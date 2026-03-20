/**
 * StoryMatcher — level filtering + date-seeded daily rotation.
 * Stories live under `/public/assets/stories/` and are listed in `manifest.json`.
 */

export type StoryCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type GrammarMarker = {
  id: string
  sentenceIndex: number
  label: string
  explanation: string
}

export type StorySentence = {
  fr: string
  en: string
  /** Start time in seconds (audio sync). */
  start: number
  /** End time in seconds. */
  end: number
}

export type StoryPayload = {
  id: string
  level: StoryCefrLevel
  title: string
  /** e.g. chapter label */
  chapter?: string
  /** Optional; when empty, ReadingRoom uses a mock clock for demo sync. */
  audioUrl: string | null
  sentences: StorySentence[]
  grammarMarkers: GrammarMarker[]
  vocabulary: { fr: string; en: string }[]
}

export type ManifestItem = {
  level: StoryCefrLevel
  file: string
}

export type StoryManifest = {
  version: number
  items: ManifestItem[]
}

function baseUrl(): string {
  const b = import.meta.env.BASE_URL || '/'
  return b.endsWith('/') ? b : `${b}/`
}

/** Deterministic index 0..count-1 from local date + level (all users at level see same story today). */
export function dailyRotationIndex(level: StoryCefrLevel, count: number, date = new Date()): number {
  if (count <= 0) return 0
  const y = date.getFullYear()
  const mo = date.getMonth() + 1
  const da = date.getDate()
  const seed = `${y}-${mo}-${da}-${level}`
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % count
}

export function normalizeUserLevel(raw: string): StoryCefrLevel {
  const u = raw.toUpperCase()
  if (u.startsWith('A1')) return 'A1'
  if (u.startsWith('A2')) return 'A2'
  if (u.startsWith('B1')) return 'B1'
  if (u.startsWith('B2')) return 'B2'
  if (u.startsWith('C1') || u.startsWith('C2')) return 'C1'
  return 'B1'
}

function isStoryPayload(x: unknown): x is StoryPayload {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  const audioOk = o.audioUrl === null || typeof o.audioUrl === 'string'
  return (
    typeof o.id === 'string' &&
    typeof o.level === 'string' &&
    typeof o.title === 'string' &&
    audioOk &&
    Array.isArray(o.sentences) &&
    Array.isArray(o.grammarMarkers) &&
    Array.isArray(o.vocabulary)
  )
}

export async function fetchManifest(): Promise<StoryManifest> {
  const res = await fetch(`${baseUrl()}assets/stories/manifest.json`)
  if (!res.ok) throw new Error(`Story manifest failed: ${res.status}`)
  const data = (await res.json()) as StoryManifest
  if (!data.items || !Array.isArray(data.items)) throw new Error('Invalid manifest')
  return data
}

export async function fetchStoryFile(file: string): Promise<StoryPayload> {
  const res = await fetch(`${baseUrl()}assets/stories/${encodeURIComponent(file)}`)
  if (!res.ok) throw new Error(`Story load failed: ${file}`)
  const data = (await res.json()) as unknown
  if (!isStoryPayload(data)) throw new Error(`Invalid story JSON: ${file}`)
  return data
}

/**
 * Resolve today's story for the user's CEFR band.
 */
export async function loadDailyStoryForUserLevel(userLevelRaw: string): Promise<StoryPayload> {
  const level = normalizeUserLevel(userLevelRaw)
  const manifest = await fetchManifest()
  const pool = manifest.items.filter((i) => i.level === level)
  if (pool.length === 0) {
    const fallback = manifest.items.filter((i) => i.level === 'B1')
    if (fallback.length === 0) throw new Error('No stories in manifest')
    const idx = dailyRotationIndex('B1', fallback.length)
    return fetchStoryFile(fallback[idx]!.file)
  }
  const idx = dailyRotationIndex(level, pool.length)
  return fetchStoryFile(pool[idx]!.file)
}

export function markersForSentence(markers: GrammarMarker[], sentenceIndex: number): GrammarMarker[] {
  return markers.filter((m) => m.sentenceIndex === sentenceIndex)
}
