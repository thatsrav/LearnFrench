/**
 * TypeScript mirror of `conjugations.json` — use for loaders and the admin UI.
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2'

export type PronounKey = 'je' | 'tu' | 'il' | 'nous' | 'vous' | 'ils'

export type VerbTenses = {
  present: Record<PronounKey, string>
  passe_compose?: Record<PronounKey, string>
  imparfait?: Record<PronounKey, string>
  futur_simple?: Record<PronounKey, string>
}

export type VerbEntry = {
  id: string
  infinitive: string
  english: string
  level: CefrLevel
  /** 1–100 percentile (higher = more frequent in learner corpora) */
  frequency: number
  regular: boolean
  tenses: VerbTenses
}

export type DialogueLine = {
  speaker: string
  text: string
  /** Surface forms to highlight (must appear in `text`) */
  highlighted: string[]
}

export type ConversationEntry = {
  id: string
  verb_id: string
  level: CefrLevel
  scene: string
  dialogues: DialogueLine[]
}

export type PracticeQuestionType = 'multiple_choice' | 'text_input' | 'context'

export type PracticeDifficulty = 'easy' | 'medium' | 'hard'

export type PracticeQuestion = {
  id: string
  verb_id: string
  tense: string
  pronoun: string
  difficulty: PracticeDifficulty
  type: PracticeQuestionType
  sentence: string
  english: string
  choices?: string[]
  correct_index?: number
  /** For text_input / context — acceptable surface answers (normalized match) */
  accepted?: string[]
  explanation: string
  /** Optional short narrative for context type */
  context?: string
}

export type ConjugationsBundle = {
  version: number
  verbs: VerbEntry[]
  conversations: ConversationEntry[]
  practice_questions: PracticeQuestion[]
}
