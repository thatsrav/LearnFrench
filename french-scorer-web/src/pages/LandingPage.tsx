import { ArrowRight, BookOpen, Bot, ChevronRight, Flag, Sparkles, Trophy, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CURRICULUM_MODULES, CURRICULUM_STATS } from '../lib/curriculum'

const PATHWAYS = [
  {
    n: '01',
    pill: 'Foundation (A1)',
    title: 'The First Breath of Language',
    desc: 'Greetings, numbers, and the rhythm of everyday French — built for confident first steps.',
  },
  {
    n: '02',
    pill: 'Expansion (A2)',
    title: 'Stories, Routines, and Real Life',
    desc: 'Family, work, and past events — expand fluency with structured units; add AI feedback on drafts when you want it.',
  },
  {
    n: '03',
    pill: 'Mastery (B1+)',
    title: 'Argument, Nuance, and TEF Readiness',
    desc: 'Sharpen comprehension, writing, and oral strategies aligned with exam-style tasks.',
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-full bg-[var(--fl-bg)]">
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/welcome" className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-slate-900">F</span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">FrenchLearn</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link
              to="/"
              className="rounded-full bg-[#1A1B4B] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#12132e]"
            >
              Launch Atelier
            </Link>
            <span className="text-slate-400">|</span>
            <a href="#pathways" className="text-slate-700 hover:text-indigo-600">
              Pathways
            </a>
            <Link to="/tef-prep" className="transition hover:text-red-700">
              TEF Prep
            </Link>
            <Link to="/syllabus" className="transition hover:text-indigo-600">
              Study units
            </Link>
            <Link to="/leaderboard" className="transition hover:text-indigo-600">
              Scores
            </Link>
            <Link to="/scorer" className="transition hover:text-indigo-600">
              AI Scorer
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:text-indigo-700"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/tef-prep"
              className="hidden rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-red-900/20 sm:inline-flex"
            >
              Start TEF
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight text-[#111827] md:text-5xl lg:text-6xl">
            TEF prep & structured French units — first.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4b5563]">
            Build with exam-style TEF Canada skill rooms and a full module syllabus (lessons from A1 upward). Use the AI writing
            scorer when you want feedback on a draft — it supports the main track; it isn’t the starting point.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#1A1B4B] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#12132e]"
            >
              Enter dashboard
            </Link>
            <Link
              to="/tef-prep"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/25 transition hover:bg-red-800"
            >
              Open TEF Prep
            </Link>
            <Link
              to="/syllabus"
              className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50"
            >
              Browse study units
            </Link>
            <a
              href="#pathways"
              className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800 underline decoration-slate-300 decoration-1 underline-offset-8 transition hover:decoration-indigo-400"
            >
              Pathways
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-6 md:grid-rows-2 lg:gap-5">
          <Link
            to="/tef-prep"
            className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md md:col-span-4 md:row-span-1"
          >
            <div className="flex items-center gap-2 text-red-700">
              <Flag className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">TEF Canada · main track</span>
            </div>
            <p className="font-display mt-4 text-2xl font-bold text-slate-900">Exam-style skill rooms</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Reading, writing, listening, and speaking in structured A1 units — start here for TEF-aligned practice.
            </p>
            <div className="mt-6 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-red-900/90 via-red-800 to-slate-900 md:h-32">
              <div className="text-xs font-medium text-white/80">Listening · reading · writing · speaking</div>
            </div>
          </Link>

          <Link
            to="/syllabus"
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md md:col-span-2 md:row-span-1"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5]">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="font-display mt-6 text-xl font-bold text-slate-900">Study units</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              {CURRICULUM_STATS.moduleCount} modules · {CURRICULUM_STATS.lessonCount} lessons — your core curriculum path.
            </p>
            <span className="mt-6 text-xs font-bold uppercase tracking-wide text-[#4f46e5]">Open syllabus →</span>
          </Link>

          <Link
            to="/scorer"
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md md:col-span-4 md:row-span-1"
          >
            <div className="flex items-center gap-2 text-violet-600">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">Extra · AI writing feedback</span>
            </div>
            <p className="font-display mt-4 text-lg font-bold text-slate-900">Paste a draft for CEFR-style scoring</p>
            <p className="mt-2 text-sm text-slate-600">Corrections and breakdown when you’re polishing text — after your lessons.</p>
          </Link>

          <div className="relative overflow-hidden rounded-2xl bg-[#4f46e5] p-8 text-white shadow-lg md:col-span-2">
            <div className="pointer-events-none absolute -right-4 -top-4 font-display text-[120px] font-bold leading-none text-white/10">
              F
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">The Atelier Method</p>
            <p className="font-display relative mt-3 text-xl font-bold">Structured, human, and machine-augmented.</p>
            <p className="relative mt-2 text-sm leading-relaxed text-white/85">
              Modules build like chapters — from survival French to exam-ready expression.
            </p>
            <Link
              to="/syllabus"
              className="relative mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#4f46e5] transition hover:bg-slate-50"
            >
              View curriculum
            </Link>
          </div>
        </div>
      </section>

      <section id="pathways" className="scroll-mt-24 border-t border-slate-200 bg-white px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">Structured Pathways Designed as Chapters</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Each stage deepens autonomy — from recognition to production.</p>
          <ul className="mt-14 space-y-0 divide-y divide-slate-200">
            {PATHWAYS.map((row) => (
              <li key={row.n} className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:gap-8">
                <span className="font-display text-5xl font-bold text-slate-200 md:w-24">{row.n}</span>
                <div className="flex-1 md:flex md:items-center md:gap-8">
                  <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                    {row.pill}
                  </span>
                  <div className="mt-3 md:mt-0 md:flex-1">
                    <p className="font-display text-xl font-bold text-slate-900">{row.title}</p>
                    <p className="mt-1 text-sm text-slate-600 md:max-w-xl">{row.desc}</p>
                  </div>
                </div>
                <ChevronRight className="hidden h-6 w-6 shrink-0 text-slate-300 md:block" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="syllabus" className="scroll-mt-20 bg-[var(--fl-bg)] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-center text-3xl font-bold text-slate-900">Study units · core curriculum</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            {CURRICULUM_STATS.moduleCount} modules · {CURRICULUM_STATS.lessonCount} lessons — work through units alongside TEF
            prep.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {CURRICULUM_MODULES.map((m) => (
              <article
                key={m.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{m.levelBadge}</span>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900">{m.frenchTitle}</h3>
                <p className="text-sm font-medium text-slate-500">{m.englishTitle}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{m.description}</p>
                <Link
                  to={`/unit/${m.id}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#4f46e5] hover:underline"
                >
                  View unit <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-16 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Start with structure</h2>
            <p className="mt-2 text-slate-600">TEF prep and study units first; AI scoring when you’re revising a piece of writing.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/tef-prep"
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-800"
            >
              <Flag className="h-4 w-4" /> TEF Prep
            </Link>
            <Link
              to="/syllabus"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-6 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-50"
            >
              <BookOpen className="h-4 w-4" /> Study units
            </Link>
            <Link
              to="/scorer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <Bot className="h-4 w-4" /> AI Scorer
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <Trophy className="h-4 w-4" /> Scores
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[var(--fl-bg)] px-4 py-12 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-xl font-semibold text-slate-900">FrenchLearn</p>
          <nav className="flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span className="cursor-pointer hover:text-indigo-600">Privacy Policy</span>
            <span className="cursor-pointer hover:text-indigo-600">Terms of Craft</span>
            <Link to="/account" className="hover:text-indigo-600">
              Contact Us
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-center text-[10px] uppercase tracking-wider text-slate-400 md:text-left">
          © {new Date().getFullYear()} FrenchLearn · The Breathable Atelier
        </p>
      </footer>
    </div>
  )
}
