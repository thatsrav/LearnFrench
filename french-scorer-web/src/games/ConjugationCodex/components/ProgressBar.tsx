import type { CodexPhase } from '../conjugationCodexStore'

const STEPS: { phase: CodexPhase; label: string }[] = [
  { phase: 'discovery', label: '1 · Discovery' },
  { phase: 'rule_master', label: '2 · Rule Master' },
  { phase: 'masters_guild', label: "3 · Master's Guild" },
]

type ProgressBarProps = {
  currentPhase: CodexPhase
  className?: string
}

export function ProgressBar({ currentPhase, className = '' }: ProgressBarProps) {
  const idx = STEPS.findIndex((s) => s.phase === currentPhase)
  const active = idx >= 0 ? idx : 0

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const done = i < active
          const current = i === active
          return (
            <div key={step.phase} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={[
                      'truncate text-[10px] font-bold uppercase tracking-wide sm:text-xs',
                      current ? 'text-indigo-700' : done ? 'text-emerald-700' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={[
                      'h-full rounded-full transition-all duration-500',
                      done || current ? 'bg-indigo-600' : 'bg-transparent',
                      current ? 'w-full' : done ? 'w-full' : 'w-0',
                    ].join(' ')}
                  />
                </div>
              </div>
              {i < STEPS.length - 1 ? (
                <div
                  className={['hidden h-0.5 w-4 shrink-0 sm:block', done ? 'bg-emerald-400' : 'bg-slate-200'].join(
                    ' ',
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
