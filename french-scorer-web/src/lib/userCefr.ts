/** Shared CEFR read from recent AI scores (same key as AppShell). */
const RECENT_SCORES_KEY = 'french_scorer_recent_scores_v1'

export function readUserCefrLevel(): string {
  try {
    const raw = localStorage.getItem(RECENT_SCORES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed) || parsed.length === 0) return 'B2'
    const last = parsed[parsed.length - 1] as { cecr?: string }
    const c = String(last?.cecr ?? '').trim()
    return c || 'B2'
  } catch {
    return 'B2'
  }
}

const BADGE: Record<string, string> = {
  A1: 'A1 Beginner',
  A2: 'A2 Elementary',
  B1: 'B1 Intermediate',
  B2: 'B2 Upper Intermediate',
  C1: 'C1 Advanced',
  C2: 'C2 Mastery',
}

/** Badge label for header pills (e.g. B1 Intermediate). */
export function levelBadgeLabel(raw: string): string {
  const u = raw.toUpperCase().trim()
  if (u.startsWith('A1')) return BADGE.A1
  if (u.startsWith('A2')) return BADGE.A2
  if (u.startsWith('B1')) return BADGE.B1
  if (u.startsWith('B2')) return BADGE.B2
  if (u.startsWith('C1')) return BADGE.C1
  if (u.startsWith('C2')) return BADGE.C2
  return BADGE.B1
}
