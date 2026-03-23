import { BookOpen, HelpCircle, Lightbulb, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import type { BubblePart, DiscoveryConversation, VerbHighlight } from '../data/phase1DiscoveryConversations'
import { PHASE1_DISCOVERY_CONVERSATIONS } from '../data/phase1DiscoveryConversations'
import { useConjugationState } from '../hooks/useConjugationState'

const PRONOUN_ORDER = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'] as const

const AVATAR_RING: Record<string, string> = {
  marie: 'from-rose-400 to-pink-500',
  pierre: 'from-sky-500 to-blue-600',
  sophie: 'from-violet-400 to-purple-600',
  dubois: 'from-slate-500 to-slate-700',
  thomas: 'from-amber-400 to-orange-500',
  claire: 'from-teal-400 to-cyan-600',
  maman: 'from-fuchsia-400 to-pink-600',
  grandmere: 'from-emerald-500 to-teal-600',
  papa: 'from-indigo-500 to-blue-700',
  elise: 'from-rose-300 to-rose-500',
  marc: 'from-blue-400 to-indigo-600',
  martin: 'from-stone-400 to-stone-600',
  julie: 'from-orange-300 to-red-400',
  alex: 'from-lime-500 to-green-600',
}

function avatarClass(speakerKey: string) {
  return AVATAR_RING[speakerKey] ?? 'from-slate-400 to-slate-600'
}

function renderBubbleParts(parts: BubblePart[], onVerbClick: (v: VerbHighlight) => void) {
  return parts.map((part, i) => {
    if (part.type === 'text') {
      return <span key={i}>{part.value}</span>
    }
    return (
      <button
        key={i}
        type="button"
        onClick={() => onVerbClick(part.verb)}
        className="mx-0.5 inline rounded border-b-2 border-amber-400/90 bg-amber-100 px-1 py-0.5 font-semibold text-[var(--atelier-navy-deep)] transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
        title={`${part.verb.infinitive} · ${part.verb.glossEn} — click for full table`}
      >
        {part.verb.surface}
      </button>
    )
  })
}

function ConjugationTableModal({
  verb,
  open,
  onClose,
  titleId,
}: {
  verb: VerbHighlight | null
  open: boolean
  onClose: () => void
  titleId: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || verb === null) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Conjugation</p>
            <h2 id={titleId} className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">
              {verb.infinitive}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Form in text: <span className="font-semibold text-amber-800">{verb.surface}</span> — {verb.glossEn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close conjugation table"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Person</th>
              <th className="py-2">Form</th>
            </tr>
          </thead>
          <tbody>
            {PRONOUN_ORDER.map((p) => (
              <tr key={p} className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-medium text-slate-700">{p}</td>
                <td className="py-2.5 font-display text-base font-semibold text-[var(--atelier-navy-deep)]">{verb.table[p]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-slate-500">Listen for these shapes in the dialogue — same verb, different person.</p>
      </div>
    </div>
  )
}

function ConversationScene({ conv, onVerbClick }: { conv: DiscoveryConversation; onVerbClick: (v: VerbHighlight) => void }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-white p-4 shadow-inner md:p-6"
      aria-label={`Conversation: ${conv.sceneTitle}`}
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{conv.setting}</p>
          <p className="font-display text-lg font-bold text-[var(--atelier-navy-deep)]">{conv.sceneTitle}</p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">Verb focus · {conv.verbLabelFr}</span>
      </div>
      <ul className="space-y-4">
        {conv.turns.map((turn, idx) => {
          const alignRight = idx % 2 === 1
          return (
            <li
              key={`${conv.id}-${idx}`}
              className={['flex gap-3', alignRight ? 'flex-row-reverse' : 'flex-row'].join(' ')}
            >
              <div
                className={[
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ring-2 ring-white',
                  avatarClass(turn.speakerKey),
                ].join(' ')}
                aria-hidden
              >
                {turn.speaker.slice(0, 1)}
              </div>
              <div className={['max-w-[min(100%,28rem)] min-w-0', alignRight ? 'text-right' : 'text-left'].join(' ')}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{turn.speaker}</p>
                <div
                  className={[
                    'relative inline-block rounded-2xl border px-4 py-3 text-left text-base leading-relaxed text-slate-800 shadow-sm transition',
                    alignRight
                      ? 'rounded-tr-sm border-sky-100 bg-white'
                      : 'rounded-tl-sm border-indigo-100 bg-white',
                  ].join(' ')}
                  title={turn.translationEn}
                >
                  <p className="whitespace-pre-wrap">{renderBubbleParts(turn.parts, onVerbClick)}</p>
                  <p className="mt-2 border-t border-slate-100 pt-2 text-xs italic text-slate-500" title="English gloss">
                    {turn.translationEn}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Phase 1: Pattern Discovery — context-based reading with highlighted verbs and reflection.
 */
export function Phase1_Discovery() {
  const { markPhaseComplete, addXp, bumpStreakIfNeeded, showFeedback } = useConjugationState()
  const modalTitleId = useId()

  const [sceneIndex, setSceneIndex] = useState(0)
  const [reflectionChoice, setReflectionChoice] = useState<string | null>(null)
  const [hintOpen, setHintOpen] = useState(false)
  const [selectedVerb, setSelectedVerb] = useState<VerbHighlight | null>(null)
  const [tableOpen, setTableOpen] = useState(false)

  const conv = PHASE1_DISCOVERY_CONVERSATIONS[sceneIndex]!
  const isLast = sceneIndex >= PHASE1_DISCOVERY_CONVERSATIONS.length - 1

  const resetSceneLocalState = useCallback(() => {
    setReflectionChoice(null)
    setHintOpen(false)
    setSelectedVerb(null)
    setTableOpen(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) resetSceneLocalState()
    })
    return () => {
      cancelled = true
    }
  }, [sceneIndex, resetSceneLocalState])

  const onVerbClick = useCallback((v: VerbHighlight) => {
    setSelectedVerb(v)
    setTableOpen(true)
  }, [])

  const onReflectionSelect = useCallback((id: string) => {
    setReflectionChoice(id)
  }, [])

  const finishPhase = useCallback(() => {
    bumpStreakIfNeeded()
    addXp(15)
    markPhaseComplete('discovery')
    showFeedback(
      'neutral',
      'Pattern discovery complete',
      'You noticed how subjects pull different endings from the same verb. Next: Rule Master for focused practice.',
    )
  }, [addXp, bumpStreakIfNeeded, markPhaseComplete, showFeedback])

  const onNext = useCallback(() => {
    if (reflectionChoice === null) return
    if (isLast) {
      finishPhase()
      return
    }
    setSceneIndex((i) => i + 1)
  }, [reflectionChoice, isLast, finishPhase])

  const progressLabel = useMemo(
    () => `Conversation ${sceneIndex + 1} of ${PHASE1_DISCOVERY_CONVERSATIONS.length}`,
    [sceneIndex],
  )

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600" role="doc-subtitle">
            📖 Part 1: Pattern Discovery
          </p>
          <div className="mt-2 flex items-center gap-3 text-indigo-700">
            <BookOpen className="h-8 w-8 shrink-0" aria-hidden />
            <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)] md:text-2xl">
              Read, notice, reflect
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Read each conversation at your own pace. <strong className="font-semibold text-slate-800">Yellow highlights</strong>{' '}
            are verb forms — click any to open the full conjugation table. There is no timer and no penalty for the reflection
            question; it helps you articulate what you noticed.
          </p>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{progressLabel}</p>
      </div>

      <div className="mt-8">
        <ConversationScene conv={conv} onVerbClick={onVerbClick} />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base font-bold text-[var(--atelier-navy-deep)]">Reflection</h3>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
            No penalty
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800">{conv.reflection.prompt}</p>
        <ul className="space-y-2">
          {conv.reflection.choices.map((c) => {
            const selected = reflectionChoice === c.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onReflectionSelect(c.id)}
                  className={[
                    'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                    selected
                      ? 'border-indigo-400 bg-indigo-50 font-semibold text-[var(--atelier-navy-deep)] ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {c.label}
                </button>
              </li>
            )
          })}
        </ul>

        {reflectionChoice !== null ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-relaxed text-emerald-950">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Takeaway</p>
            <p className="mt-1">{conv.reflection.takeaway}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setHintOpen((h) => !h)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-950 transition hover:bg-amber-100"
          >
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
            {hintOpen ? 'Hide hint' : 'Hint'}
          </button>
          {hintOpen ? (
            <div className="flex w-full items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/90 p-4 text-sm text-amber-950 md:flex-1">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <p>{conv.hint}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <p className="text-xs text-slate-500">
          {reflectionChoice === null ? 'Choose any reflection answer to unlock the next step.' : isLast ? 'Ready to leave discovery.' : 'Continue to the next conversation.'}
        </p>
        <button
          type="button"
          disabled={reflectionChoice === null}
          onClick={onNext}
          className={[
            'rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition',
            reflectionChoice === null ? 'cursor-not-allowed bg-slate-300' : 'bg-[var(--atelier-navy-deep)] hover:bg-[#001438]',
          ].join(' ')}
        >
          {isLast ? 'Finish discovery → Rule Master' : 'Next conversation'}
        </button>
      </div>

      <ConjugationTableModal verb={selectedVerb} open={tableOpen} onClose={() => setTableOpen(false)} titleId={modalTitleId} />
    </section>
  )
}
