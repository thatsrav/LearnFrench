import { localDateKey } from './readingRoomMissionStorage'

const LISTENING_DONE = 'oral_listening_mission_done_v1'
const SPEAKING_DONE = 'oral_speaking_mission_done_v1'

type DayLevel = { dateKey: string; level: string }

function normLevel(raw: string): string {
  const u = raw.toUpperCase().trim()
  if (u.startsWith('A1')) return 'A1'
  if (u.startsWith('A2')) return 'A2'
  if (u.startsWith('B1')) return 'B1'
  if (u.startsWith('B2')) return 'B2'
  if (u.startsWith('C1') || u.startsWith('C2')) return 'C1'
  return 'B1'
}

function readRec(key: string): DayLevel | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const o = JSON.parse(raw) as DayLevel
    if (!o.dateKey || !o.level) return null
    return o
  } catch {
    return null
  }
}

function writeRec(key: string, level: string): void {
  try {
    localStorage.setItem(key, JSON.stringify({ dateKey: localDateKey(), level: normLevel(level) }))
  } catch {
    /* */
  }
}

export function isListeningMissionLockedToday(userLevel: string): boolean {
  const r = readRec(LISTENING_DONE)
  if (!r) return false
  return r.dateKey === localDateKey() && r.level === normLevel(userLevel)
}

export function isSpeakingMissionLockedToday(userLevel: string): boolean {
  const r = readRec(SPEAKING_DONE)
  if (!r) return false
  return r.dateKey === localDateKey() && r.level === normLevel(userLevel)
}

export function markListeningMissionComplete(userLevel: string): void {
  writeRec(LISTENING_DONE, userLevel)
}

export function markSpeakingMissionComplete(userLevel: string): void {
  writeRec(SPEAKING_DONE, userLevel)
}
