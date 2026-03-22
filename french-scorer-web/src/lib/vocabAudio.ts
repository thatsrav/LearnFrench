import type { VocabCard } from './richLessonTypes'
import { isFrenchCloudTtsConfigured, playFrenchVocabStaticUrl, speakFrenchListening } from './frenchWebTts'

/** Text sent to cloud TTS when no static file is available. */
export function vocabTextForCloudTts(card: VocabCard): string {
  return card.word.replace(/\s*·\s*/g, ', ').trim()
}

/**
 * Static MP3 path: `public/audio/vocab/{audio_key}.mp3` (see `scripts/generate-vocab-audio.mjs`).
 */
export function resolveVocabAudioUrl(card: VocabCard): string | null {
  if (card.audio_url?.trim()) return card.audio_url.trim()
  if (card.audio_key?.trim()) return `/audio/vocab/${card.audio_key.trim()}.mp3`
  return null
}

/**
 * Play pronunciation: try bundled MP3 first, then cloud TTS if configured.
 */
export async function playVocabCardAudio(card: VocabCard): Promise<void> {
  const url = resolveVocabAudioUrl(card)
  if (url) {
    try {
      await playFrenchVocabStaticUrl(url)
      return
    } catch {
      /* fall through to cloud */
    }
  }
  if (!isFrenchCloudTtsConfigured()) {
    throw new Error('Aucun fichier audio et synthèse cloud non configurée (VITE_API_BASE_URL).')
  }
  await speakFrenchListening(vocabTextForCloudTts(card))
}
