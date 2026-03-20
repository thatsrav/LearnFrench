import { localDateKey } from './readingRoomMissionStorage'

const SUBMITTED_KEY = 'writing_area_composition_submitted_v1'

export type WritingSubmittedRecord = {
  dateKey: string
  level: string
}

function normalizeLevel(raw: string): string {
  const u = raw.toUpperCase().trim()
  if (u.startsWith('A1')) return 'A1'
  if (u.startsWith('A2')) return 'A2'
  if (u.startsWith('B1')) return 'B1'
  if (u.startsWith('B2')) return 'B2'
  if (u.startsWith('C1') || u.startsWith('C2')) return 'C1'
  return 'B1'
}

export function isWritingCompositionLockedToday(userLevelRaw: string): boolean {
  const level = normalizeLevel(userLevelRaw)
  const today = localDateKey()
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY)
    if (!raw) return false
    const o = JSON.parse(raw) as WritingSubmittedRecord
    return o.dateKey === today && o.level === level
  } catch {
    return false
  }
}

export function markWritingCompositionSubmitted(userLevelRaw: string): void {
  const level = normalizeLevel(userLevelRaw)
  const rec: WritingSubmittedRecord = { dateKey: localDateKey(), level }
  try {
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(rec))
  } catch {
    /* quota */
  }
}

/** For debugging / admin — not exposed in UI by default */
export function clearWritingCompositionLock(): void {
  try {
    localStorage.removeItem(SUBMITTED_KEY)
  } catch {
    /* */
  }
}

export const SCORER_PREFILL_FROM_WRITING_KEY = 'writing_area_prefill_for_scorer_v1'
