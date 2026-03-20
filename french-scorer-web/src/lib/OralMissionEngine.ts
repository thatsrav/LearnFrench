/**
 * OralMissionEngine — daily level-matched listening (Gemini + TTS) and speaking prompts.
 * Server generates audio (ElevenLabs preferred, OpenAI TTS fallback); client caches 24h by date+level.
 */

import { getApiBaseUrl } from './apiBase'
import { localDateKey } from './readingRoomMissionStorage'
import { normalizeWritingLevel } from './WritingService'

export type ListeningQuestion = {
  questionEn: string
  options: string[]
  correctIndex: number
}

export type DailyListeningMission = {
  scenarioTitle: string
  moduleLabel: string
  scriptFr: string
  questions: ListeningQuestion[]
  audioBase64: string | null
  mime: string
  level: string
}

export type DailySpeakingPrompt = {
  promptFr: string
  promptEn: string
  topicLine: string
  level: string
}

const CACHE_LISTEN = 'oral_mission_listening_cache_v1'
const CACHE_SPEAK = 'oral_mission_speaking_cache_v1'

type ListenCache = { dateKey: string; level: string; mission: DailyListeningMission }
type SpeakCache = { dateKey: string; level: string; prompt: DailySpeakingPrompt }

export async function ensureDailyListeningMission(userLevelRaw: string): Promise<DailyListeningMission> {
  const level = normalizeWritingLevel(userLevelRaw)
  const today = localDateKey()
  try {
    const raw = localStorage.getItem(CACHE_LISTEN)
    if (raw) {
      const c = JSON.parse(raw) as ListenCache
      if (c.dateKey === today && c.level === level && c.mission) return c.mission
    }
  } catch {
    /* */
  }

  const apiBase = getApiBaseUrl()
  const resp = await fetch(`${apiBase}/api/oral/daily-listening`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  })
  const data = (await resp.json().catch(() => ({}))) as DailyListeningMission & { error?: string }

  if (!resp.ok) {
    return buildFallbackListening(level, data?.error)
  }

  const mission: DailyListeningMission = {
    scenarioTitle: String(data.scenarioTitle ?? 'Scénario du jour'),
    moduleLabel: String(data.moduleLabel ?? 'Daily scenario'),
    scriptFr: String(data.scriptFr ?? ''),
    questions: Array.isArray(data.questions) ? data.questions : [],
    audioBase64: data.audioBase64 ?? null,
    mime: String(data.mime ?? 'audio/mpeg'),
    level,
  }

  if (!mission.scriptFr) {
    return buildFallbackListening(level, 'empty script')
  }

  try {
    localStorage.setItem(CACHE_LISTEN, JSON.stringify({ dateKey: today, level, mission }))
  } catch {
    /* */
  }

  return mission
}

