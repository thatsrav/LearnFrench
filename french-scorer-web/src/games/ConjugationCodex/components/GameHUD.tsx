import { CheckCircle2, Flame, Sparkles } from 'lucide-react'
import { useConjugationHudStats } from '../hooks/useConjugationState'

type GameHUDProps = {
  className?: string
}

export function GameHUD({ className = '' }: GameHUDProps) {
  const { xp, streakDays, retentionPercent, totalReviews } = useConjugationHudStats()

  return (
    <div
      className={[
        'flex flex-wrap items-stretch gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-[7rem] flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <Sparkles className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">XP</p>
          <p className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">{xp.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex min-w-[7rem] flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <Flame className="h-5 w-5 shrink-0 text-orange-500" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Streak</p>
          <p className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">{streakDays}d</p>
        </div>
      </div>
      <div className="flex min-w-[7rem] flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Retention</p>
          <p className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">
            {totalReviews === 0 ? '—' : `${retentionPercent}%`}
          </p>
        </div>
      </div>
    </div>
  )
}
