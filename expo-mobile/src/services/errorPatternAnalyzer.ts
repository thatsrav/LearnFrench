/**
 * Recurring mistake patterns from writing journal AI feedback (keyword / regex — no external NLP).
 */

import { getDb } from '../database/database'
import type { CEFRLevel } from '../lib/curriculum'

export type ErrorCategory =
  | 'grammar'
  | 'verb-tense'
  | 'adjective-agreement'
  | 'vocabulary'
  | 'syntax'

export type TimeRange = 'week' | 'month' | 'all'

export type ErrorPattern = {
  errorType: ErrorCategory
  frequency: number
  examples: string[]
  suggestions: string[]
  /** 0–1: higher with more hits and more distinct scoring sessions */
  confidence: number
  practiceLessons: Array<{ unitId: string; level: CEFRLevel; title: string }>
}

export type RecurringMistake = {
  errorType: ErrorCategory
  label: string
  frequency: number
  confidence: number
  practiceLessons: Array<{ unitId: string; level: CEFRLevel; title: string }>
}

const DISPLAY_LABEL: Record<ErrorCategory, string> = {
  grammar: 'grammar',
  'verb-tense': 'verb tenses',
  'adjective-agreement': 'gender agreement',
  vocabulary: 'vocabulary',
  syntax: 'sentence structure',
}

/** Regexes (case-insensitive) → category. Order matters for tie-break (earlier wins). */
const RULES: { type: ErrorCategory; patterns: RegExp[] }[] = [
  {
    type: 'verb-tense',
    patterns: [
      /\bverb\b.*\b(agreement|tense|conjugat)/i,
      /\bsubject[- ]verb\b/i,
      /\bpast tense\b/i,
      /\b(imperfect|passé composé|subjunctive|conditional|future)\b/i,
      /\bconjugat/i,
      /\bauxiliary\b.*\b(avoir|être)\b/i,
      /\bwrong (verb|tense)\b/i,
      /\binconsistent tense\b/i,
    ],
  },
  {
    type: 'adjective-agreement',
    patterns: [
      /\badjective\b.*\b(agreement|gender)\b/i,
      /\bgender agreement\b/i,
      /\bmasculine\b.*\bfeminine\b/i,
      /\baccord\b/i,
      /\bplural agreement\b/i,
      /\bdeterminer\b.*\b(agreement|match)\b/i,
      /\barticle\b.*\b(gender|agreement)\b/i,
    ],
  },
  {
    type: 'vocabulary',
    patterns: [
      /\bvocabular/i,
      /\bword choice\b/i,
      /\bfalse friend\b/i,
      /\bregister\b/i,
      /\b(collocation|idiom)\b/i,
      /\bmore natural (word|expression)\b/i,
      /\bspelling\b/i,
    ],
  },
  {
    type: 'syntax',
    patterns: [
      /\bsyntax\b/i,
      /\bword order\b/i,
      /\bsentence structure\b/i,
      /\bclause\b/i,
      /\bsubordinate\b/i,
      /\binversion\b/i,
      /\bfragment\b/i,
      /\brun-on\b/i,
    ],
  },
  {
    type: 'grammar',
    patterns: [
      /\bgrammar\b/i,
      /\bagreement\b/i,
      /\bpreposition\b/i,
      /\bpronoun\b/i,
      /\bnegation\b/i,
      /\barticle\b/i,
      /\bnumber agreement\b/i,
    ],
  },
]

/** Suggested practice units per error family (SQLite / lesson ids). */
const PRACTICE_BY_TYPE: Record<ErrorCategory, Array<{ unitId: string; level: CEFRLevel; title: string }>> = {
  grammar: [
    { unitId: 'a1-u1', level: 'A1', title: 'Bonjour Basics' },
    { unitId: 'a1-u3', level: 'A1', title: 'Daily Routine' },
  ],
  'verb-tense': [
    { unitId: 'a2-u1', level: 'A2', title: 'Past Events' },
    { unitId: 'a1-u3', level: 'A1', title: 'Daily Routine' },
  ],
  'adjective-agreement': [
    { unitId: 'a1-u2', level: 'A1', title: 'Family and Friends' },
    { unitId: 'a1-u4', level: 'A1', title: 'Food and Cafe' },
  ],
  vocabulary: [
    { unitId: 'a1-u4', level: 'A1', title: 'Food and Cafe' },
    { unitId: 'a1-u5', level: 'A1', title: 'Directions in Town' },
  ],
  syntax: [
    { unitId: 'a2-u5', level: 'A2', title: 'Plans and Opinions' },
    { unitId: 'a1-u1', level: 'A1', title: 'Bonjour Basics' },
  ],
}

