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
    wrongHint: defaultWrongHint(q),
    optionalHint: defaultOptionalHint(q),
    difficulty: q.difficulty,
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Pull context questions from the bundle, optionally filtered by verb_id (e.g. aller_001).
 */
export function pickContextQuestionSession(
  bundle: ConjugationsBundle,
  opts: { verbId?: string; minCount?: number; maxCount?: number },
): RuleMasterContextQuestion[] {
  const min = Math.max(1, opts.minCount ?? 5)
  const max = Math.max(min, opts.maxCount ?? 10)
  const count = min + Math.floor(Math.random() * (max - min + 1))

  let pool = bundle.practice_questions
    .map(toRuleMasterQuestion)
    .filter((x): x is RuleMasterContextQuestion => x !== null)

  if (opts.verbId) {
    pool = pool.filter((q) => q.verb_id === opts.verbId)
  }

  return shuffle(pool).slice(0, count)
}
