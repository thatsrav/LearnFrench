/**
 * HTML5 audio player with TEF-style answer gating (mirrors expo `AudioPlayer` for `after_play_started`).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Pause, Play, RotateCcw, RotateCw, SkipBack, Volume2 } from 'lucide-react'

const SPEEDS = [0.8, 1.0, 1.2] as const
export type PlaybackSpeed = (typeof SPEEDS)[number]

const POSITION_PREFIX = 'audio_player_position_v1:'

export type TefAnswerGate =
  | 'open'
  | 'playback_only'
  | 'listen_or_memory'
  | 'after_play_started'
  | 'strict_tef'

export type WebAudioAnswerGateContextValue = {
  hasPlaybackEverStarted: boolean
  canSelectAnswers: boolean
  answerWindowRemainingMs: number | null
  questionsRevealed: boolean
  listeningEngaged: boolean
  isPlaying: boolean
  error: Error | null
  isAudioReady: boolean
  hasAudioSource: boolean
}

const WebAudioAnswerGateContext = createContext<WebAudioAnswerGateContextValue | null>(null)

export function useWebAudioAnswerGate(): WebAudioAnswerGateContextValue {
  const v = useContext(WebAudioAnswerGateContext)
  if (!v) throw new Error('useWebAudioAnswerGate must be used inside WebListeningAudioPlayer')
  return v
}

type TranscriptSegment = { text: string; startRatio: number; endRatio: number }

function splitTranscript(text: string): TranscriptSegment[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []
  const chunks = normalized.split(/(?<=[.!?…])\s+|\n+/).filter(Boolean)
  const lengths = chunks.map((c) => c.length)
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  let acc = 0
  return chunks.map((chunk, i) => {
    const start = acc / total
    acc += chunk.length
    const end = acc / total
    return {
      text: chunk + (i < chunks.length - 1 ? ' ' : ''),
      startRatio: start,
      endRatio: end,
    }
  })
}

function clampSpeed(n: number): PlaybackSpeed {
  if (n <= 0.85) return 0.8
  if (n >= 1.15) return 1.2
  return 1.0
}

export type WebListeningAudioPlayerProps = {
  contentId: string
  audioUri: string | null
  transcript: string
  title?: string
  durationHintMs?: number
  initialSpeed?: number
  persistPosition?: boolean
  answerGate?: TefAnswerGate
  minActiveListenMs?: number
  playbackEngagedOverride?: boolean
  /** Two-column layout: player + optional left extras | children (e.g. questions). */
  splitLayout?: boolean
  /** Extra blocks under the player in the left column when `splitLayout`. */
  renderLeftColumn?: (ctx: WebAudioAnswerGateContextValue) => ReactNode
  /** `tef` = emerald top bar + skip ±10s (mock-aligned). */
  accent?: 'default' | 'tef'
  showTitle?: boolean
  children?: ReactNode | ((ctx: WebAudioAnswerGateContextValue) => ReactNode)
}

