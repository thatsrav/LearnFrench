import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase.auth.getSession()
    setSession(data.session ?? null)
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    const { error } = await supabase.auth.signUp({ email: email.trim(), password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    try {
      const redirectTo = Linking.createURL('auth/callback')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) return { error: new Error(error.message) }
      if (!data.url) return { error: new Error('No OAuth URL returned') }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success' || !('url' in result) || !result.url) {
        return { error: null }
      }

      const callbackUrl = result.url
      const hash = callbackUrl.includes('#') ? callbackUrl.split('#')[1] : ''
      const params = new URLSearchParams(hash)
      let access_token = params.get('access_token')
      let refresh_token = params.get('refresh_token')

      if (!access_token) {
        const q = callbackUrl.includes('?') ? callbackUrl.split('?')[1] : ''
        const qParams = new URLSearchParams(q)
        access_token = qParams.get('access_token')
        refresh_token = qParams.get('refresh_token')
      }

      if (access_token && refresh_token) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
        if (sessionErr) return { error: new Error(sessionErr.message) }
      }

      return { error: null }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshSession,
    }),
    [session, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
