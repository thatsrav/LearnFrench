import { Mic, Volume2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const PROMPTS = [
  "Presente-toi en deux phrases.",
  "Decris ta routine du matin.",
  "Parle de ton dernier weekend.",
  "Explique pourquoi tu apprends le francais.",
]

export default function SpeakingCoachPage() {
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const prompt = useMemo(() => PROMPTS[index % PROMPTS.length], [index])

  const nextPrompt = () => {
    setFeedback(null)
    setIndex((v) => v + 1)
  }

  const simulateCheck = () => {
    setFeedback('Good attempt. Focus on clearer connectors (et, puis, parce que) and slower pronunciation.')
  }

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Speaking Coach</h2>
      <p className="mt-1 text-sm text-slate-500">Practice prompts for oral French confidence.</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt</p>
        <p className="mt-2 text-base font-medium text-slate-900">{prompt}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={simulateCheck}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2955B8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#244a9e]"
        >
          <Mic size={16} />
          Check speaking
        </button>
        <button
          type="button"
          onClick={nextPrompt}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
        >
          <Volume2 size={16} />
          Next prompt
        </button>
      </div>

      {feedback && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {feedback}
        </div>
      )}
    </section>
  )
}

