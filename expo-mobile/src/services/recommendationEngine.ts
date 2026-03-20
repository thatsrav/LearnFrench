/**
 * Smart lesson recommendations from progress + weak-area analytics + learning streak.
 */

import { getDb } from '../database/database'
import { CURRICULUM_MODULES, type CEFRLevel } from '../lib/curriculum'
import { computeDailyStreak, loadRecentScores } from '../lib/history'
import {
  analyzePerformanceByTopic,
  getCategoryStrength,
  getWeakTopics,
  type TopicPerformance,
} from './weakAreaDetection'

const GRAMMAR_UNITS = new Set(
  Object.entries({
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
  } as Record<string, 'grammar' | 'vocabulary'>)
    .filter(([, v]) => v === 'grammar')
    .map(([k]) => k),
)

const LEVEL_RANK: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
}

export type RecommendedDifficulty = 'foundational' | 'on_level' | 'stretch'

export type RecommendedNextLesson = {
  lessonId: string
  reason: string
  difficulty: RecommendedDifficulty
  /** Higher = addresses more weak signals */
  impactScore: number
  level: CEFRLevel
  title: string
  durationMin: number
}

export type DailyPlanItem = RecommendedNextLesson & {
  rationale: string
}

export type DailyLessonPlan = {
  dateKey: string
  streakDays: number
  /** True when streak is “new” — we cap volume & skip stretch goals */
  lightSchedule: boolean
  maxStudyMinutes: number
  items: DailyPlanItem[]
}

export type ReviewContentSuggestion = {
  kind: 'unit_lesson' | 'writing_lab' | 'spaced_repetition'
  lessonId?: string
  level?: CEFRLevel
  title: string
  reason: string
  impactScore: number
}

