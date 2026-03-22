/** Mirrors `expo-mobile` lesson JSON (snake_case from API). */

export type VocabCard = {
  word: string
  translation: string
  example: string
  example_translation: string
  /** Stable id for `public/audio/vocab/{audio_key}.mp3` */
  audio_key?: string
  /** Optional absolute or site-root URL override */
  audio_url?: string
}

export type VocabIntroStep = { type: 'vocab_intro'; cards: VocabCard[] }

export type DialogueTurn = { speaker: string; text: string; translation: string }

export type DialogueStep = { type: 'dialogue'; scene: string; turns: DialogueTurn[] }

export type GrammarExample = { fr: string; en: string }

export type GrammarTipStep = { type: 'grammar_tip'; rule: string; examples: GrammarExample[] }

export type MatchPairsExercise = {
  type: 'match_pairs'
  instruction: string
  pairs: { left: string; right: string }[]
}

export type FillBlankExercise = {
  type: 'fill_blank'
  sentence: string
  answer: string
  options: string[]
  hint?: string
}

export type WordOrderExercise = {
  type: 'word_order'
  words: string[]
  correct_order: number[]
  translation: string
}

export type McqExercise = {
  type: 'mcq'
  question: string
  options: string[]
  answer_index: number
  explanation?: string
}

export type PracticeExercise = MatchPairsExercise | FillBlankExercise | WordOrderExercise | McqExercise

export type PracticeStep = { type: 'practice'; exercises: PracticeExercise[] }

export type LessonStep = VocabIntroStep | DialogueStep | GrammarTipStep | PracticeStep

export type ProductionTask = {
  prompt: string
  example: string
  skill: string
}

export type RichLessonUnit = {
  id: string
  level?: string
  unit_index?: number
  theme?: string
  estimated_minutes?: number
  steps: LessonStep[]
  production_task?: ProductionTask | null
}
