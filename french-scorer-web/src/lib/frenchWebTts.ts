/**
 * French listening / practice TTS: prefers cloud (OpenAI via french-scorer-api) when
 * `VITE_API_BASE_URL` is set and the server exposes `/api/tts/french`; otherwise picks
 * the best available browser `SpeechSynthesis` French voice and uses learner-friendly prosody.
 */

export type FrenchBcp47 = 'fr-FR' | 'fr-CA'

export function listeningAccentToBcp47(accent: 'france' | 'quebec'): FrenchBcp47 {
  return accent === 'quebec' ? 'fr-CA' : 'fr-FR'
}

let cloudAudioEl: HTMLAudioElement | null = null

/** Stop browser speech and any in-flight cloud MP3. */
export function stopFrenchWebTts(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis?.cancel()
  if (cloudAudioEl) {
    cloudAudioEl.pause()
    cloudAudioEl.src = ''
    cloudAudioEl = null
  }
}

function pickBestFrenchVoice(voices: SpeechSynthesisVoice[], prefer: FrenchBcp47): SpeechSynthesisVoice | null {
  const primary = prefer.toLowerCase()

  const score = (v: SpeechSynthesisVoice) => {
    const lang = (v.lang || '').toLowerCase().replace(/_/g, '-')
    let s = 0
    if (lang === primary) s += 220
    else if (lang.startsWith(`${primary}-`)) s += 200
    else if (lang.startsWith('fr-')) s += 90
    else if (lang.startsWith('fr')) s += 70

    const n = (v.name || '').toLowerCase()
    if (n.includes('premium') || n.includes('enhanced') || n.includes('neural')) s += 65
    if (n.includes('google')) s += 55
    if (n.includes('microsoft')) s += 50
    if (n.includes('natural')) s += 45
    if (n.includes('siri')) s += 40
    if (n.includes('amelie') || n.includes('thomas') || n.includes('daniel') || n.includes('audrey')) s += 28
    if (n.includes('compact') && !n.includes('premium')) s -= 25
    return s
  }

  let best: SpeechSynthesisVoice | null = null
  let bestScore = -1
  for (const v of voices) {
    const sc = score(v)
    if (sc > bestScore) {
      bestScore = sc
      best = v
    }
  }
  return best
}

function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    if (!synth) {
      resolve([])
      return
    }

    const initial = synth.getVoices()
    if (initial.length) {
      resolve(initial)
      return
    }

    const onVoices = () => {
      const list = synth.getVoices()
      if (list.length) {
        synth.removeEventListener('voiceschanged', onVoices)
        resolve(list)
      }
    }

    synth.addEventListener('voiceschanged', onVoices)
    window.setTimeout(() => {
      synth.removeEventListener('voiceschanged', onVoices)
      resolve(synth.getVoices())
    }, 400)
  })
}

function getApiBase(): string | null {
  const b = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  return b || null
}

async function speakFrenchOpenAiTts(text: string, apiBase: string): Promise<void> {
  stopFrenchWebTts()
  const url = `${apiBase.replace(/\/$/, '')}/api/tts/french`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(errText || `TTS HTTP ${res.status}`)
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
      reject(new Error('Audio playback failed'))
    }
    void audio.play().catch((e) => {
      URL.revokeObjectURL(objectUrl)
      if (cloudAudioEl === audio) cloudAudioEl = null
      reject(e instanceof Error ? e : new Error(String(e)))
    })
  })
}

/** Browser-only: best local French voice + slightly slower rate for learning. */
export async function speakFrenchWithBrowserTts(text: string, prefer: FrenchBcp47): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const trimmed = text.trim()
  if (!trimmed) return

  stopFrenchWebTts()

  const voices = await ensureVoicesLoaded()
  const voice = pickBestFrenchVoice(voices, prefer)

  const u = new SpeechSynthesisUtterance(trimmed)
  u.lang = prefer
  if (voice) u.voice = voice
  u.rate = 0.9
  u.pitch = 1
  u.volume = 1

  return new Promise((resolve) => {
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

const MAX_TTS_CHARS = 4096

/**
 * Prefer OpenAI HD speech from your scorer API when configured; else enhanced browser TTS.
 * `prefer` selects the best matching *local* voice when falling back to the Web Speech API.
 */
export async function speakFrenchListening(text: string, prefer: FrenchBcp47): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const apiBase = getApiBase()
  if (apiBase && trimmed.length <= MAX_TTS_CHARS) {
    try {
      await speakFrenchOpenAiTts(trimmed, apiBase)
      return
    } catch (e) {
      console.warn('[frenchWebTts] Cloud TTS failed, falling back to browser voice.', e)
    }
  }

  await speakFrenchWithBrowserTts(trimmed, prefer)
}
