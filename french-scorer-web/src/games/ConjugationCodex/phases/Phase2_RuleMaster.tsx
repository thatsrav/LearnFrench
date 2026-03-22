import { Target } from 'lucide-react'
import { useConjugationState } from '../hooks/useConjugationState'

/**
 * Phase 2: Rule Master — explicit practice with feedback (content TBD).
 */
export function Phase2_RuleMaster() {
  const { markPhaseComplete, addXp, bumpStreakIfNeeded, showFeedback } = useConjugationState()

  const onComplete = () => {
    bumpStreakIfNeeded()
    addXp(25)
    markPhaseComplete('rule_master')
    showFeedback(
      'correct',
      'Rules anchored',
      "Explicit practice with immediate feedback will live here. Next: spaced reviews in the Master's Guild.",
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3 text-indigo-700">
        <Target className="h-8 w-8 shrink-0" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phase 2</p>
          <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">Rule Master</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Short, targeted prompts with clear correctness — build speed and accuracy before long-term scheduling.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
        Placeholder · conjugation prompts & feedback loop
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="mt-8 w-full rounded-xl bg-[var(--atelier-navy-deep)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#001438] sm:w-auto"
      >
        Complete rule practice (demo) → Master&apos;s Guild
      </button>
    </section>
  )
}
