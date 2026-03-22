/**
 * Lenient French answer matching: lowercase, trim, strip accents, optional edit distance.
 */

const ACCENT_MAP: Record<string, string> = {
  à: 'a',
  â: 'a',
  ä: 'a',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  î: 'i',
  ï: 'i',
  ô: 'o',
  ö: 'o',
  û: 'u',
  ù: 'u',
  ü: 'u',
  ç: 'c',
  æ: 'ae',
  œ: 'oe',
}

export function stripAccents(s: string): string {
  let out = ''
  for (const ch of s) {
    const lower = ch.toLowerCase()
    out += ACCENT_MAP[lower] ?? lower
  }
  return out
}

export function normalizeAnswer(input: string): string {
  const t = stripAccents(input.trim().toLowerCase())
  return t.replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  if (a.length < b.length) return levenshtein(b, a)
  if (b.length === 0) return a.length
  const prev = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    let cur = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const next = Math.min(
        cur + 1,
        prev[j]! + 1,
        prev[j - 1]! + cost,
      )
      prev[j - 1] = cur
      cur = next
    }
    prev[b.length] = cur
  }
  return prev[b.length]!
}

export type AnswerCheckOptions = {
  /** Accept answers within this edit distance of a normalized accepted form (single-token only). */
  maxTypoDistance?: number
}

export function isAnswerCorrect(
  rawInput: string,
  acceptedForms: readonly string[],
  options: AnswerCheckOptions = {},
): boolean {
  const maxTypo = options.maxTypoDistance ?? 1
  const user = normalizeAnswer(rawInput)
  if (!user) return false

  for (const form of acceptedForms) {
    const target = normalizeAnswer(form)
    if (!target) continue
    if (user === target) return true
    if (!user.includes(' ') && !target.includes(' ') && user.length >= 3 && target.length >= 3) {
      const d = levenshtein(user, target)
      if (d <= maxTypo) return true
    } else if (user.includes(' ') || target.includes(' ')) {
      if (levenshtein(user, target) <= maxTypo) return true
    }
  }
  return false
}
