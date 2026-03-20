import { getDb } from './database'

export type TefPrepSkill = 'listening' | 'reading' | 'writing' | 'speaking'

export type TefPrepAnswerRecord = {
  questionIndex: number
  selectedIndex: number | null
  correct: boolean
}

export async function insertTefPrepProgress(row: {
  userId: string
  tefUnit: number
  skill: TefPrepSkill
  listeningCatalogId: string
  scorePercent: number
  correctCount: number
  totalQuestions: number
  answers: TefPrepAnswerRecord[]
  timeSpentMs: number
  cefrEstimate: string
}): Promise<void> {
  const db = await getDb()
  const uid = row.userId?.trim() ?? ''
  const now = Date.now()
  await db.runAsync(
    `
    INSERT INTO tef_prep_progress (
      user_id, tef_unit, skill, listening_catalog_id,
      score_percent, correct_count, total_questions,
      answers_json, time_spent_ms, cefr_estimate, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    uid,
    row.tefUnit,
    row.skill,
    row.listeningCatalogId,
    row.scorePercent,
    row.correctCount,
    row.totalQuestions,
    JSON.stringify(row.answers),
    row.timeSpentMs,
    row.cefrEstimate,
    now,
  )
}
