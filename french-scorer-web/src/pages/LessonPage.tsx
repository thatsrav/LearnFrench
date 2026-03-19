import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUnitById, unlockNextUnit } from '../lib/syllabus'

export default function LessonPage() {
  const { unitId = '' } = useParams()
  const navigate = useNavigate()
  const unit = getUnitById(unitId)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [done, setDone] = useState<{ score: number; unlocked: string | null } | null>(null)

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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Lesson not found</h2>
        <button
          onClick={() => navigate('/syllabus')}
          className="mt-4 rounded-xl bg-[#2955B8] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to syllabus
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
    setDone({ score, unlocked: result.unlockedUnitId })
  }

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[#2955B8]">
            {unit.level} - Unit {unit.orderIndex}
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{unit.title}</h2>
        </div>
        <button
          onClick={() => navigate('/syllabus')}
          className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          Back
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Grammar Rule</h3>
        <p className="mt-2 text-sm text-slate-700">{unit.grammarRuleText}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Vocabulary</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {unit.vocabList.map((w) => (
            <span key={w} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {unit.quiz.map((q, qIdx) => (
          <div key={`${unit.id}-${qIdx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{qIdx + 1}. {q.question}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oIdx) => {
                const selected = answers[qIdx] === oIdx
                return (
                  <button
                    key={`${unit.id}-${qIdx}-${oIdx}`}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                    className={[
                      'w-full rounded-xl border px-3 py-2 text-left text-sm',
                      selected
                        ? 'border-[#2955B8] bg-blue-50 text-[#2955B8]'
                        : 'border-slate-200 bg-white text-slate-700',
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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Current score</span>
          <span className="text-sm font-bold text-slate-900">{score}/100</span>
        </div>
        <button
          onClick={submit}
          className="w-full rounded-xl bg-[#2955B8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#244a9e]"
        >
          Submit lesson
        </button>
      </div>

      {done && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {done.score >= 80 ? (
            <>
              Great job! You scored {done.score}.
              {done.unlocked ? ` Next unit unlocked: ${done.unlocked}.` : ' No next unit to unlock.'}
            </>
          ) : (
            <>You scored {done.score}. Reach 80+ to unlock the next unit.</>
          )}
        </div>
      )}
    </section>
  )
}

