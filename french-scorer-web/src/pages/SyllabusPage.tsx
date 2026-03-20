import { ArrowRight, BookOpen, CheckCircle2, Compass, Layers, Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CURRICULUM_MODULES, CURRICULUM_STATS } from '../lib/curriculum'
import { getSyllabusData, LEVEL_ORDER, type CEFRLevel } from '../lib/syllabus'

const ATELIER_LEVELS: {
  code: string
  subtitle: string
  bullets: string[]
  featured?: boolean
  locked?: boolean
  Icon: typeof Layers
}[] = [
  {
    code: 'A1',
    subtitle: 'Discovery',
    bullets: ['Basic pronunciation & phonetics', 'Greetings & introductions', 'Numbers, days, and time'],
    Icon: Sparkles,
  },
  {
    code: 'A2',
    subtitle: 'Navigation',
    bullets: ['Past events & routines', 'Directions & travel', 'Everyday stories'],
    Icon: Compass,
  },
  {
    code: 'B1',
    subtitle: 'Independence',
    bullets: ['Subjunctive mood in context', 'Debating & argumentation', 'Conditional scenarios'],
    featured: true,
    Icon: BookOpen,
  },
  {
    code: 'B2',
    subtitle: 'Fluency',
    bullets: ['Abstract topics & nuance', 'Formal registers', 'Long-form listening'],
    Icon: Layers,
  },
  {
    code: 'C1',
    subtitle: 'Precision',
    bullets: ['Academic & professional French', 'Implicit meaning', 'Synthesis tasks'],
    Icon: Layers,
  },
  {
    code: 'C2',
    subtitle: 'Mastery',
    bullets: ['Near-native expression', 'Stylistic control', 'Specialized domains'],
    locked: true,
    Icon: Lock,
  },
]

function levelProgress(code: string, rows: ReturnType<typeof getSyllabusData>) {
  if (code === 'C2') return { done: 0, total: 1, percent: 0 }
  const levelRows = rows.filter((r) => r.level === code)
  if (levelRows.length === 0) return { done: 0, total: 0, percent: 0 }
  const done = levelRows.filter((r) => r.status === 'completed').length
  const total = levelRows.length
  return { done, total, percent: Math.round((done / total) * 100) }
}

