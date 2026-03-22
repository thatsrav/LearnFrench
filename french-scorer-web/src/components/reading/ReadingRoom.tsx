import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadDailyStoryForUserLevel,
  markersForSentence,
  type GrammarMarker,
  type StoryPayload,
} from '../../lib/StoryMatcher'
import {
  formatCountdown,
  isDailyMissionLockedToday,
  loadLastDailyVocab,
  loadLastStoryMeta,
  msUntilLocalMidnight,
  saveMissionComplete,
} from '../../lib/readingRoomMissionStorage'
import {
  FRENCH_CLOUD_TTS_SETUP_HINT,
  getFrenchWebTtsAudioElement,
  isFrenchCloudTtsConfigured,
  speakFrenchListening,
  stopFrenchWebTts,
} from '../../lib/frenchWebTts'
import { levelBadgeLabel } from '../../lib/userCefr'
import TefTrackFooterBar from '../tef/TefTrackFooterBar'

const navy = '#1e293b'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

function indexForTime(t: number, sentences: StoryPayload['sentences']): number {
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]!
    if (t >= s.start && t < s.end) return i
  }
  if (sentences.length === 0) return 0
  const last = sentences[sentences.length - 1]!
  if (t >= last.end) return sentences.length - 1
  return 0
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-sm"
    >
      <span
        className={[
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-indigo-500' : 'bg-slate-200',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </span>
      {label}
    </button>
  )
}

function MissionAccomplished({
  onOpenVocab,
  vocabAvailable,
}: {
  onOpenVocab: () => void
  vocabAvailable: boolean
}) {
  const [ms, setMs] = useState(() => msUntilLocalMidnight())
  const meta = loadLastStoryMeta()

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilLocalMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
      </div>
      <h1 className="font-display mt-6 text-2xl font-bold text-[#1e293b]">Mission accomplie</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Vous avez terminé la mission de lecture du jour{meta?.title ? ` — « ${meta.title} »` : ''}.
        Revenez après minuit pour une nouvelle histoire.
      </p>
      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
        <Clock className="h-5 w-5 shrink-0 text-indigo-600" />
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">Prochaine mission</p>
          <p className="font-mono text-xl font-bold tabular-nums text-[#1e293b]">{formatCountdown(ms)}</p>
        </div>
      </div>
      {vocabAvailable ? (
        <button
          type="button"
          onClick={onOpenVocab}
          className="mt-8 w-full max-w-xs rounded-full bg-[#1e293b] py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
        >
          Voir le vocabulaire du jour
        </button>
      ) : null}
    </div>
  )
}

export type ReadingRoomProps = {
  userLevel: string
}

