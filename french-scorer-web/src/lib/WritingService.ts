/**
 * WritingService — daily level-matched writing topic via Gemini (backend) + local 24h cache.
 * Midnight refresh: cache key includes calendar date; stale dates are refetched automatically.
 */

import { getApiBaseUrl } from './apiBase'
import { localDateKey } from './readingRoomMissionStorage'

export type GrammarFocusItem = {
  label: string
  masteryPercent: number
}

export type DailyWritingTopic = {
  title: string
  description: string
  grammarFocus: GrammarFocusItem[]
  curatorTip: string
  tags: string[]
  level: string
}

const CACHE_KEY = 'writing_service_daily_topic_v1'

type TopicCache = {
  dateKey: string
  level: string
  topic: DailyWritingTopic
}

export function normalizeWritingLevel(raw: string): string {
  const u = raw.toUpperCase().trim()
  if (u.startsWith('A1')) return 'A1'
  if (u.startsWith('A2')) return 'A2'
  if (u.startsWith('B1')) return 'B1'
  if (u.startsWith('B2')) return 'B2'
  if (u.startsWith('C1') || u.startsWith('C2')) return 'C1'
  return 'B1'
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 72
  return Math.max(40, Math.min(95, Math.round(n)))
}

function normalizeTopic(raw: unknown, level: string): DailyWritingTopic {
  const o = raw as Record<string, unknown>
  const title = String(o?.title ?? '').trim()
  const description = String(o?.description ?? '').trim()
  const curatorTip = String(o?.curatorTip ?? '').trim()
  const tags = Array.isArray(o?.tags) ? o.tags.map((t) => String(t).trim()).filter(Boolean) : []
  let grammarFocus: GrammarFocusItem[] = Array.isArray(o?.grammarFocus)
    ? (o.grammarFocus as unknown[])
        .map((g) => {
          const x = g as Record<string, unknown>
          return {
            label: String(x?.label ?? '').trim(),
            masteryPercent: clampPct(Number(x?.masteryPercent)),
          }
        })
        .filter((g) => g.label.length > 0)
    : []

  while (grammarFocus.length < 3) {
    grammarFocus.push({ label: 'Structures de base', masteryPercent: 70 })
  }
  grammarFocus = grammarFocus.slice(0, 3)

  while (tags.length < 2) tags.push('PRATIQUE')
  return {
    title: title || `Composition — niveau ${level}`,
    description:
      description ||
      'Write a short paragraph in French following the instructions above. Use connectors and check agreements.',
    grammarFocus,
    curatorTip:
      curatorTip ||
      'Relisez chaque phrase en vérifiant le genre et le nombre des adjectifs et des participes passés.',
    tags: tags.slice(0, 2),
    level,
  }
}

