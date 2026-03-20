/**
 * Local writing journal: drafts, scored essays, AI feedback history.
 * Schema aligns with `supabase/migrations/002_writing_journal.sql` for future cloud sync.
 */

import { scoreFrench, type FrenchScore, type ScoreFrenchOptions, type ScoreProvider } from '../api/scoreFrench'
import { getDb } from './database'

function normalizeUserId(userId: string | null | undefined): string {
  return userId?.trim() ?? ''
}

export function countWordsFrench(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).filter(Boolean).length
}

function parseStringArrayJson(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}

export type WritingJournalEntry = {
  id: number
  userId: string
  title: string
  content: string
  createdAt: Date
  wordCount: number
  submittedAt: Date | null
  draft: boolean
  category: string
  /** Supabase `writing_entries.id` when synced */
  remoteId: string | null
}

export type WritingJournalScore = {
  id: number
  entryId: number
  overallScore: number
  grammarScore: number
  vocabScore: number
  pronunciationScore: number
  fluencyScore: number
  cecr: string
  aiProvider: string
  scoredAt: Date
}

export type WritingJournalFeedback = {
  id: number
  scoreId: number
  feedbackText: string
  errorExamples: string[]
  suggestions: string[]
}

export type EntryWithFeedback = {
  entry: WritingJournalEntry
  scores: Array<{
    score: WritingJournalScore
    feedback: WritingJournalFeedback | null
  }>
}

export type JournalEntryFilters = {
  dateFrom?: Date
  dateTo?: Date
  category?: string
  /** Only entries whose latest score is >= this (excludes unscored when set) */
  minScore?: number
  /** Only entries whose latest score is <= this (excludes unscored when set) */
  maxScore?: number
  draftsOnly?: boolean
}

export type JournalListEntry = WritingJournalEntry & {
  /** Latest AI overall score for this entry, or null if never scored */
  latestOverallScore: number | null
}

