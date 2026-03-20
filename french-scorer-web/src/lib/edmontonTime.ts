/**
 * Daily oral content & locks use America/Edmonton (Cold Lake / Alberta).
 * DST matches Edmonton; not the same as UTC or user local midnight.
 */

const TZ = 'America/Edmonton'

/** YYYY-MM-DD in Edmonton for `now` (default: current instant). */
export function edmontonDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  if (!y || !m || !d) {
    const fallback = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`
  }
  return `${y}-${m}-${d}`
}

/** Milliseconds until the next calendar day begins in Edmonton (first instant where YYYY-MM-DD advances). */
export function msUntilEdmontonMidnight(now = new Date()): number {
  const cur = edmontonDateKey(now)
  let lo = now.getTime()
  let hi = now.getTime() + 50 * 60 * 60 * 1000
  while (hi - lo > 500) {
    const mid = Math.floor((lo + hi) / 2)
    if (edmontonDateKey(new Date(mid)) === cur) lo = mid
    else hi = mid
  }
  return Math.max(0, hi - now.getTime())
}
