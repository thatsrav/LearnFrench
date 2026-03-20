/**
 * French TTS for Expo: optional OpenAI MP3 via `EXPO_PUBLIC_API_BASE_URL` + `/api/tts/french`,
 * otherwise `expo-speech` with the best installed French voice and calmer rate/pitch.
 */

import { Audio } from 'expo-av'
import { File, Paths } from 'expo-file-system'
import * as Speech from 'expo-speech'

export type FrenchBcp47 = 'fr-FR' | 'fr-CA'

export function listeningAccentToBcp47(accent: 'france' | 'quebec'): FrenchBcp47 {
  return accent === 'quebec' ? 'fr-CA' : 'fr-FR'
}

let voicesCache: Speech.Voice[] | null = null
let voicesPromise: Promise<Speech.Voice[]> | null = null

async function getVoices(): Promise<Speech.Voice[]> {
  if (voicesCache) return voicesCache
  if (!voicesPromise) {
    voicesPromise = Speech.getAvailableVoicesAsync().then((v) => {
      voicesCache = v
      return v
    })
  }
  return voicesPromise
}

function pickVoiceIdentifier(voices: Speech.Voice[], prefer: FrenchBcp47): string | undefined {
  const p = prefer.toLowerCase().replace(/_/g, '-')
  const fr = voices.filter((v) => (v.language || '').toLowerCase().startsWith('fr'))
  const exact = fr.filter((v) => (v.language || '').toLowerCase().replace(/_/g, '-').startsWith(p))
  const pool = exact.length ? exact : fr
  if (!pool.length) return undefined

  const score = (v: Speech.Voice) => {
    let s = 0
    const lang = (v.language || '').toLowerCase().replace(/_/g, '-')
    if (lang.startsWith(p)) s += 100
    const name = `${v.name || ''} ${v.quality || ''}`.toLowerCase()
    if (name.includes('enhanced') || name.includes('premium')) s += 45
    return s
  }

  return [...pool].sort((a, b) => score(b) - score(a))[0]?.identifier
}

let cloudSound: Audio.Sound | null = null

async function speakOpenAiFromApi(text: string, apiBase: string): Promise<void> {
  Speech.stop()
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
    void sound.playAsync().catch(reject)
  })
}

export async function stopFrenchExpoTts(): Promise<void> {
  Speech.stop()
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

export async function speakFrenchListening(text: string, prefer: FrenchBcp47): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (apiBase && trimmed.length <= MAX_TTS_CHARS) {
    try {
      await speakOpenAiFromApi(trimmed, apiBase)
      return
    } catch (e) {
      console.warn('[frenchExpoTts] Cloud TTS failed, using device speech.', e)
    }
  }

  const voices = await getVoices()
  const voice = pickVoiceIdentifier(voices, prefer)

  return new Promise((resolve) => {
    Speech.speak(trimmed, {
      language: prefer,
      voice,
      pitch: 1,
      rate: 0.92,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    })
  })
}
