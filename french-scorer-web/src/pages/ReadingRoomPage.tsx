import { useMemo, useState } from 'react'
import { LEVEL_ORDER, type CEFRLevel } from '../lib/syllabus'

const PASSAGES: Record<CEFRLevel, { title: string; text: string; question: string; answer: string }[]> = {
  A1: [
    {
      title: 'Au cafe',
      text: "Je vais au cafe avec mon ami. Nous commandons un cafe et un croissant. Il fait beau aujourd'hui.",
      question: 'What do they order?',
      answer: 'Un cafe et un croissant.',
    },
  ],
  A2: [
    {
      title: 'Une journee de travail',
      text: "Le matin, Marie prend le metro pour aller au bureau. Elle commence a neuf heures et dejeuner avec ses collegues.",
      question: 'How does Marie go to work?',
      answer: 'Elle prend le metro.',
    },
  ],
  B1: [
    {
      title: 'Projet d equipe',
      text: "L'equipe prepare une presentation. Chacun partage ses idees, puis ils choisissent les meilleures solutions.",
      question: 'What does the team do after sharing ideas?',
      answer: 'Ils choisissent les meilleures solutions.',
    },
  ],
  B2: [
    {
      title: 'Habitudes numeriques',
      text: "Beaucoup de personnes consultent leur telephone des le reveil, ce qui influence leur concentration pendant la journee.",
      question: 'What is affected during the day?',
      answer: 'La concentration.',
    },
  ],
  C1: [
    {
      title: 'Debat public',
      text: "Le debat met en lumiere la complexite du sujet: chaque argument semble pertinent, mais ses consequences divergent.",
      question: 'How are the consequences described?',
      answer: 'Elles divergent.',
    },
  ],
}

export default function ReadingRoomPage() {
  const [level, setLevel] = useState<CEFRLevel>('A1')
  const content = useMemo(() => PASSAGES[level], [level])

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Reading Room</h2>
      <p className="mt-1 text-sm text-slate-500">Short reading drills by CEFR level.</p>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 space-y-4">
        {content.map((p) => (
          <article key={p.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{p.text}</p>
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comprehension</p>
              <p className="mt-1 text-sm text-slate-800">{p.question}</p>
              <p className="mt-2 text-sm text-[#2955B8]"><span className="font-semibold">Answer:</span> {p.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

