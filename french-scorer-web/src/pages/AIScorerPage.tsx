import { Bot, CheckCircle2, Download, Info, Mic, Sparkles, Type, TrendingUp, AlertTriangle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { syncWebScoreHistoryToCloud } from '../lib/cloudProgressWeb'
import { SCORER_PREFILL_FROM_WRITING_KEY } from '../lib/writingAreaStorage'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type FrenchScore = {
  score: number
  cecr: string
  grammar: number
  vocabulary: number
  pronunciation: number
  fluency: number
  strengths: string[]
  improvements: string[]
  corrected_version: string
}

type ScoreProvider = 'auto' | 'gemini' | 'groq' | 'openai' | 'claude'

type StoredScore = { ts: number; score: number; cecr: string; provider: string }
const RECENT_SCORES_KEY = 'french_scorer_recent_scores_v1'

function loadRecentScores(): StoredScore[] {
  try {
    const raw = localStorage.getItem(RECENT_SCORES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((x) => x as Partial<StoredScore>)
      .filter((x) => typeof x.ts === 'number' && typeof x.score === 'number')
      .map((x) => ({
        ts: x.ts as number,
        score: x.score as number,
        cecr: String(x.cecr ?? ''),
        provider: String(x.provider ?? ''),
      }))
      .sort((a, b) => a.ts - b.ts)
      .slice(-30)
  } catch {
    return []
  }
}

function saveRecentScores(scores: StoredScore[]) {
  localStorage.setItem(RECENT_SCORES_KEY, JSON.stringify(scores.slice(-30)))
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computeDailyStreak(scores: StoredScore[]): number {
  const days = new Set(scores.map((s) => dayKey(s.ts)))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

const TONE_OPTIONS = ['Formal Academic', 'Professional', 'Creative'] as const

export default function AIScorerPage() {
  const { user } = useAuth()
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<ScoreProvider>('auto')
  const [c1Essay, setC1Essay] = useState(false)
  const [examType, setExamType] = useState('DELF / DALF Standard')
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]>('Formal Academic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>(() => loadRecentScores())
  const writingPrefillOnce = useRef(false)

  useEffect(() => {
    if (writingPrefillOnce.current) return
    try {
      const pre = sessionStorage.getItem(SCORER_PREFILL_FROM_WRITING_KEY)
      if (pre) {
        writingPrefillOnce.current = true
        setText(pre)
        sessionStorage.removeItem(SCORER_PREFILL_FROM_WRITING_KEY)
      }
    } catch {
      /* */
    }
  }, [])

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading && inputMode === 'text', [text, loading, inputMode])
  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0), [text])

  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    (location.hostname === 'localhost' ? '' : 'https://learnfrench-0vkn.onrender.com')

  async function onScore() {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    setResultProvider(null)
    try {
      const body: Record<string, unknown> = { text: trimmed, provider }
      if (c1Essay) body.level = 'C1'
      const resp = await fetch(`${apiBase}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || `Request failed (${resp.status})`)
      if (!data?.result) throw new Error('No result returned from server.')
      const r = data.result as FrenchScore
      const normalized: FrenchScore = {
        score: Number(r.score),
        cecr: String(r.cecr ?? ''),
        grammar: Number(r.grammar ?? r.score),
        vocabulary: Number(r.vocabulary ?? r.score),
        pronunciation: Number(r.pronunciation ?? r.score),
        fluency: Number(r.fluency ?? r.score),
        strengths: Array.isArray(r.strengths) ? r.strengths : [],
        improvements: Array.isArray(r.improvements) ? r.improvements : [],
        corrected_version: String(r.corrected_version ?? ''),
      }
      setResult(normalized)
      setResultProvider(String(data?.provider ?? ''))
      const next = [
        ...recentScores,
        {
          ts: Date.now(),
          score: normalized.score,
          cecr: normalized.cecr,
          provider: String(data?.provider ?? ''),
        },
      ].slice(-30)
      setRecentScores(next)
      saveRecentScores(next)
      if (supabase && user) {
        void syncWebScoreHistoryToCloud(supabase, user.id, next).catch(() => {})
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const streak = useMemo(() => computeDailyStreak(recentScores), [recentScores])
  const chartData = useMemo(
    () =>
      recentScores.map((s) => ({
        t: new Date(s.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: Math.max(0, Math.min(100, s.score)),
      })),
    [recentScores],
  )

  const barChartData = useMemo(() => {
    const last = chartData.slice(-7)
    if (last.length === 0) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, score: 0 }))
    }
    return last.map((row, i) => ({
      day: i === last.length - 1 ? 'Today' : row.t,
      score: row.score,
    }))
  }, [chartData])

  const structuralPct = result
    ? Math.round((result.grammar + result.vocabulary + result.fluency) / 3)
    : 0

  return (
    <div className="space-y-8 pb-6">
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-[var(--atelier-navy-deep)]">Study first:</span>{' '}
        <Link to="/tef-prep" className="font-semibold text-sky-800 underline-offset-2 hover:underline">
          TEF Prep
        </Link>
        {' · '}
        <Link to="/syllabus" className="font-semibold text-[var(--fl-blue)] underline-offset-2 hover:underline">
          Syllabus
        </Link>
        <span className="text-slate-500"> — optional draft feedback.</span>
      </p>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--atelier-navy-deep)] px-8 py-10 text-white shadow-xl md:px-12 md:py-12">
        <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Bot className="h-16 w-16 text-sky-200" strokeWidth={1.25} />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-200/90">L-AI Core</p>
        <h1 className="font-display mt-3 max-w-xl text-3xl font-bold leading-tight md:text-4xl">The Academic Scorer</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85">
          Multi-dimensional evaluation: proficiency banding, grammar & syntax, lexical range, and structural coherence — aligned
          with academic French descriptors.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[var(--atelier-navy-deep)]">Composition input</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Target: B2 upper intermediate
              </span>
            </div>

            <div className="mt-4 flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition',
                  inputMode === 'text' ? 'bg-white text-[var(--atelier-navy-deep)] shadow-sm' : 'text-slate-500',
                ].join(' ')}
              >
                <Type className="h-4 w-4" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition',
                  inputMode === 'voice' ? 'bg-white text-[var(--atelier-navy-deep)] shadow-sm' : 'text-slate-500',
                ].join(' ')}
              >
                <Mic className="h-4 w-4" />
                Voice (demo)
              </button>
            </div>

            {inputMode === 'text' ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder="Collez votre composition en français…"
                disabled={loading}
                className="mt-5 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                <Bot className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                Voice capture is a placeholder — use <strong>Text</strong> for live scoring.
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ScoreProvider)}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-400"
              >
                <option value="auto">Auto routing</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={c1Essay} onChange={(e) => setC1Essay(e.target.checked)} disabled={loading} />
                C1 essay routing
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => void onScore()}
                disabled={!canSubmit}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition',
                  canSubmit ? 'bg-[var(--atelier-navy-deep)] hover:bg-[#001438]' : 'cursor-not-allowed bg-slate-300',
                ].join(' ')}
              >
                <Sparkles size={18} />
                Score my text
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <span className="font-semibold">Error:</span> {error}
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Evaluating with L-AI Core…</p>
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-10 rounded-lg bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
          ) : null}

          {!loading && result ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-[var(--atelier-navy-deep)] p-6 text-white shadow-lg md:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Overall proficiency</p>
                  <p className="font-display mt-3 text-4xl font-bold">{result.cecr || '—'}</p>
                  <p className="mt-2 text-sm text-white/80">Holistic band from your latest submission.</p>
                  <p className="mt-4 text-xs leading-relaxed text-white/70">
                    Score {result.score}/100 — grammar, lexis, and discourse weighted per provider rubric.
                  </p>
                  {resultProvider ? (
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-sky-200/90">
                      Validated by {resultProvider}
                    </p>
                  ) : (
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-sky-200/90">L-AI Core</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--atelier-navy-deep)]">Grammar & syntax</h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[var(--fl-blue)]" style={{ width: `${result.grammar}%` }} />
                  </div>
                  <p className="mt-2 text-right text-xs font-bold text-slate-600">{Math.round(result.grammar)}%</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {result.strengths.slice(0, 2).map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {s}
                      </li>
                    ))}
                    {result.improvements[0] ? (
                      <li className="flex gap-2 text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        {result.improvements[0]}
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--atelier-navy-deep)]">Lexical range</h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${result.vocabulary}%` }} />
                  </div>
                  <p className="mt-2 text-right text-xs font-bold text-slate-600">{Math.round(result.vocabulary)}%</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {result.strengths.slice(2, 4).map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {s}
                      </li>
                    ))}
                    {result.improvements[1] ? (
                      <li className="flex gap-2 text-sky-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        {result.improvements[1]}
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--atelier-navy-deep)]">Structural coherence</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Argument flow and paragraphing inferred from fluency & grammar signals in this pass.
                  </p>
                  <div className="relative mx-auto mt-4 h-[7.5rem] w-[7.5rem]">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#fecaca" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#7f1d1d"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(264 * structuralPct) / 100} 264`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-[#7f1d1d]">
                      {structuralPct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-[var(--atelier-navy-deep)]">
                    Granular corrections (
                    {Math.min(4, result.improvements.length || (result.corrected_version ? 1 : 0))} highlighted)
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--fl-blue)] hover:underline"
                    onClick={() => {
                      const blob = new Blob(
                        [result.corrected_version || result.improvements.join('\n')],
                        { type: 'text/plain' },
                      )
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = 'frenchlearn-feedback.txt'
                      a.click()
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export feedback
                  </button>
                </div>
                <ul className="mt-6 space-y-4">
                  {(result.improvements.length
                    ? result.improvements.slice(0, 4)
                    : ['Review agreement and tense consistency.']
                  ).map((imp, i) => (
                      <li
                        key={i}
                        className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-[auto_1fr_1fr]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--atelier-navy-deep)] text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Original context</p>
                          <p className="mt-1 text-sm text-rose-800 line-clamp-3">{text.trim().slice(0, 120) || '—'}…</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Suggestion</p>
                          <p className="mt-1 text-sm font-medium text-[var(--fl-blue)]">{imp}</p>
                          <span className="mt-2 inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                            Enhancement
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
                {result.corrected_version ? (
                  <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase text-sky-900">Full corrected version</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.corrected_version}</p>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {/* Context column */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exam type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-sky-300"
            >
              <option>DELF / DALF Standard</option>
              <option>TEF Canada (writing focus)</option>
              <option>Academic placement</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">UI context only — API uses provider + optional C1 flag.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Desired tone</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-bold transition',
                    tone === t
                      ? 'bg-[var(--atelier-navy-deep)] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick insights</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 py-4 text-center">
                <p className="font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">{wordCount}</p>
                <p className="text-[10px] font-bold uppercase text-slate-500">Words</p>
              </div>
              <div className="rounded-xl bg-slate-50 py-4 text-center">
                <p className="font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">
                  {result ? result.improvements.length : 0}
                </p>
                <p className="text-[10px] font-bold uppercase text-slate-500">Focus points</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900/80">Streak</p>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-amber-950">{streak} days</p>
            <p className="mt-1 text-xs text-amber-900/70">From scores on this device.</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[var(--atelier-navy-deep)] p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">History</p>
              {result ? (
                <p className="mt-2 font-display text-3xl font-bold">{result.score}</p>
              ) : (
                <p className="mt-2 text-sm text-white/75">Run a score to populate.</p>
              )}
            </div>
            <div className="p-4">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="var(--atelier-navy-deep)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
