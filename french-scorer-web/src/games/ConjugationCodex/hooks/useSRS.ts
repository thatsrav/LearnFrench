import { useCallback, useMemo, useState } from 'react'

/** SM-2 style quality: 0 = complete blackout … 5 = perfect */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5

export type SRSCard = {
  id: string
  /** Easiness factor (default 2.5) */
  ef: number
  /** Repetition count (0 = new) */
  reps: number
  /** Interval in days */
  intervalDays: number
  /** Due at (epoch ms) */
  dueAt: number
}

const MS_PER_DAY = 86_400_000

function clampEase(ef: number) {
  return Math.min(2.5, Math.max(1.3, ef))
}

/**
 * Next interval & ease from SM-2 (simplified).
 * @see https://www.supermemo.com/en/blog/application-of-a-computer-to-increase-the-effectiveness-of-learning
 */
export function scheduleSRSUpdate(card: SRSCard, quality: ReviewQuality, now = Date.now()): SRSCard {
  let { ef, reps, intervalDays } = card

  if (quality < 3) {
    reps = 0
    intervalDays = 1
    ef = clampEase(ef - 0.2)
  } else {
    if (reps === 0) intervalDays = 1
    else if (reps === 1) intervalDays = 6
    else intervalDays = Math.round(intervalDays * ef)
    reps += 1
    ef = clampEase(ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  }

  return {
    ...card,
    ef,
    reps,
    intervalDays,
    dueAt: now + intervalDays * MS_PER_DAY,
  }
}

export function initialSRSCard(id: string, now = Date.now()): SRSCard {
  return {
    id,
    ef: 2.5,
    reps: 0,
    intervalDays: 0,
    dueAt: now,
  }
}

export type UseSRSOptions = {
  initialCards?: SRSCard[]
}

/**
 * Hook for Master's Guild daily queue (shell — wire to persisted cards later).
 */
export function useSRS(options: UseSRSOptions = {}) {
  const [cards, setCards] = useState<SRSCard[]>(() => options.initialCards ?? [])

  const dueNow = useCallback(
    (now = Date.now()) => cards.filter((c) => c.dueAt <= now),
    [cards],
  )

  const dueToday = useMemo(() => dueNow(), [dueNow])

  const scheduleReview = useCallback((id: string, quality: ReviewQuality) => {
    const now = Date.now()
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx < 0) {
        return [...prev, scheduleSRSUpdate(initialSRSCard(id, now), quality, now)]
      }
      const next = [...prev]
      next[idx] = scheduleSRSUpdate(prev[idx]!, quality, now)
      return next
    })
  }, [])

  const retentionPercent = useMemo(() => {
    if (cards.length === 0) return 0
    const mature = cards.filter((c) => c.reps >= 2).length
    return Math.round((mature / cards.length) * 100)
  }, [cards])

  return {
    cards,
    setCards,
    dueToday,
    dueNow,
    scheduleReview,
    retentionPercent,
  }
}
