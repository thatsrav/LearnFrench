import { useEffect, useMemo, useState } from 'react'
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

type StoredScore = {
  ts: number
  score: number
  cecr: string
  provider: string
}

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
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeDailyStreak(scores: StoredScore[]): number {
  const days = new Set(scores.map((s) => dayKey(s.ts)))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (true) {
    const key = dayKey(cursor.getTime())
    if (!days.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function cefrColor(cecr: string): string {
  const level = cecr.toUpperCase()
  if (level.startsWith('A')) return 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30'
  if (level.startsWith('B')) return 'bg-sky-500/15 text-sky-200 ring-sky-400/30'
  if (level.startsWith('C')) return 'bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30'
  return 'bg-zinc-500/15 text-zinc-200 ring-zinc-400/30'
}

function App() {
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<'auto' | 'gemini' | 'groq'>('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading, [text, loading])
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    (location.hostname === 'localhost' ? '' : 'https://learnfrench-0vkn.onrender.com')

  useEffect(() => {
    setRecentScores(loadRecentScores())
  }, [])

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
      if (!resp.ok) {
        throw new Error(data?.error || `Request failed (${resp.status})`)
      }
      setResult(data?.result ?? null)
      if (!data?.result) {
        throw new Error('No result returned from server.')
      }
      setResultProvider(String(data?.provider ?? ''))

      const nextRecent: StoredScore[] = [
        ...recentScores,
        {
          ts: Date.now(),
          score: Number(data.result.score),
          cecr: String(data.result.cecr ?? ''),
          provider: String(data?.provider ?? ''),
        },
      ].slice(-30)
      setRecentScores(nextRecent)
      saveRecentScores(nextRecent)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const streak = useMemo(() => computeDailyStreak(recentScores), [recentScores])
  const latestCecr = result?.cecr ?? (recentScores.at(-1)?.cecr || '—')

  const chartData = useMemo(() => {
    return recentScores.map((s) => ({
      t: new Date(s.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.max(0, Math.min(100, s.score)),
    }))
  }, [recentScores])

  return (
    <div className="h-full bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="flex h-full">
        <aside
          className={[
            'h-full border-r border-white/10 bg-zinc-950/70 backdrop-blur',
            sidebarOpen ? 'w-[240px]' : 'w-[72px]',
            'transition-[width] duration-200 ease-out',
          ].join(' ')}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10" />
              {sidebarOpen && (
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white">French Scorer</div>
                  <div className="text-xs text-zinc-400">Dashboard</div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
            >
              {sidebarOpen ? '⟨' : '⟩'}
            </button>
          </div>

          <nav className="px-2">
            {[
              { label: 'Practice', key: 'practice' },
              { label: 'Scoreboard', key: 'scoreboard' },
              { label: 'Settings', key: 'settings' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left',
                  'text-sm text-zinc-200 hover:bg-white/5',
                ].join(' ')}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/20" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-zinc-400">Practice</div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">French scoring dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs ring-1', cefrColor(latestCecr)].join(' ')}>
                CEFR: <span className="ml-1 font-semibold">{latestCecr}</span>
              </span>
              <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-200 ring-1 ring-white/10">
                Streak: <span className="font-semibold">{streak}</span> day{streak === 1 ? '' : 's'}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-4">
            {/* Primary tile */}
            <section className="col-span-12 lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Write in French</div>
                  <div className="text-xs text-zinc-400">Paste your text and score it with your chosen provider.</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-zinc-400">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'auto' | 'gemini' | 'groq')}
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-white/20"
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
                      'rounded-xl px-4 py-2 text-sm font-semibold',
                      canSubmit ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-white/10 text-zinc-400',
                    ].join(' ')}
                  >
                    {loading ? 'Scoring…' : 'Score'}
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Écrivez votre texte ici…"
                className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
              />

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              {result && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <div className="text-4xl font-extrabold tracking-tight text-white">{result.score}</div>
                      <div className="text-sm text-zinc-400">/ 100</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      {resultProvider && (
                        <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                          Provider: <span className="font-semibold">{resultProvider}</span>
                        </span>
                      )}
                      <span className={['rounded-full px-2 py-1 ring-1', cefrColor(result.cecr)].join(' ')}>
                        CEFR <span className="font-semibold">{result.cecr}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Strengths</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
                        {result.strengths?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Improvements</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
                        {result.improvements?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Corrected version</div>
                    <pre className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-100">
                      {result.corrected_version}
                    </pre>
                  </div>
                </div>
              )}
            </section>

            {/* Secondary tiles */}
            <section className="col-span-12 lg:col-span-5 grid grid-cols-12 gap-4">
              <div className="col-span-12 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Recent Scores</div>
                    <div className="text-xs text-zinc-400">Last {chartData.length} runs</div>
                  </div>
                  <div className="text-xs text-zinc-400">0–100</div>
                </div>
                <div className="mt-3 h-44">
                  {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-zinc-950/40 text-sm text-zinc-400">
                      Score something to see a chart.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="t" tick={{ fill: 'rgba(244,244,245,0.7)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'rgba(244,244,245,0.7)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(9,9,11,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12 }}
                          labelStyle={{ color: 'rgba(244,244,245,0.8)' }}
                          itemStyle={{ color: 'rgba(244,244,245,0.9)' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="col-span-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-semibold text-white">Daily streak</div>
                <div className="mt-1 text-xs text-zinc-400">Consecutive days you scored</div>
                <div className="mt-6 text-4xl font-extrabold tracking-tight text-white">{streak}</div>
                <div className="mt-1 text-sm text-zinc-300">day{streak === 1 ? '' : 's'}</div>
              </div>

              <div className="col-span-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-semibold text-white">CEFR level</div>
                <div className="mt-1 text-xs text-zinc-400">Latest result</div>
                <div className="mt-6">
                  <span className={['inline-flex items-center rounded-2xl px-4 py-2 text-2xl font-extrabold ring-1', cefrColor(latestCecr)].join(' ')}>
                    {latestCecr}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">A1 → C2</div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