export type JournalListResult = {
  entries: JournalListEntry[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

function mapEntry(r: {
  id: number
  user_id: string
  title: string
  content: string
  created_at: number
  word_count: number
  submitted_at: number | null
  draft: number
  category: string
  remote_id?: string | null
}): WritingJournalEntry {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    content: r.content,
    createdAt: new Date(r.created_at),
    wordCount: r.word_count,
    submittedAt: r.submitted_at != null ? new Date(r.submitted_at) : null,
    draft: r.draft === 1,
    category: r.category,
    remoteId: r.remote_id ?? null,
  }
}

function mapScore(r: {
  id: number
  entry_id: number
  overall_score: number
  grammar_score: number
  vocab_score: number
  pronunciation_score: number
  fluency_score: number
  cecr: string
  ai_provider: string
  scored_at: number
}): WritingJournalScore {
  return {
    id: r.id,
    entryId: r.entry_id,
    overallScore: r.overall_score,
    grammarScore: r.grammar_score,
    vocabScore: r.vocab_score,
    pronunciationScore: r.pronunciation_score,
    fluencyScore: r.fluency_score,
    cecr: r.cecr,
    aiProvider: r.ai_provider,
    scoredAt: new Date(r.scored_at),
  }
}

function localDayKey(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mapFeedback(r: {
  id: number
  score_id: number
  feedback_text: string
  error_examples_json: string
  suggestions_json: string
}): WritingJournalFeedback {
  return {
    id: r.id,
    scoreId: r.score_id,
    feedbackText: r.feedback_text,
    errorExamples: parseStringArrayJson(r.error_examples_json),
    suggestions: parseStringArrayJson(r.suggestions_json),
  }
}

function buildFeedbackFromResult(result: FrenchScore): {
  feedbackText: string
  errorExamples: string[]
  suggestions: string[]
} {
  const strengths = result.strengths.length
    ? `Strengths:\n${result.strengths.map((s) => `• ${s}`).join('\n')}`
    : ''
  const improvements = result.improvements.length
    ? `Improvements:\n${result.improvements.map((s) => `• ${s}`).join('\n')}`
    : ''
  const corrected =
    result.corrected_version.trim().length > 0
      ? `\n\nCorrected version:\n${result.corrected_version}`
      : ''
  const feedbackText = [strengths, improvements, corrected].filter(Boolean).join('\n\n')

  return {
    feedbackText: feedbackText.trim() || 'No detailed feedback text returned.',
    errorExamples: [],
    suggestions: result.improvements.map(String),
  }
}

/**
 * Create or update a draft entry. Returns local SQLite row id.
 */
export async function saveWritingDraft(
  userId: string | null | undefined,
  title: string,
  content: string,
  options?: { category?: string; entryId?: number; draft?: boolean },
): Promise<number> {
  const uid = normalizeUserId(userId)
  const now = Date.now()
  const wc = countWordsFrench(content)
  const cat = options?.category?.trim() ?? ''
  const asDraft = options?.draft !== false ? 1 : 0
  const db = await getDb()

  if (options?.entryId != null) {
    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM writing_entries WHERE id = ? AND user_id = ?',
      options.entryId,
      uid,
    )
    if (!existing) {
      throw new Error('Journal entry not found or access denied.')
    }
    await db.runAsync(
      `
      UPDATE writing_entries
      SET title = ?, content = ?, word_count = ?, category = ?, draft = ?
      WHERE id = ? AND user_id = ?
    `,
      title.trim(),
      content,
      wc,
      cat,
      asDraft,
      options.entryId,
      uid,
    )
    return options.entryId
  }

  const res = await db.runAsync(
    `
    INSERT INTO writing_entries (user_id, title, content, created_at, word_count, submitted_at, draft, category)
    VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
  `,
    uid,
    title.trim(),
    content,
    now,
    wc,
    asDraft,
    cat,
  )
  return Number(res.lastInsertRowId)
}

export type SubmitForScoringOptions = ScoreFrenchOptions & { userId?: string | null }

/**
 * Score entry text via existing API; stores score + feedback rows (append-only history per re-score).
 */
export async function submitForScoring(
  entryId: number,
  aiProvider: ScoreProvider,
  options?: SubmitForScoringOptions,
): Promise<{ scoreId: number; result: FrenchScore; providerUsed: string }> {
  const db = await getDb()
  const uid = normalizeUserId(options?.userId)
  const row = await db.getFirstAsync<{
    id: number
    user_id: string
    content: string
  }>('SELECT id, user_id, content FROM writing_entries WHERE id = ?', entryId)

  if (!row) {
    throw new Error('Journal entry not found.')
  }
  if (uid !== '' && row.user_id !== uid) {
    throw new Error('Journal entry not found for this account.')
  }

  const essayLevel = options?.essayLevel
  const { result, providerUsed } = await scoreFrench(
    row.content,
    aiProvider,
    essayLevel ? { essayLevel } : undefined,
  )
  const scoredAt = Date.now()
  const fb = buildFeedbackFromResult(result)

  let scoreId = 0
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
      UPDATE writing_entries
      SET draft = 0,
          submitted_at = ?,
          word_count = ?
      WHERE id = ?
    `,
      scoredAt,
      countWordsFrench(row.content),
      entryId,
    )

    const ins = await db.runAsync(
      `
      INSERT INTO writing_scores (
        entry_id, overall_score, grammar_score, vocab_score, pronunciation_score, fluency_score,
        cecr, ai_provider, scored_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      entryId,
      Math.round(result.score),
      Math.round(result.grammar),
      Math.round(result.vocabulary),
      Math.round(result.pronunciation),
      Math.round(result.fluency),
      result.cecr,
      providerUsed || aiProvider,
      scoredAt,
    )
    scoreId = Number(ins.lastInsertRowId)

    await db.runAsync(
      `
      INSERT INTO writing_feedback (score_id, feedback_text, error_examples_json, suggestions_json)
      VALUES (?, ?, ?, ?)
    `,
      scoreId,
      fb.feedbackText,
      JSON.stringify(fb.errorExamples),
      JSON.stringify(fb.suggestions),
    )
  })

  return { scoreId, result, providerUsed }
}