export default function SyllabusPage() {
  const navigate = useNavigate()
  const [pathLevel, setPathLevel] = useState<CEFRLevel>('A1')
  const [toast, setToast] = useState<string | null>(null)
  const syllabusRows = useMemo(() => getSyllabusData(), [])

  const pathRows = useMemo(() => syllabusRows.filter((r) => r.level === pathLevel), [syllabusRows, pathLevel])

  const b1Resume = useMemo(() => {
    const b1 = syllabusRows.filter((r) => r.level === 'B1')
    const next = b1.find((r) => r.status === 'available')
    return next?.id ?? b1[0]?.id
  }, [syllabusRows])

  const onUnitClick = (unitId: string, status: 'locked' | 'available' | 'completed') => {
    if (status === 'locked') {
      setToast('Complete the previous unit to unlock!')
      window.setTimeout(() => setToast(null), 1800)
      return
    }
    navigate(`/lesson/${unitId}`)
  }

  return (
    <div className="space-y-12 pb-8">
      <header className="max-w-3xl">
        <span className="inline-flex rounded-full bg-[var(--atelier-pink-pill)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--atelier-pink-text)]">
          Curriculum hub
        </span>
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-[var(--atelier-navy-deep)] md:text-4xl lg:text-[2.5rem]">
          Syllabus Atelier
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Your academic path from A1 through C2 — structured modules, lesson-by-lesson progression, and exam-aligned TEF prep.
          Progress is saved in this browser until you sync with an account.
        </p>
      </header>

      <section>
        <div className="grid gap-5 sm:grid-cols-2">
          {ATELIER_LEVELS.map((lvl) => {
            const { done, total, percent } = levelProgress(lvl.code, syllabusRows)
            const Icon = lvl.Icon
            const isLocked = lvl.locked
            const isFeatured = lvl.featured

            if (isLocked) {
              return (
                <div
                  key={lvl.code}
                  className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-slate-100/50 p-6 opacity-60"
                >
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[1px]">
                    <Lock className="h-14 w-14 text-slate-400" strokeWidth={1.25} />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-800">{lvl.code}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{lvl.subtitle}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {lvl.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-slate-300">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }

            if (isFeatured) {
              return (
                <div
                  key={lvl.code}
                  className="flex flex-col rounded-2xl border border-sky-900/20 bg-[var(--atelier-navy-deep)] p-6 text-white shadow-lg shadow-slate-900/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-3xl font-bold">{lvl.code}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">{lvl.subtitle}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-5 w-5 text-sky-200" />
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/85">
                    {lvl.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-sky-300">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
                      <span>Course load</span>
                      <span>{total ? `${percent}% complete` : '—'}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  {b1Resume ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/lesson/${b1Resume}`)}
                      className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-bold text-[var(--atelier-navy-deep)] shadow-md transition hover:bg-sky-50"
                    >
                      Resume lesson
                    </button>
                  ) : null}
                </div>
              )
            }

            return (
              <div
                key={lvl.code}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-sky-200/60 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">{lvl.code}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{lvl.subtitle}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {lvl.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-slate-300">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[var(--fl-blue)] transition-all"
                      style={{ width: `${total ? percent : 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {total ? `${done} / ${total} lessons · ${percent}%` : 'Open sequential path below'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Exam CTA */}
      <section className="grid gap-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/80 p-8 md:grid-cols-2 md:items-center lg:p-10">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">Prêt pour l’examen ?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Our integrated TEF Prep track mirrors high-stakes tasks — skill rooms for reading, writing, listening, and speaking,
            with AI-assisted writing feedback when you want a benchmark.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/tef-prep"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#001438]"
            >
              Start assessment
            </Link>
            <Link
              to="/tef-prep"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400"
            >
              View exam guide
            </Link>
          </div>
        </div>
        <div className="relative flex min-h-[180px] items-center justify-center rounded-2xl bg-[var(--atelier-teal)]/15 p-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-600/20 to-slate-800/10" />
          <div className="relative rounded-xl border border-[#7f1d1d]/30 bg-[#450a0a] px-5 py-4 text-center shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">Atelier outcomes</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">98%</p>
            <p className="text-[10px] font-medium leading-snug text-white/75">success rate for structured-track students (illustrative)</p>
          </div>
        </div>
      </section>

      {/* Module library */}
      <section>
        <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">Module library</h2>
        <p className="mt-1 text-sm text-slate-600">
          {CURRICULUM_STATS.moduleCount} modules · {CURRICULUM_STATS.lessonCount} lessons — full curriculum detail.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CURRICULUM_MODULES.map((m) => (
            <article
              key={m.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200/70 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{m.levelBadge}</span>
              <h3 className="font-display mt-3 text-lg font-bold text-slate-900">{m.frenchTitle}</h3>
              <p className="text-sm font-medium text-slate-500">{m.englishTitle}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{m.description}</p>
              <Link
                to={`/unit/${m.id}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--fl-blue)] hover:underline"
              >
                View unit <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Sequential path */}
      <section id="lesson-path" className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--fl-blue)]">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">Sequential path</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--atelier-navy-deep)]">Lesson-by-lesson</h2>
            <p className="text-sm text-slate-500">Unlock order is enforced — complete each unit to open the next.</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {LEVEL_ORDER.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setPathLevel(l)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                pathLevel === l
                  ? 'bg-[var(--atelier-navy-deep)] text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {pathRows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
              No published units for this level yet.
            </p>
          ) : (
            pathRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onUnitClick(row.id, row.status)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border p-4 text-left transition',
                  row.status === 'available'
                    ? 'border-sky-300 bg-sky-50/80 hover:bg-sky-50'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50',
                  row.status === 'locked' ? 'cursor-not-allowed opacity-50' : '',
                ].join(' ')}
              >
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {row.level} · Unit {row.orderIndex}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{row.title}</div>
                </div>

                {row.status === 'completed' ? (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-emerald-700">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-semibold">Completed</span>
                  </div>
                ) : row.status === 'available' ? (
                  <div className="rounded-xl bg-[var(--atelier-navy-deep)] px-3 py-2 text-xs font-semibold text-white">Start</div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-3 py-2 text-slate-600">
                    <Lock size={16} />
                    <span className="text-xs font-semibold">Locked</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[var(--atelier-navy-deep)] px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
