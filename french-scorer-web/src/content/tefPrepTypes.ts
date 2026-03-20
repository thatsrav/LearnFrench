/**
 * Minimal TEF A1 JSON types used by listening catalog (`listeningContent.ts`).
 */

export type TefMcqQuestion = {
  question_fr: string
  options: string[]
  answer_index: number
}

export type TefListeningJson = {
  tef_task_id: string
  clb_target: number
  strictness_level: string
  lexical_density: number
  unit_index: number
  skill: string
  scenario: string
  audio_uri: string | null
  transcript_fr: string
  questions: TefMcqQuestion[]
  duration_seconds_approx?: number
  gloss_en?: string
}
