/**
 * Grammar Atelier — shared content (parity with expo-mobile atelier cards).
 */

export type TenseColumnId = 'passe' | 'present' | 'futur'

export type TenseChip = { id: string; text: string; correct: TenseColumnId }

/** Seeded in columns — not movable back to tray */
export const TENSE_LOCKED_IDS = new Set(['c1', 'c2'])

export const TENSE_INITIAL_PLACED: Record<TenseColumnId, TenseChip[]> = {
  passe: [{ id: 'c1', text: 'Je suis allé', correct: 'passe' }],
  present: [{ id: 'c2', text: 'Je vais', correct: 'present' }],
  futur: [],
}

export const TENSE_INITIAL_TRAY: TenseChip[] = [
  { id: 'c3', text: "J'irai", correct: 'futur' },
  { id: 'c4', text: 'Tu chantes', correct: 'present' },
  { id: 'c5', text: 'Nous avons fini', correct: 'passe' },
]

export type AgreementTask = {
  id: string
  prompt: string
  hint: string
  choices: string[]
  correctIndex: number
}

export const AGREEMENT_TASKS: AgreementTask[] = [
  {
    id: '1',
    prompt: 'Les filles sont ____ .',
    hint: '(heureux)',
    choices: ['heureux', 'heureuse', 'heureuxs', 'heureuses'],
    correctIndex: 3,
  },
  {
    id: '2',
    prompt: 'La porte est ____ .',
    hint: '(ouvert)',
    choices: ['ouvert', 'ouverte', 'ouverts', 'ouvertes'],
    correctIndex: 1,
  },
  {
    id: '3',
    prompt: 'Les livres sont ____ .',
    hint: '(nouveau)',
    choices: ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles'],
    correctIndex: 2,
  },
  {
    id: '4',
    prompt: 'Elle est ____ .',
    hint: '(content)',
    choices: ['content', 'contente', 'contents', 'contentes'],
    correctIndex: 1,
  },
]

export const SYNTAX_BANK = ['souvent', 'Elle', 'nous', 'rend', 'visite', '.'] as const
export const SYNTAX_CORRECT = ['Elle', 'nous', 'rend', 'souvent', 'visite', '.'] as const

const XP_KEY = 'grammar_atelier_xp_v1'

export function readGrammarAtelierXp(): number {
  try {
    const n = Number(localStorage.getItem(XP_KEY))
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1240
  } catch {
    return 1240
  }
}

export function addGrammarAtelierXp(delta: number): number {
  const next = Math.max(0, readGrammarAtelierXp() + delta)
  try {
    localStorage.setItem(XP_KEY, String(next))
  } catch {
    /* */
  }
  return next
}
