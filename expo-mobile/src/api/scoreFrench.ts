import { getApiBaseUrl } from '../lib/config'

/** Must match backend `server.js` provider values. */
export type ScoreProvider = 'auto' | 'gemini' | 'groq' | 'openai' | 'claude'

export type FrenchScore = {
  score: number
  cecr: string
  grammar: number
  vocabulary: number
  pronunciation: number
  fluency: number
  strengths: string[]
  improvements: string[]
  corrected_version: string
}

function clamp100(n: unknown, fallback: number): number {
  const x = Math.round(Number(n))
  if (!Number.isFinite(x)) return fallback
  return Math.max(0, Math.min(100, x))
}

export function normalizeFrenchScore(raw: Partial<FrenchScore> & { score?: number }): FrenchScore {
  const score = clamp100(raw.score, 0)
  const fill = (v: unknown) => clamp100(v, score)
  return {
    score,
    cecr: String(raw.cecr ?? 'A1'),
    grammar: fill(raw.grammar),
    vocabulary: fill(raw.vocabulary),
    pronunciation: fill(raw.pronunciation),
    fluency: fill(raw.fluency),
    strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String) : [],
    improvements: Array.isArray(raw.improvements) ? raw.improvements.map(String) : [],
    corrected_version: String(raw.corrected_version ?? ''),
  }
}

export type ScoreFrenchResponse = {
  result: FrenchScore
  /** Which model backend actually used (e.g. `gemini`, `groq`). */
  providerUsed: string
}

/**
 * POST /api/score — server-side keys only; mobile never sends API secrets.
 */
export type ScoreFrenchOptions = {
  /** When `C1`, backend `auto` uses OpenAI → Claude preference for long/advanced essays. */
  essayLevel?: 'C1'
}

export async function scoreFrench(
  text: string,
  provider: ScoreProvider,
  options?: ScoreFrenchOptions,
): Promise<ScoreFrenchResponse> {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Please enter some French text to score.')
  }

  const apiBase = getApiBaseUrl()
  const url = `${apiBase}/api/score`

  const body: Record<string, unknown> = { text: trimmed, provider }
  if (options?.essayLevel === 'C1') {
    body.level = 'C1'
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await resp.json().catch(() => ({}))) as {
    error?: string
    result?: FrenchScore
    provider?: string
  }

  if (!resp.ok) {
    const msg = typeof data?.error === 'string' ? data.error : `Request failed (${resp.status})`
    throw new Error(msg)
  }

  if (!data?.result) {
    throw new Error('No result returned from server.')
  }

  return {
    result: normalizeFrenchScore(data.result as Partial<FrenchScore>),
    providerUsed: String(data?.provider ?? ''),
  }
}
