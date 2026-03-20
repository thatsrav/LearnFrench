import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Volume2, X } from 'lucide-react'
import WebListeningAudioPlayer from './WebListeningAudioPlayer'
import { getListeningContentForTefUnit } from '../content/listeningContent'
import { useAuth } from '../contexts/AuthContext'
import { buildSixListeningQuestions, type ListeningMcqWithExpl } from '../lib/listeningQuestionAugment'
import {
  cefrFromListeningPercent,
  listeningStrengthMessage,
  listeningStrengthMessageEn,
  listeningWeakAreasHint,
} from '../lib/tefListeningScore'
import { getModuleIdForContentUnit } from '../lib/curriculum'
import { persistTefPrepListeningAttempt, type TefPrepAnswerRecord } from '../lib/tefPrepProgressWeb'
import { supabase } from '../lib/supabase'

const LETTERS = ['A', 'B', 'C', 'D'] as const

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function clampPlayerSpeed(rate: number): 0.8 | 1 | 1.2 {
  if (rate <= 0.85) return 0.8
  if (rate >= 1.05) return 1.2
  return 1.0
}

function speakFrCa(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-CA'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

type Props = {
  tefUnit: number
}

export default function TefPrepWebListeningPractice({ tefUnit }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const startedAtRef = useRef(Date.now())
  const savedRef = useRef(false)

  const content = useMemo(() => getListeningContentForTefUnit(tefUnit), [tefUnit])
  const questions = useMemo(
    () => (content ? buildSixListeningQuestions(content.questions, content.scenario) : []),
    [content],
  )

  const [ttsEngaged, setTtsEngaged] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [answersLog, setAnswersLog] = useState<TefPrepAnswerRecord[]>([])
  const [phase, setPhase] = useState<'practice' | 'summary'>('practice')
  const [reviewOpen, setReviewOpen] = useState(false)

  const currentQ: ListeningMcqWithExpl | undefined = questions[qIndex]

  const correctCount = useMemo(() => results.filter(Boolean).length, [results])
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const cefr = cefrFromListeningPercent(percent)
  const strength = listeningStrengthMessage(percent)
  const strengthEn = listeningStrengthMessageEn(percent)
  const weakHint = listeningWeakAreasHint(percent)

  const persistAttempt = useCallback(async () => {
    if (!content || savedRef.current || phase !== 'summary') return
    savedRef.current = true
    const timeSpentMs = Date.now() - startedAtRef.current
    try {
      await persistTefPrepListeningAttempt(supabase, user?.id, {
        tefUnit,
        listeningCatalogId: content.tef_task_id,
        scorePercent: percent,
        correctCount,
        totalQuestions: questions.length,
        answers: answersLog,
        timeSpentMs,
        cefrEstimate: cefr,
      })
    } catch (e) {
      console.warn('[tef_prep_progress]', e)
      savedRef.current = false
    }
  }, [answersLog, cefr, content, correctCount, percent, phase, questions.length, tefUnit, user?.id])

  useEffect(() => {
    if (phase === 'summary') void persistAttempt()
  }, [phase, persistAttempt])

  const onSubmit = () => {
    if (currentQ == null || selected == null) return
    const ok = selected === currentQ.answer_index
    setResults((r) => [...r, ok])
    setAnswersLog((a) => [...a, { questionIndex: qIndex, selectedIndex: selected, correct: ok }])
    setShowResult(true)
  }

  const onNext = () => {
    if (qIndex >= questions.length - 1) {
      setPhase('summary')
      return
    }
    setQIndex((i) => i + 1)
    setSelected(null)
    setShowResult(false)
  }

  const goWeakPractice = () => {
    const unitId = 'a2-u1'
    const moduleId = getModuleIdForContentUnit(unitId)
    navigate(`/lesson/${unitId}${moduleId ? `?module=${encodeURIComponent(moduleId)}` : ''}`)
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-700">
        Contenu d’écoute introuvable pour cette unité.
      </div>
    )
  }

  const answeredCount = results.length
  const progressRatio = questions.length ? answeredCount / questions.length : 0

  if (phase === 'summary') {
    return (
      <div className="space-y-4 pb-8">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <h2 className="text-center text-xl font-bold text-slate-900">Bravo !</h2>
          <p className="mt-2 text-center text-3xl font-extrabold text-emerald-700">
            {correctCount}/{questions.length}
          </p>
          <p className="mt-1 text-center text-base text-slate-600">{percent} % correct</p>
          <p className="mt-2 text-center text-base font-semibold text-slate-800">
            You got {percent}% — {strengthEn}
          </p>
          <p className="mt-3 text-center text-lg font-semibold text-slate-800">Niveau estimé (pratique) : {cefr}</p>
          <p className="mt-1 text-center text-sm leading-5 text-slate-600">{strength}</p>
          {weakHint ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-sm text-amber-950">{weakHint}</p>
              <button
                type="button"
                onClick={goWeakPractice}
                className="mt-3 w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
              >
                Leçon suggérée : événements passés (A2)
              </button>
              <Link
                to="/#syllabus"
                className="mt-2 flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-50"
              >
                Ouvrir le syllabus
              </Link>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          className="flex w-full flex-row items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-4 text-base font-bold text-slate-900 hover:bg-slate-50"
        >
          <FileText className="h-5 w-5" />
          Revoir la transcription
        </button>

        {reviewOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white p-4 shadow-xl sm:rounded-2xl">
              <div className="mb-2 flex flex-row items-center justify-between">
                <h3 id="review-title" className="text-lg font-bold text-slate-900">
                  Transcription
                </h3>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto text-sm leading-7 text-slate-800">{content.transcript_fr}</div>
              {content.gloss_en ? <p className="mt-4 text-xs italic text-slate-500">{content.gloss_en}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold text-slate-500">{content.tef_task_id}</p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">
          Unit {tefUnit}: Listening Practice — Duration {formatDuration(content.duration_seconds_approx ?? 60)}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Unité {tefUnit} : pratique orale · ~{formatDuration(content.duration_seconds_approx ?? 60)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {content.level} · scénario : {content.scenario.replace(/_/g, ' ')}
        </p>
      </div>

      <WebListeningAudioPlayer
        contentId={`${content.tef_task_id}_tef_u${tefUnit}`}
        audioUri={content.audio_uri}
        transcript={content.transcript_fr}
        title="Écoute"
        durationHintMs={(content.duration_seconds_approx ?? 60) * 1000}
        initialSpeed={clampPlayerSpeed(content.playback_speed)}
        persistPosition
        answerGate="after_play_started"
        playbackEngagedOverride={ttsEngaged}
      >
        {(gate) => (
          <>
            {!content.audio_uri ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-900">Pas de fichier audio : lecture TTS pour simuler l’écoute.</p>
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel()
                    speakFrCa(content.transcript_fr)
                    setTtsEngaged(true)
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  <Volume2 className="h-4 w-4" />
                  Lancer la lecture TTS
                </button>
              </div>
            ) : null}

            {!gate.hasPlaybackEverStarted ? (
              <div className="mt-4 rounded-xl bg-slate-100 p-4">
                <p className="text-center text-sm text-slate-600">
                  Appuyez sur lecture (ou TTS) pour afficher les questions — format TEF.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-2 flex flex-row items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    Question {qIndex + 1} of {questions.length}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    {answeredCount}/{questions.length} answered
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progressRatio * 100}%` }} />
                </div>

                {currentQ ? (
                  <>
                    <p className="mt-4 text-base font-semibold leading-6 text-slate-900">{currentQ.question_fr}</p>

                    <div className="mt-3 flex flex-col gap-2">
                      {currentQ.options.map((opt, oi) => {
                        const picked = selected === oi
                        const locked = !gate.canSelectAnswers || showResult
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={locked}
                            onClick={() => {
                              if (locked) return
                              setSelected(oi)
                            }}
                            className={`flex flex-row items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                              locked ? 'cursor-not-allowed opacity-50' : ''
                            } ${picked ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                                picked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600'
                              }`}
                            >
                              {LETTERS[oi]}
                            </span>
                            <span className="flex-1 text-slate-800">{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    {showResult && selected != null ? (
                      <div
                        className={`mt-4 rounded-xl border p-4 ${
                          selected === currentQ.answer_index
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-rose-300 bg-rose-50'
                        }`}
                      >
                        <p className="text-base font-bold text-slate-900">
                          {selected === currentQ.answer_index ? 'Correct !' : 'Incorrect'}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-700">{currentQ.explanation_fr}</p>
                        <button
                          type="button"
                          onClick={onNext}
                          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-base font-bold text-white hover:bg-slate-800"
                        >
                          {qIndex >= questions.length - 1 ? 'Voir le bilan' : 'Question suivante'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={onSubmit}
                        disabled={selected == null || !gate.canSelectAnswers}
                        className={`mt-5 w-full rounded-xl py-3.5 text-base font-bold text-white ${
                          selected == null || !gate.canSelectAnswers ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Valider la réponse
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </>
        )}
      </WebListeningAudioPlayer>
    </div>
  )
}
