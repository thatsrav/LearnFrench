import { CheckCircle2, ChevronLeft, Circle, Clock, Lock, PlayCircle } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  countModuleProgress,
  getLessonCardStatuses,
  getModuleById,
  type LessonCardStatus,
} from '../lib/curriculum'
import { getSyllabusData } from '../lib/syllabus'

function statusLabel(s: LessonCardStatus): string {
  if (s === 'in_progress') return 'In Progress'
  return ''
}

export default function UnitOverviewPage() {
  const { moduleId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const mod = getModuleById(moduleId)

  const syllabusRows = useMemo(() => getSyllabusData(), [location.key, location.pathname])

  const { statuses, progress } = useMemo(() => {
    if (!mod) return { statuses: [] as LessonCardStatus[], progress: { done: 0, total: 0, percent: 0 } }
    const statuses = getLessonCardStatuses(mod, syllabusRows)
    const progress = countModuleProgress(mod, syllabusRows)
    return { statuses, progress }
  }, [mod, syllabusRows])

  if (!mod) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-900">Unit not found</p>
        <Link to="/syllabus" className="mt-4 inline-block font-semibold text-[#2563eb] hover:underline">
          Back to study units
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link
        to="/syllabus"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
      >
        <ChevronLeft size={18} />
        Back to All Units
      </Link>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl flex-1">
          <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">{mod.levelBadge}</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {mod.frenchTitle}
            <span className="block text-xl font-semibold text-slate-500 md:text-2xl">— {mod.englishTitle}</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">{mod.description}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 font-medium">
              <span className="text-slate-400">▢</span>
              {mod.lessons.length} Lessons
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              <Clock size={16} className="text-slate-400" />
              {mod.durationWeeks} weeks
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Your Progress</h2>
          <p className="mt-1 text-sm text-slate-500">
            {progress.done} of {progress.total} lessons completed
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[var(--atelier-navy-deep)] transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">{progress.percent}% Complete</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Topics Covered</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {mod.topics.map((t, i) => (
            <span
              key={t}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium',
                i === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700',
              ].join(' ')}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Lessons</h2>
        <div className="mt-4 space-y-3">
          {mod.lessons.map((lesson, idx) => {
            const status = statuses[idx]
            const isActive = status === 'in_progress'
            const isDone = status === 'completed'
            const isSoon = status === 'coming_soon'
            const isLocked = status === 'locked'

            const openLesson = () => {
              if (!lesson.contentUnitId) return
              if (isLocked || isSoon) return
              navigate(`/lesson/${lesson.contentUnitId}?module=${encodeURIComponent(mod.id)}`)
            }

            return (
              <div
                key={lesson.id}
                className={[
                  'flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between',
                  isActive ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200',
                  isLocked || isSoon ? 'opacity-70' : '',
                ].join(' ')}
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={22} />
                      </div>
                    ) : isActive ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-[var(--atelier-navy-deep)]">
                        <PlayCircle size={22} />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Circle size={22} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                      {isActive && (
                        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                          {statusLabel(status)}
                        </span>
                      )}
                      {isSoon && (
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          Soon
                        </span>
                      )}
                    </div>
                    {lesson.subtitle && <p className="text-sm text-slate-500">{lesson.subtitle}</p>}
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={14} />
                      {lesson.durationMin} min
                    </p>
                  </div>
                </div>

                <div className="shrink-0 sm:pl-4">
                  {isDone && lesson.contentUnitId && (
                    <button
                      type="button"
                      onClick={openLesson}
                      className="w-full rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:border-slate-400 sm:w-auto"
                    >
                      Review
                    </button>
                  )}
                  {isActive && lesson.contentUnitId && (
                    <button
                      type="button"
                      onClick={openLesson}
                      className="w-full rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 sm:w-auto"
                    >
                      Start
                    </button>
                  )}
                  {(isLocked || isSoon) && (
                    <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-400">
                      {isLocked && !isSoon && <Lock size={16} />}
                      {isSoon ? 'Coming soon' : 'Locked'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
