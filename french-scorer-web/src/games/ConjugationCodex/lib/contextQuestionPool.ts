import type { ConjugationsBundle, PracticeQuestion } from '../data/conjugationsSchema'

export type RuleMasterContextQuestion = {
  id: string
  verb_id: string
  tense: string
  pronoun: string
  context: string
  sentence: string
  english: string
  accepted: string[]
  explanation: string
  wrongHint: string
  optionalHint?: string
  difficulty?: PracticeQuestion['difficulty']
}

function defaultWrongHint(q: PracticeQuestion): string {
  return `Check the subject (${q.pronoun}) and tense (${q.tense.replace(/_/g, ' ')}).`
}

function defaultOptionalHint(q: PracticeQuestion): string | undefined {
  if (q.tense === 'passe_compose') {
    return 'Passé composé: choose the auxiliary and participle that fit the subject.'
  }
  if (q.tense === 'present') {
    return 'Present tense: match the subject to the correct verb form.'
  }
  return undefined
}

function toRuleMasterQuestion(q: PracticeQuestion): RuleMasterContextQuestion | null {
  if (q.type !== 'context') return null
  const accepted = q.accepted
  if (!accepted?.length) return null
  const context = q.context?.trim()
  if (!context) return null

  return {
    id: q.id,
    verb_id: q.verb_id,
    tense: q.tense,
    pronoun: q.pronoun,
    context,
    sentence: q.sentence,
    english: q.english,
    accepted: [...accepted],
    explanation: q.explanation,
    wrongHint: q.wrong_hint?.trim() || defaultWrongHint(q),
    optionalHint: q.optional_hint?.trim() || defaultOptionalHint(q),
    difficulty: q.difficulty,
  }
}

/** Map a JSON practice row to a Rule Master card (shared with Phase 2 restore-by-id). */
export function ruleMasterFromPracticeQuestion(q: PracticeQuestion): RuleMasterContextQuestion | null {
  return toRuleMasterQuestion(q)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export type ContextSessionOptions = {
  minCount?: number
  maxCount?: number
  /** Prefer this verb_id for part of the session (e.g. aller_001). */
  preferVerbId?: string
  /** Fraction of the session (0–1) to reserve for preferred verb when possible. Default 0.38. */
  preferVerbShare?: number
}

/**
 * Build a session: mixes all context verbs, with extra weight on `preferVerbId` when provided.
 */
export function pickContextQuestionSession(
  bundle: ConjugationsBundle,
  opts: ContextSessionOptions = {},
): RuleMasterContextQuestion[] {
  const min = Math.max(1, opts.minCount ?? 5)
  const max = Math.max(min, opts.maxCount ?? 10)
  const count = min + Math.floor(Math.random() * (max - min + 1))

  const all = bundle.practice_questions
    .map(toRuleMasterQuestion)
    .filter((x): x is RuleMasterContextQuestion => x !== null)

  const preferId = opts.preferVerbId
  const share = Math.min(1, Math.max(0, opts.preferVerbShare ?? 0.38))

  if (!preferId) {
    return shuffle(all).slice(0, count)
  }

  const preferred = all.filter((q) => q.verb_id === preferId)
  const rest = all.filter((q) => q.verb_id !== preferId)

  const nPrefer = Math.min(preferred.length, Math.max(1, Math.ceil(count * share)))

  const picked: RuleMasterContextQuestion[] = []
  const idSet = new Set<string>()
  const take = (q: RuleMasterContextQuestion) => {
    if (picked.length >= count || idSet.has(q.id)) return
    picked.push(q)
    idSet.add(q.id)
  }

  for (const q of shuffle(preferred)) {
    if (picked.length >= nPrefer) break
    take(q)
  }
  for (const q of shuffle(rest)) {
    if (picked.length >= count) break
    take(q)
  }
  for (const q of shuffle(all)) {
    if (picked.length >= count) break
    take(q)
  }

  return shuffle(picked)
}
