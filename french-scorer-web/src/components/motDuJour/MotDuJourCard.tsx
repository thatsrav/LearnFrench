import { Bookmark, ExternalLink, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  getMotDuJour,
  isWordBookmarked,
  speakMotDuJour,
  toggleWordBookmark,
  type MotDuJourEntry,
} from '../../lib/motDuJour'
import { resolveMotDuJourImage } from '../../lib/motDuJourImage'
import { readUserCefrLevel } from '../../lib/userCefr'

function ExampleWithHighlight({ text, highlight }: { text: string; highlight: string }) {
  const lower = text.toLowerCase()
  const h = highlight.toLowerCase()
  const idx = lower.indexOf(h)
  if (idx < 0) {
    return <span className="text-white/95">{text}</span>
  }
  const before = text.slice(0, idx)
  const mid = text.slice(idx, idx + highlight.length)
  const after = text.slice(idx + highlight.length)
  return (
    <span className="text-white/95">
      {before}
      <strong className="font-bold text-white underline decoration-indigo-300 decoration-2 underline-offset-4">{mid}</strong>
      {after}
    </span>
  )
}

export default function MotDuJourCard() {
  const [entry, setEntry] = useState<MotDuJourEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)

  const userLevel = readUserCefrLevel()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const e = await getMotDuJour(userLevel)
        if (!cancelled) {
          setEntry(e)
          setBookmarked(isWordBookmarked(e.wordFr))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Chargement impossible')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userLevel])

  const onBookmark = useCallback(() => {
    if (!entry) return
    const next = toggleWordBookmark(entry.wordFr)
    setBookmarked(next)
  }, [entry])

  const onSpeak = useCallback(() => {
    if (entry) speakMotDuJour(entry.wordFr)
  }, [entry])

  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl bg-[#1A1B4B] text-white shadow-xl">
        <div className="grid md:grid-cols-2 md:items-stretch">
          <div className="animate-pulse space-y-4 p-8 md:p-10">
            <div className="h-3 w-24 rounded bg-white/20" />
            <div className="h-12 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-20 rounded bg-white/10" />
          </div>
          <div className="min-h-[220px] bg-slate-800 md:min-h-0" />
        </div>
      </section>
    )
  }

  if (error || !entry) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        Mot du jour : {error ?? 'indisponible'}
      </section>
    )
  }

  const img = resolveMotDuJourImage(entry.wordFr, entry.imageUrl)

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1A1B4B] text-white shadow-xl">
      <div className="grid md:grid-cols-2 md:items-stretch">
        <div className="p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-200/90">Mot du jour</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-100">
              {entry.level}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="font-display text-4xl font-bold md:text-5xl">« {entry.wordFr} »</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onSpeak}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Écouter la prononciation"
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onBookmark}
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full transition',
                  bookmarked ? 'bg-amber-400/30 text-amber-100' : 'bg-white/10 text-white hover:bg-white/20',
                ].join(' ')}
                aria-label={bookmarked ? 'Retirer des favoris' : 'Enregistrer'}
              >
                <Bookmark className="h-5 w-5" fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {entry.ipa ? (
            <p className="mt-2 font-mono text-sm text-indigo-200/90">{entry.ipa}</p>
          ) : null}
          {entry.pos ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-300/80">{entry.pos}</p>
          ) : null}

          <div className="mt-6 space-y-3 text-sm leading-relaxed">
            <p className="text-white/90">
              <span className="font-semibold text-white">Définition</span> — {entry.definitionFr}{' '}
              <span className="text-indigo-200/90">({entry.definitionEn})</span>
            </p>
            <div>
              <p className="font-semibold text-white">Exemple</p>
              <p className="mt-1 text-base leading-relaxed">
                <ExampleWithHighlight text={entry.exampleFr} highlight={entry.highlightFr} />
              </p>
              <p className="mt-2 text-indigo-100/90">{entry.exampleEn}</p>
            </div>
          </div>

          {entry.moreUrl ? (
            <a
              href={entry.moreUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-200 underline-offset-4 hover:underline"
            >
              Explorer le contexte <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <a
              href={`https://fr.wiktionary.org/wiki/${encodeURIComponent(entry.wordFr)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-200 underline-offset-4 hover:underline"
            >
              Wiktionnaire <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="relative min-h-[220px] bg-slate-900 md:min-h-0">
          <img
            src={img}
            alt={`Illustration thématique pour le mot « ${entry.wordFr} »`}
            className="h-full w-full object-cover opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B4B]/80 to-transparent md:bg-gradient-to-l" />
        </div>
      </div>
    </section>
  )
}
