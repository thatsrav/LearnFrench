import { Bot, Flame, Lightbulb, Mic, Sparkles, Type } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { syncWebScoreHistoryToCloud } from '../lib/cloudProgressWeb'
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

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Premium linguistic engine</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-[2.75rem]">
          Master French with AI Precision
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Paste your essay or speak your thoughts. Our models analyze syntax, vocabulary depth, and tone in seconds — with a
          CEFR readout you can trust for practice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
                  inputMode === 'text' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                <Type className="h-4 w-4" />
                Text input
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
                  inputMode === 'voice' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                <Mic className="h-4 w-4" />
                Voice input
              </button>
            </div>

            {inputMode === 'text' ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Saisissez votre texte ici pour analyse… (min. quelques phrases)"
                disabled={loading}
                className="mt-5 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              />
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                <Bot className="mx-auto mb-3 text-slate-400" size={36} />
                Voice capture is a UI placeholder — use <strong>Text input</strong> for real AI grading.
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ScoreProvider)}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="auto">Luminous routing (Auto)</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={c1Essay} onChange={(e) => setC1Essay(e.target.checked)} disabled={loading} />
                Route for C1 / academic scoring
              </label>
            </div>

            <button
              type="button"
              onClick={() => void onScore()}
              disabled={!canSubmit}
              className={[
                'mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition',
                canSubmit
                  ? 'bg-gradient-to-r from-[#6366f1] via-violet-600 to-[#4f46e5] hover:opacity-95'
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
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
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
              {result.corrected_version ? (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                  <h4 className="text-xs font-bold uppercase text-indigo-800">Corrected version</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.corrected_version}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-[1.5rem] border border-amber-100 bg-[#fffbeb] p-5 shadow-sm ring-1 ring-amber-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80">Learning streak</p>
                  <p className="text-xl font-black text-amber-950">{streak} jours</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-950">+50 XP</span>
            </div>
            <p className="mt-2 text-xs text-amber-900/70">Basé sur l’historique des scores sur cet appareil.</p>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#6366f1] via-violet-600 to-[#4f46e5] p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Latest analysis</p>
              {result ? (
                <>
                  <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-5xl font-black tracking-tight">{result.score}</p>
                      <p className="text-sm font-medium text-white/80">/ 100</p>
                    </div>
                    <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#2563eb] shadow-sm">
                      CEFR {result.cecr}
                    </span>
                  </div>
                  {resultProvider ? (
                    <p className="mt-2 text-xs text-white/70">via {resultProvider}</p>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 text-sm text-white/85">Analysez un texte pour voir score et niveau ici.</p>
              )}
            </div>
            <div className="space-y-5 p-6">
              {result ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Skill breakdown</p>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex justify-between text-sm font-semibold text-slate-800">
                        <span>Grammar & syntax</span>
                        <span>{Math.round(result.grammar)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${result.grammar}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm font-semibold text-slate-800">
                        <span>Vocabulary range</span>
                        <span>{Math.round(result.vocabulary)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#6366f1]" style={{ width: `${result.vocabulary}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm font-semibold text-slate-800">
                        <span>Pronunciation (voice)</span>
                        <span>{Math.round(result.pronunciation)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-fuchsia-400" style={{ width: `${result.pronunciation}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-sm font-semibold text-slate-800">
                        <span>Fluency</span>
                        <span>{Math.round(result.fluency)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-violet-400" style={{ width: `${result.fluency}%` }} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Votre dernière analyse apparaîtra ici.</p>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score history</p>
                <div className="mt-3 h-40">
                  {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
                      Aucun score pour le graphique
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
            <p className="text-sm leading-relaxed text-slate-600">
              Astuce : utiliser le <strong className="text-slate-800">subjonctif</strong> plus souvent dans vos essais vous
              rapproche du territoire C1.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
