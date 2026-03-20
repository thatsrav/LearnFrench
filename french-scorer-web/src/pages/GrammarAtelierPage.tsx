import { Check, Flame, Menu } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  AGREEMENT_TASKS,
  addGrammarAtelierXp,
  readGrammarAtelierXp,
  SYNTAX_BANK,
  SYNTAX_CORRECT,
  TENSE_INITIAL_PLACED,
  TENSE_INITIAL_TRAY,
  TENSE_LOCKED_IDS,
  type TenseChip,
  type TenseColumnId,
} from '../lib/grammarAtelier'

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.value = 0.08
    o.start()
    o.stop(ctx.currentTime + 0.12)
  } catch {
    /* */
  }
}

export default function GrammarAtelierPage() {
  const [xpStreak, setXpStreak] = useState(() => readGrammarAtelierXp())

  const [placed, setPlaced] = useState<Record<TenseColumnId, TenseChip[]>>(() => ({
    passe: [...TENSE_INITIAL_PLACED.passe],
    present: [...TENSE_INITIAL_PLACED.present],
    futur: [...TENSE_INITIAL_PLACED.futur],
  }))
  const [tray, setTray] = useState<TenseChip[]>(() => [...TENSE_INITIAL_TRAY])
  const [selectedTenseId, setSelectedTenseId] = useState<string | null>(null)
  const [glowCol, setGlowCol] = useState<TenseColumnId | null>(null)

  const [agreementIndex, setAgreementIndex] = useState(0)
  const [agreementSelected, setAgreementSelected] = useState<number | null>(null)
  const [agreementSolved, setAgreementSolved] = useState<Record<string, boolean>>({})

  const [syntaxBank, setSyntaxBank] = useState<string[]>(() => [...SYNTAX_BANK])
  const [syntaxActive, setSyntaxActive] = useState<string[]>([])
  const [syntaxFeedback, setSyntaxFeedback] = useState<string | null>(null)
  const [syntaxSolved, setSyntaxSolved] = useState(false)

  const [, setTenseXpAwarded] = useState<Set<string>>(() => new Set())
  const [, setAgreementXpAwarded] = useState<Set<string>>(() => new Set())
  const [, setSyntaxXpAwarded] = useState(false)

  const agreementTask = AGREEMENT_TASKS[agreementIndex]!

  const tenseTrayScore = useMemo(() => {
    let ok = 0
    for (const col of ['passe', 'present', 'futur'] as const) {
      for (const c of placed[col]) {
        if (TENSE_LOCKED_IDS.has(c.id)) continue
        if (c.correct === col) ok += 1
      }
    }
    return ok
  }, [placed])

  const agreementScore = useMemo(() => Object.values(agreementSolved).filter(Boolean).length, [agreementSolved])

  const totalScore = tenseTrayScore + agreementScore + (syntaxSolved ? 1 : 0)
  const totalMax = TENSE_INITIAL_TRAY.length + AGREEMENT_TASKS.length + 1

  const placeChip = useCallback((chipId: string, col: TenseColumnId) => {
    const chip = tray.find((c) => c.id === chipId)
    if (!chip) return
    setTray((t) => t.filter((c) => c.id !== chipId))
    setPlaced((p) => ({ ...p, [col]: [...p[col], chip] }))
    setSelectedTenseId(null)
    setGlowCol(col)
    window.setTimeout(() => setGlowCol(null), 700)

    if (chip.correct === col) {
      setTenseXpAwarded((s) => {
        if (s.has(chipId)) return s
        setXpStreak(addGrammarAtelierXp(8))
        return new Set(s).add(chipId)
      })
    }
  }, [tray])

  const removeChipFromColumns = useCallback((chipId: string) => {
    setPlaced((p) => {
      let removed: TenseChip | null = null
      const next: Record<TenseColumnId, TenseChip[]> = { passe: [], present: [], futur: [] }
      for (const k of ['passe', 'present', 'futur'] as const) {
        for (const c of p[k]) {
          if (c.id === chipId) {
            if (TENSE_LOCKED_IDS.has(c.id)) next[k].push(c)
            else removed = c
          } else {
            next[k].push(c)
          }
        }
      }
      if (removed) {
        queueMicrotask(() => {
          setTray((t) => (t.some((x) => x.id === removed!.id) ? t : [...t, removed!]))
        })
      }
      return removed ? next : p
    })
  }, [])

  const pickAgreement = useCallback(
    (choiceIndex: number) => {
      setAgreementSelected(choiceIndex)
      const ok = choiceIndex === agreementTask.correctIndex
      if (ok) {
        setAgreementSolved((s) => ({ ...s, [agreementTask.id]: true }))
        setAgreementXpAwarded((s) => {
          if (s.has(agreementTask.id)) return s
          setXpStreak(addGrammarAtelierXp(15))
          return new Set(s).add(agreementTask.id)
        })
      }
    },
    [agreementTask.correctIndex, agreementTask.id],
  )

  const nextAgreement = useCallback(() => {
    setAgreementSelected(null)
    setAgreementIndex((i) => (i + 1) % AGREEMENT_TASKS.length)
  }, [])

  const moveSyntaxToActive = useCallback((word: string) => {
    setSyntaxBank((b) => b.filter((w) => w !== word))
    setSyntaxActive((a) => [...a, word])
    setSyntaxFeedback(null)
  }, [])

  const syntaxUndoLast = useCallback(() => {
    setSyntaxActive((a) => {
      if (!a.length) return a
      const last = a[a.length - 1]!
      setSyntaxBank((b) => [...b, last])
      return a.slice(0, -1)
    })
    setSyntaxFeedback(null)
    setSyntaxSolved(false)
  }, [])

  const resetSyntax = useCallback(() => {
    setSyntaxBank([...SYNTAX_BANK])
    setSyntaxActive([])
    setSyntaxFeedback(null)
    setSyntaxSolved(false)
    setSyntaxXpAwarded(false)
  }, [])

  const validateSyntax = useCallback(() => {
    const match =
      syntaxActive.length === SYNTAX_CORRECT.length && syntaxActive.every((w, i) => w === SYNTAX_CORRECT[i])
    setSyntaxFeedback(
      match
        ? 'Parfait — ordre canonique : sujet + pronoms + verbe + adverbe + complément.'
        : 'Pas tout à fait — pensez au placement du pronom objet indirect et de l’adverbe.',
    )
    if (match) {
      setSyntaxSolved(true)
      playChime()
      setSyntaxXpAwarded((aw) => {
        if (aw) return aw
        setXpStreak(addGrammarAtelierXp(25))
        return true
      })
    }
  }, [syntaxActive])

  const resetTenseRound = useCallback(() => {
    setPlaced({
      passe: [...TENSE_INITIAL_PLACED.passe],
      present: [...TENSE_INITIAL_PLACED.present],
      futur: [...TENSE_INITIAL_PLACED.futur],
    })
    setTray([...TENSE_INITIAL_TRAY])
    setSelectedTenseId(null)
    setGlowCol(null)
    setTenseXpAwarded(new Set())
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Interactive lab</p>
          <h1 className="font-display mt-1 text-3xl font-bold text-[#1e293b]">Grammar Atelier</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            B2-style session — tri des temps (comme l’app), accords multiples, syntaxe par construction de phrase.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> XP
            </p>
            <p className="font-display text-xl font-bold text-[#1e293b]">{xpStreak.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Session
            </p>
            <p className="font-display text-xl font-bold text-[#1e293b]">
              {totalScore}/{totalMax}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tense sorting */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#1e293b]">Tense sorting</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                Tap · column
              </span>
              <button
                type="button"
                onClick={resetTenseRound}
                className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 underline-offset-2 hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Deux formes sont déjà classées. Sélectionnez une puce du plateau, puis touchez la colonne cible.
          </p>
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
                    'mt-2 min-h-[140px] w-full space-y-2 rounded-2xl border-2 border-dashed p-2 text-left transition',
                    selectedTenseId ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-slate-50',
                    glowCol === col.id ? 'ring-2 ring-emerald-400 ring-offset-2' : '',
                  ].join(' ')}
                >
                  {placed[col.id].map((c) => {
                    const wrongHere = !TENSE_LOCKED_IDS.has(c.id) && c.correct !== col.id
                    return (
                      <span
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (TENSE_LOCKED_IDS.has(c.id)) return
                          removeChipFromColumns(c.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!TENSE_LOCKED_IDS.has(c.id)) removeChipFromColumns(c.id)
                          }
                        }}
                        className={[
                          'block w-full cursor-pointer rounded-xl py-2 text-center text-xs font-bold text-white',
                          TENSE_LOCKED_IDS.has(c.id) ? 'cursor-default opacity-95' : '',
                          wrongHere ? 'bg-rose-600' : 'bg-[#1e293b]',
                        ].join(' ')}
                        title={TENSE_LOCKED_IDS.has(c.id) ? 'Exemple fixe' : 'Cliquer pour reprendre au plateau'}
                      >
                        {c.text}
                      </span>
                    )
                  })}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-600">Plateau — à placer</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tray.map((c) => (
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
            Temps (hors exemples) : {tenseTrayScore}/{TENSE_INITIAL_TRAY.length} corrects dans la bonne colonne.
          </p>
        </div>

        {/* Agreement */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-display text-lg font-bold text-[#1e293b]">Agreement challenge</h2>
          <p className="mt-2 text-sm text-slate-600">Accordez l’adjectif avec le sujet (genre et nombre).</p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tâche {String(agreementIndex + 1).padStart(2, '0')} / {String(AGREEMENT_TASKS.length).padStart(2, '0')}
            </p>
            <p className="mt-3 text-lg font-semibold text-[#1e293b]">{agreementTask.prompt}</p>
            <p className="mt-1 text-sm italic text-slate-500">{agreementTask.hint}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {agreementTask.choices.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pickAgreement(i)}
                  className={[
                    'rounded-full border-2 px-4 py-2 text-sm font-bold transition',
                    agreementSelected === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md'
                      : 'border-slate-200 bg-white text-[#1e293b] hover:border-indigo-200',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {agreementSelected !== null ? (
            <p className="mt-3 text-sm font-medium text-slate-600">
              {agreementSelected === agreementTask.correctIndex
                ? '✓ Bien vu.'
                : 'Réessayez — pensez au genre et au nombre du sujet.'}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {AGREEMENT_TASKS.map((t, i) => (
                <span
                  key={t.id}
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                    i === agreementIndex ? 'bg-[#1e293b] text-white' : 'bg-slate-100 text-slate-500',
                    agreementSolved[t.id] ? 'ring-2 ring-emerald-400' : '',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={nextAgreement}
              className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              Phrase suivante →
            </button>
          </div>
        </div>
      </div>

      {/* Syntax — bank + compose (same model as mobile) */}
      <div className="overflow-hidden rounded-3xl bg-[#1e293b] text-white shadow-lg md:flex">
        <div className="p-8 md:w-[42%]">
          <div className="flex items-center gap-2 text-sky-200/90">
            <Menu className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Syntax reordering</span>
          </div>
          <h2 className="font-display mt-3 text-2xl font-bold md:text-3xl">Reconstruire la phrase</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Touchez les mots dans l’ordre pour composer une phrase correcte. Zone de composition : cliquez pour annuler le
            dernier mot.
          </p>
          <button
            type="button"
            onClick={resetSyntax}
            className="mt-4 text-xs font-bold text-sky-200 underline underline-offset-2 hover:text-white"
          >
            Réinitialiser les mots
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-4 border-t border-white/10 p-6 md:border-l md:border-t-0 md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Composer ici</p>
          <button
            type="button"
            onClick={() => {
              if (syntaxActive.length) syntaxUndoLast()
            }}
            className="flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-3 text-left"
          >
            {syntaxActive.length === 0 ? (
              <span className="text-sm text-white/40">Tapez les jetons ci-dessous…</span>
            ) : (
              syntaxActive.map((w, i) => (
                <span key={`${w}-${i}`} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#1e293b] shadow-sm">
                  {w}
                </span>
              ))
            )}
          </button>

          <p className="text-xs font-bold uppercase tracking-wide text-white/50">Réserve</p>
          <div className="flex flex-wrap gap-2">
            {syntaxBank.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => moveSyntaxToActive(w)}
                className="rounded-xl bg-white/95 px-3 py-2.5 text-sm font-bold text-[#1e293b] shadow-sm transition hover:bg-white"
              >
                {w}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400">Cible : Elle nous rend souvent visite.</p>
          <button
            type="button"
            onClick={validateSyntax}
            className="w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:opacity-95 md:max-w-xs"
            style={{ backgroundColor: '#ff5a79' }}
          >
            Valider la syntaxe
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
