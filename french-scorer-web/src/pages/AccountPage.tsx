import { Cloud, CreditCard, LogOut, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SoundPreferencesCard } from '../components/SoundPreferencesCard'
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
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Bienvenue</h1>
          <p className="mt-2 text-sm text-slate-600">Continue your journey toward French mastery in our digital atelier.</p>
          <p className="mt-4 text-sm font-medium text-slate-800">{user.email}</p>
          {syncMsg ? (
            <p className={`mt-3 text-sm font-medium ${syncMsg.endsWith('— OK') ? 'text-emerald-700' : 'text-red-600'}`}>
              {syncMsg}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => uploadWebUnitProgress(supabase!, user.id), 'Lesson progress uploaded')}
              className="rounded-2xl bg-[#2563eb] px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              Upload lesson progress → cloud
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => downloadWebUnitProgress(supabase!, user.id), 'Lesson progress downloaded')}
              className="rounded-2xl border-2 border-[#2563eb] px-4 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
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
              className="rounded-2xl bg-[#4f46e5] px-4 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
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
              className="rounded-2xl border-2 border-indigo-600 px-4 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              Download score history from cloud
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Your learning profile</h2>
          <p className="mt-1 text-sm text-slate-600">Manage credentials and cloud preferences.</p>
          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-slate-100/80 to-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <User className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-900">Scholar</p>
                <p className="text-sm text-slate-600">Connected learner</p>
                <span className="mt-2 inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                  Pro member
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-500">Weekly streak</p>
                <p className="mt-1 text-xl font-black text-slate-900">—</p>
              </div>
              <div className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-500">Words learned</p>
                <p className="mt-1 text-xl font-black text-slate-900">—</p>
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
            >
              <Cloud className="h-4 w-4" />
              Sync with Cloud
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void signOut()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
          <div className="mt-6">
            <SoundPreferencesCard />
          </div>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-slate-400" />
                Account settings
              </span>
              <span className="text-slate-400">›</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-400" />
                Billing history
              </span>
              <span className="text-slate-400">›</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Bienvenue</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Continue your journey toward French mastery in our digital atelier.
        </p>
        <div className="mt-6 rounded-xl border border-amber-200 bg-[#fffbeb] p-4 text-sm text-amber-950">
          <strong className="font-semibold">Session tip:</strong> sign in to sync TEF practice and lesson progress across
          devices.
        </div>

        {syncMsg ? (
          <p
            className={`mt-4 rounded-xl px-3 py-2 text-sm font-medium ${
              syncMsg === 'Signed in.' || syncMsg.includes('Check your email') || syncMsg.includes('Account ready')
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {syncMsg}
          </p>
        ) : null}

        <div className="mt-8 flex rounded-2xl bg-slate-200/90 p-1.5">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Sign up
          </button>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-400"
            placeholder="you@example.com"
          />
          <div className="mt-5 flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
            <button type="button" className="text-xs font-bold text-[#4f46e5] hover:underline">
              Forgot?
            </button>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="mt-8 w-full rounded-2xl bg-[#1a1c2e] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-900"
          >
            {mode === 'signin' ? 'Sign in to FrenchLearn' : 'Create your FrenchLearn account'}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void onGoogle()}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Connected to: <code className="rounded bg-slate-100 px-1 text-slate-700">{getSupabaseProjectHost() ?? '—'}</code>
        </p>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Your learning profile</h2>
        <p className="mt-1 text-sm text-slate-600">Preview of the dashboard after sign-in.</p>
        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-slate-100/80 to-slate-50 p-6 opacity-95 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200" />
            <div>
              <p className="font-display text-lg font-bold text-slate-900">Julian Lemaire</p>
              <p className="text-sm text-slate-600">Advanced B2 Scholar</p>
              <span className="mt-2 inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                Pro member
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-slate-500">Weekly streak</p>
              <p className="mt-1 text-xl font-black text-slate-900">14 days</p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-slate-500">Words learned</p>
              <p className="mt-1 text-xl font-black text-slate-900">2,480</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] px-4 py-3.5 text-sm font-bold text-white shadow-lg">
            <span className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Sync with Cloud
            </span>
            <span className="text-xs font-medium text-white/80">Just now</span>
          </div>
        </div>
        <div className="mt-6">
          <SoundPreferencesCard />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
          <Link to="/" className="font-semibold text-[#2563eb] hover:underline">
            ← Home
          </Link>
        </p>
      </div>
    </div>
  )
}
