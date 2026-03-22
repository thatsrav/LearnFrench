import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  FillBlankExercise,
  MatchPairsExercise,
  McqExercise,
  PracticeExercise,
  RichLessonUnit,
  WordOrderExercise,
} from '../../lib/richLessonTypes'
import type { UnitLesson } from '../../lib/syllabus'

function shuffleIndices(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function McqBlock({
  ex,
  onCorrect,
}: {
  ex: McqExercise
  onCorrect: () => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const ok = picked === ex.answer_index
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-900">{ex.question}</p>
      <div className="space-y-2">
        {ex.options.map((opt, i) => {
          const sel = picked === i
          const wrong = picked !== null && sel && !ok
          return (
            <button
              key={i}
              type="button"
              disabled={ok}
              onClick={() => {
                if (ok) return
                setPicked(i)
                if (i === ex.answer_index) onCorrect()
              }}
              className={[
                'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                sel && ok ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : '',
                wrong ? 'border-red-300 bg-red-50' : '',
                !sel || (sel && !ok && !wrong) ? 'border-slate-200 bg-white hover:border-slate-300' : '',
                ok && !sel ? 'opacity-50' : '',
              ].join(' ')}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {ok && ex.explanation ? <p className="text-xs text-slate-600">{ex.explanation}</p> : null}
    </div>
  )
}

function FillBlankBlock({
  ex,
  onCorrect,
}: {
  ex: FillBlankExercise
  onCorrect: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const ok = picked === ex.answer
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-900">{ex.sentence}</p>
      {ex.hint ? <p className="text-xs text-slate-500">{ex.hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {ex.options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={ok}
            onClick={() => {
              if (ok) return
              setPicked(opt)
              if (opt === ex.answer) onCorrect()
            }}
            className={[
              'rounded-full border px-4 py-2 text-sm font-semibold',
              picked === opt && ok ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white',
              ok && opt !== picked ? 'opacity-40' : '',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function MatchPairsBlock({
  ex,
  onCorrect,
}: {
  ex: MatchPairsExercise
  onCorrect: () => void
}) {
  const rightOrder = useMemo(() => shuffleIndices(ex.pairs.length), [ex.pairs])
  const [matches, setMatches] = useState<Record<number, number>>({})
  const [pickL, setPickL] = useState<number | null>(null)

  const tryPair = (li: number, ri: number) => {
    const trueR = ex.pairs[li]?.right
    const shownR = ex.pairs[rightOrder[ri]!]?.right
    if (trueR === shownR) {
      setMatches((m) => {
        const next = { ...m, [li]: ri }
        if (Object.keys(next).length === ex.pairs.length) queueMicrotask(() => onCorrect())
        return next
      })
    }
    setPickL(null)
  }

  const doneCount = Object.keys(matches).length
  const allDone = doneCount === ex.pairs.length

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-800">{ex.instruction}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-slate-400">French</p>
          {ex.pairs.map((p, li) => {
            const matched = li in matches
            return (
              <button
                key={li}
                type="button"
                disabled={matched || allDone}
                onClick={() => (pickL === li ? setPickL(null) : setPickL(li))}
                className={[
                  'w-full rounded-xl border px-3 py-2 text-left text-sm',
                  matched ? 'border-emerald-200 bg-emerald-50 text-slate-600' : '',
                  pickL === li ? 'border-[var(--atelier-navy-deep)] ring-2 ring-sky-200' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                {p.left}
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-slate-400">English</p>
          {rightOrder.map((origIdx, ri) => {
            const used = Object.entries(matches).some(([, v]) => v === ri)
            const label = ex.pairs[origIdx]!.right
            return (
              <button
                key={ri}
                type="button"
                disabled={used || allDone}
                onClick={() => {
                  if (pickL !== null) tryPair(pickL, ri)
                }}
                className={[
                  'w-full rounded-xl border px-3 py-2 text-left text-sm',
                  used ? 'border-emerald-200 bg-emerald-50 text-slate-500 line-through' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-slate-500">Tap a French item, then its English match.</p>
    </div>
  )
}

function WordOrderBlock({
  ex,
  onCorrect,
}: {
  ex: WordOrderExercise
  onCorrect: () => void
}) {
  const [bank, setBank] = useState(() => shuffleIndices(ex.words.length))
  const [tray, setTray] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const moveToTray = (bankPos: number) => {
    const wi = bank[bankPos]
    if (wi === undefined) return
    setBank((b) => b.filter((_, i) => i !== bankPos))
    setTray((t) => [...t, wi])
  }

  const moveToBank = (trayPos: number) => {
    const wi = tray[trayPos]
    if (wi === undefined) return
    setTray((t) => t.filter((_, i) => i !== trayPos))
    setBank((b) => [...b, wi])
  }

  const check = () => {
    if (done) return
    if (tray.length !== ex.correct_order.length) return
    const ok = tray.every((v, i) => v === ex.correct_order[i])
    if (ok) {
      setDone(true)
      onCorrect()
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Build the sentence (tap words in order).</p>
      <div className="min-h-[48px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        <div className="flex flex-wrap gap-2">
          {tray.map((wi, ti) => (
            <button
              key={`${wi}-${ti}`}
              type="button"
              onClick={() => moveToBank(ti)}
              className="rounded-lg bg-white px-2 py-1 text-sm shadow-sm ring-1 ring-slate-200"
            >
              {ex.words[wi]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((wi, bi) => (
          <button
            key={`b-${wi}-${bi}`}
            type="button"
            onClick={() => moveToTray(bi)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
          >
            {ex.words[wi]}
          </button>
        ))}
      </div>
      <p className="text-xs italic text-slate-500">{ex.translation}</p>
      <button
        type="button"
        disabled={done}
        onClick={check}
        className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        Check order
      </button>
    </div>
  )
}

function PracticeExerciseView({
  ex,
  onSolved,
}: {
  ex: PracticeExercise
  onSolved: () => void
}) {
  const mark = useCallback(() => {
    onSolved()
  }, [onSolved])

  if (ex.type === 'mcq') return <McqBlock ex={ex} onCorrect={mark} />
  if (ex.type === 'fill_blank') return <FillBlankBlock ex={ex} onCorrect={mark} />
  if (ex.type === 'match_pairs') return <MatchPairsBlock ex={ex} onCorrect={mark} />
  if (ex.type === 'word_order') return <WordOrderBlock ex={ex} onCorrect={mark} />

  return null
}

export type RichLessonFlowProps = {
  unit: UnitLesson
  rich: RichLessonUnit
  onBack: () => void
  onComplete: (scorePercent: number) => void
}

export default function RichLessonFlow({ unit, rich, onBack, onComplete }: RichLessonFlowProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [exIdx, setExIdx] = useState(0)
  const [prodPhase, setProdPhase] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const solvedThisExercise = useRef(false)

  const practiceTotals = useMemo(() => {
    let t = 0
    for (const s of rich.steps) {
      if (s.type === 'practice') t += s.exercises.length
    }
    return t
  }, [rich.steps])

  const step = rich.steps[stepIdx]
  const pastSteps = stepIdx >= rich.steps.length
  const showProductionGate = pastSteps && Boolean(rich.production_task) && !prodPhase
  const showSummaryCard = pastSteps && (!rich.production_task || prodPhase)

  useEffect(() => {
    solvedThisExercise.current = false
  }, [stepIdx, exIdx])

  const advanceAfterPractice = () => {
    if (!step || step.type !== 'practice') return
    if (exIdx < step.exercises.length - 1) {
      setExIdx(exIdx + 1)
    } else {
      setExIdx(0)
      setStepIdx(stepIdx + 1)
    }
  }

  const handleExerciseSolved = () => {
    if (solvedThisExercise.current) return
    solvedThisExercise.current = true
    setCorrectCount((c) => c + 1)
    advanceAfterPractice()
  }

  if (showSummaryCard) {
    const score =
      practiceTotals === 0 ? 100 : Math.round((correctCount / practiceTotals) * 100)
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">Lesson complete</h2>
        <p className="mt-2 text-sm text-slate-600">
          Practice score: <span className="font-bold">{score}%</span> ({correctCount}/{practiceTotals} exercises)
        </p>
        <p className="mt-1 text-xs text-slate-500">Score 80%+ unlocks the next unit in your path.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onComplete(score)}
            className="rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-3 text-sm font-bold text-white"
          >
            Save progress & unlock →
          </button>
          <button type="button" onClick={onBack} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold">
            Back
          </button>
        </div>
      </section>
    )
  }

  if (showProductionGate && rich.production_task) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Production</p>
        <h2 className="font-display mt-2 text-lg font-bold text-[var(--atelier-navy-deep)]">Writing</h2>
        <p className="mt-3 text-sm text-slate-800">{rich.production_task.prompt}</p>
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-semibold">Example:</span> {rich.production_task.example}
        </p>
        <textarea
          className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
          rows={4}
          placeholder="Write here (optional — not graded)"
        />
        <button
          type="button"
          onClick={() => setProdPhase(true)}
          className="mt-4 rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-3 text-sm font-bold text-white"
        >
          Continue to results
        </button>
      </section>
    )
  }

  if (!step) return null

  if (step.type === 'vocab_intro') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <nav className="mb-4 text-xs text-slate-500">
          <span className="text-[var(--atelier-navy-deep)]">Syllabus</span> / {unit.level} / {rich.theme ?? unit.title}
        </nav>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vocabulary</p>
        <h1 className="font-display mt-2 text-2xl font-bold text-[var(--atelier-navy-deep)]">{unit.title}</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {step.cards.map((c, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="font-semibold text-slate-900">{c.word}</p>
              <p className="text-sm text-indigo-700">{c.translation}</p>
              <p className="mt-2 text-sm text-slate-800">{c.example}</p>
              <p className="text-xs text-slate-500">{c.example_translation}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <button type="button" onClick={() => (stepIdx === 0 ? onBack() : setStepIdx(stepIdx - 1))} className="text-sm font-semibold text-slate-600">
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(stepIdx + 1)}
            className="rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Next →
          </button>
        </div>
      </section>
    )
  }

  if (step.type === 'dialogue') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dialogue</p>
        <p className="mt-1 text-sm italic text-slate-600">{step.scene}</p>
        <div className="mt-4 space-y-3">
          {step.turns.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-bold text-indigo-700">{t.speaker}</p>
              <p className="mt-1 text-sm text-slate-900">{t.text}</p>
              <p className="mt-1 text-xs text-slate-500">{t.translation}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <button type="button" onClick={() => setStepIdx(stepIdx - 1)} className="text-sm font-semibold text-slate-600">
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(stepIdx + 1)}
            className="rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Next →
          </button>
        </div>
      </section>
    )
  }

  if (step.type === 'grammar_tip') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grammar</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">{step.rule}</p>
        {step.examples.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {step.examples.map((e, i) => (
              <li key={i} className="rounded-lg bg-sky-50/80 p-3 text-sm">
                <span className="font-medium text-slate-900">{e.fr}</span>
                <span className="mt-1 block text-xs text-slate-600">{e.en}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex justify-between">
          <button type="button" onClick={() => setStepIdx(stepIdx - 1)} className="text-sm font-semibold text-slate-600">
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(stepIdx + 1)}
            className="rounded-xl bg-[var(--atelier-navy-deep)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Next →
          </button>
        </div>
      </section>
    )
  }

  if (step.type === 'practice') {
    const ex = step.exercises[exIdx]
    if (!ex) return null
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Practice</p>
        <p className="mt-1 text-xs text-slate-500">
          Exercise {exIdx + 1} of {step.exercises.length} · {practiceTotals} total
        </p>
        <div className="mt-6">
          <PracticeExerciseView key={`${stepIdx}-${exIdx}`} ex={ex} onSolved={handleExerciseSolved} />
        </div>
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => {
              if (exIdx > 0) setExIdx(exIdx - 1)
              else if (stepIdx > 0) {
                setStepIdx(stepIdx - 1)
                const prev = rich.steps[stepIdx - 1]
                if (prev?.type === 'practice') setExIdx(prev.exercises.length - 1)
              }
            }}
            className="text-sm font-semibold text-slate-600"
          >
            ← Back
          </button>
        </div>
      </section>
    )
  }

  return null
}
