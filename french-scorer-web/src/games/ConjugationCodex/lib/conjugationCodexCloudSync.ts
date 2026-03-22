import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConjugationCodexPersisted } from '../conjugationCodexStore'

/**
 * Optional cloud mirror for Conjugation Codex progress.
 * Requires a Supabase table, e.g.:
 *   create table conjugation_codex_progress (
 *     user_id uuid primary key references auth.users(id),
 *     payload jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 * If the table is missing, this logs a warning and returns without throwing.
 */
export async function pushConjugationCodexProgressToCloud(
  client: SupabaseClient,
  userId: string,
  payload: ConjugationCodexPersisted,
): Promise<void> {
  const { error } = await client.from('conjugation_codex_progress').upsert(
    {
      user_id: userId,
      payload: payload as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    console.warn('[conjugation_codex cloud]', error.message)
  }
}

export async function pullConjugationCodexProgressFromCloud(
  client: SupabaseClient,
  userId: string,
): Promise<ConjugationCodexPersisted | null> {
  const { data, error } = await client
    .from('conjugation_codex_progress')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[conjugation_codex cloud]', error.message)
    return null
  }
  const raw = data?.payload as ConjugationCodexPersisted | undefined
  return raw ?? null
}
