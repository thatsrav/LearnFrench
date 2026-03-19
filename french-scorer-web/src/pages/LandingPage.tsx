import { ArrowRight, Award, BookOpen, Bot, Clock, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CURRICULUM_MODULES, CURRICULUM_STATS } from '../lib/curriculum'

export default function LandingPage() {
  return (
    <div className="min-h-full bg-[#f8fafc]">
      {/* Top bar */}
      <header className="border-b border-white/10 bg-slate-900/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg">
              F
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">FrenchLearn</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-semibold text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/scorer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800"
            >
              <Bot size={18} />
              AI Scorer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#4338ca] to-[#7c3aed] px-4 pb-24 pt-16 text-white md:px-6 md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Apprenez le Français</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            Master French with our comprehensive curriculum and AI-powered scoring system. From beginner to intermediate,
            we&apos;ve got you covered.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#syllabus"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-slate-50"
            >
              Start Learning
              <ArrowRight size={18} />
            </a>
            <Link
              to="/scorer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Bot size={18} />
              Try AI Scorer
            </Link>
          </div>
        </div>

        {/* Feature bento overlapping hero */}
        <div className="relative z-10 mx-auto mt-14 grid max-w-5xl gap-4 md:-mb-8 md:grid-cols-3 md:px-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BookOpen size={24} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{CURRICULUM_STATS.moduleCount} Units</p>
            <p className="text-sm text-slate-500">Comprehensive curriculum</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Target size={24} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{CURRICULUM_STATS.lessonCount} Lessons</p>
            <p className="text-sm text-slate-500">Structured learning path</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Award size={24} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">AI Powered</p>
            <p className="text-sm text-slate-500">Instant feedback</p>
          </div>
        </div>
      </section>

      {/* Syllabus grid */}
      <section id="syllabus" className="scroll-mt-20 px-4 pb-16 pt-28 md:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">French Syllabus</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Our structured curriculum takes you from beginner to intermediate level with carefully designed units.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {CURRICULUM_MODULES.map((m) => (
              <article
                key={m.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{m.levelBadge}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Clock size={14} />
                    {m.durationWeeks} weeks
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900">
                  {m.frenchTitle}
                  <span className="block text-base font-semibold text-slate-500">— {m.englishTitle}</span>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{m.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.topics.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {t}
                    </span>
                  ))}
                  {m.topics.length > 3 && (
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">+{m.topics.length - 3} more</span>
                  )}
                </div>
                <p className="mt-4 text-xs font-medium text-slate-500">{m.lessons.length} lessons included</p>
                <Link
                  to={`/unit/${m.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-500 hover:text-blue-700"
                >
                  View Unit
                  <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Ready to Test Your French?</h2>
          <p className="mt-3 text-slate-600">
            Use our AI-powered French scorer to get instant feedback on your grammar, vocabulary, and writing flow.
          </p>
          <Link
            to="/scorer"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95"
          >
            <Bot size={20} />
            Try AI Scorer Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">FrenchLearn — Modern French</footer>
    </div>
  )
}
