import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StudyCefrLevel } from '../content/wordOfTheDay'

const KEY_LEVEL = '@frenchlearn_study_cefr'
const KEY_WOTD_ENABLED = '@frenchlearn_wotd_notifications'
const KEY_WOTD_HOUR = '@frenchlearn_wotd_hour'
const KEY_WOTD_MINUTE = '@frenchlearn_wotd_minute'

export const STUDY_LEVELS: StudyCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function parseStudyLevel(raw: string | null | undefined): StudyCefrLevel {
  const u = (raw ?? '').toUpperCase()
  if (u === 'A1' || u === 'A2' || u === 'B1' || u === 'B2' || u === 'C1' || u === 'C2') return u
  return 'A1'
}

export async function getStudyCefrLevel(): Promise<StudyCefrLevel> {
  const v = await AsyncStorage.getItem(KEY_LEVEL)
  return parseStudyLevel(v)
}

export async function setStudyCefrLevel(level: StudyCefrLevel): Promise<void> {
  await AsyncStorage.setItem(KEY_LEVEL, level)
}

export async function getWordOfDayNotificationsEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY_WOTD_ENABLED)
  if (v === null) return false
  return v === '1' || v === 'true'
}

export async function setWordOfDayNotificationsEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_WOTD_ENABLED, on ? '1' : '0')
}

export async function getWordOfDayTime(): Promise<{ hour: number; minute: number }> {
  const h = await AsyncStorage.getItem(KEY_WOTD_HOUR)
  const m = await AsyncStorage.getItem(KEY_WOTD_MINUTE)
  const hour = Math.min(23, Math.max(0, parseInt(h ?? '9', 10) || 9))
  const minute = Math.min(59, Math.max(0, parseInt(m ?? '0', 10) || 0))
  return { hour, minute }
}

export async function setWordOfDayTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(KEY_WOTD_HOUR, String(Math.min(23, Math.max(0, hour))))
  await AsyncStorage.setItem(KEY_WOTD_MINUTE, String(Math.min(59, Math.max(0, minute))))
}

/** Pull study_cefr from Supabase profile into local storage (best-effort). */
export async function syncStudyLevelFromSupabase(client: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await client.from('profiles').select('study_cefr').eq('id', userId).maybeSingle()
  if (error || !data) return
  const level = parseStudyLevel(data.study_cefr as string | null)
  await setStudyCefrLevel(level)
}

/** Push local study level to profile (column may not exist until migration 004). */
export async function pushStudyLevelToSupabase(
  client: SupabaseClient,
  userId: string,
  level: StudyCefrLevel,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await client.from('profiles').update({ study_cefr: level, updated_at: new Date().toISOString() }).eq('id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
