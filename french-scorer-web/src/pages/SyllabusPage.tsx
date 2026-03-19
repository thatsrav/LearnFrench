import { Lock, CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSyllabusData, LEVEL_ORDER, type CEFRLevel } from '../lib/syllabus'

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
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Syllabus</h2>
          <p className="text-sm text-slate-500">Select a CEFR level and continue your units.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {LEVEL_ORDER.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              level === l ? 'bg-[#2955B8] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
            ].join(' ')}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <button
            key={row.id}
            onClick={() => onUnitClick(row.id, row.status)}
            className={[
              'flex w-full items-center justify-between rounded-2xl border p-4 text-left transition',
              row.status === 'available'
                ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                : 'border-slate-200 bg-white hover:bg-slate-50',
              row.status === 'locked' ? 'opacity-40' : 'opacity-100',
            ].join(' ')}
          >
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {row.level} - Unit {row.orderIndex}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{row.title}</div>
            </div>

            {row.status === 'completed' ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-emerald-700">
                <CheckCircle2 size={16} />
                <span className="text-xs font-semibold">Completed</span>
              </div>
            ) : row.status === 'available' ? (
              <div className="rounded-xl bg-[#2955B8] px-3 py-2 text-xs font-semibold text-white">
                Start Unit
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-3 py-2 text-slate-600">
                <Lock size={16} />
                <span className="text-xs font-semibold">Locked</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </section>
  )
}

