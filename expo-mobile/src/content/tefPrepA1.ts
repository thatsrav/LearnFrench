/**
 * TEF Canada Prep — A1 Skill Room JSON (bundled via Metro).
 */

export type TefSkill = 'reading' | 'writing' | 'listening' | 'speaking'

export const TEF_A1_UNIT_COUNT = 10

export type TefMcqQuestion = {
  question_fr: string
  options: string[]
  answer_index: number
}

export type TefLetterOption = { letter: string; text_fr: string }

export type TefReadingItem = {
  item_number: number
  question_fr: string
  options: TefLetterOption[]
  answer_index: number
}

export type TefReadingJson = {
  tef_task_id: string
  clb_target: number
  strictness_level: string
  lexical_density: number
  unit_index: number
  skill: string
  title_fr?: string
  content_fr?: string
  passage_type?: string
  instructions_fr?: string
  document?: { label_fr?: string; body_fr: string }
  items?: TefReadingItem[]
  questions?: TefMcqQuestion[]
  gloss_en?: string
}

export type TefWritingJson = {
  tef_task_id: string
  clb_target: number
  strictness_level: string
  lexical_density: number
  unit_index: number
  skill: string
  section: string
  task_type: string
  genre?: string
  prompt_fr: string
  prompt_en: string
  min_words: number
  max_words: number
  constraints_fr?: string[]
  rubric_hints?: string[]
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

export type TefSpeakingJson = {
  tef_task_id: string
  clb_target: number
  strictness_level: string
  lexical_density: number
  unit_index: number
  skill: string
  section: string
  task_type: string
  situation_fr: string
  situation_en: string
  cues_oral_fr: string[]
  target_functions?: string[]
  evaluation_criteria?: string[]
}

type UnitBundle = {
  reading: TefReadingJson
  writing: TefWritingJson
  listening: TefListeningJson
  speaking: TefSpeakingJson
}

const bundles: UnitBundle[] = [
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_1/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_1/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_1/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_1/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_2/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_2/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_2/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_2/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_3/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_3/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_3/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_3/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_4/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_4/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_4/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_4/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_5/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_5/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_5/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_5/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_6/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_6/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_6/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_6/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_7/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_7/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_7/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_7/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_8/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_8/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_8/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_8/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_9/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_9/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_9/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_9/speaking.json'),
  },
  {
    reading: require('../../assets/TEF_Prep/A1/Unit_10/reading.json'),
    writing: require('../../assets/TEF_Prep/A1/Unit_10/writing.json'),
    listening: require('../../assets/TEF_Prep/A1/Unit_10/listening.json'),
    speaking: require('../../assets/TEF_Prep/A1/Unit_10/speaking.json'),
  },
]

export function getTefA1Unit(unitIndex1Based: number): UnitBundle | null {
  if (unitIndex1Based < 1 || unitIndex1Based > TEF_A1_UNIT_COUNT) return null
  return bundles[unitIndex1Based - 1] ?? null
}

export function getTefA1SkillData(
  unitIndex1Based: number,
  skill: TefSkill,
): TefReadingJson | TefWritingJson | TefListeningJson | TefSpeakingJson | null {
  const b = getTefA1Unit(unitIndex1Based)
  if (!b) return null
  return b[skill]
}
