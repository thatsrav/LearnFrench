import { Flame, PlayCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
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
  cecr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string
  strengths: string[]
  improvements: string[]
  corrected_version: string
}

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
      .map((x) => ({ ts: x.ts as number, score: x.score as number, cecr: String(x.cecr ?? ''), provider: String(x.provider ?? '') }))
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
function cefrColor(cecr: string): string {
  const level = cecr.toUpperCase()
  if (level.startsWith('A')) return 'bg-emerald-100 text-emerald-800'
  if (level.startsWith('B')) return 'bg-indigo-100 text-indigo-800'
  if (level.startsWith('C')) return 'bg-violet-100 text-violet-800'
  return 'bg-slate-100 text-slate-700'
}
function getDailyVocab(level: string): string[] {
  const cecr = level.toUpperCase()
  if (cecr.startsWith('A')) return ['bonjour', 'merci', 'demain']
  if (cecr.startsWith('B')) return ['cependant', 'ameliorer', 'quotidiennement']
  if (cecr.startsWith('C')) return ['nuancer', 'pertinent', 'coherence']
  return ['mot', 'phrase', 'conversation']
}

export default function HomeDashboardPage() {
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<'auto' | 'gemini' | 'groq'>('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>(() => loadRecentScores())

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading, [text, loading])
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
      const resp = await fetch(`${apiBase}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, provider }),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || `Request failed (${resp.status})`)
      if (!data?.result) throw new Error('No result returned from server.')
      setResult(data.result)
      setResultProvider(String(data?.provider ?? ''))
      const next = [...recentScores, { ts: Date.now(), score: Number(data.result.score), cecr: String(data.result.cecr ?? ''), provider: String(data?.provider ?? '') }].slice(-30)
      setRecentScores(next)
      saveRecentScores(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const streak = useMemo(() => computeDailyStreak(recentScores), [recentScores])
  const latestCecr = result?.cecr ?? (recentScores.at(-1)?.cecr || '—')
  const dailyVocab = useMemo(() => getDailyVocab(latestCecr), [latestCecr])
  const chartData = useMemo(
    () => recentScores.map((s) => ({ t: new Date(s.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), score: Math.max(0, Math.min(100, s.score)) })),
    [recentScores],
  )

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:scale-[1.01] lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">French Scorer</h2>
            <p className="text-sm text-slate-500">Writing Lab: improve your French writing instantly.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'auto' | 'gemini' | 'groq')}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#2563eb]"
            >
              <option value="auto">Auto</option>
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
            </select>
            <button
              type="button"
              onClick={onScore}
              disabled={!canSubmit}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold text-white transition',
                canSubmit ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-slate-300',
              ].join(' ')}
            >
              Score My French
            </button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Ecrivez votre texte en francais..."
          className="mt-4 w-full resize-y rounded-2xl border border-white/80 bg-white/70 p-4 text-sm text-slate-800 shadow-inner backdrop-blur-md outline-none placeholder:text-slate-400 focus:border-[#2563eb]"
        />

        {error && <div className="mt-4 rounded-xl border border-[#F27166]/40 bg-[#F27166]/10 p-3 text-sm text-[#8f2a22]"><span className="font-semibold">Error:</span> {error}</div>}

        {loading && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-24 rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
              <div className="h-24 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold text-slate-900">{result.score}</div>
                <div className="pb-1 text-sm text-slate-500">/100</div>
              </div>
              <div className="flex items-center gap-2">
                {resultProvider && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{resultProvider}</span>}
                <span className={['rounded-full px-3 py-1 text-xs font-semibold', cefrColor(result.cecr)].join(' ')}>CEFR {result.cecr}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:scale-[1.01] lg:col-span-4">
        <h2 className="text-lg font-semibold text-slate-900">Stats</h2>
        <p className="text-sm text-slate-500">Current level and daily consistency.</p>
        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="rounded-full bg-[#2563eb] px-8 py-6 text-center text-white shadow-[0_0_45px_rgba(37,99,235,0.35)]">
            <div className="text-xs uppercase tracking-wide text-white/80">CEFR Level</div>
            <div className="text-4xl font-extrabold">{latestCecr}</div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700 ring-1 ring-amber-200">
            <Flame className="text-amber-500" size={18} />
            <div className="text-sm font-semibold">{streak} Days</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:scale-[1.01] lg:col-span-4">
        <h2 className="text-lg font-semibold text-slate-900">Daily Vocab</h2>
        <p className="text-sm text-slate-500">Three words tailored to your level.</p>
        <div className="mt-4 space-y-3">
          {dailyVocab.map((word) => (
            <div key={word} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="font-medium text-slate-700">{word}</span>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs text-[#2563eb] ring-1 ring-slate-200 hover:bg-slate-100">
                <PlayCircle size={14} />
                Listen
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:scale-[1.01] lg:col-span-8">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
            <p className="text-sm text-slate-500">Track your score trends over time.</p>
          </div>
          <span className="text-xs text-slate-400">0 - 100</span>
        </div>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
              Start scoring to build your history.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 10, left: -14, bottom: 4 }}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', color: '#1E293B' }} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}

