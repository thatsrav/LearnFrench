import type { ConjugationCard } from '../data/mastersGuildCards'
import { cardStrength, isCardDue, type CardStrength, type SrsCardState } from './sm2'

export type CardWithState = {
  card: ConjugationCard
  state: SrsCardState
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Pick 6–10 due cards with target mix: 50% weak, 30% medium, 20% strong.
 * Shortfalls are filled from remaining due cards in random order.
 */
export function buildDailySessionQueue(due: CardWithState[], sessionSize: number): ConjugationCard[] {
  const n = Math.max(1, Math.min(sessionSize, due.length))
  const byTier: Record<CardStrength, CardWithState[]> = { weak: [], medium: [], strong: [] }
  for (const row of due) {
    byTier[cardStrength(row.state)].push(row)
  }
  for (const k of Object.keys(byTier) as CardStrength[]) {
    byTier[k] = shuffle(byTier[k])
  }

  const targets = {
    weak: Math.round(n * 0.5),
    medium: Math.round(n * 0.3),
    strong: Math.round(n * 0.2),
  }
  let sum = targets.weak + targets.medium + targets.strong
  while (sum < n) {
    targets.weak++
    sum++
  }
  while (sum > n) {
    if (targets.weak > 0) targets.weak--
    else if (targets.medium > 0) targets.medium--
    else targets.strong--
    sum--
  }

  const picked: ConjugationCard[] = []
  const take = (tier: CardStrength, count: number) => {
    for (let i = 0; i < count && byTier[tier].length > 0; i++) {
      picked.push(byTier[tier].shift()!.card)
    }
  }
  take('weak', targets.weak)
  take('medium', targets.medium)
  take('strong', targets.strong)

  const rest: ConjugationCard[] = []
  for (const tier of ['weak', 'medium', 'strong'] as const) {
    rest.push(...byTier[tier].map((r) => r.card))
  }
  shuffle(rest)
  while (picked.length < n && rest.length > 0) {
    picked.push(rest.shift()!)
  }
  return shuffle(picked)
}

/** Weekly challenge: mixed tenses, random sample (default 10). */
export function buildChallengeQueue(allCards: ConjugationCard[], count = 10): ConjugationCard[] {
  return shuffle([...allCards]).slice(0, Math.min(count, allCards.length))
}

/**
 * Due cards first, then pad with soonest upcoming reviews until `target` rows (or all cards).
 */
export function collectDueAndSoon(
  all: ConjugationCard[],
  getState: (id: string) => SrsCardState,
  today: string,
  target: number,
): CardWithState[] {
  const withStates: CardWithState[] = all.map((card) => ({ card, state: getState(card.id) }))
  const due = withStates.filter((x) => isCardDue(x.state, today))
  const notDue = withStates.filter((x) => !isCardDue(x.state, today))
  notDue.sort((a, b) => a.state.nextReviewDate.localeCompare(b.state.nextReviewDate))
  const out: CardWithState[] = [...due]
  for (const x of notDue) {
    if (out.length >= target) break
    out.push(x)
  }
  return out
}

export function randomSessionSize(): number {
  return 6 + Math.floor(Math.random() * 5)
}
