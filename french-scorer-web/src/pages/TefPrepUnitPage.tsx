import { Link, useParams } from 'react-router-dom'
import { BookOpen, Mic, Pencil, Headphones } from 'lucide-react'
import type { TefSkill } from '../lib/tefPrepFetch'

const SKILLS: { skill: TefSkill; label: string; desc: string; icon: typeof BookOpen }[] = [
  { skill: 'reading', label: 'Reading Room', desc: 'Affiches, annonces, courriels', icon: BookOpen },
  { skill: 'writing', label: 'Écriture — Section A', desc: 'Fait divers (niveau A1)', icon: Pencil },
  { skill: 'listening', label: 'Compréhension orale', desc: 'Annonces / dialogues + QCM', icon: Headphones },
  { skill: 'speaking', label: 'Expression orale — Section A', desc: 'Demander des renseignements', icon: Mic },
]

export default function TefPrepUnitPage() {
  const { unit: unitStr } = useParams()
  const unit = Number(unitStr)
  if (!Number.isFinite(unit) || unit < 1 || unit > 10) {
    return <p className="text-slate-700">Unité invalide.</p>
  }

  return (
    <div className="space-y-6">
      <Link to="/tef-prep" className="text-sm font-semibold text-blue-600 hover:underline">
        ← TEF Prep Hub
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Unité {unit}</h1>
      <p className="text-sm text-slate-600">Choisissez une salle de compétences.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map(({ skill, label, desc, icon: Icon }) => (
          <Link
            key={skill}
            to={`/tef-prep/a1/${unit}/${skill}`}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-200"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