/** Lesson links for a single feedback blob (journal detail / CTAs). */
export function getPracticeLessonsForFeedback(feedbackText: string): Array<{
  unitId: string
  level: CEFRLevel
  title: string
}> {
  const cat = categorizeErrors(feedbackText)
  return PRACTICE_BY_TYPE[cat]
}

function normalizeUserId(userId: string | null | undefined): string {
  return userId?.trim() ?? ''
}

function msForRange(range: TimeRange | undefined): number | null {
  if (!range || range === 'all') return null
  const day = 24 * 60 * 60 * 1000
  return range === 'week' ? 7 * day : 30 * day
}

function extractBulletLines(text: string): string[] {
  const lines = text.split(/\n+/)
  const out: string[] = []
  for (const line of lines) {
    const t = line.replace(/^[\s•\-*]+/, '').trim()
    if (t.length >= 12) out.push(t)
  }
  return out.slice(0, 40)
}

/**
 * Primary category for a block of feedback (best keyword match).
 */
export function categorizeErrors(feedbackText: string): ErrorCategory {
  const blob = feedbackText.toLowerCase()
  let best: ErrorCategory = 'grammar'
  let bestScore = 0

  for (const { type, patterns } of RULES) {
    let s = 0
    for (const re of patterns) {
      re.lastIndex = 0
      const m = blob.match(re)
      if (m) s += 1 + Math.min(2, m[0].length / 40)
    }
    if (s > bestScore) {
      bestScore = s
      best = type
    }
  }
  return best
}

/**
 * All categories that match this text (for multi-label counting).
 */
function categoriesInText(feedbackText: string): ErrorCategory[] {
  const blob = feedbackText.toLowerCase()
  const hit = new Set<ErrorCategory>()
  for (const { type, patterns } of RULES) {
    for (const re of patterns) {
      re.lastIndex = 0
      if (re.test(blob)) {
        hit.add(type)
        break
      }
    }
  }
  if (hit.size === 0) hit.add('grammar')
  return [...hit]
}

function confidenceForPattern(freq: number, distinctSessions: number): number {
  const base = Math.min(1, freq / 8) * 0.55 + Math.min(1, distinctSessions / 5) * 0.45
  if (freq < 2) return Math.round(Math.min(0.45, base) * 100) / 100
  if (freq < 4) return Math.round(Math.min(0.72, base) * 100) / 100
  return Math.round(Math.min(0.95, base) * 100) / 100
}

async function loadFeedbackBlobs(
  userId: string,
  timeRange?: TimeRange,
): Promise<{ combinedText: string; suggestions: string[]; scoreId: number }[]> {
  const uid = normalizeUserId(userId)
  const db = await getDb()
  const windowMs = msForRange(timeRange)
  const now = Date.now()
  const minTs = windowMs != null ? now - windowMs : null

  const baseWhere = '(we.user_id = ? OR (? = \'\' AND we.user_id = \'\'))'
  const sql =
    minTs != null
      ? `
    SELECT wf.feedback_text, wf.suggestions_json, wf.error_examples_json, wf.score_id
    FROM writing_feedback wf
    INNER JOIN writing_scores ws ON ws.id = wf.score_id
    INNER JOIN writing_entries we ON we.id = ws.entry_id
    WHERE ${baseWhere} AND ws.scored_at >= ?
    ORDER BY ws.scored_at DESC
  `
      : `
    SELECT wf.feedback_text, wf.suggestions_json, wf.error_examples_json, wf.score_id
    FROM writing_feedback wf
    INNER JOIN writing_scores ws ON ws.id = wf.score_id
    INNER JOIN writing_entries we ON we.id = ws.entry_id
    WHERE ${baseWhere}
    ORDER BY ws.scored_at DESC
  `

  const params = minTs != null ? [uid, uid, minTs] : [uid, uid]
  const rows = await db.getAllAsync<{
    feedback_text: string
    suggestions_json: string
    error_examples_json: string
    score_id: number
  }>(sql, ...params)

  return rows.map((r) => {
    let suggestions: string[] = []
    try {
      const v = JSON.parse(r.suggestions_json) as unknown
      if (Array.isArray(v)) suggestions = v.map(String)
    } catch {
      suggestions = []
    }
    let examples: string[] = []
    try {
      const v = JSON.parse(r.error_examples_json) as unknown
      if (Array.isArray(v)) examples = v.map(String)
    } catch {
      examples = []
    }
    return {
      combinedText: `${r.feedback_text}\n${suggestions.join('\n')}\n${examples.join('\n')}`,
      suggestions,
      scoreId: r.score_id,
    }
  })
}