/**
 * Paginated list with optional filters (indexed on user_id + created_at / category).
 * Includes latest overall AI score per entry via windowed join.
 */
export async function getJournalEntries(
  userId: string | null | undefined,
  listOptions?: { limit?: number; offset?: number; filters?: JournalEntryFilters },
): Promise<JournalListResult> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const limit = Math.min(100, Math.max(1, listOptions?.limit ?? 20))
  const offset = Math.max(0, listOptions?.offset ?? 0)
  const f = listOptions?.filters

  const where: string[] = ['writing_entries.user_id = ?']
  const params: (string | number)[] = [uid]

  if (f?.draftsOnly) {
    where.push('writing_entries.draft = 1')
  }
  if (f?.category != null && f.category.trim() !== '') {
    where.push('writing_entries.category = ?')
    params.push(f.category.trim())
  }
  if (f?.dateFrom) {
    where.push('writing_entries.created_at >= ?')
    params.push(f.dateFrom.getTime())
  }
  if (f?.dateTo) {
    const end = new Date(f.dateTo)
    end.setHours(23, 59, 59, 999)
    where.push('writing_entries.created_at <= ?')
    params.push(end.getTime())
  }

  if (f?.minScore != null && Number.isFinite(f.minScore)) {
    where.push('latest.latest_overall IS NOT NULL AND latest.latest_overall >= ?')
    params.push(Math.round(Number(f.minScore)))
  }
  if (f?.maxScore != null && Number.isFinite(f.maxScore)) {
    where.push('latest.latest_overall IS NOT NULL AND latest.latest_overall <= ?')
    params.push(Math.round(Number(f.maxScore)))
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const fromSql = `
    writing_entries
    LEFT JOIN (
      SELECT entry_id, overall_score AS latest_overall
      FROM (
        SELECT entry_id, overall_score,
          ROW_NUMBER() OVER (PARTITION BY entry_id ORDER BY scored_at DESC, id DESC) AS rn
        FROM writing_scores
      ) ranked
      WHERE ranked.rn = 1
    ) latest ON latest.entry_id = writing_entries.id
  `

  const countRow = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM ${fromSql} ${whereSql}`,
    ...params,
  )
  const total = Number(countRow?.c ?? 0)

  const rows = await db.getAllAsync<{
    id: number
    user_id: string
    title: string
    content: string
    created_at: number
    word_count: number
    submitted_at: number | null
    draft: number
    category: string
    remote_id: string | null
    latest_overall: number | null
  }>(
    `
    SELECT writing_entries.id, writing_entries.user_id, writing_entries.title, writing_entries.content,
           writing_entries.created_at, writing_entries.word_count, writing_entries.submitted_at,
           writing_entries.draft, writing_entries.category, writing_entries.remote_id,
           latest.latest_overall
    FROM ${fromSql}
    ${whereSql}
    ORDER BY writing_entries.created_at DESC
    LIMIT ? OFFSET ?
  `,
    ...params,
    limit,
    offset,
  )

  return {
    entries: rows.map((r) => ({
      ...mapEntry(r),
      latestOverallScore: r.latest_overall != null ? Number(r.latest_overall) : null,
    })),
    total,
    limit,
    offset,
    hasMore: offset + rows.length < total,
  }
}

export type ScoreTrendPoint = { dayKey: string; label: string; score: number | null }

/**
 * One point per calendar day for the last `days` days; score carries forward from last known submission.
 */
export async function getScoreTrendLastDays(
  userId: string | null | undefined,
  days = 30,
): Promise<ScoreTrendPoint[]> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const startMs = Date.now() - days * 24 * 60 * 60 * 1000

  const rows = await db.getAllAsync<{ overall_score: number; scored_at: number }>(
    `
    SELECT ws.overall_score, ws.scored_at
    FROM writing_scores ws
    INNER JOIN writing_entries we ON we.id = ws.entry_id
    WHERE (we.user_id = ? OR (? = '' AND we.user_id = ''))
      AND ws.scored_at >= ?
    ORDER BY ws.scored_at ASC
  `,
    uid,
    uid,
    startMs,
  )

  const bestByDay = new Map<string, number>()
  for (const r of rows) {
    const key = localDayKey(r.scored_at)
    const prev = bestByDay.get(key)
    const v = Number(r.overall_score)
    if (prev == null || v > prev) bestByDay.set(key, v)
  }

  const out: ScoreTrendPoint[] = []
  let carry: number | null = null
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const key = localDayKey(d.getTime())
    const todayVal = bestByDay.get(key)
    if (todayVal != null) carry = todayVal
    out.push({
      dayKey: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      score: todayVal ?? carry,
    })
  }

  return out
}

export async function getWritingEntryById(
  entryId: number,
  userId?: string | null,
): Promise<WritingJournalEntry | null> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const row = await db.getFirstAsync<{
    id: number
    user_id: string
    title: string
    content: string
    created_at: number
    word_count: number
    submitted_at: number | null
    draft: number
    category: string
    remote_id: string | null
  }>('SELECT * FROM writing_entries WHERE id = ?', entryId)

  if (!row) return null
  if (uid !== '' && row.user_id !== uid) return null
  return mapEntry(row)
}

export async function setWritingEntryRemoteId(
  entryId: number,
  userId: string | null | undefined,
  remoteId: string,
): Promise<void> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  await db.runAsync(
    'UPDATE writing_entries SET remote_id = ? WHERE id = ? AND user_id = ?',
    remoteId,
    entryId,
    uid,
  )
}

/** Full entry plus every score and linked feedback (progress over time). */
export async function getEntryWithFeedback(
  entryId: number,
  userId?: string | null,
): Promise<EntryWithFeedback | null> {
  const uid = normalizeUserId(userId)
  const db = await getDb()

  const entryRow = await db.getFirstAsync<{
    id: number
    user_id: string
    title: string
    content: string
    created_at: number
    word_count: number
    submitted_at: number | null
    draft: number
    category: string
  }>('SELECT * FROM writing_entries WHERE id = ?', entryId)

  if (!entryRow) return null
  if (uid !== '' && entryRow.user_id !== uid) return null

  const scoreRows = await db.getAllAsync<{
    id: number
    entry_id: number
    overall_score: number
    grammar_score: number
    vocab_score: number
    pronunciation_score: number
    fluency_score: number
    cecr: string
    ai_provider: string
    scored_at: number
  }>(
    `SELECT * FROM writing_scores WHERE entry_id = ? ORDER BY scored_at ASC, id ASC`,
    entryId,
  )

  const scores: EntryWithFeedback['scores'] = []
  for (const sr of scoreRows) {
    const fbRow = await db.getFirstAsync<{
      id: number
      score_id: number
      feedback_text: string
      error_examples_json: string
      suggestions_json: string
    }>('SELECT * FROM writing_feedback WHERE score_id = ? LIMIT 1', sr.id)

    scores.push({
      score: mapScore(sr),
      feedback: fbRow ? mapFeedback(fbRow) : null,
    })
  }

  return {
    entry: mapEntry(entryRow),
    scores,
  }
}

/**
 * Deletes entry and cascades scores + feedback (SQLite FK).
 */
export async function deleteEntry(entryId: number, userId?: string | null): Promise<boolean> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  if (uid !== '') {
    const r = await db.runAsync('DELETE FROM writing_entries WHERE id = ? AND user_id = ?', entryId, uid)
    return r.changes > 0
  }
  const r = await db.runAsync('DELETE FROM writing_entries WHERE id = ?', entryId)
  return r.changes > 0
}
