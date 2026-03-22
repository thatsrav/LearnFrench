/**
 * Spaced repetition (SuperMemo SM-2) + SQLite persistence.
 *
 * Tables: spaced_repetition_items, spaced_repetition_reviews (see database.ts).
 */

import { getDb } from '../database/database'

// --- SM-2 (classic) -----------------------------------------------------------------------------

export class SM2Algorithm {
  static readonly MIN_EASE = 1.3
  static readonly DEFAULT_EASE = 2.5

  /**
   * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), minimum 1.3
   * @param quality 0–5 (0 = complete blackout, 5 = perfect)
   */
  static updateEaseFactor(currentEase: number, quality: number): number {
    const q = Math.max(0, Math.min(5, quality))
    let ef = currentEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if (ef < SM2Algorithm.MIN_EASE) ef = SM2Algorithm.MIN_EASE
    return Math.round(ef * 100) / 100
  }

  /**
   * Calendar date after `intervalDays` from last review.
   * `easeFactor` is included for API compatibility; interval is already computed from SM-2.
   */
  static calculateNextReviewDate(lastReview: Date, easeFactor: number, intervalDays: number): Date {
    void easeFactor
    const d = new Date(lastReview.getTime())
    d.setDate(d.getDate() + Math.max(1, Math.round(intervalDays)))
    return d
  }

  /**
   * Full SM-2 transition after a graded review at `reviewedAt`.
   */
  static scheduleAfterReview(
    state: { easeFactor: number; intervalDays: number; repetitions: number },
    quality: number,
    reviewedAt: Date,
  ): { easeFactor: number; intervalDays: number; repetitions: number; nextReview: Date } {
    const q = Math.max(0, Math.min(5, Math.round(quality)))
    let easeFactor = SM2Algorithm.updateEaseFactor(state.easeFactor, q)
    let intervalDays = state.intervalDays
    let repetitions = state.repetitions

    if (q < 3) {
      repetitions = 0
      intervalDays = 1
    } else {
      if (repetitions === 0) {
        intervalDays = 1
      } else if (repetitions === 1) {
        intervalDays = 6
      } else {
        intervalDays = Math.max(1, Math.round(state.intervalDays * easeFactor))
      }
      repetitions += 1
    }

    const nextReview = SM2Algorithm.calculateNextReviewDate(reviewedAt, easeFactor, intervalDays)
    return { easeFactor, intervalDays, repetitions, nextReview }
  }
}

/** @deprecated Prefer SM2Algorithm.calculateNextReviewDate — kept for task API shape */
export function calculateNextReviewDate(
  lastReview: Date,
  easeFactor: number,
  interval: number,
): Date {
  return SM2Algorithm.calculateNextReviewDate(lastReview, easeFactor, interval)
}

export function updateEaseFactor(currentEase: number, quality: number): number {
  return SM2Algorithm.updateEaseFactor(currentEase, quality)
}

// --- Types --------------------------------------------------------------------------------------

export type SpacedRepetitionContentType = 'vocab' | 'grammar'

export type SpacedRepetitionReviewItem = {
  id: number
  itemId: string
  contentType: SpacedRepetitionContentType
  unitId: string
  frontText: string
  backText: string
  lastReview: Date
  nextReview: Date
  easeFactor: number
  /** SM-2 interval in days */
  interval: number
  repetitions: number
}

function normalizeUserId(userId: string | null | undefined): string {
  return userId?.trim() ?? ''
}

function endOfDay(d: Date): number {
  const x = new Date(d.getTime())
  x.setHours(23, 59, 59, 999)
  return x.getTime()
}

// --- DB helpers ---------------------------------------------------------------------------------

function mapRow(r: {
  id: number
  item_id: string
  content_type: string
  unit_id: string
  front_text: string
  back_text: string
  last_review: number
  next_review: number
  ease_factor: number
  interval_days: number
  repetitions: number
}): SpacedRepetitionReviewItem {
  return {
    id: r.id,
    itemId: r.item_id,
    contentType: r.content_type as SpacedRepetitionContentType,
    unitId: r.unit_id,
    frontText: r.front_text,
    backText: r.back_text,
    lastReview: new Date(r.last_review),
    nextReview: new Date(r.next_review),
    easeFactor: Number(r.ease_factor),
    interval: Number(r.interval_days),
    repetitions: Number(r.repetitions),
  }
}

/**
 * Items due on or before end of `today` (local calendar day).
 */
export async function getReviewItems(userId: string, today: Date): Promise<SpacedRepetitionReviewItem[]> {
  const uid = normalizeUserId(userId)
  const before = endOfDay(today)
  const db = await getDb()
  const rows = await db.getAllAsync<{
    id: number
    item_id: string
    content_type: string
    unit_id: string
    front_text: string
    back_text: string
    last_review: number
    next_review: number
    ease_factor: number
    interval_days: number
    repetitions: number
  }>(
    `
    SELECT id, item_id, content_type, unit_id, front_text, back_text,
           last_review, next_review, ease_factor, interval_days, repetitions
    FROM spaced_repetition_items
    WHERE user_id = ? AND next_review <= ?
    ORDER BY next_review ASC, id ASC
  `,
    uid,
    before,
  )
  return rows.map(mapRow)
}