export default function ReadingRoom({ userLevel }: ReadingRoomProps) {
  const badge = levelBadgeLabel(userLevel)
  const [locked, setLocked] = useState(() => isDailyMissionLockedToday())
  const [story, setStory] = useState<StoryPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [patternsOn, setPatternsOn] = useState(true)
  const [translationOn, setTranslationOn] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [activeMarker, setActiveMarker] = useState<GrammarMarker | null>(null)
  const [vocabModal, setVocabModal] = useState(false)
  const [accomplishedVocabModal, setAccomplishedVocabModal] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ttsError, setTtsError] = useState<string | null>(null)
  /** True while POST /api/tts/french is in flight (no bundled audio). */
  const [ttsStarting, setTtsStarting] = useState(false)

  const durationTotal = useMemo(() => {
    if (!story?.sentences.length) return 0
    return Math.max(...story.sentences.map((s) => s.end))
  }, [story])

  const audioUrl = story?.audioUrl?.trim() || null

  const sentenceChunkWindows = useMemo(() => {
    if (!story?.sentences.length) return []
    const chunks = chunk(story.sentences, 3)
    let offset = 0
    return chunks.map((sentences) => {
      const startIndex = offset
      offset += sentences.length
      return { sentences, startIndex }
    })
  }, [story])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await loadDailyStoryForUserLevel(userLevel)
        if (!cancelled) {
          setStory(s)
          setSelectedIdx(0)
          setActiveMarker(null)
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Impossible de charger l’histoire.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userLevel])

  useEffect(() => () => stopFrenchWebTts(), [])

  const audioSentenceIdx = useMemo(() => {
    if (!story) return 0
    if (!audioUrl && playing && duration > 0) {
      const ratio = Math.min(1, currentTime / duration)
      const virtualT = ratio * durationTotal
      return indexForTime(virtualT, story.sentences)
    }
    return indexForTime(currentTime, story.sentences)
  }, [story, currentTime, audioUrl, playing, duration, durationTotal])

  const highlightIdx = playing ? audioSentenceIdx : selectedIdx

  const onTimeUpdate = useCallback(() => {
    const a = audioRef.current
    if (a) setCurrentTime(a.currentTime)
  }, [])

  /** Cloud TTS progress when there is no bundled story audio. */
  useEffect(() => {
    if (audioUrl || !playing || !story) return
    const id = window.setInterval(() => {
      const a = getFrenchWebTtsAudioElement()
      if (a) {
        setCurrentTime(a.currentTime)
        if (a.duration > 0 && !Number.isNaN(a.duration)) setDuration(a.duration)
      }
    }, 150)
    return () => window.clearInterval(id)
  }, [audioUrl, playing, story])

  useEffect(() => {
    const a = audioRef.current
    if (!a || !audioUrl) return
    const onMeta = () => setDuration(a.duration || durationTotal)
    a.addEventListener('loadedmetadata', onMeta)
    return () => a.removeEventListener('loadedmetadata', onMeta)
  }, [audioUrl, durationTotal])

  const togglePlay = useCallback(() => {
    if (!story) return
    if (audioUrl && audioRef.current) {
      const a = audioRef.current
      if (playing) {
        a.pause()
        setPlaying(false)
      } else {
        if (a.ended || (a.duration > 0 && a.currentTime >= a.duration - 0.15)) {
          a.currentTime = 0
          setCurrentTime(0)
        }
        void a.play()
        setPlaying(true)
      }
      return
    }
    if (playing) {
      stopFrenchWebTts()
      setPlaying(false)
      setTtsStarting(false)
      return
    }
    if (!isFrenchCloudTtsConfigured()) {
      setTtsError(FRENCH_CLOUD_TTS_SETUP_HINT)
      return
    }
    setTtsError(null)
    setCurrentTime(0)
    setDuration(0)
    setTtsStarting(true)
    const text = story.sentences.map((s) => s.fr).join(' ')
    void speakFrenchListening(text, undefined, {
      onPlaybackStarted: () => {
        setTtsStarting(false)
        setPlaying(true)
      },
    })
      .then(() => {
        setPlaying(false)
        setTtsStarting(false)
      })
      .catch((e) => {
        setPlaying(false)
        setTtsStarting(false)
        setTtsError(e instanceof Error ? e.message : String(e))
      })
  }, [story, audioUrl, playing])

  const seekRelative = useCallback(
    (delta: number) => {
      if (!story) return
      if (audioUrl && audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + delta)
        setCurrentTime(audioRef.current.currentTime)
        return
      }
      const a = getFrenchWebTtsAudioElement()
      if (a && a.duration > 0) {
        const next = Math.max(0, Math.min(a.duration, a.currentTime + delta))
        a.currentTime = next
        setCurrentTime(next)
      }
    },
    [story, audioUrl],
  )

  const formatPlayerTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const displayDuration = duration > 0 ? duration : durationTotal

  const onCompleteMission = useCallback(() => {
    if (!story) return
    saveMissionComplete({
      vocab: story.vocabulary,
      storyId: story.id,
      title: story.title,
    })
    setLocked(true)
  }, [story])

  const savedVocab = loadLastDailyVocab()

  if (locked) {
    return (
      <>
        <MissionAccomplished
          vocabAvailable={savedVocab.length > 0}
          onOpenVocab={() => setAccomplishedVocabModal(true)}
        />
        {accomplishedVocabModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="font-display text-lg font-bold text-[#1e293b]">Vocabulaire du jour</h2>
              <ul className="mt-4 space-y-3">
                {savedVocab.map((v, i) => (
                  <li key={i} className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-sm">
                    <span className="font-semibold text-[#1e293b]">{v.fr}</span>
                    <span className="text-slate-600">{v.en}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-6 w-full rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setAccomplishedVocabModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
        {loadError}
      </div>
    )
  }

  if (!story) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-100 bg-white">
        <p className="text-sm font-medium text-slate-500">Chargement de la mission…</p>
      </div>
    )
  }

  const markersBySentence = (i: number) => markersForSentence(story.grammarMarkers, i)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {audioUrl ? (
        <audio
          key={story.id}
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="hidden"
        />
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Reading Room{story.chapter ? `: ${story.chapter}` : ''}
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-[#1e293b] md:text-3xl">{story.title}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-900">
          {badge}
        </span>
      </header>

      {ttsError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{ttsError}</div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={Boolean(!audioUrl && ttsStarting)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-80"
            style={{ backgroundColor: navy }}
          >
            {!audioUrl && ttsStarting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
            {!audioUrl && ttsStarting
              ? 'Chargement…'
              : playing
                ? 'Pause'
                : 'Écouter la page'}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(story.sentences.map((s) => s.fr).join('\n\n'))
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e293b]"
          >
            <Bookmark className="h-4 w-4" />
            Enregistrer le passage
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Switch checked={patternsOn} onChange={setPatternsOn} label="Patterns" />
          <Switch checked={translationOn} onChange={setTranslationOn} label="Translation" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8"
            style={{ borderLeftWidth: 4, borderLeftColor: '#6366f1' }}
          >
            {story.chapter ? (
              <p className="font-serif text-lg font-semibold italic text-slate-500">{story.chapter}</p>
            ) : null}
            <div className="mt-4 space-y-8 text-base leading-relaxed text-[#1e293b] md:text-lg">
              {sentenceChunkWindows.map(({ sentences: chunk, startIndex }) => (
                <div
                  key={startIndex}
                  className="space-y-3 border-b border-slate-100 pb-8 last:border-b-0 last:pb-0"
                >
                  <div className="space-y-3">
                    {chunk.map((sent, offset) => {
                      const i = startIndex + offset
                      const active = highlightIdx === i
                      const markers = markersBySentence(i)
                      return (
                        <div key={i} className="space-y-2">
                          <p className="leading-relaxed">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIdx(i)
                                setPlaying(false)
                                if (audioRef.current) audioRef.current.pause()
                                stopFrenchWebTts()
                                setTtsStarting(false)
                                const first = markers[0]
                                if (patternsOn && first) setActiveMarker(first)
                                else setActiveMarker(null)
                              }}
                              className={[
                                'w-full rounded-lg px-1 py-0.5 text-left transition',
                                active ? 'bg-sky-100 ring-2 ring-sky-400/60' : 'hover:bg-slate-50',
                              ].join(' ')}
                            >
                              <span
                                className={[
                                  patternsOn && markers.length > 0
                                    ? 'underline decoration-indigo-400 decoration-2 underline-offset-4'
                                    : '',
                                ].join(' ')}
                              >
                                {sent.fr}
                              </span>
                            </button>
                            {patternsOn && markers.length > 0 ? (
                              <span className="mt-2 flex flex-wrap gap-1.5">
                                {markers.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveMarker(m)
                                      setSelectedIdx(i)
                                    }}
                                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800 hover:bg-indigo-100"
                                  >
                                    {m.label}
                                  </button>
                                ))}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {translationOn ? (
                    <div className="mt-3 block max-h-[min(120vh,8000px)] space-y-2 overflow-hidden border-t border-dashed border-indigo-200 pt-3 transition-[max-height,opacity] duration-300 ease-out">
                      {chunk.map((sent, offset) => {
                        const i = startIndex + offset
                        const active = highlightIdx === i
                        return (
                          <p
                            key={`en-${i}`}
                            className={[
                              'border-l-2 border-indigo-200 pl-3 text-sm leading-relaxed italic md:text-base',
                              active ? 'font-semibold text-indigo-700' : 'text-slate-500',
                            ].join(' ')}
                          >
                            {sent.en}
                          </p>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="relative mt-8 border-t border-slate-100 pt-5 md:pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Lecture audio</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:px-4">
                <button
                  type="button"
                  aria-label="Reculer"
                  onClick={() => seekRelative(-3)}
                  className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={playing ? 'Pause' : 'Lecture'}
                  onClick={togglePlay}
                  disabled={Boolean(!audioUrl && ttsStarting && !playing)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white disabled:opacity-50"
                  style={{ backgroundColor: navy }}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
                </button>
                <button
                  type="button"
                  aria-label="Avancer"
                  onClick={() => seekRelative(3)}
                  className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <div className="mx-1 h-1 min-w-[80px] flex-1 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${displayDuration > 0 ? Math.min(100, (currentTime / displayDuration) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                  {formatPlayerTime(currentTime)} / {formatPlayerTime(displayDuration || durationTotal)}
                </span>
                <span className="text-[10px] font-bold text-slate-600">1.0×</span>
                <Volume2 className="h-4 w-4 text-slate-400" aria-hidden />
              </div>
              {!audioUrl ? (
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                  {isFrenchCloudTtsConfigured()
                    ? 'Sans fichier audio intégré : la page est lue via la synthèse vocale (API).'
                    : FRENCH_CLOUD_TTS_SETUP_HINT}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {patternsOn && activeMarker ? (
            <div className="rounded-3xl p-6 text-white shadow-md" style={{ backgroundColor: navy }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Grammar marker</p>
              <p className="font-display mt-2 text-lg font-bold">{activeMarker.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{activeMarker.explanation}</p>
              <button
                type="button"
                onClick={() => setActiveMarker(null)}
                className="mt-4 text-xs font-semibold text-indigo-200 underline"
              >
                Fermer
              </button>
            </div>
          ) : patternsOn ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
              Activez un point de grammaire en touchant une pastille sous une phrase.
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vocabulary</p>
            <ul className="mt-3 space-y-2">
              {story.vocabulary.slice(0, 8).map((v, i) => (
                <li key={i} className="flex justify-between gap-2 border-b border-slate-100 pb-2 text-sm">
                  <span className="font-semibold text-[#1e293b]">{v.fr}</span>
                  <span className="text-right text-slate-600">{v.en}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setVocabModal(true)}
              className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
            >
              Liste complète →
            </button>
          </div>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        <span className="inline-flex items-center gap-1 opacity-50">
          <ChevronLeft className="h-4 w-4" /> Chapitre précédent
        </span>
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
        <span className="inline-flex items-center gap-1 opacity-50">
          Chapitre suivant <ChevronRight className="h-4 w-4" />
        </span>
      </footer>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCompleteMission}
          className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
        >
          Marquer la mission comme terminée
        </button>
      </div>

      <section className="space-y-3 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TEF track pulse</p>
        <TefTrackFooterBar />
      </section>

      {vocabModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          onClick={() => setVocabModal(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold text-[#1e293b]">Vocabulaire — {story.title}</h2>
            <ul className="mt-4 space-y-3">
              {story.vocabulary.map((v, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-sm">
                  <span className="font-semibold text-[#1e293b]">{v.fr}</span>
                  <span className="text-slate-600">{v.en}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 w-full rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setVocabModal(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
