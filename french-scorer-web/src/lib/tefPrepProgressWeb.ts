import type { SupabaseClient } from '@supabase/supabase-js'

export type TefPrepAnswerRecord = {
  questionIndex: number
  selectedIndex: number | null
  correct: boolean
}

const LOCAL_KEY = 'tef_prep_progress_local_v1'

type LocalRow = {
  tef_unit: number
  skill: string
  listening_catalog_id: string
  score_percent: number
  correct_count: number
  total_questions: number
  answers: TefPrepAnswerRecord[]
  time_spent_ms: number
  cefr_estimate: string
  created_at: number
}

function appendLocal(row: LocalRow) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const arr: LocalRow[] = raw ? JSON.parse(raw) : []
    arr.push(row)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr.slice(-200)))
  } catch {
    /* ignore */
  }
}

/** Saves TEF prep listening attempt to Supabase (if signed in) and always mirrors to localStorage. */
export async function persistTefPrepListeningAttempt(
  client: SupabaseClient | null,
  userId: string | undefined,
  row: {
    tefUnit: number
    listeningCatalogId: string
    scorePercent: number
    correctCount: number
    totalQuestions: number
    answers: TefPrepAnswerRecord[]
    timeSpentMs: number
    cefrEstimate: string
  },
): Promise<void> {
  const local: LocalRow = {
    tef_unit: row.tefUnit,
    skill: 'listening',
    listening_catalog_id: row.listeningCatalogId,
    score_percent: row.scorePercent,
    correct_count: row.correctCount,
    total_questions: row.totalQuestions,
    answers: row.answers,
    time_spent_ms: row.timeSpentMs,
    cefr_estimate: row.cefrEstimate,
    created_at: Date.now(),
  }
  appendLocal(local)

  const uid = userId?.trim()
  if (!client || !uid) return

  const { error } = await client.from('tef_prep_progress').insert({
    user_id: uid,
    tef_unit: row.tefUnit,
    skill: 'listening',
    listening_catalog_id: row.listeningCatalogId,
    score_percent: row.scorePercent,
    correct_count: row.correctCount,
    total_questions: row.totalQuestions,
    answers_json: row.answers,
    time_spent_ms: row.timeSpentMs,
    cefr_estimate: row.cefrEstimate,
  })
  if (error) {
    console.warn('[tef_prep_progress]', error.message)
  }
}