/**
 * Aggregate patterns across journal feedback for the user.
 */
export async function analyzeErrorPatterns(
  userId: string,
  timeRange?: TimeRange,
): Promise<ErrorPattern[]> {
  const blobs = await loadFeedbackBlobs(userId, timeRange)
  if (blobs.length === 0) return []

  const byType = new Map<
    ErrorCategory,
    { count: number; examples: string[]; suggestions: Set<string>; sessions: Set<number> }
  >()

  for (const row of blobs) {
    const text = row.combinedText
    const cats = categoriesInText(text)
    const bullets = extractBulletLines(text)

    for (const cat of cats) {
      const cur = byType.get(cat) ?? {
        count: 0,
        examples: [] as string[],
        suggestions: new Set<string>(),
        sessions: new Set<number>(),
      }
      cur.count += 1
      cur.sessions.add(row.scoreId)
      for (const s of row.suggestions) {
        if (s.trim()) cur.suggestions.add(s.trim())
      }
      for (const b of bullets) {
        if (categoriesInText(b).includes(cat) && cur.examples.length < 5) {
          cur.examples.push(b.length > 160 ? `${b.slice(0, 157)}…` : b)
        }
      }
      if (cur.examples.length < 3) {
        const fallback = bullets.find((b) => b.length > 15)
        if (fallback && !cur.examples.includes(fallback))
          cur.examples.push(fallback.length > 160 ? `${fallback.slice(0, 157)}…` : fallback)
      }
      byType.set(cat, cur)
    }
  }

  const patterns: ErrorPattern[] = []
  for (const [errorType, agg] of byType) {
    const suggestions = [...agg.suggestions].slice(0, 6)
    const examples = [...new Set(agg.examples)].slice(0, 5)
    patterns.push({
      errorType,
      frequency: agg.count,
      examples,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : [
              `Review ${DISPLAY_LABEL[errorType]} in your next short writing.`,
              'Try the linked lesson, then rewrite one paragraph applying the rule.',
            ],
      confidence: confidenceForPattern(agg.count, agg.sessions.size),
      practiceLessons: PRACTICE_BY_TYPE[errorType],
    })
  }

  patterns.sort((a, b) => b.frequency - a.frequency || b.confidence - a.confidence)
  return patterns
}

/**
 * Top 5 recurring mistake categories by frequency.
 */
export async function getRecurringMistakes(userId: string): Promise<RecurringMistake[]> {
  const patterns = await analyzeErrorPatterns(userId, 'all')
  return patterns.slice(0, 5).map((p) => ({
    errorType: p.errorType,
    label: DISPLAY_LABEL[p.errorType],
    frequency: p.frequency,
    confidence: p.confidence,
    practiceLessons: p.practiceLessons,
  }))
}

/**
 * Short coaching tips from analyzed patterns (highest-impact first).
 */
export function generatePersonalizedTips(patterns: ErrorPattern[]): string[] {
  if (patterns.length === 0) {
    return ['Score a few journal entries with the AI to unlock personalized tips.']
  }

  const tips: string[] = []
  const top = patterns.slice(0, 4)

  for (const p of top) {
    const label = DISPLAY_LABEL[p.errorType]
    if (p.confidence >= 0.55) {
      tips.push(
        `Focus on ${label}: it showed up in ${p.frequency} recent feedback ${p.frequency === 1 ? 'pass' : 'passes'} — drill the linked lesson, then write 3–5 sentences using that pattern only.`,
      )
    } else {
      tips.push(
        `Keep an eye on ${label} (${p.frequency} signal${p.frequency === 1 ? '' : 's'}) — one more week of data will sharpen this tip.`,
      )
    }
  }

  if (tips.length < 2 && top[0]) {
    tips.push(
      `Quick win: copy one “Improvements” bullet from your journal and rewrite it correctly out loud, then in writing.`,
    )
  }

  return tips.slice(0, 6)
}
