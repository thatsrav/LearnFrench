const PROMPTS = [
  "Presente-toi en deux phrases.",
  "Decris ta routine du matin.",
  "Parle de ton dernier weekend.",
  "Explique pourquoi tu apprends le francais.",
]

export default function SpeakingCoachPage() {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Speaking Coach</h2>
      <p className="mt-1 text-sm text-slate-500">Practice prompts for oral French confidence.</p>

      <ul className="mt-4 space-y-3">
        {PROMPTS.map((prompt, i) => (
          <li
            key={i}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt {i + 1}</p>
            <p className="mt-2 text-base font-medium text-slate-900">{prompt}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
