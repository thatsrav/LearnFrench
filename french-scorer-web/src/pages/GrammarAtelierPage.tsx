import { Check, Flame } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

type ColumnId = 'passe' | 'present' | 'futur'

const tenseChips: { id: string; text: string; correct: ColumnId }[] = [
  { id: '1', text: "J'irai", correct: 'futur' },
  { id: '2', text: 'Tu chantes', correct: 'present' },
  { id: '3', text: 'Nous avons fini', correct: 'passe' },
]

const agreementAnswer = 'heureuses'

export default function GrammarAtelierPage() {
  const [placements, setPlacements] = useState<Record<string, ColumnId | null>>({})
  const [selectedTenseId, setSelectedTenseId] = useState<string | null>(null)
  const [agreement, setAgreement] = useState<string | null>(null)
  const [syntaxOrder, setSyntaxOrder] = useState<string[]>(['souvent', 'Elle', 'nous', 'rend', 'visite', '.'])
  const [syntaxFeedback, setSyntaxFeedback] = useState<string | null>(null)

  const placeChip = useCallback((chipId: string, col: ColumnId) => {
    setPlacements((p) => ({ ...p, [chipId]: col }))
    setSelectedTenseId(null)
  }, [])

  const tenseScore = useMemo(() => {
    let ok = 0
    for (const c of tenseChips) {
      if (placements[c.id] === c.correct) ok += 1
    }
    return ok
  }, [placements])

  const validateSyntax = () => {
    const target = ['Elle', 'nous', 'rend', 'souvent', 'visite', '.']
    const match = syntaxOrder.length === target.length && syntaxOrder.every((w, i) => w === target[i])
    setSyntaxFeedback(match ? 'Parfait — ordre canonique SVO + adverbe.' : 'Pas tout à fait — réessayez le bloc sujet + COD.')
  }

  const moveSyntax = (index: number, dir: -1 | 1) => {
    setSyntaxOrder((prev) => {
      const j = index + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
    setSyntaxFeedback(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Interactive lab</p>
          <h1 className="font-display mt-1 text-3xl font-bold text-[#1e293b]">Grammar Atelier</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Tense sorting, agreement, and syntax — web edition of your Grammar Games flow.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> XP streak
            </p>
            <p className="font-display text-xl font-bold text-[#1e293b]">1,240</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Correct
            </p>
            <p className="font-display text-xl font-bold text-[#1e293b]">
              {tenseScore + (agreement === agreementAnswer ? 1 : 0)}/4
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tense sorting */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#1e293b]">Tense sorting</h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
              Interactive
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Tap a chip, then tap a column to place it.</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {(
              [
                { id: 'passe' as const, label: 'Passé' },
                { id: 'present' as const, label: 'Présent' },
                { id: 'futur' as const, label: 'Futur' },
              ] as const
            ).map((col) => (
              <div key={col.id}>
                <p className="text-center text-xs font-bold uppercase text-slate-500">{col.label}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTenseId) placeChip(selectedTenseId, col.id)
                  }}
                  className={[
                    'mt-2 min-h-[120px] w-full space-y-2 rounded-2xl border-2 border-dashed p-2 text-left transition',
                    selectedTenseId ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-slate-50',
                  ].join(' ')}
                >
                  {tenseChips
                    .filter((c) => placements[c.id] === col.id)
                    .map((c) => (
                      <span
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPlacements((p) => ({ ...p, [c.id]: null }))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            setPlacements((p) => ({ ...p, [c.id]: null }))
                          }
                        }}
                        className="block w-full cursor-pointer rounded-xl bg-[#1e293b] py-2 text-center text-xs font-bold text-white"
                      >
                        {c.text}
                      </span>
                    ))}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-600">Tray — select a phrase, then tap a column.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tenseChips
                .filter((c) => !placements[c.id])
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedTenseId((s) => (s === c.id ? null : c.id))}
                    className={[
                      'rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm',
                      selectedTenseId === c.id ? 'ring-2 ring-indigo-400 ring-offset-2' : '',
                    ].join(' ')}
                    style={{ backgroundColor: '#1e293b' }}
                  >
                    {c.text}
                  </button>
                ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Score: {tenseScore}/{tenseChips.length} columns correct.
          </p>
        </div>

        {/* Agreement */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-display text-lg font-bold text-[#1e293b]">Agreement challenge</h2>
          <p className="mt-2 text-sm text-slate-600">Match the adjective to subject gender and number.</p>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-lg font-semibold text-[#1e293b]">Les filles sont ____ .</p>
            <p className="mt-1 text-sm text-slate-500">(heureux)</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['heureux', 'heureuse', 'heureuxs', 'heureuses'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAgreement(opt)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-bold transition',
                  agreement === opt
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'border border-slate-200 bg-white text-[#1e293b] hover:border-indigo-200',
                ].join(' ')}
              >
                {opt}
              </button>
            ))}
          </div>
          {agreement ? (
            <p className="mt-3 text-sm font-medium text-slate-600">
              {agreement === agreementAnswer ? '✓ Correct — plural feminine.' : 'Try again — think plural + feminine.'}
            </p>
          ) : null}
        </div>
      </div>

      {/* Syntax */}
      <div className="overflow-hidden rounded-3xl bg-[#1e293b] text-white shadow-lg md:flex">
        <div className="p-8 md:w-[42%]">
          <h2 className="font-display text-xl font-bold">Syntax reordering</h2>
          <p className="mt-3 text-sm text-slate-300">
            Reorder the chips into a natural French sentence, then validate.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-4 border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Compose here</p>
          <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-white/30 p-3">
            {syntaxOrder.map((word, i) => (
              <span key={`${word}-${i}`} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSyntax(i, -1)}
                  className="rounded-lg bg-white/20 px-1.5 py-1 text-xs text-white hover:bg-white/30"
                  aria-label="Move left"
                >
                  ←
                </button>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#1e293b] shadow-sm">{word}</span>
                <button
                  type="button"
                  onClick={() => moveSyntax(i, 1)}
                  className="rounded-lg bg-white/20 px-1.5 py-1 text-xs text-white hover:bg-white/30"
                  aria-label="Move right"
                >
                  →
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400">Use arrows to reorder into: Elle nous rend souvent visite.</p>
          <button
            type="button"
            onClick={validateSyntax}
            className="w-full rounded-2xl py-4 text-sm font-bold text-white shadow-md transition hover:opacity-95 md:max-w-xs"
            style={{ backgroundColor: '#ff5a79' }}
          >
            Validate syntax
          </button>
          {syntaxFeedback ? <p className="text-sm text-indigo-100">{syntaxFeedback}</p> : null}
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        THE DIGITAL CURATOR · MODULES BY L’ATELIER FRANÇAIS
      </p>
    </div>
  )
}
