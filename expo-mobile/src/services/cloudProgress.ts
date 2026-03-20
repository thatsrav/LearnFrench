import type { SupabaseClient } from '@supabase/supabase-js'
import { getDb } from '../database/database'
import { getSyllabusData, type SyllabusRow } from '../database/SyllabusService'
import type { StoredScore } from '../lib/history'

type UnitProgressRow = {
  unit_id: string
  status: SyllabusRow['status']
  score: number
}

/** Push all local SQLite unit progress to Supabase (upsert). */
export async function uploadUnitProgressToCloud(client: SupabaseClient, userId: string): Promise<void> {
  const rows = await getSyllabusData()
  const payload = rows.map((r) => ({
    user_id: userId,
    unit_id: r.id,
    status: r.status,
    score: r.score,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await client.from('user_unit_progress').upsert(payload, {
    onConflict: 'user_id,unit_id',
  })
  if (error) throw new Error(error.message)
}

/** Apply remote rows to local SQLite (overwrites matching unit_id). */
export async function downloadUnitProgressFromCloud(client: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await client
    .from('user_unit_progress')
    .select('unit_id,status,score')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  if (!data?.length) return

  const db = await getDb()
  await db.withTransactionAsync(async () => {
    for (const row of data as UnitProgressRow[]) {
      await db.runAsync(
        `
          INSERT INTO user_progress (unit_id, status, score)
          VALUES (?, ?, ?)
          ON CONFLICT(unit_id) DO UPDATE SET
            status = excluded.status,
            score = excluded.score
        `,
        row.unit_id,
        row.status,
        row.score,
      )
    }
  })
}

/** Replace cloud score history with current local list (simple sync). */
export async function syncScoreHistoryToCloud(
  client: SupabaseClient,
  userId: string,
  scores: StoredScore[],
): Promise<void> {
  const { error: delErr } = await client.from('user_score_events').delete().eq('user_id', userId)
  if (delErr) throw new Error(delErr.message)

  if (scores.length === 0) return

  const payload = scores.map((s) => ({
    user_id: userId,
    ts: s.ts,
    score: s.score,
    cecr: s.cecr,
    provider: s.provider,
  }))

  const { error } = await client.from('user_score_events').insert(payload)
  if (error) throw new Error(error.message)
}

export async function downloadScoreHistoryFromCloud(
  client: SupabaseClient,
  userId: string,
): Promise<StoredScore[]> {
  const { data, error } = await client
    .from('user_score_events')
    .select('ts,score,cecr,provider')
    .eq('user_id', userId)
    .order('ts', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    ts: Number(r.ts),
    score: Number(r.score),
    cecr: String(r.cecr ?? ''),
    provider: String(r.provider ?? ''),
  }))
}
