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

/** Why the app is not configured (safe to show on Account page — no secrets). */
export function getSupabaseSetupDiagnostics(): {
  urlInBuild: boolean
  keyInBuild: boolean
  hint: string
} {
  const urlInBuild = rawUrl.length > 0
  const keyInBuild = key.length > 0

  if (!urlInBuild && !keyInBuild) {
    return {
      urlInBuild: false,
      keyInBuild: false,
      hint: 'This deployment has no Supabase values in the JavaScript bundle. Vercel did not pass them into the Vite build, or you have not redeployed since adding them.',
    }
  }
  if (rawUrl.includes('supabase.com/dashboard')) {
    return {
      urlInBuild: true,
      keyInBuild,
      hint: 'VITE_SUPABASE_URL looks like a Supabase dashboard link. It must be the Project URL: https://YOUR_REF.supabase.co (Settings → API).',
    }
  }
  if (urlInBuild && !url) {
    return {
      urlInBuild: true,
      keyInBuild,
      hint: 'VITE_SUPABASE_URL is set but is not a valid API URL. Use https://YOUR_REF.supabase.co exactly.',
    }
  }
  if (!keyInBuild) {
    return {
      urlInBuild,
      keyInBuild: false,
      hint: 'VITE_SUPABASE_ANON_KEY is missing from this build. Check the name spelling and redeploy.',
    }
  }
  if (!urlInBuild) {
    return {
      urlInBuild: false,
      keyInBuild: true,
      hint: 'VITE_SUPABASE_URL is missing from this build. Check the name spelling and redeploy.',
    }
  }
  return {
    urlInBuild: true,
    keyInBuild: true,
    hint: '',
  }
}

/** Shown on Account page so you can confirm production (Vercel) is using the right project. */
export function getSupabaseProjectHost(): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        // Recommended for browser SPAs + OAuth (code in URL, exchange on /auth/callback).
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
