const ENABLED_KEY = 'atelier:soundFxEnabled'
const VOLUME_KEY = 'atelier:soundFxVolume'

export const SOUND_SETTINGS_EVENT = 'atelier:sound-settings'

export function getSoundFxEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ENABLED_KEY) !== 'false'
}

export function setSoundFxEnabled(value: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENABLED_KEY, String(value))
  window.dispatchEvent(new CustomEvent(SOUND_SETTINGS_EVENT))
}

export function getSoundFxVolume(): number {
  if (typeof window === 'undefined') return 0.75
  const raw = localStorage.getItem(VOLUME_KEY)
  if (raw === null) return 0.75
  const n = Number(raw)
  if (!Number.isFinite(n)) return 0.75
  return Math.min(1, Math.max(0, n))
}

export function setSoundFxVolume(value: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VOLUME_KEY, String(Math.min(1, Math.max(0, value))))
  window.dispatchEvent(new CustomEvent(SOUND_SETTINGS_EVENT))
}