/**
 * Vocabulary items due for this unit (same due rule as getReviewItems), ordered oldest first.
 */
export async function getDueReviewItemsForUnit(
  userId: string,
  unitId: string,
  today: Date,
  limit: number,
): Promise<SpacedRepetitionReviewItem[]> {
  const uid = normalizeUserId(userId)
  const before = endOfDay(today)
  const lim = Math.min(50, Math.max(1, limit))
  const db = await getDb()
  const rows = await db.getAllAsync<{
    id: number
    item_id: string
    content_type: string
    unit_id: string
    front_text: string
    back_text: string
    last_review: number
    next_review: number
    ease_factor: number
    interval_days: number
    repetitions: number
  }>(
    `
    SELECT id, item_id, content_type, unit_id, front_text, back_text,
           last_review, next_review, ease_factor, interval_days, repetitions
    FROM spaced_repetition_items
    WHERE user_id = ? AND unit_id = ? AND content_type = 'vocab' AND next_review <= ?
    ORDER BY next_review ASC, id ASC
    LIMIT ?
  `,
    uid,
    unitId,
    before,
    lim,
  )
  return rows.map(mapRow)
}

const MAX_VOCAB_SEED_PER_LESSON = 15
const GRAMMAR_SNIPPET_LEN = 480

export type LessonUnitSeed = {
  id: string
  grammar_rule_text: string
  vocab_list: string[]
  /** Richer backs (e.g. translations). When non-empty, used instead of vocab_list for inserts. */
  vocab_entries?: { word: string; back: string }[]
}

/**
 * Insert one SR row if absent (INSERT OR IGNORE). Uses SM-2 initial schedule (review tomorrow).
 */
export async function insertSpacedRepetitionItem(
  userId: string | null | undefined,
  row: {
    itemId: string
    unitId: string
    contentType: SpacedRepetitionContentType
    frontText: string
    backText: string
  },
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const now = Date.now()
  const last = new Date(now)
  const initialInterval = 1
  const next = SM2Algorithm.calculateNextReviewDate(last, SM2Algorithm.DEFAULT_EASE, initialInterval)
  const nextMs = next.getTime()
  const ef = SM2Algorithm.DEFAULT_EASE

  await db.runAsync(
    `
    INSERT OR IGNORE INTO spaced_repetition_items
      (user_id, item_id, content_type, unit_id, front_text, back_text,
       last_review, next_review, ease_factor, interval_days, repetitions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `,
    uid,
    row.itemId,
    row.contentType,
    row.unitId,
    row.frontText,
    row.backText,
    now,
    nextMs,
    ef,
    initialInterval,
  )
}

/**
 * Apply SM-2 after a grade, keyed by stable `item_id` (resolves DB row then delegates to recordSpacedRepetitionReview).
 */
export async function updateSpacedRepetitionItem(
  userId: string | null | undefined,
  itemId: string,
  quality: number,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM spaced_repetition_items WHERE user_id = ? AND item_id = ? LIMIT 1',
    uid,
    itemId,
  )
  if (!row) {
    throw new Error(`Spaced repetition item not found: ${itemId}`)
  }
  await recordSpacedRepetitionReview(userId, row.id, quality)
}

/**
 * After a lesson score ≥ 80%, seed vocab + one grammar card (INSERT OR IGNORE).
 */
function buildInitialInsertRow() {
  const now = Date.now()
  const last = new Date(now)
  const initialInterval = 1
  const next = SM2Algorithm.calculateNextReviewDate(last, SM2Algorithm.DEFAULT_EASE, initialInterval)
  return {
    now,
    nextMs: next.getTime(),
    ef: SM2Algorithm.DEFAULT_EASE,
    initialInterval,
  }
}

