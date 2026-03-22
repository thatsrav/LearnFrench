import { CalendarClock } from 'lucide-react'
import { useConjugationState } from '../hooks/useConjugationState'

/**
 * Phase 3: Master's Guild — SRS daily reviews (content TBD; useSRS ready in hooks).
 */
export function Phase3_MastersGuild() {
  const { addXp, bumpStreakIfNeeded, recordReview, showFeedback } = useConjugationState()

  const onDemoReview = (correct: boolean) => {
    bumpStreakIfNeeded()
    recordReview(correct)
    addXp(correct ? 8 : 3)
    showFeedback(
      correct ? 'correct' : 'incorrect',
      correct ? 'Well recalled' : 'Scheduled again',
      correct
        ? 'Good retrieval strengthens the trace. More cards will queue here with real SRS.'
        : 'Mistakes are data — this shell will reschedule weak forms more often.',
    )
  }

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
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Daily review queue powered by spaced repetition — small sets, high frequency, long retention.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
        Placeholder · due cards from useSRS + conjugations.json
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onDemoReview(true)}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Demo: correct recall
        </button>
        <button
          type="button"
          onClick={() => onDemoReview(false)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Demo: slip / reschedule
        </button>
      </div>
    </section>
  )
}
