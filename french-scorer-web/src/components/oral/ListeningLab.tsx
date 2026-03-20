import { AlertTriangle, Headphones, Lock, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ensureDailyListeningMission,
  type DailyListeningMission,
  type ListeningQuestion,
  type QuestionFocus,
} from '../../lib/OralMissionEngine'
import { msUntilEdmontonMidnight } from '../../lib/edmontonTime'
import { formatCountdown } from '../../lib/readingRoomMissionStorage'
import { isListeningMissionLockedToday, markListeningMissionComplete } from '../../lib/oralLabStorage'
import { addExamReadiness, incrementOralStreakOncePerDay } from '../../lib/tefSharedFooterStats'

const navy = '#1e293b'

type Props = {
  userLevel: string
}

function focusLabel(f: QuestionFocus | undefined): string {
  if (f === 'tone') return 'Tone'
  if (f === 'implicit') return 'Implicit meaning'
  return 'Key details'
}

function focusChipClass(f: QuestionFocus | undefined): string {
  if (f === 'tone') return 'bg-violet-100 text-violet-900 border-violet-200'
  if (f === 'implicit') return 'bg-sky-100 text-sky-900 border-sky-200'
  return 'bg-emerald-100 text-emerald-900 border-emerald-200'
}

function MissionDoneListening({ title, score, total }: { title?: string; score?: number; total?: number }) {
  const [ms, setMs] = useState(() => msUntilEdmontonMidnight())
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilEdmontonMidnight()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-4 text-white" style={{ backgroundColor: navy }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Listening lab</p>
        <p className="font-display mt-1 text-lg font-bold">Mission accomplie</p>
      </div>
      <div className="p-6 text-center">
        <p className="text-sm font-bold text-emerald-700">Écoute — session validée</p>
        {score !== undefined && total !== undefined ? (
          <p className="mt-2 text-sm font-semibold text-[#1e293b]">
            Score : {score} / {total}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {title ? `« ${title} »` : "Scénario d'aujourd'hui"} terminé. Prochain contenu (minuit Edmonton) dans :
        </p>
        <p className="mt-3 font-mono text-2xl font-bold tabular-nums text-[#1e293b]">{formatCountdown(ms)}</p>
      </div>
    </div>
  )
}

export default function ListeningLab({ userLevel }: Props) {
  const [mission, setMission] = useState<DailyListeningMission | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [locked, setLocked] = useState(() => isListeningMissionLockedToday(userLevel))
  const [playbackStarted, setPlaybackStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [choices, setChoices] = useState<Record<number, number>>({})
  const [quizResult, setQuizResult] = useState<'idle' | 'done'>('idle')
  const [doneSummary, setDoneSummary] = useState<{ score: number; total: number } | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const lastGoodTimeRef = useRef(0)

  /** TEF protocol: no rewind / seek once playback starts */
  const tefProtocolActive = playbackStarted

  const loadMission = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const m = await ensureDailyListeningMission(userLevel)
      setMission(m)
      setShowQuiz(false)
      setChoices({})
      setQuizResult('idle')
      setPlaybackStarted(false)
      setCurrentTime(0)
      lastGoodTimeRef.current = 0
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [userLevel])

  useEffect(() => {
    void loadMission()
  }, [loadMission])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mission?.audioBase64) return
    try {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const bin = atob(mission.audioBase64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const blob = new Blob([bytes], { type: mission.mime || 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url
      const a = audioRef.current
      if (a) {
        a.src = url
        a.load()
      }
    } catch {
      setErr('Impossible de décoder le fichier audio.')
    }
  }, [mission])

  const onTimeUpdate = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (tefProtocolActive) {
      if (a.currentTime + 0.08 < lastGoodTimeRef.current) {
        a.currentTime = lastGoodTimeRef.current
      } else {
        lastGoodTimeRef.current = a.currentTime
      }
    } else {
      lastGoodTimeRef.current = a.currentTime
    }
    setCurrentTime(a.currentTime)
  }, [tefProtocolActive])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return

    if (!mission?.audioBase64) {
      if (!mission?.scriptFr) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(mission.scriptFr)
      u.lang = 'fr-FR'
      u.onstart = () => {
        setPlaybackStarted(true)
        setPlaying(true)
      }
      u.onend = () => {
        setPlaying(false)
        setShowQuiz(true)
      }
      window.speechSynthesis.speak(u)
      return
    }

    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      void a.play()
      setPlaybackStarted(true)
      setPlaying(true)
    }
  }, [mission, playing])

  const seekDisabled = tefProtocolActive

  const skipBack = useCallback(() => {
    if (seekDisabled) return
    const el = audioRef.current
    if (el) el.currentTime = Math.max(0, el.currentTime - 10)
  }, [seekDisabled])

  const skipFwd = useCallback(() => {
    if (seekDisabled) return
    const el = audioRef.current
    if (el) el.currentTime = Math.min(el.duration || 0, el.currentTime + 10)
  }, [seekDisabled])

  const onAudioEnded = useCallback(() => {
    setPlaying(false)
    setShowQuiz(true)
  }, [])

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const displayDuration = duration || 1

  const submitQuiz = useCallback(() => {
    if (!mission) return
    const qs = mission.questions
    if (qs.length === 0) return
    const allAnswered = qs.every((_, i) => choices[i] !== undefined)
    if (!allAnswered) return
    let ok = 0
    qs.forEach((q: ListeningQuestion, i: number) => {
      if (choices[i] === q.correctIndex) ok += 1
    })
    setDoneSummary({ score: ok, total: qs.length })
    setQuizResult('done')
    markListeningMissionComplete(userLevel)
    addExamReadiness(8)
    incrementOralStreakOncePerDay()
    setLocked(true)
  }, [mission, choices, userLevel])

  const score = useMemo(() => {
    if (!mission || quizResult !== 'done') return null
    let ok = 0
    mission.questions.forEach((q, i) => {
      if (choices[i] === q.correctIndex) ok += 1
    })
    return ok
  }, [mission, choices, quizResult])

  if (locked) {
    return (
      <MissionDoneListening
        title={mission?.scenarioTitle}
        score={doneSummary?.score}
        total={doneSummary?.total}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-5 text-white md:px-8" style={{ backgroundColor: navy }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Headphones className="h-6 w-6 text-indigo-100" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">TEF preparation track</p>
              <h2 className="font-display text-xl font-bold md:text-2xl">Listening Lab</h2>
              <p className="mt-0.5 text-xs text-indigo-100/90">{mission?.moduleLabel ?? '…'}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <Lock className="h-3.5 w-3.5" />
            No-back (TEF)
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Chargement du scénario (ElevenLabs Multilingual v2 + Gemini)…</p>
        ) : mission ? (
          <>
            {mission.scenarioTitle ? (
              <p className="text-sm font-semibold text-[#1e293b]">« {mission.scenarioTitle} »</p>
            ) : null}

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div
                className="flex flex-wrap items-center gap-3"
                onPointerDown={(e) => {
                  if (seekDisabled) e.preventDefault()
                }}
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-white shadow-md transition hover:opacity-95"
                  aria-label={playing ? 'Pause' : 'Lecture'}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div
                    className={[
                      'h-2.5 overflow-hidden rounded-full bg-slate-200',
                      seekDisabled ? 'pointer-events-none select-none' : '',
                    ].join(' ')}
                    title={seekDisabled ? 'Seek désactivé (protocole TEF)' : undefined}
                  >
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-[width]"
                      style={{ width: `${Math.min(100, (currentTime / displayDuration) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-slate-400">
                <button
                  type="button"
                  onClick={skipBack}
                  disabled={seekDisabled}
                  className="rounded-lg p-2 disabled:opacity-25"
                  aria-label="Reculer"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <p className="max-w-[200px] text-center text-[11px] font-medium italic text-slate-500">
                  {seekDisabled
                    ? 'Pas de retour arrière ni de saut — comme à l’examen TEF.'
                    : 'La lecture active le mode examen.'}
                </p>
                <button
                  type="button"
                  onClick={skipFwd}
                  disabled={seekDisabled}
                  className="rounded-lg p-2 disabled:opacity-25"
                  aria-label="Avancer"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
              {!mission.audioBase64 ? (
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Audio HD indisponible — synthèse navigateur (FR). Configurez ElevenLabs sur l’API pour MP3 haute fidélité.
                </p>
              ) : null}
            </div>

            <audio
              ref={audioRef}
              preload="metadata"
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration || 0)
                lastGoodTimeRef.current = 0
              }}
              onTimeUpdate={onTimeUpdate}
              onEnded={onAudioEnded}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="hidden"
            />

            {showQuiz && mission.questions.length > 0 ? (
              <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                <p className="text-sm font-bold text-[#1e293b]">Compréhension orale</p>
                <p className="text-xs text-slate-500">
                  Questions sur le ton, le sens implicite et les faits importants — après l’écoute complète.
                </p>
                {mission.questions.map((q: ListeningQuestion, qi: number) => (
                  <div key={qi} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          focusChipClass(q.focus),
                        ].join(' ')}
                      >
                        {focusLabel(q.focus)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-800">{q.questionEn}</p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className={[
                            'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition',
                            choices[qi] === oi ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50/50',
                            quizResult === 'done' && oi === q.correctIndex ? 'ring-2 ring-emerald-400' : '',
                            quizResult === 'done' && choices[qi] === oi && oi !== q.correctIndex
                              ? 'ring-2 ring-red-300'
                              : '',
                          ].join(' ')}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={choices[qi] === oi}
                            disabled={quizResult === 'done'}
                            onChange={() => setChoices((c) => ({ ...c, [qi]: oi }))}
                            className="accent-indigo-600"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {quizResult === 'done' ? (
                  <p className="text-sm font-semibold text-emerald-700">
                    Score : {score} / {mission.questions.length} — mission validée (fuseau Edmonton).
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="w-full rounded-full bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-500"
                  >
                    Valider les réponses
                  </button>
                )}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
