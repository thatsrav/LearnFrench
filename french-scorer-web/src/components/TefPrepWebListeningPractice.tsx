import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ClipboardList, Clock, FileText, Lightbulb, Volume2, X } from 'lucide-react'
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
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    if (phase !== 'practice') return
    const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

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
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-sm">
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

  const timeStr = `${String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:${String(elapsedSec % 60).padStart(2, '0')}`

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">TEF Listening</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Section A · Unité {tefUnit} · ~{formatDuration(content.duration_seconds_approx ?? 60)} d’écoute
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Temps écoulé</p>
              <p className="text-sm font-bold tabular-nums text-slate-900">{timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Progression</p>
              <p className="text-sm font-bold text-slate-900">
                Question {qIndex + 1} / {questions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <WebListeningAudioPlayer
        contentId={`${content.tef_task_id}_tef_u${tefUnit}`}
        audioUri={content.audio_uri}
        transcript={content.transcript_fr}
        title="Lecteur audio"
        durationHintMs={(content.duration_seconds_approx ?? 60) * 1000}
        initialSpeed={clampPlayerSpeed(content.playback_speed)}
        persistPosition
        answerGate="after_play_started"
        playbackEngagedOverride={ttsEngaged}
        splitLayout
        accent="tef"
        showTitle={false}
        renderLeftColumn={(gate) => (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Enregistrement</p>
                  <p className="text-sm font-semibold text-slate-900">#{String(tefUnit).padStart(3, '0')}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Dialogue : {content.scenario.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {!content.audio_uri ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-950">Pas de fichier audio : lecture TTS pour simuler l’écoute.</p>
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel()
                    speakFrCa(content.transcript_fr)
                    setTtsEngaged(true)
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Volume2 className="h-4 w-4" />
                  Lancer la lecture TTS
                </button>
              </div>
            ) : null}

            {!gate.hasPlaybackEverStarted ? (
              <div className="rounded-xl bg-slate-100 p-5 text-center">
                <p className="text-sm leading-relaxed text-slate-600">
                  Appuyez sur <strong className="text-slate-800">lecture</strong> (ou TTS) pour afficher les questions — format
                  TEF.
                </p>
              </div>
            ) : null}

            <div className="rounded-2xl border-l-4 border-amber-400 bg-[#fef3c7]/90 p-4">
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Conseil d’écoute</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-950/90">
                    Repérez les <strong className="text-amber-800">mots de liaison</strong> (
                    <em>cependant</em>, <em>d’ailleurs</em>) — ils annoncent souvent la réponse attendue.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      >
        {(gate) =>
          !gate.hasPlaybackEverStarted ? (
            <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 p-8 text-center">
              <p className="max-w-xs text-sm text-slate-500">Les questions apparaîtront ici après la première écoute.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Compréhension orale</p>
              <div className="mb-4 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>

              {currentQ ? (
                <>
                  <p className="text-lg font-semibold leading-snug text-slate-900">{currentQ.question_fr}</p>

                  <div className="mt-5 flex flex-col gap-3">
                    {currentQ.options.map((opt, oi) => {
                      const picked = selected === oi
                      const locked = !gate.canSelectAnswers || showResult
                      const showCorrect = showResult && selected != null && oi === currentQ.answer_index
                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            if (locked) return
                            setSelected(oi)
                          }}
                          className={`relative flex flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm transition ${
                            locked ? 'cursor-not-allowed opacity-60' : ''
                          } ${
                            picked
                              ? 'border-[#2563eb] bg-blue-50/80 shadow-sm'
                              : 'border-transparent bg-slate-100/80 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                              picked ? 'border-[#2563eb] bg-[#2563eb] text-white' : 'border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            {LETTERS[oi]}
                          </span>
                          <span className="flex-1 text-slate-800">{opt}</span>
                          {picked && showResult && showCorrect ? (
                            <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  {showResult && selected != null ? (
                    <div className="mt-6 space-y-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div
                          className={`rounded-2xl border p-4 ${
                            selected === currentQ.answer_index
                              ? 'border-emerald-200 bg-emerald-50/90'
                              : 'border-slate-200 bg-slate-50/80 opacity-70'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Check className={`h-5 w-5 ${selected === currentQ.answer_index ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <p className="text-sm font-bold text-slate-900">Excellent travail !</p>
                          </div>
                          {selected === currentQ.answer_index ? (
                            <p className="mt-2 text-sm leading-relaxed text-slate-700">{currentQ.explanation_fr}</p>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">Réponse enregistrée.</p>
                          )}
                        </div>
                        <div
                          className={`rounded-2xl border p-4 ${
                            selected !== currentQ.answer_index
                              ? 'border-amber-200 bg-amber-50/50'
                              : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <X className={`h-5 w-5 ${selected !== currentQ.answer_index ? 'text-amber-700' : 'text-slate-300'}`} />
                            <p className="text-sm font-bold text-slate-800">Pas tout à fait.</p>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {selected !== currentQ.answer_index
                              ? currentQ.explanation_fr
                              : 'Continuez ainsi — chaque détail compte pour le TEF.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={onNext}
                          className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800"
                        >
                          {qIndex >= questions.length - 1 ? 'Voir le bilan' : 'Question suivante'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={onSubmit}
                        disabled={selected == null || !gate.canSelectAnswers}
                        className={`min-w-[10rem] rounded-xl px-10 py-3.5 text-sm font-bold text-white shadow-lg transition ${
                          selected == null || !gate.canSelectAnswers
                            ? 'cursor-not-allowed bg-slate-300'
                            : 'bg-[#2563eb] hover:bg-blue-700'
                        }`}
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )
        }
      </WebListeningAudioPlayer>
    </div>
  )
}
