import {
  ArrowRight,
  Brain,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  LineChart,
  Puzzle,
  Shuffle,
  Sparkles,
  Target,
  Users,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type GameStatus = 'available' | 'coming_soon' | 'in_development'

type GrammarGame = {
  id: string
  title: string
  shortTitle: string
  description: string
  icon: typeof BookOpen
  status: GameStatus
  href?: string
  accent: string
  scienceNote: string
}

const GAMES: GrammarGame[] = [
  {
    id: 'conjugation-codex',
    title: 'Conjugation Codex',
    shortTitle: 'Conjugation Codex',
    description:
      'Sort verb forms into the right tense columns, fix agreement in context, and rebuild scrambled syntax — a focused workout for French morphology.',
    icon: BookOpen,
    status: 'available',
    href: '/game/conjugation-codex',
    accent: 'from-indigo-50 to-violet-50/80 border-indigo-100',
    scienceNote: 'Interleaving tenses strengthens discrimination between similar forms (spacing + varied retrieval).',
  },
  {
    id: 'agreement-challenge',
    title: 'Agreement Challenge',
    shortTitle: 'Agreement Challenge',
    description:
      'Past participle agreement, adjective gender and number, and determiner chains — error patterns your brain actually remembers.',
    icon: Users,
    status: 'coming_soon',
    accent: 'from-slate-50 to-sky-50/50 border-slate-200',
    scienceNote: 'Targeted feedback on agreement errors reduces fossilization more than broad grammar review alone.',
  },
  {
    id: 'syntax-shuffle',
    title: 'Syntax Shuffle',
    shortTitle: 'Syntax Shuffle',
    description:
      'Word order, clitic placement, and subordinate clauses — build mental models of French sentence architecture.',
    icon: Shuffle,
    status: 'coming_soon',
    accent: 'from-slate-50 to-emerald-50/50 border-slate-200',
    scienceNote: 'Constructing sentences from constituents supports syntactic parsing in comprehension tasks.',
  },
  {
    id: 'mood-lab',
    title: 'Mood & Mode Lab',
    shortTitle: 'Mood Lab',
    description:
      'Indicative, subjunctive, and conditional in minimal pairs — learn triggers, not tables.',
    icon: Layers,
    status: 'in_development',
    accent: 'from-slate-50 to-amber-50/40 border-slate-200',
    scienceNote: 'Contrastive minimal pairs accelerate acquisition of abstract mood contrasts.',
  },
  {
    id: 'particle-path',
    title: 'Particle Path',
    shortTitle: 'Particle Path',
    description:
      'Pronouns, negation, and fixed expressions — high-frequency chunks for fluent speech.',
    icon: Puzzle,
    status: 'coming_soon',
    accent: 'from-slate-50 to-rose-50/40 border-slate-200',
    scienceNote: 'Chunk-based practice improves fluency by reducing working-memory load during production.',
  },
]

/** Mock hub stats — replace with persisted analytics when backend exists */
const MOCK_PROGRESS = {
  streakDays: 7,
  retentionPercent: 84,
  verbsMastered: 42,
  sessionsThisWeek: 5,
  lastPlayedLabel: 'Conjugation Codex · 2 days ago',
} as const

function StatusBadge({ status }: { status: GameStatus }) {
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
        <CheckCircle2 className="h-3 w-3" aria-hidden />
        Available
      </span>
    )
  }
  if (status === 'in_development') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
        <Wand2 className="h-3 w-3" aria-hidden />
        In development
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
      Coming soon
    </span>
  )
}