export default function WebListeningAudioPlayer({
  contentId,
  audioUri,
  transcript,
  title = 'Écoute',
  durationHintMs = 0,
  initialSpeed = 1,
  persistPosition = true,
  answerGate = 'listen_or_memory',
  minActiveListenMs = 3000,
  playbackEngagedOverride = false,
  splitLayout = false,
  renderLeftColumn,
  accent = 'default',
  showTitle = true,
  children,
}: WebListeningAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lastTickRef = useRef(0)

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error' | 'no_source'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [positionMs, setPositionMs] = useState(0)
  const [durationMs, setDurationMs] = useState(durationHintMs)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(clampSpeed(initialSpeed))
  const [volume, setVolume] = useState(1)
  const [transcriptVisible, setTranscriptVisible] = useState(false)
  const [naturalCompleteOnce, setNaturalCompleteOnce] = useState(false)
  const [accumulatedListenMs, setAccumulatedListenMs] = useState(0)
  const [hasPlaybackEverStarted, setHasPlaybackEverStarted] = useState(false)

  const segments = useMemo(() => splitTranscript(transcript), [transcript])
  const persistKey = `${POSITION_PREFIX}${contentId}`

  const progressRatio = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0
  const activeSegmentIndex = useMemo(() => {
    if (segments.length === 0) return -1
    if (loadState === 'no_source' || durationMs <= 0) return -1
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i]
      if (progressRatio >= s.startRatio && progressRatio < s.endRatio) return i
    }
    return segments.length - 1
  }, [segments, progressRatio, loadState, durationMs])

  const savePosition = useCallback(
    (ms: number) => {
      if (!persistPosition || !contentId) return
      try {
        localStorage.setItem(persistKey, String(Math.floor(ms)))
      } catch {
        /* ignore */
      }
    },
    [contentId, persistKey, persistPosition],
  )

  const restorePosition = useCallback((): number => {
    if (!persistPosition) return 0
    try {
      const raw = localStorage.getItem(persistKey)
      const n = raw != null ? Number(raw) : 0
      return Number.isFinite(n) && n > 0 ? n : 0
    } catch {
      return 0
    }
  }, [persistKey, persistPosition])

  useEffect(() => {
    setError(null)
    setNaturalCompleteOnce(false)
    setAccumulatedListenMs(0)
    setPositionMs(0)
    setDurationMs(durationHintMs)
    setPlaying(false)
    setHasPlaybackEverStarted(false)
    lastTickRef.current = 0

    const el = audioRef.current
    const uri = audioUri?.trim()
    if (!uri) {
      if (el) {
        el.pause()
        el.removeAttribute('src')
      }
      setLoadState('no_source')
      return
    }

    setLoadState('loading')
    if (!el) return

    el.src = uri
    el.load()

    const onLoaded = () => {
      const d = el.duration
      if (Number.isFinite(d) && d > 0) {
        setDurationMs(d * 1000)
      } else {
        setDurationMs(durationHintMs)
      }
      setLoadState('ready')
      const restored = restorePosition()
      if (restored > 0 && Number.isFinite(d) && d > 0 && restored < d * 1000 - 500) {
        el.currentTime = restored / 1000
        setPositionMs(restored)
      }
    }

    const onErr = () => {
      const err = new Error("Impossible de charger l'audio.")
      setError(err)
      setLoadState('error')
    }

    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('error', onErr)
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('error', onErr)
      el.pause()
    }
  }, [audioUri, durationHintMs, restorePosition])

  useEffect(() => {
    const el = audioRef.current
    if (!el || loadState !== 'ready') return
    el.playbackRate = speed
  }, [speed, loadState])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = volume
  }, [volume])

  useEffect(() => {
    if (activeSegmentIndex < 0 || !transcriptVisible) return
    const seg = segmentRefs.current[activeSegmentIndex]
    seg?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeSegmentIndex, transcriptVisible])

  const tickListenAccumulation = useCallback(() => {
    const now = Date.now()
    if (playing) {
      if (lastTickRef.current > 0) {
        const delta = Math.min(now - lastTickRef.current, 2000)
        setAccumulatedListenMs((a) => a + delta)
      }
      lastTickRef.current = now
    } else if (lastTickRef.current > 0) {
      const delta = Math.min(now - lastTickRef.current, 2000)
      setAccumulatedListenMs((a) => a + delta)
      lastTickRef.current = 0
    }
  }, [playing])

  useEffect(() => {
    const id = setInterval(() => tickListenAccumulation(), 500)
    return () => clearInterval(id)
  }, [tickListenAccumulation])

  const onTimeUpdate = () => {
    const el = audioRef.current
    if (!el) return
    const ms = Math.floor(el.currentTime * 1000)
    setPositionMs(ms)
    if (el.currentTime > 0.05 && !hasPlaybackEverStarted) {
      setHasPlaybackEverStarted(true)
    }
  }

  const onPlay = () => {
    setPlaying(true)
    setHasPlaybackEverStarted(true)
  }

  const onPause = () => {
    setPlaying(false)
    const el = audioRef.current
    if (el) void savePosition(Math.floor(el.currentTime * 1000))
  }

  const onEnded = () => {
    setPlaying(false)
    setNaturalCompleteOnce(true)
    void savePosition(0)
  }

  const togglePlay = () => {
    const el = audioRef.current
    if (!el || loadState !== 'ready') return
    if (el.paused) {
      void el.play().catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      setHasPlaybackEverStarted(true)
    } else {
      el.pause()
    }
  }

  const replay = () => {
    const el = audioRef.current
    if (!el || loadState !== 'ready') return
    el.currentTime = 0
    void el.play().catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
    setHasPlaybackEverStarted(true)
  }

  const seekToRatio = (ratio: number) => {
    const el = audioRef.current
    if (!el || loadState !== 'ready' || durationMs <= 0) return
    const sec = Math.max(0, Math.min(el.duration || durationMs / 1000, ratio * (el.duration || durationMs / 1000)))
    el.currentTime = sec
    setPositionMs(Math.floor(sec * 1000))
    void savePosition(Math.floor(sec * 1000))
  }

  const skipSeconds = (delta: number) => {
    const el = audioRef.current
    if (!el || loadState !== 'ready') return
    const max = el.duration || durationMs / 1000
    const next = Math.max(0, Math.min(max, el.currentTime + delta))
    el.currentTime = next
    setPositionMs(Math.floor(next * 1000))
    void savePosition(Math.floor(next * 1000))
  }

  const memoryOk = loadState === 'no_source' || naturalCompleteOnce || accumulatedListenMs >= minActiveListenMs

  const playbackStarted = playbackEngagedOverride || hasPlaybackEverStarted

  let canSelectAnswers = true
  if (answerGate === 'playback_only') {
    canSelectAnswers = playing
  } else if (answerGate === 'listen_or_memory') {
    canSelectAnswers = playing || memoryOk
  } else if (answerGate === 'after_play_started') {
    canSelectAnswers = playbackStarted
  } else if (answerGate === 'strict_tef') {
    canSelectAnswers = memoryOk
  }

  const gateCtx: WebAudioAnswerGateContextValue = {
    hasPlaybackEverStarted: answerGate === 'open' ? true : playbackStarted,
    canSelectAnswers,
    answerWindowRemainingMs: null,
    questionsRevealed: true,
    listeningEngaged: memoryOk,
    isPlaying: playing,
    error,
    isAudioReady: loadState === 'ready',
    hasAudioSource: Boolean(audioUri?.trim()),
  }

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')}`
  }

  const childNode = typeof children === 'function' ? children(gateCtx) : children

  const playerShell =
    accent === 'tef'
      ? 'rounded-2xl border-x border-b border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm'
      : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'

  const playerCard = (
    <div className={playerShell}>
      {showTitle ? <p className="text-base font-bold text-slate-900">{title}</p> : null}

        {loadState === 'loading' ? (
          <p className="mt-3 text-sm text-slate-600">Chargement de l’audio…</p>
        ) : null}

        {loadState === 'error' && error ? (
          <div className="mt-3 rounded-xl bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-800">Audio indisponible</p>
            <p className="mt-1 text-xs text-rose-700">{error.message}</p>
          </div>
        ) : null}

        {loadState === 'no_source' ? (
          <div className="mt-2 rounded-xl bg-amber-50 p-3">
            <p className="text-sm text-amber-900">Aucun fichier audio fourni — utilisez la lecture TTS ci-dessous.</p>
          </div>
        ) : null}

        {loadState === 'ready' ? (
          <>
            <div
              className={`mt-3 flex flex-row items-center justify-center ${accent === 'tef' ? 'gap-2' : 'gap-4'}`}
            >
              {accent === 'tef' ? (
                <button
                  type="button"
                  onClick={() => skipSeconds(-10)}
                  className="flex h-10 flex-col items-center justify-center rounded-xl bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                  aria-label="Reculer de 10 secondes"
                >
                  <RotateCcw className="h-4 w-4" />
                  10s
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => replay()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300"
                  aria-label="Rejouer depuis le début"
                >
                  <SkipBack className="h-5 w-5 text-slate-900" />
                </button>
              )}
              <button
                type="button"
                onClick={() => void togglePlay()}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
                aria-label={playing ? 'Pause' : 'Lecture'}
              >
                {playing ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 pl-1 text-white" />}
              </button>
              {accent === 'tef' ? (
                <button
                  type="button"
                  onClick={() => skipSeconds(10)}
                  className="flex h-10 flex-col items-center justify-center rounded-xl bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                  aria-label="Avancer de 10 secondes"
                >
                  <RotateCw className="h-4 w-4" />
                  10s
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex flex-row justify-center gap-2">
              {SPEEDS.map((sp) => {
                const on = speed === sp
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpeed(sp)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${on ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {sp}×
                  </button>
                )
              })}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={(ev) => {
                  const rect = (ev.currentTarget as HTMLButtonElement).getBoundingClientRect()
                  const x = ev.clientX - rect.left
                  const ratio = x / rect.width
                  seekToRatio(ratio)
                }}
                className="relative h-8 w-full"
              >
                <span className="absolute inset-y-2 left-0 right-0 block rounded-full bg-slate-200" />
                <span
                  className="absolute inset-y-2 left-0 block rounded-full bg-emerald-500"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </button>
              <div className="mt-1 flex flex-row justify-between text-xs tabular-nums text-slate-600">
                <span>{formatTime(positionMs)}</span>
                <span>{formatTime(durationMs)}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-row items-center gap-3">
              <Volume2 className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-2 flex-1 accent-emerald-600"
                aria-label="Volume"
              />
            </div>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => setTranscriptVisible((v) => !v)}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          {transcriptVisible ? 'Masquer la transcription' : 'Voir la transcription'}
        </button>

        {transcriptVisible ? (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-7 text-slate-800">
            {segments.map((seg, i) => (
              <span
                key={i}
                ref={(el) => {
                  segmentRefs.current[i] = el
                }}
                className={i === activeSegmentIndex && loadState === 'ready' ? 'rounded bg-emerald-100' : ''}
              >
                {seg.text}
              </span>
            ))}
          </div>
        ) : null}
    </div>
  )

  const leftStack = (
    <div className="space-y-4">
      {playerCard}
      {renderLeftColumn ? renderLeftColumn(gateCtx) : null}
    </div>
  )

  const mainContent = splitLayout ? (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      {leftStack}
      <div className="min-h-[12rem]">{childNode}</div>
    </div>
  ) : (
    <>
      {playerCard}
      {childNode}
    </>
  )

  return (
    <WebAudioAnswerGateContext.Provider value={gateCtx}>
      <audio
        ref={audioRef}
        className="hidden"
        playsInline
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />
      {mainContent}
    </WebAudioAnswerGateContext.Provider>
  )
}
