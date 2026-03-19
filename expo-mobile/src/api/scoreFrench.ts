import { getApiBaseUrl } from '../lib/config'

/** Must match backend `server.js` provider values. */
export type ScoreProvider = 'auto' | 'gemini' | 'groq' | 'openai' | 'claude'

export type FrenchScore = {
  score: number
  cecr: string
  strengths: string[]
  improvements: string[]
  corrected_version: string
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
    result: data.result,
    providerUsed: String(data?.provider ?? ''),
  }
}
