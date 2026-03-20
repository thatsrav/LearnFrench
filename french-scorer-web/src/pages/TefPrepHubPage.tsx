import { ArrowRight, BookOpen, Flame, Headphones, Mic, Pencil, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TEF_A1_UNIT_COUNT } from '../lib/tefPrepFetch'

const UNIT_BLURBS: Record<number, string> = {
  1: 'Core syntax, verb tenses, and sentence structure essentials.',
  2: 'Lexical mastery — everyday vocabulary in context.',
  3: 'Argumentative strategy for short written tasks.',
  4: 'Listening: rapid audio decoding and inference.',
  5: 'Advanced reading — notices, emails, and short articles.',
  6: 'Speaking Section A — asking for information.',
  7: 'Speaking Section B — structured monologue.',
  8: 'Subjunctive and nuance in formal French.',
  9: 'Time management under exam conditions.',
  10: 'Full-length review and confidence checklist.',
}

const SKILLS_ROW = [
  { icon: BookOpen, title: 'Reading', sub: 'Compréhension écrite', to: '/tef-prep/a1/1/reading' },
  { icon: Pencil, title: 'Writing', sub: 'Expression écrite', to: '/tef-prep/a1/1/writing' },
  { icon: Headphones, title: 'Listening', sub: 'Compréhension orale', to: '/tef-prep/a1/1/listening' },
  { icon: Mic, title: 'Speaking', sub: 'Expression orale', to: '/tef-prep/a1/1/speaking' },
] as const

export default function TefPrepHubPage() {
  return (
    <div className="space-y-12 pb-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">TEF Canada</p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Mastering Proficiency.</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Prepare for your journey with structured A1 skill rooms — reading, writing, listening, and speaking. Content loads
            from bundled JSON; listening uses our extended catalog for six-question TEF-style practice.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-violet-600">
              <Flame className="h-5 w-5" />
              <span className="text-xs font-bold uppercase text-slate-500">Streak</span>
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900">12</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-500">Days to exam</p>
            <p className="mt-1 text-2xl font-black text-slate-900">45</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS_ROW.map(({ icon: Icon, title, sub, to }) => (
          <Link
            key={title}
            to={to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-slate-900">{title}</p>
            <p className="mt-1 text-sm capitalize text-slate-500">{sub}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-1 w-10 rounded-full bg-[#2563eb]" />
          <h2 className="font-display text-2xl font-bold text-slate-900">Preparation Pathway</h2>
        </div>
        <ul className="space-y-3">
          {Array.from({ length: TEF_A1_UNIT_COUNT }, (_, i) => i + 1).map((unit) => (
            <li key={unit}>
              <Link
                to={`/tef-prep/a1/${unit}`}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-100 hover:bg-red-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-sm font-black text-slate-700">
                    {String(unit).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900">
                      Unité {unit} — TEF A1 foundations
                    </p>
                    <p className="mt-1 max-w-xl text-sm text-slate-600">
                      {UNIT_BLURBS[unit] ?? 'Skill-room practice for this unit.'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-red-700 sm:shrink-0">
                  Ouvrir <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-xl">
          <Sparkles className="h-8 w-8 text-indigo-300" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">AI score prediction</p>
          <p className="font-display mt-2 text-2xl font-bold">Need a benchmark?</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            Paste French writing for CEFR-style scoring and breakdowns — a useful complement to TEF prep.
          </p>
          <Link
            to="/scorer"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100"
          >
            Try AI Scorer
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex gap-1 text-red-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <p className="font-display mt-4 text-xl font-bold text-slate-900">&ldquo;The best preparation tool I used.&rdquo;</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Structured units plus listening practice that feels like the real exam — I moved from CLB 5 to CLB 9 with daily use.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div>
              <p className="text-sm font-bold text-slate-900">Marc-André V.</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Successfully immigrated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
