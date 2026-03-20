import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim()
const key = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

function resolveSupabaseUrl(u: string): string {
  if (!u) return ''
  if (u.includes('supabase.com/dashboard')) {
    console.error(
      '[Supabase] EXPO_PUBLIC_SUPABASE_URL looks like a dashboard URL. Use https://YOUR_REF.supabase.co from Settings → API.',
    )
    return ''
  }
  return u.replace(/\/$/, '')
}

const url = resolveSupabaseUrl(rawUrl)

export const isSupabaseConfigured = Boolean(url && key)

/** Null when env vars are missing — app still runs in offline / guest mode. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null
