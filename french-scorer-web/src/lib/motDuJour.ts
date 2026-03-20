/**
 * Mot du jour — CEFR-matched, date-seeded rotation (same word for all users at that level each day).
 * Data: /public/assets/mots-du-jour/bank.json
 */

import { localDateKey } from './readingRoomMissionStorage'

export type MotDuJourLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type MotDuJourEntry = {
  level: MotDuJourLevel
  wordFr: string
  /** IPA or approx pronunciation hint */
  ipa?: string
  /** e.g. nom féminin */
  pos?: string
  definitionFr: string
  definitionEn: string
  exampleFr: string
  /** Substring of exampleFr to render in bold (usually the headword or inflected form) */
  highlightFr: string
  exampleEn: string
  /** Optional read-more link */
  moreUrl?: string
  /** Unsplash search or fixed image URL */
  imageUrl?: string
}

type BankFile = { words: MotDuJourEntry[] }

const CACHE_KEY = 'mot_du_jour_cache_v1'

function baseUrl(): string {
  const b = import.meta.env.BASE_URL || '/'
  return b.endsWith('/') ? b : `${b}/`
}

export function normalizeMotLevel(raw: string): MotDuJourLevel {
  const u = raw.toUpperCase().trim()
  if (u.startsWith('A1')) return 'A1'
  if (u.startsWith('A2')) return 'A2'
  if (u.startsWith('B1')) return 'B1'
  if (u.startsWith('B2')) return 'B2'
  if (u.startsWith('C1') || u.startsWith('C2')) return 'C1'
  return 'B1'
}

/** Same calendar seed as StoryMatcher / oral missions. */
export function dailyMotRotationIndex(level: MotDuJourLevel, count: number, date = new Date()): number {
  if (count <= 0) return 0
  const y = date.getFullYear()
  const mo = date.getMonth() + 1
  const da = date.getDate()
  const seed = `${y}-${mo}-${da}-mot-${level}`
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % count
}

const FALLBACK: Record<MotDuJourLevel, MotDuJourEntry> = {
  A1: {
    level: 'A1',
    wordFr: 'bonjour',
    ipa: '/bɔ̃.ʒuʁ/',
    pos: 'interjection',
    definitionFr: 'Salutation utilisée le matin ou de façon neutre dans la journée.',
    definitionEn: 'Greeting used in the morning or neutrally during the day.',
    exampleFr: 'Bonjour, comment allez-vous ?',
    highlightFr: 'Bonjour',
    exampleEn: 'Hello, how are you?',
  },
  A2: {
    level: 'A2',
    wordFr: 'rendez-vous',
    ipa: '/ʁɑ̃.de.vu/',
    pos: 'nom masculin',
    definitionFr: 'Une rencontre prévue à une heure précise.',
    definitionEn: 'A meeting planned for a specific time.',
    exampleFr: "J'ai un rendez-vous chez le médecin à quinze heures.",
    highlightFr: 'rendez-vous',
    exampleEn: 'I have a doctor’s appointment at three p.m.',
  },
  B1: {
    level: 'B1',
    wordFr: 'éphémère',
    ipa: '/e.fe.mɛʁ/',
    pos: 'adjectif',
    definitionFr: 'Qui ne dure qu’un très court moment ; passager.',
    definitionEn: 'Lasting only a very short time; fleeting.',
    exampleFr: 'La beauté des cerisiers en fleurs est éphémère.',
    highlightFr: 'éphémère',
    exampleEn: 'The beauty of cherry blossoms is fleeting.',
    moreUrl: 'https://fr.wikipedia.org/wiki/%C3%89ph%C3%A9m%C3%A8re',
  },
  B2: {
    level: 'B2',
    wordFr: 'nuancer',
    ipa: '/nyɑ̃.se/',
    pos: 'verbe',
    definitionFr: 'Apporter des distinctions subtiles ; moduler un propos pour éviter une vision trop tranchée.',
    definitionEn: 'To add subtle distinctions; to qualify a statement.',
    exampleFr: 'Il faut nuancer ce jugement : la situation est plus complexe.',
    highlightFr: 'nuancer',
    exampleEn: 'We should qualify that judgment: the situation is more complex.',
  },
  C1: {
    level: 'C1',
    wordFr: 'rescision',
    ipa: '/ʁes.si.zjɔ̃/',
    pos: 'nom féminin',
    definitionFr: 'Annulation d’un contrat avec effet rétroactif, selon les cas prévus par la loi.',
    definitionEn: 'Rescission of a contract with retroactive effect where the law allows.',
    exampleFr: 'Les parties ont demandé la rescision du bail pour vice du consentement.',
    highlightFr: 'rescision',
    exampleEn: 'The parties sought rescission of the lease for defective consent.',
  },
}

async function fetchBank(): Promise<MotDuJourEntry[]> {
  const res = await fetch(`${baseUrl()}assets/mots-du-jour/bank.json`)
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as BankFile
  if (!data.words || !Array.isArray(data.words)) throw new Error('Invalid bank')
  return data.words.filter((w) => w.wordFr && w.definitionFr && w.exampleFr && w.highlightFr)
}

function poolForLevel(entries: MotDuJourEntry[], level: MotDuJourLevel): MotDuJourEntry[] {
  const exact = entries.filter((e) => e.level === level)
  if (exact.length > 0) return exact
  const stepDown: MotDuJourLevel[] = ['B1', 'A2', 'A1']
  for (const lv of stepDown) {
    if (level === lv) continue
    const p = entries.filter((e) => e.level === lv)
    if (p.length) return p
  }
  return entries.length ? entries : [FALLBACK[level]]
}

type CacheShape = { dateKey: string; level: MotDuJourLevel; entry: MotDuJourEntry }

export async function getMotDuJour(userLevelRaw: string): Promise<MotDuJourEntry> {
  const level = normalizeMotLevel(userLevelRaw)
  const today = localDateKey()

  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const c = JSON.parse(raw) as CacheShape
      if (c.dateKey === today && c.level === level && c.entry?.wordFr) return c.entry
    }
  } catch {
    /* */
  }

  let entry: MotDuJourEntry
  try {
    const all = await fetchBank()
    const pool = poolForLevel(all, level)
    const idx = dailyMotRotationIndex(level, pool.length)
    entry = pool[idx]!
  } catch {
    entry = FALLBACK[level]
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ dateKey: today, level, entry }))
  } catch {
    /* */
  }

  return entry
}

export const MOT_BOOKMARKS_KEY = 'mot_du_jour_bookmarks_v1'

export function isWordBookmarked(wordFr: string): boolean {
  try {
    const raw = localStorage.getItem(MOT_BOOKMARKS_KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(list)) return false
    return list.includes(wordFr)
  } catch {
    return false
  }
}

export function toggleWordBookmark(wordFr: string): boolean {
  try {
    const raw = localStorage.getItem(MOT_BOOKMARKS_KEY)
    const list = raw ? ([...(JSON.parse(raw) as unknown[])] as string[]) : []
    const i = list.indexOf(wordFr)
    if (i >= 0) {
      list.splice(i, 1)
      localStorage.setItem(MOT_BOOKMARKS_KEY, JSON.stringify(list))
      return false
    }
    list.push(wordFr)
    localStorage.setItem(MOT_BOOKMARKS_KEY, JSON.stringify(list.slice(-200)))
    return true
  } catch {
    return false
  }
}

/** Speak the headword in French (browser TTS). */
export function speakMotDuJour(wordFr: string): void {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(wordFr)
    u.lang = 'fr-FR'
    u.rate = 0.92
    window.speechSynthesis.speak(u)
  } catch {
    /* */
  }
}
