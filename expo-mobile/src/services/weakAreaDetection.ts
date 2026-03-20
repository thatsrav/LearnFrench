/**
 * Weak-area analytics for personalized recommendations.
 *
 * Data sources (local):
 * - `user_progress` + `units` — unit quiz scores
 * - `user_score_events` — AI writing lab attempts (same shape as Supabase sync)
 *
 * `userId`: rows match `user_id = ?` OR legacy `user_id IS NULL` (pre-login / same device).
 */

import { getDb } from '../database/database'
import { loadRecentScores } from '../lib/history'

export const MIN_ATTEMPTS_FOR_INSIGHTS = 5

export type TopicPerformance = {
  topic: string
  avgScore: number
  attemptCount: number
  /** Unix ms; null when only unit quiz aggregate (no per-attempt timestamp stored) */
  lastAttemptAt: number | null
  /** Helps React style rows (unit vs writing) */
  source: 'unit_quiz' | 'writing_lab'
}

export type CategoryMetric = {
  avgScore: number | null
  attemptCount: number
  lastAttemptAt: number | null
}

export type CategoryStrengthBreakdown = {
  grammar: CategoryMetric
  vocabulary: CategoryMetric
  pronunciation: CategoryMetric
  /**
   * True when pronunciation uses writing-lab scores as a proxy (no mic scoring yet).
   * Grammar/vocab split comes from unit-quiz tagging by unit id.
   */
  pronunciationIsWritingProxy: boolean
}

export type WeakAreaAnalysisResult<T> =
  | { ok: true; attemptCount: number; data: T }
  | {
      ok: false
      code: 'INSUFFICIENT_DATA'
      attemptCount: number
      minRequired: number
      message: string
    }

/** Primary learning focus per syllabus unit (quiz = grammar vs vocabulary emphasis). */
const UNIT_PRIMARY_FOCUS: Record<string, 'grammar' | 'vocabulary'> = {
  'a1-u1': 'grammar',
  'a1-u2': 'vocabulary',
  'a1-u3': 'grammar',
  'a1-u4': 'vocabulary',
  'a1-u5': 'vocabulary',
  'a2-u1': 'grammar',
  'a2-u2': 'vocabulary',
  'a2-u3': 'vocabulary',
  'a2-u4': 'vocabulary',
  'a2-u5': 'grammar',
}

type ScoreEventRow = {
  ts: number
  score: number
  cecr: string
  provider: string
}

async function fetchScoreEventsForUser(userId: string): Promise<ScoreEventRow[]> {
  const db = await getDb()
  const rows = await db.getAllAsync<{
    ts: number
    score: number
    cecr: string
    provider: string
  }>(
    `
    SELECT ts, score, cecr, provider
    FROM user_score_events
    WHERE user_id IS NULL OR user_id = ?
    ORDER BY ts ASC
  `,
    userId,
  )

  const fromSqlite: ScoreEventRow[] = rows.map((r) => ({
    ts: Number(r.ts),
    score: Number(r.score),
    cecr: String(r.cecr ?? ''),
    provider: String(r.provider ?? ''),
  }))

  // Merge legacy AsyncStorage history (dedupe by ts so upgrades keep old attempts)
  const legacy = await loadRecentScores().then((list) =>
    list.map((s) => ({
      ts: s.ts,
      score: s.score,
      cecr: s.cecr,
      provider: s.provider,
    })),
  )

  const byTs = new Map<number, ScoreEventRow>()
  for (const r of legacy) byTs.set(r.ts, r)
  for (const r of fromSqlite) byTs.set(r.ts, r)

  return Array.from(byTs.values()).sort((a, b) => a.ts - b.ts)
}

async function fetchUnitProgressRows(userId: string): Promise<
  {
    unit_id: string
    level: string
    title: string
    status: string
    score: number
  }[]
> {
  void userId // reserved for future per-user local partitions
  const db = await getDb()
  return db.getAllAsync<{
    unit_id: string
    level: string
    title: string
    status: string
    score: number
  }>(
    `
    SELECT
      u.id AS unit_id,
      u.level,
      u.title,
      COALESCE(p.status, 'locked') AS status,
      COALESCE(p.score, 0) AS score
    FROM units u
    LEFT JOIN user_progress p ON p.unit_id = u.id
  `,
  )
}

/** Counts every writing attempt + every unit with at least one recorded quiz score > 0. */
async function countTotalAttempts(userId: string): Promise<number> {
  const events = await fetchScoreEventsForUser(userId)
  const units = await fetchUnitProgressRows(userId)
  const unitAttempts = units.filter((u) => u.score > 0).length
  return events.length + unitAttempts
}

