import { Flame, GraduationCap, Play, Plus, Sparkles, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { countModuleProgress, getModuleById } from '../lib/curriculum'
import { getSyllabusData, getUnitById } from '../lib/syllabus'
import MotDuJourCard from '../components/motDuJour/MotDuJourCard'
import TefTrackFooterBar from '../components/tef/TefTrackFooterBar'

const RECENT_SCORES_KEY = 'french_scorer_recent_scores_v1'

type StoredScore = { ts: number; score: number; cecr: string; provider: string }

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

function displayName(user: ReturnType<typeof useAuth>['user']): string {
  if (!user?.email) return 'Jean'
  const local = user.email.split('@')[0] ?? 'Jean'
  const cleaned = local.replace(/[._]/g, ' ').trim()
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : 'Jean'
}

function lastCefr(scores: StoredScore[]): string {
  const last = scores.at(-1)
  return last?.cecr?.trim() || 'B2'
}

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardHomePage() {
  const { user } = useAuth()
  const scores = useMemo(() => loadRecentScores(), [])
  const streak = useMemo(() => computeDailyStreak(scores), [scores])
  const cefr = useMemo(() => lastCefr(scores), [scores])

  const syllabusRows = useMemo(() => getSyllabusData(), [])
  const focusMod = useMemo(() => getModuleById('mod-a1-bases'), [])
  const progress = useMemo(() => {
    if (!focusMod) return { percent: 25, done: 0, total: 8 }
    const p = countModuleProgress(focusMod, syllabusRows)
    return p.total ? p : { percent: 25, done: 0, total: 8 }
  }, [focusMod, syllabusRows])

  const focusRow = useMemo(() => {
    const avail = syllabusRows.find((r) => r.status === 'available')
    return avail ?? syllabusRows[0] ?? null
  }, [syllabusRows])

  const focusLesson = useMemo(() => {
    if (!focusRow) {
      return {
        unitId: 'a1-u1',
        orderLabel: '1.1',
        title: 'Greetings & Introductions',
        blurb: "Master the art of the perfect « Bonjour » and navigating formal vs. informal settings.",
      }
    }
    const u = getUnitById(focusRow.id)
    const orderLabel = focusRow.level === 'A1' ? `1.${focusRow.orderIndex}` : `${focusRow.orderIndex}`
    return {
      unitId: focusRow.id,
      orderLabel,
      title: u?.title ?? focusRow.title,
      blurb: "Master the art of the perfect « Bonjour » and navigating formal vs. informal settings.",
    }
  }, [focusRow])

  const weekChart = useMemo(() => {
    const byDay: Record<string, number> = {}
    scores.forEach((s) => {
      const d = new Date(s.ts)
      const i = (d.getDay() + 6) % 7
      const label = WEEK_LABELS[i]
      byDay[label] = Math.max(byDay[label] ?? 0, s.score)
    })
    return WEEK_LABELS.map((day) => ({
      day,
      score: byDay[day] ?? 0,
      active: day === 'Wed',
    }))
  }, [scores])

  const name = displayName(user)

  return (
    <div className="relative space-y-8 pb-24">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1A1B4B] md:text-4xl">
          Bienvenue, {name}!
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          Ready for your <strong className="font-semibold text-[#1A1B4B]">Atelier session</strong> today? Consistency is the
          bridge between fluency and mastery.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-indigo-100/80 bg-[#EEF2FF] p-6 shadow-sm md:p-8">
            <span className="inline-flex rounded-full bg-indigo-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-900">
              Current focus
            </span>
            <h2 className="font-display mt-4 text-xl font-bold text-[#1A1B4B] md:text-2xl">
              Lesson {focusLesson.orderLabel}: {focusLesson.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{focusLesson.blurb}</p>
            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Module progress</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-[#4F46E5] transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            <Link
              to={`/lesson/${focusLesson.unitId}?module=${encodeURIComponent('mod-a1-bases')}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1A1B4B] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#12132e]"
            >
              <Play className="h-4 w-4 fill-current" />
              Resume lesson
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CEFR level</p>
                <p className="font-display text-lg font-bold text-[#1A1B4B]">
                  {cefr} {cefr.startsWith('B') ? 'Intermediate' : cefr.startsWith('A') ? 'Foundation' : 'Advanced'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-800">
              Vocabulary: <span className="font-bold text-[#1A1B4B]">2,480</span> mots
            </p>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500">Streak</p>
                <p className="font-display text-lg font-bold text-[#1A1B4B]">{streak} days</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Study consistency</p>
            <p className="text-xs text-slate-600">Last 7 days</p>
            <div className="mt-3 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekChart} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {weekChart.map((entry, i) => (
                      <Cell key={i} fill={entry.active ? '#4F46E5' : '#c7d2fe'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="relative grid gap-5 md:grid-cols-2">
        <Link
          to="/tef-prep"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="font-display mt-4 text-lg font-bold text-[#1A1B4B]">TEF prep room</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Simulate the official Test d&apos;évaluation de français with timed reading, writing, listening, and speaking
            modules.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Mock exams</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
              Reading comprehension
            </span>
          </div>
        </Link>

        <Link
          to="/scorer"
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-display mt-4 text-lg font-bold text-[#1A1B4B]">AI Scorer</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Paste your essays for instant academic feedback on syntax, tone, and CEFR-style banding.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Instant feedback</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Tone analysis</span>
          </div>
        </Link>

        <Link
          to="/syllabus"
          className="fixed bottom-8 right-6 z-10 inline-flex items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/25 transition hover:bg-[#4338ca] md:right-10"
        >
          <Plus className="h-5 w-5" />
          Quick practice
        </Link>
      </div>

      <MotDuJourCard />

      <section className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TEF track pulse</p>
        <TefTrackFooterBar />
      </section>
    </div>
  )
}
