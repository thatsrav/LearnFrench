/** Conjugation prompts for Phase 3 SRS (single-word or short phrase answers). */

export type ConjugationCard = {
  id: string
  verb: string
  pronoun: string
  tense: string
  /** Expected surface form(s), normalized in checker */
  answers: readonly string[]
}

export const MASTERS_GUILD_CARDS: ConjugationCard[] = [
  // AVOIR — présent
  { id: 'avoir-pres-je', verb: 'AVOIR', pronoun: 'JE', tense: 'PRÉSENT', answers: ['ai'] },
  { id: 'avoir-pres-tu', verb: 'AVOIR', pronoun: 'TU', tense: 'PRÉSENT', answers: ['as'] },
  { id: 'avoir-pres-il', verb: 'AVOIR', pronoun: 'IL / ELLE / ON', tense: 'PRÉSENT', answers: ['a'] },
  { id: 'avoir-pres-nous', verb: 'AVOIR', pronoun: 'NOUS', tense: 'PRÉSENT', answers: ['avons'] },
  { id: 'avoir-pres-vous', verb: 'AVOIR', pronoun: 'VOUS', tense: 'PRÉSENT', answers: ['avez'] },
  { id: 'avoir-pres-ils', verb: 'AVOIR', pronoun: 'ILS / ELLES', tense: 'PRÉSENT', answers: ['ont'] },
  // ÊTRE — présent
  { id: 'etre-pres-je', verb: 'ÊTRE', pronoun: 'JE', tense: 'PRÉSENT', answers: ['suis'] },
  { id: 'etre-pres-tu', verb: 'ÊTRE', pronoun: 'TU', tense: 'PRÉSENT', answers: ['es'] },
  { id: 'etre-pres-il', verb: 'ÊTRE', pronoun: 'IL / ELLE / ON', tense: 'PRÉSENT', answers: ['est'] },
  { id: 'etre-pres-nous', verb: 'ÊTRE', pronoun: 'NOUS', tense: 'PRÉSENT', answers: ['sommes'] },
  { id: 'etre-pres-vous', verb: 'ÊTRE', pronoun: 'VOUS', tense: 'PRÉSENT', answers: ['êtes', 'etes'] },
  { id: 'etre-pres-ils', verb: 'ÊTRE', pronoun: 'ILS / ELLES', tense: 'PRÉSENT', answers: ['sont'] },
  // ALLER — présent
  { id: 'aller-pres-je', verb: 'ALLER', pronoun: 'JE', tense: 'PRÉSENT', answers: ['vais'] },
  { id: 'aller-pres-tu', verb: 'ALLER', pronoun: 'TU', tense: 'PRÉSENT', answers: ['vas'] },
  { id: 'aller-pres-il', verb: 'ALLER', pronoun: 'IL / ELLE / ON', tense: 'PRÉSENT', answers: ['va'] },
  { id: 'aller-pres-nous', verb: 'ALLER', pronoun: 'NOUS', tense: 'PRÉSENT', answers: ['allons'] },
  { id: 'aller-pres-vous', verb: 'ALLER', pronoun: 'VOUS', tense: 'PRÉSENT', answers: ['allez'] },
  { id: 'aller-pres-ils', verb: 'ALLER', pronoun: 'ILS / ELLES', tense: 'PRÉSENT', answers: ['vont'] },
  // FAIRE — présent
  { id: 'faire-pres-je', verb: 'FAIRE', pronoun: 'JE', tense: 'PRÉSENT', answers: ['fais'] },
  { id: 'faire-pres-nous', verb: 'FAIRE', pronoun: 'NOUS', tense: 'PRÉSENT', answers: ['faisons'] },
  { id: 'faire-pres-ils', verb: 'FAIRE', pronoun: 'ILS / ELLES', tense: 'PRÉSENT', answers: ['font'] },
  // VENIR — présent
  { id: 'venir-pres-je', verb: 'VENIR', pronoun: 'JE', tense: 'PRÉSENT', answers: ['viens'] },
  { id: 'venir-pres-nous', verb: 'VENIR', pronoun: 'NOUS', tense: 'PRÉSENT', answers: ['venons'] },
  { id: 'venir-pres-ils', verb: 'VENIR', pronoun: 'ILS / ELLES', tense: 'PRÉSENT', answers: ['viennent'] },
  // Mixed tenses — passé composé (être + past participle)
  {
    id: 'aller-pc-ils',
    verb: 'ALLER',
    pronoun: 'ILS',
    tense: 'PASSÉ COMPOSÉ',
    answers: ['sont allés', 'sont alles'],
  },
  {
    id: 'venir-pc-elle',
    verb: 'VENIR',
    pronoun: 'ELLE',
    tense: 'PASSÉ COMPOSÉ',
    answers: ['est venue'],
  },
]

export function cardById(id: string): ConjugationCard | undefined {
  return MASTERS_GUILD_CARDS.find((c) => c.id === id)
}
