import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ConjugationCard } from '../data/mastersGuildCards'
import type { ConjugationsBundle } from '../data/conjugationsSchema'
import conjugationsBundle from '../data/conjugations.json'
import { buildMasterSrsDeck } from '../lib/srsExtendedDeck'
import {
  addCalendarDays,
  applySm2Correct,
  applySm2Wrong,
  createDefaultSrsState,
  isCardDue,
  todayKeyLocal,
  type SrsCardState,
} from '../lib/sm2'

const STORAGE_KEY = 'ccx:srs:cards'

const BUNDLE = conjugationsBundle as ConjugationsBundle
const SRS_DECK = buildMasterSrsDeck(BUNDLE)

/** Cap how many due cards we queue per sitting (full due count still shown in the badge). */
const MAX_SESSION_CARDS = 12

export type ExtendedSrsCardState = SrsCardState & {
  timesReviewedTotal: number
  timesCorrect: number
}

export type SrsPersistedV1 = {
  v: 1
  cards: Record<string, ExtendedSrsCardState>
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function hashStringId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Spread first reviews across two weeks so day one is not every card at once. */
function staggeredInitialState(id: string, today: string): ExtendedSrsCardState {
  const days = hashStringId(id) % 14
  const base = createDefaultSrsState(today)
  return {
    ...base,
    nextReviewDate: addCalendarDays(today, days),
    timesReviewedTotal: 0,
    timesCorrect: 0,
  }
}

function loadPersisted(): Record<string, ExtendedSrsCardState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as SrsPersistedV1
    if (parsed?.v !== 1 || !parsed.cards || typeof parsed.cards !== 'object') return {}
    return parsed.cards
  } catch {
    return {}
  }
}

function savePersisted(cards: Record<string, ExtendedSrsCardState>) {
  try {
    const payload: SrsPersistedV1 = { v: 1, cards }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}

function mergeWithDeck(
  partial: Record<string, ExtendedSrsCardState>,
  today: string,
): Record<string, ExtendedSrsCardState> {
  const out: Record<string, ExtendedSrsCardState> = { ...partial }
  for (const c of SRS_DECK) {
    if (!out[c.id]) {
      out[c.id] = staggeredInitialState(c.id, today)
    }
  }
  return out
}

function defaultCardState(today: string): ExtendedSrsCardState {
  return {
    ...createDefaultSrsState(today),
    timesReviewedTotal: 0,
    timesCorrect: 0,
  }
}

function getDueCards(map: Record<string, ExtendedSrsCardState>, today: string): ConjugationCard[] {
  return SRS_DECK.filter((c) => isCardDue(map[c.id] ?? defaultCardState(today), today))
}

/**
 * If fewer than `min` cards are due, pull forward random non-due cards to today.
 */
function ensureMinimumDue(
  map: Record<string, ExtendedSrsCardState>,
  min: number,
  today: string,
): Record<string, ExtendedSrsCardState> {
  const due = getDueCards(map, today)
  if (due.length >= min) return map
  const need = min - due.length
  const dueIds = new Set(due.map((c) => c.id))
  const candidates = shuffle(SRS_DECK.filter((c) => !dueIds.has(c.id)))
  const next = { ...map }
  for (let i = 0; i < need && i < candidates.length; i++) {
    const id = candidates[i]!.id
    const cur = next[id] ?? defaultCardState(today)
    next[id] = { ...cur, nextReviewDate: today }
  }
  return next
}

export type UseSRSResult = {
  ready: boolean
  todayKey: string
  sessionQueue: ConjugationCard[]
  /** All cards due today before session cap (for badge). */
  rawDueCount: number
  /** Cards actually queued this session (≤ MAX_SESSION_CARDS when many are due). */
  sessionCap: number
  cardStates: Record<string, ExtendedSrsCardState>
  recordSchedulingOutcome: (cardId: string, correct: boolean) => void
  refreshSession: () => void
}

export function useSRS(): UseSRSResult {
  const today = todayKeyLocal()
  const [ready, setReady] = useState(false)
  const [cardStates, setCardStates] = useState<Record<string, ExtendedSrsCardState>>({})
  const [sessionQueue, setSessionQueue] = useState<ConjugationCard[]>([])
  const [rawDueCount, setRawDueCount] = useState(0)

  const bootstrap = useCallback(() => {
    const t = todayKeyLocal()
    const mergedBase = mergeWithDeck(loadPersisted(), t)
    const rawDue = getDueCards(mergedBase, t)
    setRawDueCount(rawDue.length)
    const merged = ensureMinimumDue(mergedBase, 5, t)
    savePersisted(merged)
    const due = getDueCards(merged, t)
    const queue = shuffle(due).slice(0, MAX_SESSION_CARDS)
    setCardStates(merged)
    setSessionQueue(queue)
    setReady(true)
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const recordSchedulingOutcome = useCallback((cardId: string, correct: boolean) => {
    const t = todayKeyLocal()
    setCardStates((prev) => {
      const cur = prev[cardId] ?? defaultCardState(t)
      const base: SrsCardState = {
        easeFactor: cur.easeFactor,
        intervalDays: cur.intervalDays,
        nextReviewDate: cur.nextReviewDate,
      }
      const sched = correct ? applySm2Correct(base, t) : applySm2Wrong(base, t)
      const next: ExtendedSrsCardState = {
        ...sched,
        timesReviewedTotal: cur.timesReviewedTotal + 1,
        timesCorrect: cur.timesCorrect + (correct ? 1 : 0),
      }
      const merged = { ...prev, [cardId]: next }
      savePersisted(merged)
      return merged
    })
  }, [])

  const refreshSession = useCallback(() => {
    bootstrap()
  }, [bootstrap])

  return useMemo(
    () => ({
      ready,
      todayKey: today,
      sessionQueue,
      rawDueCount,
      sessionCap: MAX_SESSION_CARDS,
      cardStates,
      recordSchedulingOutcome,
      refreshSession,
    }),
    [ready, today, sessionQueue, rawDueCount, cardStates, recordSchedulingOutcome, refreshSession],
  )
}
