import type { ConjugationCard } from '../data/mastersGuildCards'
import { MASTERS_GUILD_CARDS } from '../data/mastersGuildCards'
import type { ConjugationsBundle } from '../data/conjugationsSchema'

const TENSE_LABEL: Record<string, string> = {
  present: 'PRÉSENT',
  passe_compose: 'PASSÉ COMPOSÉ',
  imparfait: 'IMPARFAIT',
  futur_simple: 'FUTUR SIMPLE',
}

const PRONOUN_LABEL: Record<string, string> = {
  je: 'JE',
  tu: 'TU',
  il: 'IL / ELLE / ON',
  nous: 'NOUS',
  vous: 'VOUS',
  ils: 'ILS / ELLES',
}

function verbDisplay(bundle: ConjugationsBundle, verbId: string): string {
  const v = bundle.verbs.find((x) => x.id === verbId)
  if (!v) return verbId.replace(/_001$/, '').toUpperCase()
  return v.infinitive.toUpperCase()
}

function tenseLabel(tense: string) {
  return TENSE_LABEL[tense] ?? tense.replace(/_/g, ' ').toUpperCase()
}

function pronounLabel(p: string) {
  return PRONOUN_LABEL[p] ?? p.toUpperCase()
}

/**
 * Build extra SRS cards from short text_input drills so Phase 3 can draw from the full conjugation set.
 */
export function buildSrsFillerCards(bundle: ConjugationsBundle, opts?: { maxCards?: number }): ConjugationCard[] {
  const maxCards = opts?.maxCards ?? 45
  const seen = new Set<string>()
  const out: ConjugationCard[] = []

  for (const q of bundle.practice_questions) {
    if (out.length >= maxCards) break
    if (q.type !== 'text_input') continue
    if (!q.accepted?.length) continue
    if (q.accepted.some((a) => a.length > 40)) continue

    const key = q.id
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      id: `pq:${q.id}`,
      verb: verbDisplay(bundle, q.verb_id),
      pronoun: pronounLabel(q.pronoun),
      tense: tenseLabel(q.tense),
      answers: [...q.accepted],
    })
  }
  return out
}

export function buildMasterSrsDeck(bundle: ConjugationsBundle): ConjugationCard[] {
  return [...MASTERS_GUILD_CARDS, ...buildSrsFillerCards(bundle)]
}

export function findSrsCard(deck: ConjugationCard[], id: string): ConjugationCard | undefined {
  return deck.find((c) => c.id === id)
}
