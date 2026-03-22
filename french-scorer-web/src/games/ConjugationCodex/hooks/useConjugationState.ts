import { useShallow } from 'zustand/react/shallow'
import { selectRetentionPercent, useConjugationCodexStore, type CodexPhase } from '../conjugationCodexStore'

/** Phase + transition actions (Zustand shell). */
export function useConjugationState() {
  return useConjugationCodexStore(
    useShallow((s) => ({
      phase: s.phase,
      setPhase: s.setPhase,
      advanceToNextPhase: s.advanceToNextPhase,
      markPhaseComplete: s.markPhaseComplete,
      addXp: s.addXp,
      bumpStreakIfNeeded: s.bumpStreakIfNeeded,
      recordReview: s.recordReview,
      showFeedback: s.showFeedback,
      clearFeedback: s.clearFeedback,
      resetSession: s.resetSession,
      phaseDiscoveryComplete: s.phaseDiscoveryComplete,
      phaseRuleMasterComplete: s.phaseRuleMasterComplete,
      phaseMastersGuildUnlocked: s.phaseMastersGuildUnlocked,
    })),
  )
}

export function useConjugationHudStats() {
  return useConjugationCodexStore(
    useShallow((s) => ({
      xp: s.xp,
      streakDays: s.streakDays,
      retentionPercent: selectRetentionPercent(s),
      totalReviews: s.totalReviews,
    })),
  )
}

export function useConjugationFeedback() {
  return useConjugationCodexStore(
    useShallow((s) => ({
      feedback: s.feedback,
      clearFeedback: s.clearFeedback,
    })),
  )
}

export type { CodexPhase }