function normalizeUserId(userId: string | null | undefined): string {
  return userId?.trim() ?? ''
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function parseLevelFromUnitId(unitId: string): CEFRLevel {
  const lower = unitId.toLowerCase()
  if (lower.startsWith('a1')) return 'A1'
  if (lower.startsWith('a2')) return 'A2'
  if (lower.startsWith('b1')) return 'B1'
  if (lower.startsWith('b2')) return 'B2'
  if (lower.startsWith('c1')) return 'C1'
  return 'A1'
}

type UnitRow = {
  unit_id: string
  level: string
  title: string
  status: string
  score: number
  order_index: number
}

async function fetchOrderedUnits(_userId: string): Promise<UnitRow[]> {
  void _userId
  const db = await getDb()
  return db.getAllAsync<UnitRow>(
    `
    SELECT u.id AS unit_id, u.level, u.title, u.order_index,
           COALESCE(p.status, 'locked') AS status,
           COALESCE(p.score, 0) AS score
    FROM units u
    LEFT JOIN user_progress p ON p.unit_id = u.id
    ORDER BY
      CASE u.level
        WHEN 'A1' THEN 1 WHEN 'A2' THEN 2 WHEN 'B1' THEN 3 WHEN 'B2' THEN 4 WHEN 'C1' THEN 5
      END ASC,
      u.order_index ASC
  `,
  )
}

function findCurriculumMeta(contentUnitId: string): { title: string; durationMin: number } | null {
  for (const mod of CURRICULUM_MODULES) {
    const hit = mod.lessons.find((l) => l.contentUnitId === contentUnitId)
    if (hit) return { title: hit.title, durationMin: hit.durationMin }
  }
  return null
}

function displayTitle(unit: UnitRow): string {
  return findCurriculumMeta(unit.unit_id)?.title ?? unit.title
}

function durationForUnit(unitId: string): number {
  return findCurriculumMeta(unitId)?.durationMin ?? 20
}

function weakTopicUnitIds(weak: TopicPerformance[], units: UnitRow[]): Set<string> {
  const set = new Set<string>()
  for (const w of weak) {
    if (w.source !== 'unit_quiz') continue
    for (const u of units) {
      if (`${u.level} · ${u.title}` === w.topic) set.add(u.unit_id)
    }
  }
  return set
}

function isLevelMastered(level: CEFRLevel, units: UnitRow[]): boolean {
  const inLevel = units.filter((u) => u.level === level)
  if (inLevel.length === 0) return false
  return inLevel.every((u) => u.status === 'completed' && u.score >= 80)
}

function firstAvailableOrRetry(units: UnitRow[]): UnitRow | null {
  const retry = units.find((u) => u.status === 'completed' && u.score > 0 && u.score < 80)
  if (retry) return retry
  const avail = units.find((u) => u.status === 'available')
  return avail ?? null
}

function nextLevelAfter(level: CEFRLevel): CEFRLevel | null {
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
  const i = order.indexOf(level)
  return i >= 0 && i < order.length - 1 ? order[i + 1]! : null
}

async function getStreakDays(): Promise<number> {
  const scores = await loadRecentScores()
  return computeDailyStreak(scores)
}

type Candidate = RecommendedNextLesson & { rationale: string }

function buildCandidates(
  units: UnitRow[],
  weakUnitIds: Set<string>,
  grammarWeak: boolean,
  userMaxLevel: CEFRLevel,
): Candidate[] {
  const out: Candidate[] = []
  const seen = new Set<string>()

  const push = (c: Candidate) => {
    if (seen.has(c.lessonId)) return
    seen.add(c.lessonId)
    out.push(c)
  }

  for (const u of units) {
    if (u.status === 'locked') continue

    const isRetry = u.status === 'completed' && u.score > 0 && u.score < 80
    const isContinue = u.status === 'available' && u.score === 0
    if (!isRetry && !isContinue) continue

    let impact = 1
    let reason = ''
    let difficulty: RecommendedDifficulty = 'on_level'
    let rationale = ''

    if (isRetry) {
      impact += 4
      reason = `Retry — last score ${u.score}% (aim for 80%+).`
      rationale = 'Strengthen this unit before moving on.'
      difficulty = u.score < 50 ? 'foundational' : 'on_level'
    } else {
      reason = 'Continue your current learning path.'
      rationale = 'Next open lesson in your syllabus order.'
      difficulty = LEVEL_RANK[u.level as CEFRLevel] <= LEVEL_RANK.A2 ? 'foundational' : 'on_level'
    }

    if (weakUnitIds.has(u.unit_id)) {
      impact += 3
      rationale += ' Targets a measured weak area.'
    }
    if (grammarWeak && GRAMMAR_UNITS.has(u.unit_id)) {
      impact += 2
      rationale += ' Grammar-focused — matches your profile.'
    }

    const lvl = u.level as CEFRLevel
    if (LEVEL_RANK[lvl] > LEVEL_RANK[userMaxLevel] + 1) {
      difficulty = 'stretch'
    }

    push({
      lessonId: u.unit_id,
      level: lvl,
      title: displayTitle(u),
      reason,
      rationale: rationale.trim(),
      difficulty,
      impactScore: impact,
      durationMin: durationForUnit(u.unit_id),
    })
  }

  // Level-up suggestion when current tier is mastered
  for (const level of ['A1', 'A2', 'B1', 'B2'] as CEFRLevel[]) {
    if (!isLevelMastered(level, units)) continue
    const next = nextLevelAfter(level)
    if (!next) continue
    const nu = units.find((x) => x.level === next && x.status === 'available')
    if (!nu) continue
    push({
      lessonId: nu.unit_id,
      level: next,
      title: displayTitle(nu),
      reason: `You’ve mastered ${level} — start ${next}.`,
      rationale: 'Natural progression after strong completion scores.',
      difficulty: 'stretch',
      impactScore: 5,
      durationMin: durationForUnit(nu.unit_id),
    })
  }

  // If nothing (edge case), recommend a1-u1
  if (out.length === 0) {
    const first = units[0]
    if (first) {
      push({
        lessonId: first.unit_id,
        level: first.level as CEFRLevel,
        title: displayTitle(first),
        reason: 'Start or resume from the beginning of the path.',
        rationale: 'Default path when no other signal is available.',
        difficulty: 'foundational',
        impactScore: 1,
        durationMin: durationForUnit(first.unit_id),
      })
    }
  }

  return out
}

/** Highest-impact next lesson (single pick). */
export async function getRecommendedNextLesson(
  userId: string,
): Promise<RecommendedNextLesson | null> {
  const uid = normalizeUserId(userId)
  const units = await fetchOrderedUnits(uid)
  if (units.length === 0) return null

  const weakUnitIds = new Set<string>()
  let grammarWeak = false
  let userMaxLevel: CEFRLevel = 'A1'

  const weak = await getWeakTopics(uid, 70)
  if (weak.ok) {
    for (const id of weakTopicUnitIds(weak.data, units)) weakUnitIds.add(id)
  }

  const cat = await getCategoryStrength(uid)
  if (cat.ok && cat.data.grammar.avgScore != null && cat.data.grammar.attemptCount > 0) {
    grammarWeak = cat.data.grammar.avgScore < 70
  }

  for (const u of units) {
    if (u.status === 'completed' && u.score >= 80) {
      const lvl = u.level as CEFRLevel
      if (LEVEL_RANK[lvl] > LEVEL_RANK[userMaxLevel]) userMaxLevel = lvl
    }
  }
  const avail = firstAvailableOrRetry(units)
  if (avail) {
    const al = avail.level as CEFRLevel
    if (LEVEL_RANK[al] > LEVEL_RANK[userMaxLevel]) userMaxLevel = al
  }

  const candidates = buildCandidates(units, weakUnitIds, grammarWeak, userMaxLevel)
  candidates.sort((a, b) => b.impactScore - a.impactScore || a.lessonId.localeCompare(b.lessonId))
  const top = candidates[0]
  if (!top) return null
  return {
    lessonId: top.lessonId,
    reason: top.reason,
    difficulty: top.difficulty,
    impactScore: top.impactScore,
    level: top.level,
    title: top.title,
    durationMin: top.durationMin,
  }
}

const NEW_STREAK_MAX_DAYS = 1
/** Don’t schedule more than this many minutes for a “new” streak day */
const NEW_STREAK_MAX_MINUTES = 90
const DEFAULT_MAX_MINUTES = 150

/** Top lessons for today, ranked by impact; respects streak-friendly caps. */
export async function generateDailyLessonPlan(userId: string): Promise<DailyLessonPlan> {
  const uid = normalizeUserId(userId)
  const today = new Date()
  const dateKey = dayKey(today)
  const streakDays = await getStreakDays()
  const lightSchedule = streakDays <= NEW_STREAK_MAX_DAYS

  const units = await fetchOrderedUnits(uid)
  const weakUnitIds = new Set<string>()
  let grammarWeak = false
  let userMaxLevel: CEFRLevel = 'A1'

  const weak = await getWeakTopics(uid, 70)
  if (weak.ok) {
    for (const id of weakTopicUnitIds(weak.data, units)) weakUnitIds.add(id)
  }

  const cat = await getCategoryStrength(uid)
  if (cat.ok && cat.data.grammar.avgScore != null && cat.data.grammar.attemptCount > 0) {
    grammarWeak = cat.data.grammar.avgScore < 70
  }

  for (const u of units) {
    if (u.status === 'completed' && u.score >= 80) {
      const lvl = u.level as CEFRLevel
      if (LEVEL_RANK[lvl] > LEVEL_RANK[userMaxLevel]) userMaxLevel = lvl
    }
  }
  const avail = firstAvailableOrRetry(units)
  if (avail) {
    const al = avail.level as CEFRLevel
    if (LEVEL_RANK[al] > LEVEL_RANK[userMaxLevel]) userMaxLevel = al
  }

  const allRanked = buildCandidates(units, weakUnitIds, grammarWeak, userMaxLevel)
  allRanked.sort((a, b) => b.impactScore - a.impactScore || a.lessonId.localeCompare(b.lessonId))

  let candidates = lightSchedule ? allRanked.filter((c) => c.difficulty !== 'stretch') : allRanked

  const maxStudyMinutes = lightSchedule ? NEW_STREAK_MAX_MINUTES : DEFAULT_MAX_MINUTES
  const maxItems = lightSchedule ? 2 : 3

  const items: DailyPlanItem[] = []
  let minutes = 0
  for (const c of candidates) {
    if (items.length >= maxItems) break
    if (minutes + c.durationMin > maxStudyMinutes && items.length > 0) break
    items.push({ ...c, rationale: c.rationale })
    minutes += c.durationMin
  }

  if (items.length === 0) {
    const fallback = candidates[0] ?? allRanked[0]
    if (fallback) items.push({ ...fallback, rationale: fallback.rationale })
  }

  return {
    dateKey,
    streakDays,
    lightSchedule,
    maxStudyMinutes,
    items,
  }
}

/** Extra review surfaces (weak writing, spaced rep, weak units). */
export async function suggestReviewContent(userId: string): Promise<ReviewContentSuggestion[]> {
  const uid = normalizeUserId(userId)
  const units = await fetchOrderedUnits(uid)
  const out: ReviewContentSuggestion[] = []

  const weak = await getWeakTopics(uid, 70)
  if (weak.ok) {
    for (const t of weak.data.filter((x) => x.source === 'unit_quiz').slice(0, 3)) {
      const u = units.find((row) => `${row.level} · ${row.title}` === t.topic)
      if (!u) continue
      out.push({
        kind: 'unit_lesson',
        lessonId: u.unit_id,
        level: u.level as CEFRLevel,
        title: displayTitle(u),
        reason: `Quiz average ~${t.avgScore}% on this topic — revisit the lesson.`,
        impactScore: 4,
      })
    }
  }

  const topics = await analyzePerformanceByTopic(uid)
  if (topics.ok) {
    const writing = topics.data.filter((x) => x.source === 'writing_lab' && x.avgScore < 70)
    if (writing.length > 0) {
      out.push({
        kind: 'writing_lab',
        title: 'AI French Scorer',
        reason: 'Writing samples look below target — short practice texts will help.',
        impactScore: 3,
      })
    }
  }

  out.push({
    kind: 'spaced_repetition',
    title: 'Spaced repetition deck',
    reason: 'Refresh vocabulary & grammar cards due today.',
    impactScore: 2,
  })

  out.sort((a, b) => b.impactScore - a.impactScore)
  return out
}

// --- Engagement tracking -----------------------------------------------------------------------

export type RecommendationEvent = 'shown' | 'opened' | 'completed'

export async function recordRecommendationEngagement(
  userId: string | null | undefined,
  planDate: string,
  lessonId: string,
  event: RecommendationEvent,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  await db.runAsync(
    `INSERT INTO recommendation_engagement (user_id, plan_date, lesson_id, event, created_at) VALUES (?, ?, ?, ?, ?)`,
    uid,
    planDate,
    lessonId,
    event,
    Date.now(),
  )
}

/** Mark each lesson as shown when the daily plan is rendered (deduped per day). */
export async function recordDailyPlanShown(
  userId: string | null | undefined,
  plan: DailyLessonPlan,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  for (const item of plan.items) {
    const existing = await db.getFirstAsync<{ c: number }>(
      `SELECT COUNT(*) as c FROM recommendation_engagement
       WHERE user_id = ? AND plan_date = ? AND lesson_id = ? AND event = 'shown'`,
      uid,
      plan.dateKey,
      item.lessonId,
    )
    if (Number(existing?.c ?? 0) > 0) continue
    await recordRecommendationEngagement(userId, plan.dateKey, item.lessonId, 'shown')
  }
}
