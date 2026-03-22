/**
 * French TTS — cloud only (OpenAI HD MP3 via french-scorer-api).
 * No browser SpeechSynthesis: quality is inconsistent and rarely sounds natural.
 *
 * Set `VITE_API_BASE_URL` to your API host; server needs `OPENAI_API_KEY` for `POST /api/tts/french`.
 */

export type FrenchBcp47 = 'fr-FR' | 'fr-CA'

/** @deprecated Accent is reserved for future server-side voice selection; cloud TTS ignores it today. */
export function listeningAccentToBcp47(accent: 'france' | 'quebec'): FrenchBcp47 {
  return accent === 'quebec' ? 'fr-CA' : 'fr-FR'
}

let cloudAudioEl: HTMLAudioElement | null = null
/** Separate from cloud TTS — bundled / static vocab MP3. */
let vocabStaticEl: HTMLAudioElement | null = null

/** Active cloud TTS element, if any (for progress UI). */
export function getFrenchWebTtsAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  return cloudAudioEl
}

/** Active static vocab audio element, if any. */
export function getFrenchVocabStaticAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  return vocabStaticEl
}

export const FRENCH_CLOUD_TTS_SETUP_HINT =
  'Pour une voix naturelle : définissez VITE_API_BASE_URL vers votre french-scorer-api et OPENAI_API_KEY sur le serveur (POST /api/tts/french).'

export function isFrenchCloudTtsConfigured(): boolean {
  return Boolean((import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim())
}

/** Stops any in-flight cloud MP3. */
export function stopFrenchWebTts(): void {
  if (typeof window === 'undefined') return
  if (cloudAudioEl) {
    cloudAudioEl.pause()
    cloudAudioEl.src = ''
    cloudAudioEl = null
  }
}

/** Stops static vocab MP3 (public/audio/vocab/…). */
export function stopFrenchVocabStaticAudio(): void {
  if (typeof window === 'undefined') return
  if (vocabStaticEl) {
    vocabStaticEl.pause()
    vocabStaticEl.src = ''
    vocabStaticEl = null
  }
}

export type PlayVocabStaticOptions = {
  onPlaybackStarted?: () => void
}

/**
 * Play a pre-generated MP3 from the site root (e.g. `/audio/vocab/bonjour.mp3`).
 * Does not call the TTS API.
 */
export async function playFrenchVocabStaticUrl(url: string, options?: PlayVocabStaticOptions): Promise<void> {
  if (typeof window === 'undefined') return
  const trimmed = url.trim()
  if (!trimmed) return

  stopFrenchVocabStaticAudio()
  stopFrenchWebTts()

  const audio = new Audio(trimmed)
  vocabStaticEl = audio
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      if (vocabStaticEl === audio) vocabStaticEl = null
      resolve()
    }
    audio.onerror = () => {
      if (vocabStaticEl === audio) vocabStaticEl = null
      reject(new Error('Lecture audio (fichier) impossible.'))
    }
    void audio
      .play()
      .then(() => {
        options?.onPlaybackStarted?.()
      })
      .catch((e) => {
        if (vocabStaticEl === audio) vocabStaticEl = null
        reject(e instanceof Error ? e : new Error(String(e)))
      })
  })
}

function getApiBase(): string {
  const b = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (!b) {
    throw new Error(FRENCH_CLOUD_TTS_SETUP_HINT)
  }
  return b
}

const MAX_TTS_CHARS = 4096

export type SpeakFrenchCloudOptions = {
  onPlaybackStarted?: () => void
}

/**
 * Play French text using OpenAI TTS on your backend. Throws if not configured or request fails.
 */
export async function speakFrenchListening(
  text: string,
  _prefer?: FrenchBcp47,
  options?: SpeakFrenchCloudOptions,
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const apiBase = getApiBase()
  if (trimmed.length > MAX_TTS_CHARS) {
    throw new Error(`Texte trop long pour la synthèse (max ${MAX_TTS_CHARS} caractères).`)
  }

  stopFrenchWebTts()
  const url = `${apiBase.replace(/\/$/, '')}/api/tts/french`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: trimmed }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(errText || `Synthèse vocale indisponible (HTTP ${res.status}).`)
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const audio = new Audio(objectUrl)
  cloudAudioEl = audio
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(objectUrl)
      if (cloudAudioEl === audio) cloudAudioEl = null
      resolve()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      if (cloudAudioEl === audio) cloudAudioEl = null
      reject(new Error('Lecture audio impossible.'))
    }
    void audio
      .play()
      .then(() => {
        options?.onPlaybackStarted?.()
      })
      .catch((e) => {
        URL.revokeObjectURL(objectUrl)
        if (cloudAudioEl === audio) cloudAudioEl = null
        reject(e instanceof Error ? e : new Error(String(e)))
      })
  })
}
