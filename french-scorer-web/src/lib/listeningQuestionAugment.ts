import type { TefMcqQuestion } from '../content/tefPrepTypes'

export type ListeningMcqWithExpl = TefMcqQuestion & { explanation_fr: string }

const LETTERS = ['A', 'B', 'C', 'D'] as const

function letter(i: number): string {
  return LETTERS[i] ?? '?'
}

export function defaultExplanationForMcq(q: TefMcqQuestion): string {
  const c = q.options[q.answer_index]
  return `La bonne réponse est ${letter(q.answer_index)}) « ${c} » — c’est cohérent avec les informations de l’extrait audio.`
}

function syntheticPair(scenario: string, pairIndex: number): ListeningMcqWithExpl {
  const s = scenario.toLowerCase()
  if (pairIndex === 0) {
    return {
      question_fr: "Quel est l'objectif principal communiqué dans cet extrait ?",
      options: [
        'Informer ou donner une consigne claire',
        'Raconter une fiction détaillée',
        'Critiquer sans proposer d’action',
        'Vendre un produit précis uniquement',
      ],
      answer_index: 0,
      explanation_fr:
        "Les épreuves type TEF privilégient des objectifs informatifs ou transactionnels : retenir l’action ou l’info principale.",
    }
  }
  return {
    question_fr: "Le ton général de l'extrait est plutôt :",
    options: ['Hostile et insultant', 'Neutre, informatif ou courtois', 'Comique absurde', 'Poétique uniquement'],
    answer_index: 1,
    explanation_fr:
      s.includes('debat') || s.includes('panel')
        ? "Même en débat, le ton reste souvent contrôlé et argumentatif plutôt qu’insultant dans ce format d’examen."
        : "Les annonces et messages de service utilisent en général un registre neutre ou courtois.",
  }
}

/** Always returns exactly 6 MCQs with short French explanations (TEF-style). */
export function buildSixListeningQuestions(base: TefMcqQuestion[], scenario: string): ListeningMcqWithExpl[] {
  const tagged: ListeningMcqWithExpl[] = base.map((q) => ({
    ...q,
    explanation_fr: defaultExplanationForMcq(q),
  }))
  let p = 0
  while (tagged.length < 6) {
    tagged.push(syntheticPair(scenario, p))
    p += 1
  }
  return tagged.slice(0, 6)
}