export function buildFallbackDailyTopic(level: string): DailyWritingTopic {
  const L = normalizeWritingLevel(level)
  const byLevel: Record<string, Omit<DailyWritingTopic, 'level'>> = {
    A1: {
      title: 'Ma journée',
      description:
        'Write 5–7 short sentences in French about your typical day. Use present tense only. Mention two activities and one time expression.',
      grammarFocus: [
        { label: 'Present tense (être / avoir)', masteryPercent: 78 },
        { label: 'Articles (un / une / le / la)', masteryPercent: 65 },
        { label: 'Word order in simple sentences', masteryPercent: 82 },
      ],
      curatorTip:
        'Start each sentence with a subject (Je, Il, Elle…), then the verb, then the rest. Keep sentences short.',
      tags: ["AUJOURD'HUI", 'ROUTINE'],
    },
    A2: {
      title: 'Le week-end dernier',
      description:
        'Describe what you did last weekend in 8–10 sentences. Use passé composé for completed actions and include at least one time expression (samedi, dimanche, etc.).',
      grammarFocus: [
        { label: 'Passé composé (avoir)', masteryPercent: 72 },
        { label: 'Time expressions', masteryPercent: 68 },
        { label: 'Connectors (puis, ensuite)', masteryPercent: 55 },
      ],
      curatorTip:
        'For most verbs, passé composé uses auxiliary avoir: j’ai mangé, nous avons visité. Watch être for movement verbs like aller.',
      tags: ['WEEK-END', 'PASSÉ'],
    },
    B1: {
      title: 'Un voyage mémorable',
      description:
        'Write 120–180 words about a memorable trip. Use past tenses appropriately and express an opinion in the final sentence.',
      grammarFocus: [
        { label: 'Passé composé vs imparfait', masteryPercent: 70 },
        { label: 'Opinion phrases (je pense que…)', masteryPercent: 62 },
        { label: 'Prepositions of place', masteryPercent: 58 },
      ],
      curatorTip:
        'Use imparfait for background (Il faisait beau…) and passé composé for discrete events (Nous sommes partis…).',
      tags: ["L'ÉTÉ", 'VOYAGE'],
    },
    B2: {
      title: 'Argument court : télétravail',
      description:
        'In 180–220 words, argue for or against remote work. Structure with an introduction, two arguments, and a conclusion.',
      grammarFocus: [
        { label: 'Subjunctive after il faut que', masteryPercent: 52 },
        { label: 'Connectors (bien que, cependant)', masteryPercent: 64 },
        { label: 'Formal register', masteryPercent: 71 },
      ],
      curatorTip:
        'After bien que, use the subjunctive: bien que ce soit…. Pair it with indicative facts in the main clause.',
      tags: ['TRAVAIL', 'SOCIÉTÉ'],
    },
    C1: {
      title: 'Synthèse critique',
      description:
        'Write 220–280 words analyzing how digital media shapes language learning. Nuance your thesis and use at least one hypothetical construction.',
      grammarFocus: [
        { label: 'Hypothesis (conditionnel / si clauses)', masteryPercent: 58 },
        { label: 'Nominalisation', masteryPercent: 66 },
        { label: 'Relative clauses (lequel / où)', masteryPercent: 61 },
      ],
      curatorTip:
        'Vary sentence openings: participial phrases, inversion for emphasis, and embedded clauses to avoid a list-like tone.',
      tags: ['MÉDIAS', 'LANGUE'],
    },
  }
  const core = byLevel[L] ?? byLevel.B1
  return { ...core, level: L }
}

async function fetchDailyTopicFromApi(level: string): Promise<DailyWritingTopic | null> {
  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/api/writing/daily-topic`
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    })
    const data = (await resp.json().catch(() => ({}))) as { topic?: unknown; error?: string }
    if (!resp.ok) return null
    if (data?.topic) return normalizeTopic(data.topic, level)
  } catch {
    return null
  }
  return null
}

function readCache(level: string, today: string): DailyWritingTopic | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as TopicCache
    if (c.dateKey === today && c.level === level && c.topic) return normalizeTopic(c.topic, level)
  } catch {
    return null
  }
  return null
}

function writeCache(level: string, today: string, topic: DailyWritingTopic): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ dateKey: today, level, topic }))
  } catch {
    /* quota */
  }
}

/**
 * Returns today's topic for the user's CEFR band, using cache or API, then fallback.
 */
export async function ensureDailyTopic(userLevelRaw: string): Promise<{
  topic: DailyWritingTopic
  source: 'cache' | 'api' | 'fallback'
}> {
  const level = normalizeWritingLevel(userLevelRaw)
  const today = localDateKey()

  const cached = readCache(level, today)
  if (cached) return { topic: cached, source: 'cache' }

  const fromApi = await fetchDailyTopicFromApi(level)
  if (fromApi) {
    writeCache(level, today, fromApi)
    return { topic: fromApi, source: 'api' }
  }

  const fallback = buildFallbackDailyTopic(level)
  writeCache(level, today, fallback)
  return { topic: fallback, source: 'fallback' }
}

/** Public alias — triggers same pipeline (cache / API / fallback). */
export async function generateDailyTopic(userLevelRaw: string): Promise<DailyWritingTopic> {
  const { topic } = await ensureDailyTopic(userLevelRaw)
  return topic
}
