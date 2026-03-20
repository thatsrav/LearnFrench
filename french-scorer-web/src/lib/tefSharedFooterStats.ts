/**
 * Shared TEF track footer metrics (Exam readiness, prep days, streak).
 * Used by Oral labs; same keys can be read on Reading/Writing dashboards for consistency.
 */
import { localDateKey } from './readingRoomMissionStorage'

const FOOTER_KEY = 'tef_track_footer_stats_v1'
const STREAK_INC_DATE_KEY = 'tef_footer_streak_increment_date_v1'

export type TefFooterStats = {
  examReadiness: number
  examMax: number
  prepDaysLeft: number
  streakSessions: number
}

const DEFAULTS: TefFooterStats = {
  examReadiness: 712,
  examMax: 900,
  prepDaysLeft: 14,
  streakSessions: 22,
}

export function readTefFooterStats(): TefFooterStats {
  try {
    const raw = localStorage.getItem(FOOTER_KEY)
    if (!raw) return { ...DEFAULTS }
    const o = JSON.parse(raw) as Partial<TefFooterStats>
    return {
      examReadiness: Math.min(900, Math.max(0, Number(o.examReadiness ?? DEFAULTS.examReadiness))),
      examMax: 900,
      prepDaysLeft: Math.max(0, Math.round(Number(o.prepDaysLeft ?? DEFAULTS.prepDaysLeft))),
      streakSessions: Math.max(0, Math.round(Number(o.streakSessions ?? DEFAULTS.streakSessions))),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeTefFooterStats(partial: Partial<TefFooterStats>): void {
  const cur = readTefFooterStats()
  const next: TefFooterStats = {
    examReadiness: partial.examReadiness ?? cur.examReadiness,
    examMax: 900,
    prepDaysLeft: partial.prepDaysLeft ?? cur.prepDaysLeft,
    streakSessions: partial.streakSessions ?? cur.streakSessions,
  }
  try {
    localStorage.setItem(FOOTER_KEY, JSON.stringify(next))
  } catch {
    /* */
  }
}

/** Add points toward exam readiness (capped at 900). */
export function addExamReadiness(delta: number): void {
  const s = readTefFooterStats()
  writeTefFooterStats({ examReadiness: Math.min(900, s.examReadiness + delta) })
}

/** Increment session streak at most once per local calendar day (shared across oral missions). */
export function incrementOralStreakOncePerDay(): void {
  const today = localDateKey()
  try {
    if (localStorage.getItem(STREAK_INC_DATE_KEY) === today) return
    localStorage.setItem(STREAK_INC_DATE_KEY, today)
  } catch {
    return
  }
  const s = readTefFooterStats()
  writeTefFooterStats({ streakSessions: s.streakSessions + 1 })
}
