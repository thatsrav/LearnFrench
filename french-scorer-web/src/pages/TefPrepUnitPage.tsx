import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Headphones, Mic, Pencil } from 'lucide-react'
import type { TefSkill } from '../lib/tefPrepFetch'

const SKILLS: { skill: TefSkill; label: string; desc: string; icon: typeof BookOpen }[] = [
  { skill: 'reading', label: 'Reading', desc: 'Compréhension écrite — affiches, annonces', icon: BookOpen },
  { skill: 'writing', label: 'Writing', desc: 'Expression écrite — Section A', icon: Pencil },
  { skill: 'listening', label: 'Listening', desc: 'Compréhension orale — 6 QCM TEF-style', icon: Headphones },
  { skill: 'speaking', label: 'Speaking', desc: 'Expression orale — Section A', icon: Mic },
]

export default function TefPrepUnitPage() {
  const { unit: unitStr } = useParams()
  const unit = Number(unitStr)
  if (!Number.isFinite(unit) || unit < 1 || unit > 10) {
    return <p className="text-slate-700">Unité invalide.</p>
  }

  return (
    <div className="space-y-8">
      <Link
        to="/tef-prep"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
      >
        ← Retour au parcours TEF
      </Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-red-700">TEF Canada · A1</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Unité {unit}</h1>
        <p className="mt-2 max-w-xl text-slate-600">Choisissez une salle de compétences pour cette unité.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SKILLS.map(({ skill, label, desc, icon: Icon }) => (
          <Link
            key={skill}
            to={`/tef-prep/a1/${unit}/${skill}`}
            className="group flex gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-700">
                Ouvrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