export default function GrammarGamesHubPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-10">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white px-6 py-10 shadow-sm md:px-10 md:py-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-100/50 blur-3xl"
          aria-hidden
        />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--atelier-navy-deep)]">
          The Atelier · Practice lab
        </p>
        <h1 className="font-display relative mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-[var(--atelier-navy-deep)] md:text-4xl lg:text-[2.5rem]">
          Grammar Games — Master French Grammar the Smart Way
        </h1>
        <p className="relative mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
          Short, focused activities that respect how memory works: retrieval practice, immediate correction, and spaced
          revisiting — not endless multiple-choice drills.
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link
            to="/game/conjugation-codex"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001438]"
          >
            Start Conjugation Codex
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="#activities"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[var(--atelier-navy-deep)] transition hover:bg-slate-50"
          >
            Browse all activities
          </a>
        </div>
      </header>

      {/* Learning science */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <Brain className="h-7 w-7" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">
              Why Grammar Games work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              Research on second-language acquisition and cognitive psychology consistently shows that{' '}
              <strong className="font-semibold text-slate-800">active retrieval</strong> beats passive re-reading, that{' '}
              <strong className="font-semibold text-slate-800">timely, specific feedback</strong> corrects misconceptions
              before they stick, and that{' '}
              <strong className="font-semibold text-slate-800">spacing and interleaving</strong> produce more durable
              knowledge than massed cramming. Grammar Games turn those principles into repeatable, low-friction sessions
              you can fit between lessons — serious learning, without the arcade noise.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              <li className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <Target className="h-5 w-5 text-[var(--fl-blue)]" aria-hidden />
                <p className="mt-2 text-sm font-bold text-[var(--atelier-navy-deep)]">Retrieval practice</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  You produce forms and structures — the same skill exams measure.
                </p>
              </li>
              <li className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <LineChart className="h-5 w-5 text-[var(--fl-blue)]" aria-hidden />
                <p className="mt-2 text-sm font-bold text-[var(--atelier-navy-deep)]">Clear progress</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Streaks and mastery counts reward consistency, not luck on one quiz.
                </p>
              </li>
              <li className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <Sparkles className="h-5 w-5 text-[var(--fl-blue)]" aria-hidden />
                <p className="mt-2 text-sm font-bold text-[var(--atelier-navy-deep)]">Aligned with your path</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Complements syllabus units and TEF prep — same register, tighter loops.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Progress summary (mock) */}
      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/40 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-800/80">Your grammar lab</p>
            <h2 className="font-display mt-1 text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">
              Progress summary
            </h2>
            <p className="mt-1 text-xs text-slate-600">Sample data — full analytics will sync with your account later.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Flame className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wide">Streak</span>
            </div>
            <p className="font-display mt-2 text-3xl font-bold text-[var(--atelier-navy-deep)]">{MOCK_PROGRESS.streakDays}</p>
            <p className="text-xs text-slate-600">days in a row with practice</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <LineChart className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wide">Retention</span>
            </div>
            <p className="font-display mt-2 text-3xl font-bold text-[var(--atelier-navy-deep)]">
              {MOCK_PROGRESS.retentionPercent}%
            </p>
            <p className="text-xs text-slate-600">forms recalled after 7 days (mock)</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wide">Verbs mastered</span>
            </div>
            <p className="font-display mt-2 text-3xl font-bold text-[var(--atelier-navy-deep)]">
              {MOCK_PROGRESS.verbsMastered}
            </p>
            <p className="text-xs text-slate-600">high-confidence lemmas in rotation</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wide">This week</span>
            </div>
            <p className="font-display mt-2 text-3xl font-bold text-[var(--atelier-navy-deep)]">
              {MOCK_PROGRESS.sessionsThisWeek}
            </p>
            <p className="text-xs text-slate-600">{MOCK_PROGRESS.lastPlayedLabel}</p>
          </div>
        </div>
      </section>

      {/* Activity cards */}
      <section id="activities" className="scroll-mt-8">
        <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">All activities</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Each game targets a slice of grammar. Launch what&apos;s available; we&apos;ll notify you as new labs go live.
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {GAMES.map((game) => {
            const Icon = game.icon
            const isLaunchable = game.status === 'available' && game.href

            return (
              <li
                key={game.id}
                className={[
                  'flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition',
                  game.accent,
                  isLaunchable ? 'hover:shadow-md' : 'opacity-95',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/90 text-[var(--atelier-navy-deep)] shadow-sm ring-1 ring-slate-100">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <StatusBadge status={game.status} />
                </div>
                <h3 className="font-display mt-5 text-lg font-bold text-[var(--atelier-navy-deep)]">{game.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{game.description}</p>
                <p className="mt-4 border-t border-slate-200/80 pt-4 text-xs italic leading-relaxed text-slate-500">
                  {game.scienceNote}
                </p>
                <div className="mt-5">
                  {isLaunchable ? (
                    <Link
                      to={game.href!}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--atelier-navy-deep)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001438] sm:w-auto"
                    >
                      Open {game.shortTitle}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400 sm:w-auto"
                    >
                      {game.status === 'in_development' ? 'Preview not yet available' : 'Join waitlist (soon)'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
