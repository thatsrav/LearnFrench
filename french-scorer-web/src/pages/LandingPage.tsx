import { ArrowRight, BookOpen, Bot, ChevronRight, Flag, Medal, Sparkles, User } from 'lucide-react'
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
    desc: 'Family, work, and past events — expand fluency with structured practice and AI feedback.',
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
    <div className="min-h-full bg-[#f9fafb]">
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-slate-900">F</span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">FrenchLearn</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link to="/" className="border-b-2 border-[#4f46e5] pb-0.5 text-slate-900">
              Home
            </Link>
            <Link to="/scorer" className="transition hover:text-indigo-600">
              AI Scorer
            </Link>
            <Link to="/tef-prep" className="transition hover:text-indigo-600">
              TEF Prep
            </Link>
            <Link to="/reading" className="transition hover:text-indigo-600">
              Reading
            </Link>
            <Link to="/speaking" className="transition hover:text-indigo-600">
              Speaking
            </Link>
            <Link to="/leaderboard" className="transition hover:text-indigo-600">
              Scores
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
              to="/scorer"
              className="hidden rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 sm:inline-flex"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight text-[#111827] md:text-5xl lg:text-6xl">
            Maîtrise le Français avec Élégance
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4b5563]">
            FrenchLearn is your sanctuary for serious study — curriculum, AI scoring, and TEF-aligned practice in one calm,
            editorial space.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#syllabus"
              className="inline-flex items-center justify-center rounded-lg bg-[#4f46e5] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-600"
            >
              Start Journey
            </a>
            <a
              href="#pathways"
              className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800 underline decoration-slate-300 decoration-1 underline-offset-8 transition hover:decoration-indigo-400"
            >
              Explore Atelier
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-6 md:grid-rows-2 lg:gap-5">
          <Link
            to="/scorer"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md md:col-span-4 md:row-span-1"
          >
            <div className="flex items-center gap-2 text-[#4f46e5]">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">Precision AI Scorer</span>
            </div>
            <p className="font-display mt-4 text-2xl font-bold text-slate-900">Neural feedback on every sentence</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">CEFR estimates, corrections, and skill breakdown in seconds.</p>
            <div className="mt-6 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 md:h-32">
              <div className="text-xs font-medium text-white/60">Writing analysis · preview</div>
            </div>
          </Link>

          <Link
            to="/reading"
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md md:col-span-2 md:row-span-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5]">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="font-display mt-6 text-xl font-bold text-slate-900">Reading Room</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">Articles, quizzes, and comprehension at your pace.</p>
            <span className="mt-6 text-xs font-bold uppercase tracking-wide text-[#4f46e5]">
              Open library →
            </span>
          </Link>

          <Link
            to="/tef-prep"
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-red-100 hover:shadow-md md:col-span-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <Medal className="h-6 w-6" />
            </div>
            <p className="font-display mt-4 text-lg font-bold text-slate-900">TEF Prep</p>
            <p className="mt-2 text-sm text-slate-600">A1 skill rooms — listening, reading, writing, speaking.</p>
            <div className="mt-4 flex gap-2">
              {(['A1', 'A2', 'B1'] as const).map((lv) => (
                <span
                  key={lv}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600"
                >
                  {lv}
                </span>
              ))}
            </div>
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
            <a
              href="#syllabus"
              className="relative mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#4f46e5] transition hover:bg-slate-50"
            >
              View curriculum
            </a>
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

      <section id="syllabus" className="scroll-mt-20 bg-[#f9fafb] px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-center text-3xl font-bold text-slate-900">French Syllabus</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            {CURRICULUM_STATS.moduleCount} modules · {CURRICULUM_STATS.lessonCount} lessons — from beginner to intermediate.
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
            <h2 className="font-display text-2xl font-bold text-slate-900">Ready when you are</h2>
            <p className="mt-2 text-slate-600">Try the AI scorer or open TEF listening practice.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/scorer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              <Bot className="h-4 w-4" /> AI Scorer
            </Link>
            <Link
              to="/tef-prep"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
            >
              <Flag className="h-4 w-4" /> TEF Prep
            </Link>
            <Link
              to="/reading"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              <BookOpen className="h-4 w-4" /> Reading
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f9fafb] px-4 py-12 md:px-8">
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
