import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CodexPhase = 'discovery' | 'rule_master' | 'masters_guild'

export type FeedbackKind = 'correct' | 'incorrect' | 'neutral'

export type ConjugationCodexPersisted = {
  phase: CodexPhase
  xp: number
  streakDays: number
  lastPlayedDateKey: string | null
  phaseDiscoveryComplete: boolean
  phaseRuleMasterComplete: boolean
  phaseMastersGuildUnlocked: boolean
  totalReviews: number
  correctReviews: number
}

type ConjugationCodexState = ConjugationCodexPersisted & {
  feedback: { kind: FeedbackKind; title: string; message: string } | null

  setPhase: (phase: CodexPhase) => void
  advanceToNextPhase: () => void
  markPhaseComplete: (phase: CodexPhase) => void
  addXp: (amount: number) => void
  bumpStreakIfNeeded: () => void
  recordReview: (correct: boolean) => void
  showFeedback: (kind: FeedbackKind, title: string, message: string) => void
  clearFeedback: () => void
  resetSession: () => void
}

const PHASE_ORDER: CodexPhase[] = ['discovery', 'rule_master', 'masters_guild']

function nextPhase(current: CodexPhase): CodexPhase | null {
  const i = PHASE_ORDER.indexOf(current)
  if (i < 0 || i >= PHASE_ORDER.length - 1) return null
  return PHASE_ORDER[i + 1]!
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const initialPersisted: ConjugationCodexPersisted = {
  phase: 'discovery',
  xp: 0,
  streakDays: 0,
  lastPlayedDateKey: null,
  phaseDiscoveryComplete: false,
  phaseRuleMasterComplete: false,
  phaseMastersGuildUnlocked: false,
  totalReviews: 0,
  correctReviews: 0,
}

export const useConjugationCodexStore = create<ConjugationCodexState>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      feedback: null,

      setPhase: (phase) => set({ phase }),

      advanceToNextPhase: () => {
        const { phase } = get()
        const n = nextPhase(phase)
        if (n) set({ phase: n })
      },

      markPhaseComplete: (completedPhase) => {
        const updates: Partial<ConjugationCodexPersisted> = {}
        if (completedPhase === 'discovery') {
          updates.phaseDiscoveryComplete = true
          updates.phase = 'rule_master'
        }
        if (completedPhase === 'rule_master') {
          updates.phaseRuleMasterComplete = true
          updates.phase = 'masters_guild'
          updates.phaseMastersGuildUnlocked = true
        }
        set(updates)
      },

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      bumpStreakIfNeeded: () => {
        const key = todayKey()
        const { lastPlayedDateKey, streakDays } = get()
        if (lastPlayedDateKey === key) return
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yKey = yesterday.toISOString().slice(0, 10)
        let nextStreak = streakDays
        if (lastPlayedDateKey === null) nextStreak = 1
        else if (lastPlayedDateKey === yKey) nextStreak = streakDays + 1
        else nextStreak = 1
        set({ lastPlayedDateKey: key, streakDays: nextStreak })
      },

      recordReview: (correct) => {
        set((s) => ({
          totalReviews: s.totalReviews + 1,
          correctReviews: s.correctReviews + (correct ? 1 : 0),
        }))
      },

      showFeedback: (kind, title, message) => set({ feedback: { kind, title, message } }),

      clearFeedback: () => set({ feedback: null }),

      resetSession: () =>
        set({
          ...initialPersisted,
          feedback: null,
        }),
    }),
    {
      name: 'conjugation_codex_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s): ConjugationCodexPersisted => ({
        phase: s.phase,
        xp: s.xp,
        streakDays: s.streakDays,
        lastPlayedDateKey: s.lastPlayedDateKey,
        phaseDiscoveryComplete: s.phaseDiscoveryComplete,
        phaseRuleMasterComplete: s.phaseRuleMasterComplete,
        phaseMastersGuildUnlocked: s.phaseMastersGuildUnlocked,
        totalReviews: s.totalReviews,
        correctReviews: s.correctReviews,
      }),
    },
  ),
)

export function selectRetentionPercent(s: ConjugationCodexPersisted): number {
  if (s.totalReviews <= 0) return 0
  return Math.round((s.correctReviews / s.totalReviews) * 100)
}

export function getConjugationCodexPersistedSnapshot(): ConjugationCodexPersisted {
  const s = useConjugationCodexStore.getState()
  return {
    phase: s.phase,
    xp: s.xp,
    streakDays: s.streakDays,
    lastPlayedDateKey: s.lastPlayedDateKey,
    phaseDiscoveryComplete: s.phaseDiscoveryComplete,
    phaseRuleMasterComplete: s.phaseRuleMasterComplete,
    phaseMastersGuildUnlocked: s.phaseMastersGuildUnlocked,
    totalReviews: s.totalReviews,
    correctReviews: s.correctReviews,
  }
}
