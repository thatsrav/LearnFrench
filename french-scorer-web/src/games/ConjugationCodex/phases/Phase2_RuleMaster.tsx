import { BookOpen, Target } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { ConjugationsBundle } from '../data/conjugationsSchema'
import conjugationsBundle from '../data/conjugations.json'
import { useConjugationState } from '../hooks/useConjugationState'
import { isAnswerCorrect } from '../lib/answerCheck'
import {
  pickContextQuestionSession,
  type RuleMasterContextQuestion,
} from '../lib/contextQuestionPool'

const BUNDLE = conjugationsBundle as ConjugationsBundle

const SESSION_STORAGE_KEY = 'ccx:rule_master_session'

type SessionPersist = {
  v: 1
  questionIds: string[]
  cursor: number
}

function loadPersist(): SessionPersist | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as SessionPersist
    if (p?.v !== 1 || !Array.isArray(p.questionIds)) return null
    return p
  } catch {
    return null
  }
}

function savePersist(p: SessionPersist) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

function clearPersist() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function questionById(id: string): RuleMasterContextQuestion | null {
  const q = BUNDLE.practice_questions.find((x) => x.id === id)
  if (!q || q.type !== 'context' || !q.accepted?.length || !q.context) return null
  return {
    id: q.id,
    verb_id: q.verb_id,
    tense: q.tense,
    pronoun: q.pronoun,
    context: q.context,
    sentence: q.sentence,
    english: q.english,
    accepted: [...q.accepted],
    explanation: q.explanation,
    wrongHint: `Check the subject (${q.pronoun}) and tense (${q.tense.replace(/_/g, ' ')}).`,
    optionalHint:
      q.tense === 'passe_compose'
        ? 'Passé composé: auxiliary + past participle — what fits the blank?'
        : q.tense === 'present'
          ? 'Present tense: match the subject to the correct verb form.'
          : undefined,
    difficulty: q.difficulty,
  }
}

function resolveSessionQuestions(persist: SessionPersist | null): RuleMasterContextQuestion[] {
  if (persist?.questionIds?.length) {
    const rows = persist.questionIds.map(questionById).filter((x): x is RuleMasterContextQuestion => x !== null)
    if (rows.length === persist.questionIds.length) return rows
  }
  const fresh = pickContextQuestionSession(BUNDLE, { verbId: 'aller_001', minCount: 5, maxCount: 10 })
  savePersist({ v: 1, questionIds: fresh.map((q) => q.id), cursor: 0 })
  return fresh
}

function renderSentenceWithBlank(sentence: string) {
  const parts = sentence.split('____')
  if (parts.length < 2) {
    return <span className="font-semibold text-slate-800">{sentence}</span>
  }
  return (
    <span className="font-semibold text-slate-800">
      {parts[0]}
      <span className="mx-1 inline-block min-w-[4.5rem] border-b-2 border-slate-400 pb-0.5 text-center text-slate-400">
        ____
      </span>
      {parts.slice(1).join('____')}
    </span>
  )
}

/**
 * Phase 2: Rule Master — narrative context blanks with immediate feedback.
 */