export async function seedSpacedRepetitionFromLesson(
  userId: string | null | undefined,
  unit: LessonUnitSeed,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const { now, nextMs, ef, initialInterval } = buildInitialInsertRow()

  await db.withTransactionAsync(async () => {
    const useEntries = unit.vocab_entries && unit.vocab_entries.length > 0
    const vocabSource = useEntries
      ? unit.vocab_entries!.slice(0, MAX_VOCAB_SEED_PER_LESSON)
      : unit.vocab_list.slice(0, MAX_VOCAB_SEED_PER_LESSON).map((word) => ({
          word,
          back: `From unit ${unit.id}. Recall meaning / use in a short phrase.`,
        }))

    let idx = 0
    for (const { word, back } of vocabSource) {
      const w = word.trim()
      if (!w) continue
      const itemId = `vocab:${unit.id}:${String(idx).padStart(4, '0')}`
      idx += 1
      const backText = back.trim() || `From unit ${unit.id}. Recall meaning / use in a short phrase.`
      await db.runAsync(
        `
        INSERT OR IGNORE INTO spaced_repetition_items
          (user_id, item_id, content_type, unit_id, front_text, back_text,
           last_review, next_review, ease_factor, interval_days, repetitions)
        VALUES (?, ?, 'vocab', ?, ?, ?, ?, ?, ?, ?, 0)
      `,
        uid,
        itemId,
        unit.id,
        w,
        backText,
        now,
        nextMs,
        ef,
        initialInterval,
      )
    }

    const grammarItemId = `grammar:${unit.id}`
    const grammarBack =
      unit.grammar_rule_text.length > GRAMMAR_SNIPPET_LEN
        ? `${unit.grammar_rule_text.slice(0, GRAMMAR_SNIPPET_LEN)}…`
        : unit.grammar_rule_text

    await db.runAsync(
      `
      INSERT OR IGNORE INTO spaced_repetition_items
        (user_id, item_id, content_type, unit_id, front_text, back_text,
         last_review, next_review, ease_factor, interval_days, repetitions)
      VALUES (?, ?, 'grammar', ?, ?, ?, ?, ?, ?, ?, 0)
    `,
      uid,
      grammarItemId,
      unit.id,
      `Grammar · ${unit.id}`,
      grammarBack,
      now,
      nextMs,
      ef,
      initialInterval,
    )
  })
}

/**
 * Apply SM-2 after user rates recall; writes spaced_repetition_reviews history row.
 */
export async function recordSpacedRepetitionReview(
  userId: string | null | undefined,
  dbRowId: number,
  quality: number,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const q = Math.max(0, Math.min(5, Math.round(quality)))
  const db = await getDb()

  const row = await db.getFirstAsync<{
    id: number
    item_id: string
    ease_factor: number
    interval_days: number
    repetitions: number
  }>(
    'SELECT id, item_id, ease_factor, interval_days, repetitions FROM spaced_repetition_items WHERE id = ? AND user_id = ?',
    dbRowId,
    uid,
  )

  if (!row) {
    throw new Error('Spaced repetition item not found for this user.')
  }

  const reviewedAt = new Date()
  const next = SM2Algorithm.scheduleAfterReview(
    {
      easeFactor: Number(row.ease_factor),
      intervalDays: Number(row.interval_days),
      repetitions: Number(row.repetitions),
    },
    q,
    reviewedAt,
  )

  const remembered = q >= 3 ? 1 : 0
  const reviewedMs = reviewedAt.getTime()

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
      UPDATE spaced_repetition_items
      SET last_review = ?,
          next_review = ?,
          ease_factor = ?,
          interval_days = ?,
          repetitions = ?
      WHERE id = ? AND user_id = ?
    `,
      reviewedMs,
      next.nextReview.getTime(),
      next.easeFactor,
      next.intervalDays,
      next.repetitions,
      dbRowId,
      uid,
    )

    await db.runAsync(
      `
      INSERT INTO spaced_repetition_reviews (user_id, item_id, reviewed_at, quality, remembered)
      VALUES (?, ?, ?, ?, ?)
    `,
      uid,
      row.item_id,
      reviewedMs,
      q,
      remembered,
    )
  })
}

export type SpacedRepetitionHistoryRow = {
  itemId: string
  reviewedAt: Date
  quality: number
  remembered: boolean
}

/** Recent grading history (did they complete review? remembered = quality ≥ 3). */
export async function getSpacedRepetitionReviewHistory(
  userId: string,
  options?: { itemId?: string; limit?: number },
): Promise<SpacedRepetitionHistoryRow[]> {
  const uid = normalizeUserId(userId)
  const limit = Math.min(200, Math.max(1, options?.limit ?? 50))
  const db = await getDb()
  const itemId = options?.itemId?.trim()
  const rows = itemId
    ? await db.getAllAsync<{
        item_id: string
        reviewed_at: number
        quality: number
        remembered: number
      }>(
        `SELECT item_id, reviewed_at, quality, remembered
         FROM spaced_repetition_reviews
         WHERE user_id = ? AND item_id = ?
         ORDER BY reviewed_at DESC
         LIMIT ?`,
        uid,
        itemId,
        limit,
      )
    : await db.getAllAsync<{
        item_id: string
        reviewed_at: number
        quality: number
        remembered: number
      }>(
        `SELECT item_id, reviewed_at, quality, remembered
         FROM spaced_repetition_reviews
         WHERE user_id = ?
         ORDER BY reviewed_at DESC
         LIMIT ?`,
        uid,
        limit,
      )

  return rows.map((r) => ({
    itemId: r.item_id,
    reviewedAt: new Date(r.reviewed_at),
    quality: r.quality,
    remembered: r.remembered === 1,
  }))
}

/** Count of items due today (same rule as getReviewItems). */
export async function countDueReviewItems(userId: string, today: Date): Promise<number> {
  const uid = normalizeUserId(userId)
  const before = endOfDay(today)
  const db = await getDb()
  const r = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM spaced_repetition_items WHERE user_id = ? AND next_review <= ?',
    uid,
    before,
  )
  return Number(r?.c ?? 0)
}
