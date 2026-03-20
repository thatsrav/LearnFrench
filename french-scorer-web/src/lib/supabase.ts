import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/**
 * Must be the Project URL from Supabase → Settings → API, e.g.
 * https://abcdefghijk.supabase.co
 * NOT the dashboard link (supabase.com/dashboard/...) — that causes OAuth 404s.
 */
function resolveSupabaseUrl(u: string): string {
  if (!u) return ''
  if (u.includes('supabase.com/dashboard')) {
    console.error(
      '[Supabase] VITE_SUPABASE_URL is wrong: you pasted a dashboard URL. Use Project URL like https://YOUR_REF.supabase.co (Settings → API).',
    )
    return ''
  }
  try {
    const parsed = new URL(u)
    if (!parsed.hostname.endsWith('.supabase.co')) {
      console.warn(
        '[Supabase] VITE_SUPABASE_URL should usually be https://<project-ref>.supabase.co (Settings → API → Project URL).',
      )
    }
  } catch {
    return ''
  }
  return u.replace(/\/$/, '')
}

const url = resolveSupabaseUrl(rawUrl)

export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url, key) : null