export function Phase2_RuleMaster() {
  const {
    markPhaseComplete,
    addXp,
    bumpStreakIfNeeded,
    recordReview,
    showFeedback,
    clearFeedback,
  } = useConjugationState()

  const inputRef = useRef<HTMLInputElement>(null)
  const [questions, setQuestions] = useState<RuleMasterContextQuestion[]>(() =>
    resolveSessionQuestions(loadPersist()),
  )
  const [cursor, setCursor] = useState(() => loadPersist()?.cursor ?? 0)
  const [input, setInput] = useState('')
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [hintOpen, setHintOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  const total = questions.length
  const current = total > 0 ? questions[Math.min(cursor, total - 1)]! : null

  useEffect(() => {
    if (current && !sessionComplete) {
      inputRef.current?.focus()
    }
  }, [current, cursor, sessionComplete])

  const syncCursorToStorage = useCallback((nextCursor: number, qs: RuleMasterContextQuestion[]) => {
    savePersist({ v: 1, questionIds: qs.map((q) => q.id), cursor: nextCursor })
  }, [])

  const advanceAfterDelay = useCallback(
    (ms: number, nextCursor: number) => {
      window.setTimeout(() => {
        clearFeedback()
        setInput('')
        setWrongAttempts(0)
        setHintOpen(false)
        if (nextCursor >= total) {
          setSessionComplete(true)
          clearPersist()
        } else {
          setCursor(nextCursor)
          syncCursorToStorage(nextCursor, questions)
        }
        setSubmitting(false)
      }, ms)
    },
    [clearFeedback, questions, syncCursorToStorage, total],
  )

  const startNewDeck = useCallback(() => {
    clearPersist()
    const fresh = pickContextQuestionSession(BUNDLE, { verbId: 'aller_001', minCount: 5, maxCount: 10 })
    setQuestions(fresh)
    setCursor(0)
    setInput('')
    setWrongAttempts(0)
    setHintOpen(false)
    setSessionComplete(false)
    savePersist({ v: 1, questionIds: fresh.map((q) => q.id), cursor: 0 })
  }, [])

  const onSubmit = useCallback(() => {
    if (!current || submitting || sessionComplete) return
    const ok = isAnswerCorrect(input, current.accepted)

    if (ok) {
      setSubmitting(true)
      bumpStreakIfNeeded()
      addXp(10)
      recordReview(true)
      showFeedback('correct', 'Excellent!', current.explanation)
      const next = cursor + 1
      advanceAfterDelay(2000, next)
      return
    }

    const nextWrong = wrongAttempts + 1
    setWrongAttempts(nextWrong)
    addXp(2)
    recordReview(false)

    if (nextWrong >= 3) {
      setSubmitting(true)
      showFeedback('neutral', 'Moving on', `${current.explanation} You will get another pass later.`)
      window.setTimeout(() => {
        clearFeedback()
        const next = cursor + 1
        setInput('')
        setWrongAttempts(0)
        setHintOpen(false)
        if (next >= total) {
          setSessionComplete(true)
          clearPersist()
        } else {
          setCursor(next)
          syncCursorToStorage(next, questions)
        }
        setSubmitting(false)
      }, 2000)
      return
    }

    const hintLine = current.optionalHint ? `${current.wrongHint} ${current.optionalHint}` : current.wrongHint
    showFeedback('incorrect', 'Close, try again', hintLine)
  }, [
    addXp,
    advanceAfterDelay,
    bumpStreakIfNeeded,
    clearFeedback,
    cursor,
    current,
    input,
    questions,
    recordReview,
    sessionComplete,
    showFeedback,
    submitting,
    syncCursorToStorage,
    total,
    wrongAttempts,
  ])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  const progressLabel = useMemo(() => {
    if (total === 0) return ''
    return `Question ${Math.min(cursor + 1, total)} of ${total}`
  }, [cursor, total])

  if (sessionComplete) {
    return (
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3 text-indigo-700">
          <Target className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phase 2</p>
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">Rule Master</h2>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
          <p className="font-display text-lg font-bold text-emerald-900">Phase 2 complete!</p>
          <p className="mt-2 text-sm text-emerald-800/90">
            You practiced context sentences with <strong>aller</strong>. Ready for daily reviews in the Master&apos;s Guild?
          </p>
          <button
            type="button"
            onClick={() => {
              bumpStreakIfNeeded()
              addXp(25)
              markPhaseComplete('rule_master')
              showFeedback(
                'correct',
                'Master’s Guild unlocked',
                'Open Phase 3 for spaced repetition reviews. Your progress is saved.',
              )
            }}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            Next phase: Master&apos;s Guild (SRS reviews)
          </button>
          <button
            type="button"
            onClick={startNewDeck}
            className="mt-4 block w-full text-center text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline sm:w-auto"
          >
            Practice another deck
          </button>
        </div>
      </section>
    )
  }

  if (!current) {
    return (
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm text-slate-600">No context questions available. Check conjugations data.</p>
        <button type="button" onClick={startNewDeck} className="mt-4 text-sm font-semibold text-indigo-600">
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 text-indigo-700">
          <Target className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phase 2</p>
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">Rule Master</h2>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{progressLabel}</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Read the scene, then type the missing conjugation. Accent errors are forgiven when close.
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          <p className="text-sm italic text-slate-600">{current.context}</p>
        </div>

        <p className="text-base md:text-lg leading-relaxed">{renderSentenceWithBlank(current.sentence)}</p>

        {current.english ? (
          <p className="text-xs text-slate-500" lang="en">
            {current.english}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={submitting}
            placeholder="Type conjugated form…"
            aria-label="Type the conjugated verb form"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-indigo-500/0 transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => onSubmit()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            Submit
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setHintOpen((v) => !v)}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            {hintOpen ? 'Hide hint' : 'Hint'}
          </button>
          <button
            type="button"
            onClick={startNewDeck}
            className="text-sm font-semibold text-slate-400 transition hover:text-slate-600"
          >
            New deck
          </button>
        </div>

        {hintOpen && current.optionalHint ? (
          <p className="rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">{current.optionalHint}</p>
        ) : null}
      </div>
    </section>
  )
}
