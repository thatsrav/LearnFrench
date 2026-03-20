import { ArrowRight, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SpeakingAreaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 text-center">
      <div className="rounded-3xl border border-slate-100 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
          <Mic className="h-8 w-8" />
        </div>
        <h1 className="font-display mt-6 text-2xl font-bold text-[#1e293b]">Speaking Area</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Practice prompts, recording UI, and oral tasks are wired through TEF Prep speaking activities.
        </p>
        <Link
          to="/tef-prep/a1/1/speaking"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1e293b] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
        >
          Open speaking lab
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-6 text-xs text-slate-500">
          Or start from the{' '}
          <Link to="/tef-prep" className="font-semibold text-indigo-600 hover:underline">
            TEF hub
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
