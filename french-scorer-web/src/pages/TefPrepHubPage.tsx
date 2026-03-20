import { Link } from 'react-router-dom'
import { TEF_A1_UNIT_COUNT } from '../lib/tefPrepFetch'

export default function TefPrepHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-red-700">TEF Canada — Préparation</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">A1 Skill Rooms</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Dix unités avec quatre fichiers chacune (lecture, écriture, compréhension orale, expression orale). Contenu
          distinct du syllabus FrenchLearn — charge les JSON depuis <code className="rounded bg-slate-100 px-1">public/TEF_Prep</code>.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: TEF_A1_UNIT_COUNT }, (_, i) => i + 1).map((unit) => (
          <li key={unit}>
            <Link
              to={`/tef-prep/a1/${unit}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-red-200 hover:bg-red-50/50"
            >
              <span className="font-bold text-slate-900">Unité {unit}</span>
              <span className="text-sm text-red-700">Ouvrir →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
