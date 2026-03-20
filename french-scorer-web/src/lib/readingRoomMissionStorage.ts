/**
 * Daily Reading Mission — local gatekeeper (per device).
 * Contract: `lastStoryCompletedDate` is local calendar YYYY-MM-DD.
 */
export const LS_LAST_STORY_COMPLETED_DATE = 'lastStoryCompletedDate'
export const LS_LAST_DAILY_VOCAB = 'reading_room_daily_vocab_json'
export const LS_LAST_STORY_META = 'reading_room_last_story_meta_json'

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isDailyMissionLockedToday(): boolean {
  try {
    const done = localStorage.getItem(LS_LAST_STORY_COMPLETED_DATE)
    return done === localDateKey()
  } catch {
    return false
  }
}

export type DailyVocabItem = { fr: string; en: string }

export function saveMissionComplete(payload: {
  vocab: DailyVocabItem[]
  storyId: string
  title: string
}): void {
  const key = localDateKey()
  try {
    localStorage.setItem(LS_LAST_STORY_COMPLETED_DATE, key)
    localStorage.setItem(LS_LAST_DAILY_VOCAB, JSON.stringify(payload.vocab))
    localStorage.setItem(
      LS_LAST_STORY_META,
      JSON.stringify({ storyId: payload.storyId, title: payload.title, date: key }),
    )
  } catch {
    /* quota */
  }
}

export function loadLastDailyVocab(): DailyVocabItem[] {
  try {
    const raw = localStorage.getItem(LS_LAST_DAILY_VOCAB)
    if (!raw) return []
    const p = JSON.parse(raw) as unknown
    if (!Array.isArray(p)) return []
    return p.filter(
      (x): x is DailyVocabItem =>
        typeof x === 'object' &&
        x !== null &&
        'fr' in x &&
        'en' in x &&
        typeof (x as DailyVocabItem).fr === 'string' &&
        typeof (x as DailyVocabItem).en === 'string',
    )
  } catch {
    return []
  }
}

export function loadLastStoryMeta(): { storyId: string; title: string; date: string } | null {
  try {
    const raw = localStorage.getItem(LS_LAST_STORY_META)
    if (!raw) return null
    const o = JSON.parse(raw) as { storyId?: string; title?: string; date?: string }
    if (!o.storyId || !o.title) return null
    return { storyId: o.storyId, title: o.title, date: o.date ?? '' }
  } catch {
    return null
  }
}

/** Milliseconds until next local midnight. */
export function msUntilLocalMidnight(now = new Date()): number {
  const next = new Date(now)
  next.setDate(now.getDate() + 1)
  next.setHours(0, 0, 0, 0)
  return Math.max(0, next.getTime() - now.getTime())
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}
