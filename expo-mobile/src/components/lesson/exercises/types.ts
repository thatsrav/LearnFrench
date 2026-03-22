/** JSON-shaped practice items (matches syllabus `practice.exercises[]`). */
export type MatchPairsPayload = {
  type: 'match_pairs'
  instruction: string
  pairs: { left: string; right: string }[]
}

export type FillBlankPayload = {
  type: 'fill_blank'
  sentence: string
  answer: string
  options: string[]
  hint?: string
  explanation?: string
}

export type WordOrderPayload = {
  type: 'word_order'
  words: string[]
  correct_order: number[]
  translation: string
}

export type McqPayload = {
  type: 'mcq'
  question: string
  options: string[]
  answer_index: number
  explanation?: string
}

export type Exercise = MatchPairsPayload | FillBlankPayload | WordOrderPayload | McqPayload
