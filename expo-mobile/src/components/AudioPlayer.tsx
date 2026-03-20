/**
 * Reusable TEF-style listening player (expo-av).
 * Use `AudioAnswerGateContext` or the render-prop `children` callback to lock MCQs.
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
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Slider from '@react-native-community/slider'
import { Audio, type AVPlaybackStatus, type AVPlaybackStatusSuccess } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'

const SPEEDS = [0.8, 1.0, 1.2] as const
export type PlaybackSpeed = (typeof SPEEDS)[number]

const POSITION_PREFIX = 'audio_player_position_v1:'
const LOAD_TIMEOUT_MS = 30_000

export type TefAnswerGate =
  /** Always allow selecting answers */
  | 'open'
  /** Only while audio is actively playing */
  | 'playback_only'
  /** While playing OR after enough listening / one full pass (memory) */
  | 'listen_or_memory'
  /** After user has started playback at least once (TEF listening practice) */
  | 'after_play_started'
  /**
   * TEF-style: after listen threshold, user must tap “Voir les questions”;
   * optional countdown window after reveal.
   */
  | 'strict_tef'

export type AudioAnswerGateContextValue = {
  /** User pressed play / audio progressed (for gating question visibility) */
  hasPlaybackEverStarted: boolean
  /** Whether option taps should be accepted */
  canSelectAnswers: boolean
  /** Milliseconds left in answer window after reveal; null if no window */
  answerWindowRemainingMs: number | null
  /** In strict_tef: call when user taps reveal (wired internally; exposed for UI state) */
  questionsRevealed: boolean
  listeningEngaged: boolean
  isPlaying: boolean
  error: Error | null
  isAudioReady: boolean
  hasAudioSource: boolean
}

const AudioAnswerGateContext = createContext<AudioAnswerGateContextValue | null>(null)

export function useAudioAnswerGate(): AudioAnswerGateContextValue {
  const v = useContext(AudioAnswerGateContext)
  if (!v) {
    throw new Error('useAudioAnswerGate must be used inside AudioPlayer')
  }
  return v
}

/** Optional hook when player may be absent */
export function useOptionalAudioAnswerGate(): AudioAnswerGateContextValue | null {
  return useContext(AudioAnswerGateContext)
}

