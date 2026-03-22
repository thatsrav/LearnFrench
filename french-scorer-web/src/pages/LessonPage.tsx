import { Check, Lightbulb, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import RichLessonFlow from '../components/lesson/RichLessonFlow'
import { useAuth } from '../contexts/AuthContext'
import { uploadWebUnitProgress } from '../lib/cloudProgressWeb'
import { getRichA1Lesson } from '../lib/richLessonLoader'
import { supabase } from '../lib/supabase'
import { getSyllabusData, getUnitById, unlockNextUnit } from '../lib/syllabus'

export default function LessonPage() {
  const { user } = useAuth()
  const { unitId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get('module')
  const navigate = useNavigate()
  const unit = getUnitById(unitId)
  const rich = unit ? getRichA1Lesson(unit.id) : null

  const [progressTick, setProgressTick] = useState(0)
  const bumpProgress = () => setProgressTick((t) => t + 1)

  const syllabusRows = useMemo(() => getSyllabusData(), [unitId, progressTick])
  const levelRows = useMemo(() => {
    if (!unit) return []
    return syllabusRows.filter((r) => r.level === unit.level).sort((a, b) => a.orderIndex - b.orderIndex)
  }, [syllabusRows, unit])

  const levelProgress = useMemo(() => {
    if (!levelRows.length) return 0
    const done = levelRows.filter((r) => r.status === 'completed').length
    return Math.round((done / levelRows.length) * 100)
  }, [levelRows])

  const goBack = () => {
    if (moduleId) navigate(`/unit/${moduleId}`)
    else navigate('/syllabus')
  }

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [done, setDone] = useState<{ score: number; unlocked: string | null } | null>(null)
  const [richDone, setRichDone] = useState<{ score: number; unlocked: string | null } | null>(null)

  const score = useMemo(() => {
    if (!unit) return 0
    const total = unit.quiz.length
    if (!total) return 0
    let correct = 0
    unit.quiz.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) correct += 1
    })
    return Math.round((correct / total) * 100)
  }, [unit, answers])

  if (!unit) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">Lesson not found</h2>
        <button
          type="button"
          onClick={goBack}
          className="mt-4 rounded-xl bg-[var(--atelier-navy-deep)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#001438]"
        >
          Back
        </button>
      </section>
    )
  }

  const submit = () => {
    if (Object.keys(answers).length < unit.quiz.length) {
      alert('Please answer all questions first.')
      return
    }
    const result = unlockNextUnit(unit.id, score)
    if (supabase && user) {
      void uploadWebUnitProgress(supabase, user.id).catch(() => {})
    }
    setDone({ score, unlocked: result.unlockedUnitId })
    bumpProgress()
  }

  const handleRichComplete = (scorePercent: number) => {
    const result = unlockNextUnit(unit.id, scorePercent)
    if (supabase && user) {
      void uploadWebUnitProgress(supabase, user.id).catch(() => {})
    }
    setRichDone({ score: scorePercent, unlocked: result.unlockedUnitId })
    bumpProgress()
  }

  return (
    <div className="space-y-6">
      <nav className="text-xs font-medium text-slate-500">
        <span className="text-[var(--atelier-navy-deep)]">Syllabus</span>
        <span className="mx-2 text-slate-300">/</span>
        <span>{unit.level}</span>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-800">Lesson {unit.orderIndex}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {rich ? (
            <div className="space-y-6">
              <RichLessonFlow unit={unit} rich={rich} onBack={goBack} onComplete={handleRichComplete} />
              {richDone ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  {richDone.score >= 80 ? (
                    <>
                      Saved — you scored {richDone.score}%.
                      {richDone.unlocked ? ` Next unit unlocked.` : ''}
                    </>
                  ) : (
                    <>Score {richDone.score}. Reach 80+ to unlock the next unit.</>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--atelier-navy-deep)]">
                    Lesson overview
                  </p>
                  <h1 className="font-display mt-2 text-2xl font-bold text-[var(--atelier-navy-deep)] md:text-3xl">
                    {unit.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    {unit.level} · Unit {unit.orderIndex} — work through grammar, vocabulary, then submit the atelier quiz (80%+ unlocks
                    the next unit).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grammar</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">{unit.grammarRuleText}</p>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Core vocabulary</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {unit.vocabList.map((w) => (
                    <span
                      key={w}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {unit.quiz.map((q, qIdx) => (
                  <div key={`${unit.id}-${qIdx}`} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <p className="text-sm font-bold text-slate-900">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const selected = answers[qIdx] === oIdx
                        return (
                          <button
                            key={`${unit.id}-${qIdx}-${oIdx}`}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                            className={[
                              'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                              selected
                                ? 'border-[var(--atelier-navy-deep)] bg-sky-50 text-[var(--atelier-navy-deep)]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                            ].join(' ')}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-violet-200/80 bg-violet-50/40 p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-800">Ready for the Atelier?</p>
                <p className="mt-2 font-display text-lg font-bold text-[var(--atelier-navy-deep)]">Quiz session</p>
                <p className="mt-1 text-sm text-slate-600">{unit.quiz.length} questions · 100 points scale</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">Draft score: {score}/100</span>
                  <button
                    type="button"
                    onClick={submit}
                    className="rounded-xl bg-[var(--atelier-navy-deep)] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001438]"
                  >
                    Submit lesson →
                  </button>
                </div>
              </div>

              {done ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  {done.score >= 80 ? (
                    <>
                      Excellent — you scored {done.score}.
                      {done.unlocked ? ` Next unit unlocked.` : ''}
                    </>
                  ) : (
                    <>Score {done.score}. Reach 80+ to unlock the next unit.</>
                  )}
                </div>
              ) : null}
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Level progress</p>
            <p className="mt-2 font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">{levelProgress}%</p>
            <p className="text-xs text-slate-500">{unit.level} track</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[var(--fl-blue)] transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Module contents</p>
            <ul className="space-y-1">
              {levelRows.map((row) => {
                const active = row.id === unit.id
                const q = encodeURIComponent(moduleId ?? '')
                const href = moduleId ? `/lesson/${row.id}?module=${q}` : `/lesson/${row.id}`
                if (row.status === 'locked' && !active) {
                  return (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400"
                    >
                      <Lock className="h-4 w-4 shrink-0" />
                      <span className="truncate">{row.title}</span>
                    </li>
                  )
                }
                if (row.status === 'completed' && !active) {
                  return (
                    <li key={row.id}>
                      <Link
                        to={href}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate">{row.title}</span>
                      </Link>
                    </li>
                  )
                }
                if (active) {
                  return (
                    <li
                      key={row.id}
                      className="rounded-xl bg-[var(--atelier-navy-deep)] px-3 py-3 text-sm font-bold text-white"
                    >
                      {row.title}
                    </li>
                  )
                }
                return (
                  <li key={row.id}>
                    <Link
                      to={href}
                      className="block rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      {row.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/50 p-5">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900">Curator&apos;s note</p>
                <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
                  In France, always greet shopkeepers with <em>bonjour</em> before asking for help — it signals respect and
                  opens the conversation.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