function buildInsufficient<T>(
  attemptCount: number,
): WeakAreaAnalysisResult<T> {
  return {
    ok: false,
    code: 'INSUFFICIENT_DATA',
    attemptCount,
    minRequired: MIN_ATTEMPTS_FOR_INSIGHTS,
    message: `Need at least ${MIN_ATTEMPTS_FOR_INSIGHTS} attempts (quizzes + writing) for personalized insights. You have ${attemptCount}.`,
  }
}

/**
 * Per-topic averages: one row per syllabus unit with score > 0, plus writing grouped by CEFR label.
 */
export async function analyzePerformanceByTopic(
  userId: string,
): Promise<WeakAreaAnalysisResult<TopicPerformance[]>> {
  const attemptCount = await countTotalAttempts(userId)
  if (attemptCount < MIN_ATTEMPTS_FOR_INSIGHTS) {
    return buildInsufficient(attemptCount)
  }

  const units = await fetchUnitProgressRows(userId)
  const events = await fetchScoreEventsForUser(userId)

  const topics: TopicPerformance[] = []

  for (const u of units) {
    if (u.score <= 0) continue
    topics.push({
      topic: `${u.level} · ${u.title}`,
      avgScore: Math.round(Math.max(0, Math.min(100, u.score))),
      attemptCount: 1,
      lastAttemptAt: null,
      source: 'unit_quiz',
    })
  }

  const byCecr = new Map<string, { scores: number[]; lastTs: number }>()
  for (const e of events) {
    const key = e.cecr.trim() || 'Writing (level n/a)'
    const cur = byCecr.get(key) ?? { scores: [], lastTs: 0 }
    cur.scores.push(Math.max(0, Math.min(100, e.score)))
    cur.lastTs = Math.max(cur.lastTs, e.ts)
    byCecr.set(key, cur)
  }

  for (const [cecrLabel, agg] of byCecr) {
    const n = agg.scores.length
    const avg = agg.scores.reduce((a, b) => a + b, 0) / n
    topics.push({
      topic: `Writing · ${cecrLabel}`,
      avgScore: Math.round(avg),
      attemptCount: n,
      lastAttemptAt: agg.lastTs,
      source: 'writing_lab',
    })
  }

  return { ok: true, attemptCount, data: topics }
}

/**
 * Topics below `threshold` (default 70), lowest average first.
 */
export async function getWeakTopics(
  userId: string,
  threshold: number = 70,
): Promise<WeakAreaAnalysisResult<TopicPerformance[]>> {
  const analysis = await analyzePerformanceByTopic(userId)
  if (!analysis.ok) return analysis

  const weak = analysis.data
    .filter((t) => t.avgScore < threshold)
    .sort((a, b) => a.avgScore - b.avgScore || b.attemptCount - a.attemptCount)

  return { ok: true, attemptCount: analysis.attemptCount, data: weak }
}

function aggregateCategory(
  scores: number[],
  lastTs: number | null,
): CategoryMetric {
  if (scores.length === 0) {
    return { avgScore: null, attemptCount: 0, lastAttemptAt: null }
  }
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return {
    avgScore: Math.round(Math.max(0, Math.min(100, avg))),
    attemptCount: scores.length,
    lastAttemptAt: lastTs,
  }
}

/**
 * Grammar vs vocabulary from **unit quiz** scores (tagged by unit).
 * Pronunciation uses **writing lab** average as a proxy (mobile does not persist subscores yet).
 */
export async function getCategoryStrength(
  userId: string,
): Promise<WeakAreaAnalysisResult<CategoryStrengthBreakdown>> {
  const attemptCount = await countTotalAttempts(userId)
  if (attemptCount < MIN_ATTEMPTS_FOR_INSIGHTS) {
    return buildInsufficient(attemptCount)
  }

  const units = await fetchUnitProgressRows(userId)
  const events = await fetchScoreEventsForUser(userId)

  const grammarScores: number[] = []
  const vocabScores: number[] = []

  for (const u of units) {
    if (u.score <= 0) continue
    const focus = UNIT_PRIMARY_FOCUS[u.unit_id] ?? 'vocabulary'
    if (focus === 'grammar') {
      grammarScores.push(u.score)
    } else {
      vocabScores.push(u.score)
    }
  }

  const writingScores = events.map((e) => e.score)
  const writingLast =
    events.length > 0 ? Math.max(...events.map((e) => e.ts)) : null

  const breakdown: CategoryStrengthBreakdown = {
    grammar: aggregateCategory(grammarScores, null),
    vocabulary: aggregateCategory(vocabScores, null),
    pronunciation: aggregateCategory(writingScores, writingLast),
    pronunciationIsWritingProxy: true,
  }

  return { ok: true, attemptCount, data: breakdown }
}
