import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * OAuth redirect target (Google). Supabase appends tokens in the URL hash.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState('Signing you in…')

  useEffect(() => {
    if (!supabase) {
      setMsg('Supabase not configured')
      return
    }

    const hash = window.location.hash.replace(/^#/, '')
    const hashParams = new URLSearchParams(hash)
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')

    if (access_token && refresh_token) {
      void supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) {
          setMsg(error.message)
          return
        }
        navigate('/account', { replace: true })
      })
      return
    }

    const search = window.location.search
    if (search.includes('code=')) {
      void supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
        if (error) {
          setMsg(error.message)
          return
        }
        navigate('/account', { replace: true })
      })
      return
    }

    setMsg('Missing auth code or tokens. Check Supabase redirect URLs (e.g. http://localhost:5173/auth/callback).')
  }, [navigate])

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-slate-600">{msg}</p>
    </div>
  )
}