export async function ensureDailySpeakingPrompt(userLevelRaw: string): Promise<DailySpeakingPrompt> {
  const level = normalizeWritingLevel(userLevelRaw)
  const today = localDateKey()
  try {
    const raw = localStorage.getItem(CACHE_SPEAK)
    if (raw) {
      const c = JSON.parse(raw) as SpeakCache
      if (c.dateKey === today && c.level === level && c.prompt) return c.prompt
    }
  } catch {
    /* */
  }

  const apiBase = getApiBaseUrl()
  const resp = await fetch(`${apiBase}/api/oral/daily-speaking-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  })
  const data = (await resp.json().catch(() => ({}))) as DailySpeakingPrompt & { error?: string }

  if (!resp.ok || !data.promptFr) {
    return buildFallbackSpeaking(level)
  }

  const prompt: DailySpeakingPrompt = {
    promptFr: String(data.promptFr),
    promptEn: String(data.promptEn ?? data.promptFr),
    topicLine: String(data.topicLine ?? 'Oral'),
    level,
  }

  try {
    localStorage.setItem(CACHE_SPEAK, JSON.stringify({ dateKey: today, level, prompt }))
  } catch {
    /* */
  }

  return prompt
}

function buildFallbackListening(level: string, _err?: string): DailyListeningMission {
  const scenarios: Record<string, { title: string; mod: string; script: string; q: ListeningQuestion[] }> = {
    A1: {
      title: 'Au téléphone',
      mod: 'Module 01: Everyday calls',
      script:
        'Bonjour, je suis Marie. J’appelle pour confirmer mon rendez-vous demain à quinze heures. Est-ce toujours possible ? Merci beaucoup.',
      q: [
        {
          questionEn: 'What is Marie trying to do?',
          options: ['Cancel an appointment', 'Confirm a time', 'Complain about service', 'Ask for a refund'],
          correctIndex: 1,
        },
        {
          questionEn: 'How would you describe her tone?',
          options: ['Angry', 'Polite and practical', 'Sarcastic', 'Confused'],
          correctIndex: 1,
        },
        {
          questionEn: 'When is her appointment?',
          options: ['This morning', 'Tomorrow at 3 p.m.', 'Next week', 'She does not say'],
          correctIndex: 1,
        },
      ],
    },
    B2: {
      title: 'Appel technique',
      mod: 'Module 03: Professional discourse',
      script:
        'Allô, service technique, Lucas à l’appareil. Je vois que votre connexion a sauté trois fois cette semaine. Nous allons envoyer un technicien demain matin entre neuf heures et midi. Pouvez-vous confirmer l’adresse au quarante-deux rue des Lilas ? Parfait. Je note aussi que vous préférez être prévenu dix minutes avant.',
      q: [
        {
          questionEn: 'What is the underlying problem?',
          options: ['Billing dispute', 'Unstable internet connection', 'Wrong address', 'Late delivery'],
          correctIndex: 1,
        },
        {
          questionEn: 'What does the technician imply about the user?',
          options: [
            'They refused help',
            'They need a visit window and notice before arrival',
            'They want a refund',
            'They are moving house',
          ],
          correctIndex: 1,
        },
        {
          questionEn: 'Which tone best matches Lucas?',
          options: ['Dismissive', 'Procedural and reassuring', 'Aggressive', 'Overly casual'],
          correctIndex: 1,
        },
        {
          questionEn: 'When will the technician come?',
          options: ['Tonight', 'Tomorrow morning between 9 and 12', 'Next month', 'Only if the user calls back'],
          correctIndex: 1,
        },
      ],
    },
  }

  const core = scenarios[level] ?? scenarios.B2
  return {
    scenarioTitle: core.title,
    moduleLabel: core.mod,
    scriptFr: core.script,
    questions: core.q,
    audioBase64: null,
    mime: 'audio/mpeg',
    level,
  }
}

function buildFallbackSpeaking(level: string): DailySpeakingPrompt {
  const prompts: Record<string, DailySpeakingPrompt> = {
    A1: {
      promptFr: 'Présentez-vous en trois phrases : nom, ville, une chose que vous aimez.',
      promptEn: 'Introduce yourself in three sentences: name, city, one thing you like.',
      topicLine: 'Présentation',
      level: 'A1',
    },
    B2: {
      promptFr: 'Convainquez un ami de s’inscrire à une salle de sport. Donnez deux arguments et une conclusion.',
      promptEn: 'Convince a friend to join a gym. Give two arguments and a conclusion.',
      topicLine: 'Argumentation',
      level: 'B2',
    },
    C1: {
      promptFr:
        'Prenez position sur le télétravail : nuancez les avantages et les risques pour la cohésion d’équipe, puis proposez une piste réaliste.',
      promptEn: 'Argue about remote work with nuance on pros/cons for team cohesion; propose one realistic approach.',
      topicLine: 'Synthèse orale',
      level: 'C1',
    },
  }
  return prompts[level] ?? prompts.B2
}

export async function transcribeRecordingWebm(blob: Blob): Promise<string> {
  const apiBase = getApiBaseUrl()
  const buf = await blob.arrayBuffer()
  const resp = await fetch(`${apiBase}/api/oral/whisper`, {
    method: 'POST',
    headers: { 'Content-Type': 'audio/webm' },
    body: buf,
  })
  const data = (await resp.json().catch(() => ({}))) as { transcript?: string; error?: string }
  if (!resp.ok) throw new Error(data?.error || 'Whisper failed')
  return String(data.transcript ?? '').trim()
}

export type SpeechAnalysisResult = {
  fluency: string
  pronunciation: string
  tefScorePredicted: number
  strengths: string[]
  improvements: string[]
}

export async function analyzeTranscript(
  transcript: string,
  level: string,
  promptFr: string,
): Promise<SpeechAnalysisResult> {
  const apiBase = getApiBaseUrl()
  const resp = await fetch(`${apiBase}/api/oral/analyze-transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, level, promptFr }),
  })
  const data = (await resp.json().catch(() => ({}))) as SpeechAnalysisResult & { error?: string }
  if (!resp.ok) throw new Error(data?.error || 'Analysis failed')
  return {
    fluency: String(data.fluency ?? ''),
    pronunciation: String(data.pronunciation ?? ''),
    tefScorePredicted: Number(data.tefScorePredicted ?? 0),
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    improvements: Array.isArray(data.improvements) ? data.improvements : [],
  }
}
