import { Bot, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { syncWebScoreHistoryToCloud } from '../lib/cloudProgressWeb'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

const BREAKDOWN_LABELS: { key: keyof Pick<FrenchScore, 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency'>; label: string }[] = [
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'fluency', label: 'Fluency' },
]

export default function AIScorerPage() {
  const { user } = useAuth()
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<ScoreProvider>('auto')
  const [c1Essay, setC1Essay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>(() => loadRecentScores())

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading && inputMode === 'text', [text, loading, inputMode])

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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-violet-600">AI French Scorer</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Writing & language check</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Paste French text for detailed scoring, CEFR estimate, skill breakdown, and corrections — powered by your secure
          backend.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={[
                  'flex-1 rounded-lg py-2 text-sm font-semibold transition',
                  inputMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                Text input
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={[
                  'flex-1 rounded-lg py-2 text-sm font-semibold transition',
                  inputMode === 'voice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                Voice input (demo)
              </button>
            </div>

            {inputMode === 'text' ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Écrivez votre texte en français…"
                disabled={loading}
                className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-900 outline-none ring-0 transition focus:border-indigo-400"
              />
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                <Bot className="mx-auto mb-3 text-slate-400" size={36} />
                Voice capture is a UI placeholder — use <strong>Text input</strong> for real AI grading.
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ScoreProvider)}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="auto">Auto</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
              </select>
              <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={c1Essay} onChange={(e) => setC1Essay(e.target.checked)} disabled={loading} />
                C1 essay routing
              </label>
            </div>

            <button
              type="button"
              onClick={() => void onScore()}
              disabled={!canSubmit}
              className={[
                'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-lg transition',
                canSubmit
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95'
                  : 'cursor-not-allowed bg-slate-300',
              ].join(' ')}
            >
              <Sparkles size={18} />
              Analyze my French
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Analyzing with AI…</p>
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-10 rounded-lg bg-gradient-to-r from-indigo-100 to-violet-100" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-3/5 rounded bg-slate-200" />
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/80">Overall score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tight">{result.score}</span>
                      <span className="text-lg text-white/80">/100</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resultProvider && (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">{resultProvider}</span>
                    )}
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-800">CEFR {result.cecr}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Skill breakdown</h3>
                {BREAKDOWN_LABELS.map(({ key, label }) => {
                  const val = Math.max(0, Math.min(100, Number(result[key] ?? result.score)))
                  return (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-semibold text-slate-800">{label}</span>
                        <span className="text-slate-500">{val}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-700"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 border-t border-slate-100 p-6 md:grid-cols-2">
                <div>
                  <h4 className="text-xs font-bold uppercase text-emerald-700">Strengths</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-amber-800">Suggestions</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                    {result.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.corrected_version && (
                <div className="border-t border-slate-100 bg-slate-50 p-6">
                  <h4 className="text-xs font-bold uppercase text-indigo-800">Corrected version</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.corrected_version}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Your streak</h3>
            <p className="mt-2 text-3xl font-black text-amber-600">{streak} days</p>
            <p className="text-xs text-slate-500">Uses score history on this device.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Recent trend</h3>
            <div className="mt-2 h-44">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
                  No scores yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
