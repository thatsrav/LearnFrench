import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getWritingEntryById,
  setWritingEntryRemoteId,
  type WritingJournalEntry,
} from '../database/WritingJournalService'

/**
 * Push local journal row to `public.writing_entries` (insert or update by `remoteId`).
 */
export async function upsertWritingEntryToCloud(
  client: SupabaseClient,
  userId: string,
  entry: WritingJournalEntry,
): Promise<void> {
  const base = {
    title: entry.title,
    content: entry.content,
    word_count: entry.wordCount,
    draft: entry.draft,
    category: entry.category,
    submitted_at: entry.submittedAt ? entry.submittedAt.toISOString() : null,
  }

  if (entry.remoteId) {
    const { error } = await client
      .from('writing_entries')
      .update(base)
      .eq('id', entry.remoteId)
      .eq('user_id', userId)
    if (error) throw new Error(error.message)
    return
  }

  const { data, error } = await client
    .from('writing_entries')
    .insert({
      user_id: userId,
      ...base,
      created_at: entry.createdAt.toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  const id = data?.id != null ? String(data.id) : ''
  if (!id) throw new Error('Cloud insert returned no id')
  await setWritingEntryRemoteId(entry.id, userId, id)
}

/** Best-effort: sync after save draft / submit when Supabase + user are available. */
export async function syncJournalEntryToCloudIfPossible(
  client: SupabaseClient | null,
  userId: string | null | undefined,
  localEntryId: number,
): Promise<void> {
  const uid = userId?.trim() ?? ''
  if (!client || !uid) return
  const entry = await getWritingEntryById(localEntryId, uid)
  if (!entry) return
  await upsertWritingEntryToCloud(client, uid, entry)
}

export async function deleteWritingEntryFromCloud(
  client: SupabaseClient,
  userId: string,
  remoteId: string,
): Promise<void> {
  const { error } = await client.from('writing_entries').delete().eq('id', remoteId).eq('user_id', userId)
  if (error) throw new Error(error.message)
}
