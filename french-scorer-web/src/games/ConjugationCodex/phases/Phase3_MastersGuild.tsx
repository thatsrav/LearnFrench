import { CalendarClock, ClipboardList } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useConjugationState } from '../hooks/useConjugationState'
import { useSRS } from '../hooks/useSRS'
import { isAnswerCorrect } from '../lib/answerCheck'
import type { ConjugationCard } from '../data/mastersGuildCards'
import { playSoundEffect } from '../../../services/soundEffects'

/**
 * Phase 3: Master's Guild — daily SRS-style reviews with persisted scheduling.
 */
export function Phase3_MastersGuild() {
  const { addXp, bumpStreakIfNeeded, recordReview, showFeedback, clearFeedback, setPhase } = useConjugationState()
  const { ready, sessionQueue, rawDueCount, sessionCap, recordSchedulingOutcome, refreshSession } = useSRS()

  const inputRef = useRef<HTMLInputElement>(null)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [reveal, setReveal] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)

  const totalSession = sessionQueue.length
  const sessionComplete = totalSession > 0 && index >= totalSession
  const current: ConjugationCard | null = index < totalSession ? sessionQueue[index]! : null
  const remainingInQueue = current ? totalSession - index : 0

  useEffect(() => {
    if (current) inputRef.current?.focus()
  }, [current, index])

  const advanceCard = useCallback(
    (delayMs: number) => {
      window.setTimeout(() => {
        clearFeedback()
        setInput('')
        setReveal(false)
        setWrongAttempts(0)
        setSubmitting(false)
        setIndex((i) => i + 1)
      }, delayMs)
    },
    [clearFeedback, totalSession],
  )

  const onCheck = useCallback(() => {
    if (!current || submitting || sessionComplete) return

    const ok = isAnswerCorrect(input, current.answers)

    if (ok) {
      setSubmitting(true)
      playSoundEffect('success')
      bumpStreakIfNeeded()
      addXp(8)
      setSessionXp((x) => x + 8)
      setSessionCorrect((c) => c + 1)
      recordReview(true)
      recordSchedulingOutcome(current.id, true)
      showFeedback('correct', 'Well recalled!', 'Added to long-term memory. Keep the streak going.')
      advanceCard(1000)
      return
    }

    const nextWrong = wrongAttempts + 1
    setWrongAttempts(nextWrong)

    if (nextWrong === 1) {
      addXp(3)
      setSessionXp((x) => x + 3)
    } else {
      addXp(-2)
      setSessionXp((x) => x - 2)
    }

    if (nextWrong >= 3) {
      setSubmitting(true)
      playSoundEffect('error')
      recordReview(false)
      recordSchedulingOutcome(current.id, false)
      showFeedback(
        'incorrect',
        'Getting stronger',
        "You'll see this again soon. Compare your answer with the forms below.",
      )
      advanceCard(1800)
      return
    }

    playSoundEffect('error')
    showFeedback('incorrect', 'Not quite', 'Try again — recall the form without overthinking.')
  }, [
    addXp,
    advanceCard,
    bumpStreakIfNeeded,
    current,
    input,
    recordReview,
    recordSchedulingOutcome,
    sessionComplete,
    showFeedback,
    submitting,
    wrongAttempts,
  ])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onCheck()
    }
  }

  if (!ready) {
    return (
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm text-slate-600">Loading your review queue…</p>
      </section>
    )
  }

  if (totalSession === 0) {
    return (
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm text-slate-600">No review cards are available right now.</p>
        <button
          type="button"
          onClick={() => refreshSession()}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Refresh queue
        </button>
      </section>
    )
  }

  if (sessionComplete) {
    const reviewed = totalSession
    return (
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3 text-indigo-700">
          <CalendarClock className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phase 3</p>
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">
              Master&apos;s Guild
            </h2>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
          <p className="font-display text-lg font-bold text-emerald-900">Daily review complete!</p>
          <p className="mt-2 text-sm text-emerald-800/90">
            {sessionCorrect}/{reviewed} correct
            {sessionXp !== 0 ? (
              <>
                {' '}
                · {sessionXp > 0 ? '+' : ''}
                {sessionXp} XP this session
              </>
            ) : null}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setIndex(0)
                setSessionXp(0)
                setSessionCorrect(0)
                refreshSession()
              }}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Review again
            </button>
            <button
              type="button"
              onClick={() => setPhase('discovery')}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Return to phases
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!current) return null

  return (
    <section
      className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8"
      aria-label={`SRS card: ${current.verb}, ${current.pronoun}, ${current.tense}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 text-indigo-700">
          <CalendarClock className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phase 3</p>
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">
              Master&apos;s Guild
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">Daily SRS reviews</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            <ClipboardList className="h-4 w-4 text-slate-500" aria-hidden />
            {rawDueCount} due today
          </div>
          {sessionQueue.length < rawDueCount ? (
            <span className="max-w-[14rem] text-right text-[10px] font-medium text-slate-500">
              Reviewing {sessionQueue.length} now (cap {sessionCap}); the rest stay queued
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Recall the conjugation without thinking too hard — let the form surface on its own.
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-900 ring-1 ring-indigo-100">
            Verb: {current.verb}
          </span>
          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-800 ring-1 ring-slate-200">
            Pronoun: {current.pronoun}
          </span>
          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-violet-900 ring-1 ring-violet-100">
            Tense: {current.tense}
          </span>
        </div>

        <p className="text-center text-base italic text-slate-700">What is the conjugation?</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={submitting}
            placeholder="Type answer…"
            aria-label="Type the conjugated answer"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-indigo-500/0 transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => onCheck()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            Check
          </button>
        </div>

        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline"
        >
          {reveal ? 'Hide answer' : 'Reveal answer'}
        </button>

        {reveal ? (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50/90 px-4 py-3 text-sm font-semibold text-emerald-900">
            {current.answers.join(' · ')}
          </p>
        ) : null}

        <p className="text-sm text-slate-500">
          {remainingInQueue} remaining in this session{wrongAttempts > 0 ? ` · Attempt ${wrongAttempts} of 3` : ''}
        </p>
      </div>
    </section>
  )
}
