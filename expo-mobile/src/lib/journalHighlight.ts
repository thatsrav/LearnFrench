/**
 * Build highlight ranges from AI feedback (error examples + quoted snippets in suggestions).
 */

function collectPhrases(
  errorExamples: string[],
  suggestions: string[],
  feedbackText: string,
): string[] {
  const phrases = new Set<string>()
  for (const e of errorExamples) {
    const t = e.trim()
    if (t.length >= 2 && t.length < 120) phrases.add(t)
  }
  for (const s of suggestions) {
    const t = s.trim()
    if (t.length >= 3 && t.length < 120) phrases.add(t)
  }
  const blob = `${feedbackText}\n${suggestions.join('\n')}`
  const re = /"([^"]{2,80})"|«([^»]{2,80})»|'([^']{2,80})'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(blob)) !== null) {
    const chunk = (m[1] ?? m[2] ?? m[3] ?? '').trim()
    if (chunk.length >= 2) phrases.add(chunk)
  }
  return [...phrases].sort((a, b) => b.length - a.length)
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  const out: [number, number][] = []
  for (const [s, e] of sorted) {
    if (s >= e) continue
    const last = out[out.length - 1]
    if (!last || s > last[1]) out.push([s, e])
    else last[1] = Math.max(last[1], e)
  }
  return out
}

export type TextSegment = { text: string; highlight: boolean }

/**
 * Split `content` into segments; `highlight` marks likely error spans (best-effort substring match).
 */
export function buildHighlightedSegments(
  content: string,
  errorExamples: string[],
  suggestions: string[],
  feedbackText: string,
): TextSegment[] {
  const phrases = collectPhrases(errorExamples, suggestions, feedbackText)
  const lower = content.toLowerCase()
  const ranges: [number, number][] = []

  for (const p of phrases) {
    const needle = p.toLowerCase()
    let start = 0
    while (start < lower.length) {
      const i = lower.indexOf(needle, start)
      if (i < 0) break
      ranges.push([i, i + p.length])
      start = i + Math.max(1, needle.length)
    }
  }

  if (ranges.length === 0) return [{ text: content, highlight: false }]

  const merged = mergeRanges(ranges)
  const segments: TextSegment[] = []
  let cursor = 0
  for (const [s, e] of merged) {
    if (s > cursor) segments.push({ text: content.slice(cursor, s), highlight: false })
    segments.push({ text: content.slice(s, e), highlight: true })
    cursor = e
  }
  if (cursor < content.length) segments.push({ text: content.slice(cursor), highlight: false })
  return segments
}