export type AudioPlayerProps = {
  /** Stable id for persisted position (e.g. tef_task_id) */
  contentId: string
  /** Remote or file URI; null = no file (transcript-only + gates still work) */
  audioUri: string | null
  transcript: string
  title?: string
  /** Estimated duration before metadata loads (UI only) */
  durationHintMs?: number
  /** Initial speed from content (clamped to 0.8 | 1 | 1.2) */
  initialSpeed?: number
  persistPosition?: boolean
  answerGate?: TefAnswerGate
  /** Required active listening time (ms) before “memory” / strict reveal counts */
  minActiveListenMs?: number
  /** strict_tef: seconds after questions are shown before locking answers */
  answerWindowSec?: number | null
  /** e.g. TTS fallback: treat as “playback started” for after_play_started */
  playbackEngagedOverride?: boolean
  onPlaybackError?: (err: Error) => void
  onLoadSuccess?: (durationMs: number) => void
  /** Render questions / extra UI with gate state */
  children?: ReactNode | ((ctx: AudioAnswerGateContextValue) => ReactNode)
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

function isSuccess(status: AVPlaybackStatus): status is AVPlaybackStatusSuccess {
  return status.isLoaded
}

export default function AudioPlayer({
  contentId,
  audioUri,
  transcript,
  title,
  durationHintMs = 0,
  initialSpeed = 1,
  persistPosition = true,
  answerGate = 'listen_or_memory',
  minActiveListenMs = 3000,
  answerWindowSec = null,
  playbackEngagedOverride = false,
  onPlaybackError,
  onLoadSuccess,
  children,
}: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null)
  const scrollRef = useRef<ScrollView>(null)
  const segmentYRef = useRef<number[]>([])
  const lastTickRef = useRef<number>(0)
  const windowEndRef = useRef<number | null>(null)

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error' | 'no_source'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [positionMs, setPositionMs] = useState(0)
  const [durationMs, setDurationMs] = useState(durationHintMs)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(clampSpeed(initialSpeed))
  const [volume, setVolume] = useState(1)
  const [transcriptVisible, setTranscriptVisible] = useState(false)
  const [barWidth, setBarWidth] = useState(1)
  const [naturalCompleteOnce, setNaturalCompleteOnce] = useState(false)
  const [accumulatedListenMs, setAccumulatedListenMs] = useState(0)
  const [questionsRevealed, setQuestionsRevealed] = useState(answerGate !== 'strict_tef')
  const [windowRemainingMs, setWindowRemainingMs] = useState<number | null>(null)
  const [hasPlaybackEverStarted, setHasPlaybackEverStarted] = useState(false)

  const segments = useMemo(() => splitTranscript(transcript), [transcript])

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


  const persistKey = `${POSITION_PREFIX}${contentId}`

  const unloadSound = useCallback(async () => {
    const s = soundRef.current
    soundRef.current = null
    if (s) {
      try {
        await s.unloadAsync()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const savePosition = useCallback(
    async (ms: number) => {
      if (!persistPosition || !contentId) return
      try {
        await AsyncStorage.setItem(persistKey, String(Math.floor(ms)))
      } catch {
        /* ignore */
      }
    },
    [contentId, persistKey, persistPosition],
  )

  const restorePosition = useCallback(async (): Promise<number> => {
    if (!persistPosition) return 0
    try {
      const raw = await AsyncStorage.getItem(persistKey)
      const n = raw != null ? Number(raw) : 0
      return Number.isFinite(n) && n > 0 ? n : 0
    } catch {
      return 0
    }
  }, [persistKey, persistPosition])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      await unloadSound()
      setError(null)
      setNaturalCompleteOnce(false)
      setAccumulatedListenMs(0)
      setPositionMs(0)
      setDurationMs(durationHintMs)
      setPlaying(false)
      setQuestionsRevealed(answerGate !== 'strict_tef')
      windowEndRef.current = null
      setWindowRemainingMs(null)
      setHasPlaybackEverStarted(false)

      if (!audioUri || !audioUri.trim()) {
        setLoadState('no_source')
        return
      }

      setLoadState('loading')
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
      } catch {
        /* non-fatal */
      }

      const loadPromise = Audio.Sound.createAsync(
        { uri: audioUri.trim() },
        {
          shouldPlay: false,
          progressUpdateIntervalMillis: 250,
          volume,
          rate: speed,
          shouldCorrectPitch: true,
        },
        (status) => {
          if (cancelled || !isSuccess(status)) {
            if (status && !status.isLoaded && 'error' in status && status.error) {
              const err = new Error(String(status.error))
              setError(err)
              setLoadState('error')
              onPlaybackError?.(err)
            }
            return
          }
          setPositionMs(status.positionMillis ?? 0)
          setDurationMs(status.durationMillis && status.durationMillis > 0 ? status.durationMillis : durationHintMs)
          setPlaying(status.isPlaying)
          if (status.isPlaying && (status.positionMillis ?? 0) > 0) {
            setHasPlaybackEverStarted(true)
          }

          const now = Date.now()
          if (status.isPlaying) {
            if (lastTickRef.current > 0) {
              const delta = Math.min(now - lastTickRef.current, 2000)
              setAccumulatedListenMs((a) => a + delta)
            }
            lastTickRef.current = now
          } else {
            if (lastTickRef.current > 0) {
              const delta = Math.min(now - lastTickRef.current, 2000)
              setAccumulatedListenMs((a) => a + delta)
              lastTickRef.current = 0
            }
          }

          if (status.didJustFinish) {
            setNaturalCompleteOnce(true)
            void savePosition(0)
          }
        },
      )

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Délai dépassé : impossible de charger l’audio.')), LOAD_TIMEOUT_MS),
      )

      try {
        const { sound } = await Promise.race([loadPromise, timeoutPromise])
        if (cancelled) {
          await sound.unloadAsync()
          return
        }
        soundRef.current = sound
        const restored = await restorePosition()
        const st = await sound.getStatusAsync()
        if (isSuccess(st) && st.durationMillis && restored > 0 && restored < st.durationMillis - 500) {
          await sound.setPositionAsync(restored)
          setPositionMs(restored)
        }
        await sound.setRateAsync(speed, true)
        await sound.setVolumeAsync(volume)
        setLoadState('ready')
        if (isSuccess(st) && st.durationMillis) {
          setDurationMs(st.durationMillis)
          onLoadSuccess?.(st.durationMillis)
        }
      } catch (e) {
        if (cancelled) return
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        setLoadState('error')
        onPlaybackError?.(err)
      }
    }

    void run()
    return () => {
      cancelled = true
      void unloadSound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when URI changes
  }, [audioUri])

  useEffect(() => {
    const s = soundRef.current
    if (!s || loadState !== 'ready') return
    void s.setRateAsync(speed, true)
  }, [speed, loadState])

  useEffect(() => {
    const s = soundRef.current
    if (!s || loadState !== 'ready') return
    void s.setVolumeAsync(volume)
  }, [volume, loadState])

  useEffect(() => {
    const id = setInterval(() => {
      if (windowEndRef.current == null) {
        setWindowRemainingMs(null)
        return
      }
      const left = windowEndRef.current - Date.now()
      setWindowRemainingMs(left > 0 ? left : 0)
    }, 250)
    return () => clearInterval(id)
  }, [])

  /** Clear answer window when leaving strict mode / reloading */
  useEffect(() => {
    if (answerGate !== 'strict_tef') {
      windowEndRef.current = null
      setWindowRemainingMs(null)
    }
  }, [answerGate, audioUri])

  const togglePlay = async () => {
    const s = soundRef.current
    if (!s || loadState !== 'ready') return
    try {
      const st = await s.getStatusAsync()
      if (isSuccess(st) && st.isPlaying) {
        await s.pauseAsync()
        void savePosition(st.positionMillis ?? 0)
      } else {
        await s.playAsync()
        setHasPlaybackEverStarted(true)
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      onPlaybackError?.(err)
    }
  }

  const replay = async () => {
    const s = soundRef.current
    if (!s || loadState !== 'ready') return
    try {
      await s.setPositionAsync(0)
      await s.playAsync()
      setHasPlaybackEverStarted(true)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      onPlaybackError?.(err)
    }
  }

  const seekToRatio = async (ratio: number) => {
    const s = soundRef.current
    if (!s || loadState !== 'ready' || durationMs <= 0) return
    const ms = Math.max(0, Math.min(durationMs, Math.floor(ratio * durationMs)))
    try {
      await s.setPositionAsync(ms)
      setPositionMs(ms)
      void savePosition(ms)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      onPlaybackError?.(err)
    }
  }

  const revealQuestions = useCallback(() => {
    setQuestionsRevealed(true)
    if (answerGate === 'strict_tef' && answerWindowSec != null && answerWindowSec > 0) {
      const ms = answerWindowSec * 1000
      windowEndRef.current = Date.now() + ms
      setWindowRemainingMs(ms)
    } else {
      windowEndRef.current = null
      setWindowRemainingMs(null)
    }
  }, [answerGate, answerWindowSec])

  const memoryOk =
    loadState === 'no_source' ||
    naturalCompleteOnce ||
    accumulatedListenMs >= minActiveListenMs

  const windowOk =
    answerWindowSec == null ||
    answerWindowSec <= 0 ||
    windowRemainingMs == null ||
    windowRemainingMs > 0

  const playbackStarted = playbackEngagedOverride || hasPlaybackEverStarted

  let canSelectAnswers = true
  if (answerGate === 'playback_only') {
    canSelectAnswers = playing
  } else if (answerGate === 'listen_or_memory') {
    canSelectAnswers = playing || memoryOk
  } else if (answerGate === 'after_play_started') {
    canSelectAnswers = playbackStarted
  } else if (answerGate === 'strict_tef') {
    canSelectAnswers = questionsRevealed && memoryOk && windowOk
  }

  const gateCtx: AudioAnswerGateContextValue = {
    hasPlaybackEverStarted: answerGate === 'open' ? true : playbackStarted,
    canSelectAnswers,
    answerWindowRemainingMs: answerGate === 'strict_tef' && questionsRevealed ? windowRemainingMs : null,
    questionsRevealed: answerGate === 'strict_tef' ? questionsRevealed : true,
    listeningEngaged: memoryOk,
    isPlaying: playing,
    error,
    isAudioReady: loadState === 'ready',
    hasAudioSource: Boolean(audioUri?.trim()),
  }

  useEffect(() => {
    if (activeSegmentIndex < 0 || !transcriptVisible) return
    const y = segmentYRef.current[activeSegmentIndex]
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 24), animated: true })
    }
  }, [activeSegmentIndex, transcriptVisible])

  const onSegmentLayout = (index: number, e: LayoutChangeEvent) => {
    segmentYRef.current[index] = e.nativeEvent.layout.y
  }

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')}`
  }

  const childNode = typeof children === 'function' ? children(gateCtx) : children

  return (
    <AudioAnswerGateContext.Provider value={gateCtx}>
      <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {title ? <Text className="text-base font-bold text-slate-900">{title}</Text> : null}

        {loadState === 'loading' ? (
          <View className="mt-3 flex-row items-center gap-2">
            <ActivityIndicator color="#059669" />
            <Text className="text-sm text-slate-600">Chargement de l’audio…</Text>
          </View>
        ) : null}

        {loadState === 'error' && error ? (
          <View className="mt-3 rounded-xl bg-rose-50 p-3">
            <Text className="text-sm font-semibold text-rose-800">Audio indisponible</Text>
            <Text className="mt-1 text-xs text-rose-700">{error.message}</Text>
            <Text className="mt-2 text-xs text-rose-600">
              Vérifiez la connexion, le lien du fichier ou réessayez. Fichier manquant ou corrompu possible.
            </Text>
          </View>
        ) : null}

        {loadState === 'no_source' ? (
          <View className="mt-2 rounded-xl bg-amber-50 p-3">
            <Text className="text-sm text-amber-900">Aucun fichier audio fourni — utilisez la transcription ci-dessous.</Text>
          </View>
        ) : null}

        {loadState === 'ready' ? (
          <>
            <View className="mt-3 flex-row items-center justify-center gap-4">
              <Pressable
                onPress={() => void replay()}
                accessibilityLabel="Rejouer depuis le début"
                className="h-12 w-12 items-center justify-center rounded-full bg-slate-200 active:bg-slate-300"
              >
                <Ionicons name="play-skip-back" size={22} color="#0f172a" />
              </Pressable>
              <Pressable
                onPress={() => void togglePlay()}
                accessibilityLabel={playing ? 'Pause' : 'Lecture'}
                className="h-16 w-16 items-center justify-center rounded-full bg-emerald-600 active:bg-emerald-700"
              >
                <Ionicons name={playing ? 'pause' : 'play'} size={32} color="#fff" />
              </Pressable>
            </View>
            <View className="mt-2 flex-row justify-center gap-2">
              {SPEEDS.map((sp) => {
                const on = speed === sp
                return (
                  <Pressable
                    key={sp}
                    onPress={() => setSpeed(sp)}
                    className={['rounded-full px-3 py-1.5', on ? 'bg-emerald-700' : 'bg-slate-200'].join(' ')}
                  >
                    <Text className={['text-xs font-bold', on ? 'text-white' : 'text-slate-700'].join(' ')}>
                      {sp}×
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View className="mt-3">
              <Pressable
                onLayout={(e) => setBarWidth(Math.max(1, e.nativeEvent.layout.width))}
                onPress={(ev) => {
                  const x = ev.nativeEvent.locationX
                  void seekToRatio(x / barWidth)
                }}
                className="h-8 justify-center"
              >
                <View className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <View
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </View>
              </Pressable>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-xs tabular-nums text-slate-600">{formatTime(positionMs)}</Text>
                <Text className="text-xs tabular-nums text-slate-600">{formatTime(durationMs)}</Text>
              </View>
            </View>

            <View className="mt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-slate-600">Volume</Text>
                <Text className="text-xs text-slate-500">{Math.round(volume * 100)}%</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 36 }}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={(v) => setVolume(v)}
                minimumTrackTintColor="#059669"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#047857"
              />
            </View>
          </>
        ) : null}

        <Pressable
          onPress={() => setTranscriptVisible((v) => !v)}
          className="mt-3 flex-row items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 active:bg-emerald-100"
        >
          <Text className="text-sm font-bold text-emerald-900">
            {transcriptVisible ? 'Masquer la transcription' : 'Afficher la transcription'}
          </Text>
          <Ionicons name={transcriptVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#047857" />
        </Pressable>

        {transcriptVisible ? (
          <ScrollView ref={scrollRef} className="mt-2 max-h-56 rounded-xl border border-emerald-100 bg-white p-3" nestedScrollEnabled>
            {segments.map((seg, i) => {
              const hi = i === activeSegmentIndex && loadState === 'ready'
              return (
                <Text
                  key={i}
                  onLayout={(e) => onSegmentLayout(i, e)}
                  className={['mb-1 text-sm leading-7 text-slate-800', hi ? 'bg-amber-200 text-amber-950' : ''].join(' ')}
                  style={hi ? { backgroundColor: '#fde68a' } : undefined}
                >
                  {seg.text}
                </Text>
              )
            })}
          </ScrollView>
        ) : null}

        {answerGate === 'strict_tef' ? (
          <View className="mt-3">
            {!memoryOk ? (
              <Text className="text-xs text-slate-500">
                Écoutez au moins ~{Math.ceil(minActiveListenMs / 1000)} s (ou jusqu’à la fin) pour déverrouiller les questions.
              </Text>
            ) : !questionsRevealed ? (
              <Pressable
                onPress={revealQuestions}
                className="rounded-xl bg-slate-900 py-3 active:bg-slate-800"
              >
                <Text className="text-center text-sm font-bold text-white">Voir les questions</Text>
              </Pressable>
            ) : answerWindowSec != null && answerWindowSec > 0 ? (
              <Text className="text-center text-sm font-bold text-amber-800">
                Temps restant :{' '}
                {windowRemainingMs != null
                  ? `${Math.max(0, Math.ceil(windowRemainingMs / 1000))} s`
                  : `${answerWindowSec} s`}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {childNode}
    </AudioAnswerGateContext.Provider>
  )
}
