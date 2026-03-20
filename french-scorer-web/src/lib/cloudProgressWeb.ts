import type { SupabaseClient } from '@supabase/supabase-js'
import { getAllProgressRows, mergeRemoteUnitProgress } from './syllabus'
import type { StoredScore } from './history'

export async function uploadWebUnitProgress(client: SupabaseClient, userId: string): Promise<void> {
  const rows = getAllProgressRows()
  const payload = rows.map((r) => ({
    user_id: userId,
    unit_id: r.unit_id,
    status: r.status,
    score: r.score,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await client.from('user_unit_progress').upsert(payload, {
    onConflict: 'user_id,unit_id',
  })
  if (error) throw new Error(error.message)
}

export async function downloadWebUnitProgress(client: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await client
    .from('user_unit_progress')
    .select('unit_id,status,score')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  if (!data?.length) return
  mergeRemoteUnitProgress(data as { unit_id: string; status: 'locked' | 'available' | 'completed'; score: number }[])
}

export async function syncWebScoreHistoryToCloud(
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

export async function downloadWebScoreHistoryFromCloud(
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
