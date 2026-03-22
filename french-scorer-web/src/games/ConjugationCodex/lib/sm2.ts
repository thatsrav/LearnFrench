/**
 * Simplified SM-2 (SuperMemo-2) scheduling for conjugation cards.
 * Correct: interval *= ease_factor, then ease_factor += 0.1
 * Wrong: interval = 1 day, ease_factor = max(1.3, ease_factor - 0.2)
 */

export type SrsCardState = {
  easeFactor: number
  intervalDays: number
  /** YYYY-MM-DD — due when today >= nextReviewDate */
  nextReviewDate: string
}

export const SM2_MIN_EASE = 1.3
export const SM2_INITIAL_EASE = 2.5
export const SM2_INITIAL_INTERVAL_DAYS = 1

export function todayKeyLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addCalendarDays(dateKey: string, days: number): string {
  const base = new Date(`${dateKey}T12:00:00`)
  base.setDate(base.getDate() + Math.max(0, Math.ceil(days)))
  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function createDefaultSrsState(today: string = todayKeyLocal()): SrsCardState {
  return {
    easeFactor: SM2_INITIAL_EASE,
    intervalDays: SM2_INITIAL_INTERVAL_DAYS,
    nextReviewDate: today,
  }
}

export function isCardDue(state: SrsCardState, today: string = todayKeyLocal()): boolean {
  return state.nextReviewDate <= today
}

/** Strength tier for session mixing (50% weak / 30% medium / 20% strong). */
export type CardStrength = 'weak' | 'medium' | 'strong'

export function cardStrength(state: SrsCardState): CardStrength {
  if (state.easeFactor < 2.2 || state.intervalDays < 4) return 'weak'
  if (state.easeFactor < 2.65 || state.intervalDays < 14) return 'medium'
  return 'strong'
}

export function applySm2Correct(state: SrsCardState, today: string = todayKeyLocal()): SrsCardState {
  const nextEase = state.easeFactor + 0.1
  const nextInterval = Math.max(1, state.intervalDays * state.easeFactor)
  return {
    easeFactor: nextEase,
    intervalDays: nextInterval,
    nextReviewDate: addCalendarDays(today, nextInterval),
  }
}

export function applySm2Wrong(state: SrsCardState, today: string = todayKeyLocal()): SrsCardState {
  const nextEase = Math.max(SM2_MIN_EASE, state.easeFactor - 0.2)
  return {
    easeFactor: nextEase,
    intervalDays: 1,
    nextReviewDate: addCalendarDays(today, 1),
  }
}
