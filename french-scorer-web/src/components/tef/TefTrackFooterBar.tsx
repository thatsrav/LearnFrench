import { Clock, Trophy, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readTefFooterStats } from '../../lib/tefSharedFooterStats'

export default function TefTrackFooterBar() {
  const [stats, setStats] = useState(readTefFooterStats)

  useEffect(() => {
    const id = setInterval(() => setStats(readTefFooterStats()), 2000)
    return () => clearInterval(id)
  }, [])

  const cards = [
    {
      icon: Zap,
      label: 'Exam readiness',
      value: `${stats.examReadiness} / ${stats.examMax}`,
      iconClass: 'text-amber-500',
    },
    {
      icon: Clock,
      label: 'Prep time left',
      value: `${stats.prepDaysLeft} Days`,
      iconClass: 'text-sky-600',
    },
    {
      icon: Trophy,
      label: 'Current streak',
      value: `${stats.streakSessions} Sessions`,
      iconClass: 'text-violet-600',
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ icon: Icon, label, value, iconClass }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ${iconClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            <p className="font-display text-xl font-bold text-[#1e293b]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
