import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSupabaseProjectHost, getSupabaseSetupDiagnostics, supabase } from '../lib/supabase'
import {
  downloadWebScoreHistoryFromCloud,
  downloadWebUnitProgress,
  syncWebScoreHistoryToCloud,
  uploadWebUnitProgress,
} from '../lib/cloudProgressWeb'
import { RECENT_SCORES_KEY, type StoredScore } from '../lib/history'

export default function AccountPage() {
  const { user, loading, configured, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [busy, setBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const run = async (fn: () => Promise<void>, label: string) => {
    if (!supabase || !user) return
    setBusy(true)
    setSyncMsg(null)
    try {
      await fn()
      setSyncMsg(`${label} — OK`)
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    if (!email.trim() || !password) return
    setBusy(true)
    setSyncMsg(null)
    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password)
      setBusy(false)
      if (error) setSyncMsg(error.message)
      else setSyncMsg('Signed in.')
      return
    }
    const { error, info } = await signUpWithEmail(email, password)
    setBusy(false)
    if (error) setSyncMsg(error.message)
    else if (info) setSyncMsg(info)
  }

  const onGoogle = async () => {
    setSyncMsg(null)
    const { error } = await signInWithGoogle()
    if (error) setSyncMsg(error.message)
  }

  if (!configured) {
    const diag = getSupabaseSetupDiagnostics()
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-sm text-slate-600">
          Set <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code> in{' '}
          <code className="rounded bg-slate-100 px-1">.env</code> locally, or in Vercel for production.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">What this deployment sees (after build)</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code>:{' '}
              {diag.urlInBuild ? (
                <span className="text-emerald-700">present</span>
              ) : (
                <span className="text-red-600 font-medium">missing</span>
              )}
            </li>
            <li>
              <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code>:{' '}
              {diag.keyInBuild ? (
                <span className="text-emerald-700">present</span>
              ) : (
                <span className="text-red-600 font-medium">missing</span>
              )}
            </li>
          </ul>
        </div>
        {diag.hint ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{diag.hint}</p>
        ) : null}
        <div className="space-y-2 text-sm text-amber-900">
          <p>
            <strong>Vercel checklist</strong>
          </p>
          <ol className="list-inside list-decimal space-y-1 text-slate-700">
            <li>
              <strong>Redeploy</strong> after saving env vars (Deployments → ⋯ → Redeploy). Old builds never pick up new vars.
            </li>
            <li>
              <strong>Root Directory</strong> must be <code className="rounded bg-slate-100 px-1">french-scorer-web</code>{' '}
              (Project → Settings → General) so Vite runs in the right folder and embeds <code className="px-1">VITE_*</code>.
            </li>
            <li>
              Variables must be enabled for the environment you use: <strong>Preview</strong> and/or{' '}
              <strong>Production</strong> (&quot;All Environments&quot; covers both).
            </li>
          </ol>
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="text-slate-600">Loading…</p>
  }

  if (user) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Signed in</h1>
        <p className="text-sm text-slate-600">{user.email}</p>
        {syncMsg ? (
          <p
            className={`text-sm font-medium ${syncMsg.endsWith('— OK') ? 'text-emerald-700' : 'text-red-600'}`}
          >
            {syncMsg}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => uploadWebUnitProgress(supabase!, user.id), 'Lesson progress uploaded')}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Upload lesson progress → cloud
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => downloadWebUnitProgress(supabase!, user.id), 'Lesson progress downloaded')}
            className="rounded-xl border border-blue-600 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Download cloud → browser
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const raw = localStorage.getItem(RECENT_SCORES_KEY)
                const parsed = raw ? (JSON.parse(raw) as StoredScore[]) : []
                await syncWebScoreHistoryToCloud(supabase!, user.id, Array.isArray(parsed) ? parsed : [])
              }, 'Scores uploaded')
            }
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Upload AI score history → cloud
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const scores = await downloadWebScoreHistoryFromCloud(supabase!, user.id)
                localStorage.setItem(RECENT_SCORES_KEY, JSON.stringify(scores))
              }, 'Scores downloaded')
            }
            className="rounded-xl border border-indigo-600 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
          >
            Download score history from cloud
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void signOut()}
          className="mt-6 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-800"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Account</h1>
      <p className="text-sm text-slate-600">Sign in with email or Google to sync progress.</p>
      <p className="text-xs text-slate-400">
        Connected to: <code className="rounded bg-slate-100 px-1 text-slate-700">{getSupabaseProjectHost() ?? '—'}</code>{' '}
        (should end in <code className="text-slate-600">.supabase.co</code>)
      </p>

      {syncMsg ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            syncMsg === 'Signed in.' || syncMsg.includes('Check your email') || syncMsg.includes('Account ready')
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {syncMsg}
        </p>
      ) : null}

      <div className="flex rounded-xl bg-slate-200 p-1">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === 'signin' ? 'bg-white shadow' : 'text-slate-500'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white shadow' : 'text-slate-500'}`}
        >
          Sign up
        </button>
      </div>

      <label className="block text-xs font-semibold text-slate-500">Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
        placeholder="you@example.com"
      />
      <label className="block text-xs font-semibold text-slate-500">Password</label>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
      >
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>

      <div className="flex items-center gap-2 py-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void onGoogle()}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-slate-500">
        <Link to="/" className="text-blue-600 hover:underline">
          Home
        </Link>
      </p>
    </div>
  )
}
