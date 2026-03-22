/**
 * French TTS — cloud only (OpenAI HD MP3 via french-scorer-api).
 * No expo-speech: on-device voices rarely sound natural.
 *
 * Set EXPO_PUBLIC_API_BASE_URL (e.g. http://192.168.x.x:8787); server needs OPENAI_API_KEY.
 */

import { Audio } from 'expo-av'
import { File, Paths } from 'expo-file-system'

export type FrenchBcp47 = 'fr-FR' | 'fr-CA'

/** @deprecated Reserved for future server-side accent; cloud path ignores today. */
export function listeningAccentToBcp47(accent: 'france' | 'quebec'): FrenchBcp47 {
  return accent === 'quebec' ? 'fr-CA' : 'fr-FR'
}

let cloudSound: Audio.Sound | null = null

export const FRENCH_CLOUD_TTS_SETUP_HINT =
  'Voix naturelle : définissez EXPO_PUBLIC_API_BASE_URL vers french-scorer-api et OPENAI_API_KEY sur le serveur.'

export function isFrenchCloudTtsConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim())
}

async function speakOpenAiFromApi(
  text: string,
  apiBase: string,
  onPlaybackStarted?: () => void,
): Promise<void> {
  if (cloudSound) {
    try {
      await cloudSound.unloadAsync()
    } catch {
      /* ignore */
    }
    cloudSound = null
  }

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  })

  const url = `${apiBase.replace(/\/$/, '')}/api/tts/french`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    throw new Error(`TTS HTTP ${res.status}`)
  }
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)

  const outFile = new File(Paths.cache, `fl-tts-${Date.now()}.mp3`)
  if (!outFile.exists) {
    outFile.create()
  }
  outFile.write(bytes)

  const { sound } = await Audio.Sound.createAsync({ uri: outFile.uri })
  cloudSound = sound

  return new Promise((resolve, reject) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) {
        if (status.error) {
          reject(new Error(status.error))
        }
        return
      }
      if (status.didJustFinish) {
        void sound.unloadAsync().catch(() => {})
        if (cloudSound === sound) cloudSound = null
        resolve()
      }
    })
    void sound
      .playAsync()
      .then(() => {
        onPlaybackStarted?.()
      })
      .catch(reject)
  })
}

export async function stopFrenchExpoTts(): Promise<void> {
  if (cloudSound) {
    try {
      await cloudSound.stopAsync()
      await cloudSound.unloadAsync()
    } catch {
      /* ignore */
    }
    cloudSound = null
  }
}

const MAX_TTS_CHARS = 4096

export type SpeakFrenchCloudOptions = {
  onPlaybackStarted?: () => void
}

/**
 * Play French text via OpenAI TTS on your backend. Throws if not configured or request fails.
 */
export async function speakFrenchListening(
  text: string,
  _prefer?: FrenchBcp47,
  options?: SpeakFrenchCloudOptions,
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (!apiBase) {
    throw new Error(FRENCH_CLOUD_TTS_SETUP_HINT)
  }
  if (trimmed.length > MAX_TTS_CHARS) {
    throw new Error(`Texte trop long (max ${MAX_TTS_CHARS} caractères).`)
  }

  await speakOpenAiFromApi(trimmed, apiBase, options?.onPlaybackStarted)
}
