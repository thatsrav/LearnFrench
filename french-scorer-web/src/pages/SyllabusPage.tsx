import { ArrowRight, BookOpen, CheckCircle2, Flag, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CURRICULUM_MODULES, CURRICULUM_STATS } from '../lib/curriculum'
import { getSyllabusData, LEVEL_ORDER, type CEFRLevel } from '../lib/syllabus'

const accent = 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
const accentSoft = 'border-[#2563eb] bg-blue-50 text-[#2563eb]'

export default function SyllabusPage() {
  const navigate = useNavigate()
  const [level, setLevel] = useState<CEFRLevel>('A1')
  const [toast, setToast] = useState<string | null>(null)

  const rows = useMemo(() => getSyllabusData().filter((r) => r.level === level), [level])

  const onUnitClick = (unitId: string, status: 'locked' | 'available' | 'completed') => {
    if (status === 'locked') {
      setToast('Complete the previous unit to unlock!')
      window.setTimeout(() => setToast(null), 1800)
      return
    }
    navigate(`/lesson/${unitId}`)
  }

  return (
    <div className="space-y-10 pb-4">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4f46e5]">Core curriculum</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Study units</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Browse modules (lessons + topics), or use the lesson-by-lesson path below — progress is saved in your browser.
          Pair with{' '}
          <Link to="/tef-prep" className="font-semibold text-red-700 underline-offset-2 hover:underline">
            TEF Prep
          </Link>{' '}
          for exam-style rooms.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-slate-900">Modules · {CURRICULUM_STATS.moduleCount} units</h2>
        <p className="mt-1 text-sm text-slate-600">
          {CURRICULUM_STATS.lessonCount} lessons — open a module to see every lesson and your completion status.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {CURRICULUM_MODULES.map((m) => (
            <article
              key={m.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4f46e5]/40 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {m.levelBadge}
              </span>
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
      </section>

      <Link
        to="/tef-prep"
        className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-sm transition hover:border-red-300 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-900">TEF Canada prep</p>
            <p className="text-sm text-red-800/90">Exam-style reading, writing, listening, and speaking rooms.</p>
          </div>
        </div>
        <span className="text-sm font-bold text-red-800">Open TEF hub →</span>
      </Link>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#4f46e5]">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">Sequential path</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Lesson-by-lesson</h2>
            <p className="text-sm text-slate-500">Pick your CEFR band and continue where you left off.</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {LEVEL_ORDER.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                level === l ? `${accent} shadow-sm` : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
              No published units for this level yet.
            </p>
          ) : (
            rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onUnitClick(row.id, row.status)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border p-4 text-left transition',
                  row.status === 'available'
                    ? `${accentSoft} hover:bg-blue-100/80`
                    : 'border-slate-200 bg-white hover:bg-slate-50',
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
                  <div className="rounded-xl bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white">Start</div>
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
        <div className="fixed bottom-6 right-6 z-30 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
