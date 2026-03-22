import { Audio } from 'expo-av'
import { File as ExpoFile } from 'expo-file-system'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SPEAKING_PROMPTS } from '../content/speakingPrompts'
import { useAuth } from '../contexts/AuthContext'
import { recordScoreEvent } from '../database/database'
import { getSyllabusData } from '../database/SyllabusService'
import { getApiBaseUrl } from '../lib/config'
import { useTabScreenBottomPadding } from '../lib/screenPadding'
import { getStudyCefrLevel } from '../lib/studyLevelPreference'

/** Matches `POST /api/oral/analyze-transcript` response (french-scorer-api). */
export interface SpeechAnalysisResult {
  fluency: string
  pronunciation: string
  liaisonsFeedback: string
  nasalVowelsFeedback: string
  tefScorePredicted: number
  strengths: string[]
  improvements: string[]
}

type OralLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

type PermissionState = 'unknown' | 'denied' | 'granted'

type Phase = 'idle' | 'recording' | 'processing' | 'result'

type DailySpeakingPrompt = {
  promptFr: string
  promptEn: string
  topicLine: string
  level: OralLevel
}

const ORAL_LEVELS: OralLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

const LEVEL_ORDER: Record<OralLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
}

const MIN_RECORD_MS = 5000
const MAX_RECORD_MS = 90000

function clampOralLevel(raw: string): OralLevel {
  const u = raw.toUpperCase()
  if (u === 'A1' || u === 'A2' || u === 'B1' || u === 'B2' || u === 'C1') return u
  return 'A1'
}

function edmontonDateKey(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date())
    const y = parts.find((p) => p.type === 'year')?.value
    const m = parts.find((p) => p.type === 'month')?.value
    const d = parts.find((p) => p.type === 'day')?.value
    if (y && m && d) return `${y}-${m}-${d}`
  } catch {
    /* */
  }
  return new Date().toISOString().slice(0, 10)
}

async function resolveInitialOralLevel(): Promise<OralLevel> {
  try {
    const rows = await getSyllabusData()
    const done = rows.filter((r) => r.status === 'completed')
    let best: OralLevel = 'A1'
    let bo = 0
    for (const r of done) {
      const o = LEVEL_ORDER[r.level]
      if (o > bo) {
        bo = o
        best = r.level
      }
    }
    if (done.length > 0) return best
  } catch {
    /* */
  }
  const stored = await getStudyCefrLevel()
  return clampOralLevel(stored)
}

function fallbackPrompt(level: OralLevel, index: number): DailySpeakingPrompt {
  const fr = SPEAKING_PROMPTS[index % SPEAKING_PROMPTS.length]
  return {
    promptFr: fr,
    promptEn: fr,
    topicLine: 'Daily practice',
    level,
  }
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function audioContentTypeForUri(uri: string): string {
  const u = uri.split('?')[0]?.toLowerCase() ?? ''
  if (u.endsWith('.m4a') || u.endsWith('.mp4')) return 'audio/m4a'
  if (u.endsWith('.webm')) return 'audio/webm'
  if (u.endsWith('.wav')) return 'audio/wav'
  if (u.endsWith('.caf')) return 'audio/x-caf'
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/webm'
}

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const res = await fetch(uri)
    const blob = await res.blob()
    const buf = await blob.arrayBuffer()
    if (buf.byteLength >= 32) return buf
  } catch {
    /* */
  }
  const file = new ExpoFile(uri)
  return file.arrayBuffer()
}

function tefScoreColor(score: number): string {
  if (score < 300) return 'bg-red-500'
  if (score < 600) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function tefTextColor(score: number): string {
  if (score < 300) return 'text-red-700'
  if (score < 600) return 'text-amber-800'
  return 'text-emerald-800'
}

export default function SpeakingCoachScreen() {
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const { user } = useAuth()

  const [permission, setPermission] = useState<PermissionState>('unknown')
  const [level, setLevel] = useState<OralLevel>('A1')
  const [levelReady, setLevelReady] = useState(false)

  const [prompt, setPrompt] = useState<DailySpeakingPrompt | null>(null)
  const [promptLoading, setPromptLoading] = useState(false)
  const [promptError, setPromptError] = useState<string | null>(null)
  const fallbackIndexRef = useRef(0)

  const [phase, setPhase] = useState<Phase>('idle')
  const [durationMs, setDurationMs] = useState(0)
  const [tooShortHint, setTooShortHint] = useState(false)

  const [processingStep, setProcessingStep] = useState<'transcribing' | 'analyzing'>('transcribing')
  const [processError, setProcessError] = useState<string | null>(null)
  const [lastTranscript, setLastTranscript] = useState<string | null>(null)

  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<SpeechAnalysisResult | null>(null)

  const recordingRef = useRef<InstanceType<typeof Audio.Recording> | null>(null)
  const autoStopScheduled = useRef(false)
  const cancelStartRef = useRef(false)
  const phaseRef = useRef<Phase>('idle')
  const runPipelineRef = useRef<(uri: string) => Promise<void>>(async () => {})
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const fetchDailyPrompt = useCallback(async (oralLevel: OralLevel, useFallbackRotate: boolean) => {
    setPromptLoading(true)
    setPromptError(null)
    const base = getApiBaseUrl()
    try {
      const resp = await fetch(`${base}/api/oral/daily-speaking-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: oralLevel, contentDateKey: edmontonDateKey() }),
      })
      const data = (await resp.json().catch(() => ({}))) as Partial<DailySpeakingPrompt> & { error?: string }
      const fr = String(data.promptFr ?? '').trim()
      if (!resp.ok || !fr) {
        throw new Error(data.error || 'Could not load prompt')
      }
      setPrompt({
        promptFr: fr,
        promptEn: String(data.promptEn ?? fr).trim() || fr,
        topicLine: String(data.topicLine ?? 'Oral').trim() || 'Oral',
        level: oralLevel,
      })
    } catch {
      const idx = useFallbackRotate ? fallbackIndexRef.current++ : fallbackIndexRef.current
      setPrompt(fallbackPrompt(oralLevel, idx))
      setPromptError('Using offline prompts — API unavailable.')
    } finally {
      setPromptLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const initial = await resolveInitialOralLevel()
      if (!cancelled) {
        setLevel(initial)
        setLevelReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!levelReady || permission !== 'granted') return
    void fetchDailyPrompt(level, false)
  }, [levelReady, permission, level, fetchDailyPrompt])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { status } = await Audio.requestPermissionsAsync()
      if (cancelled) return
      if (status === 'granted') setPermission('granted')
      else setPermission('denied')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (phase !== 'recording') {
      pulse.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [phase, pulse])

  useEffect(() => {
    return () => {
      const rec = recordingRef.current
      recordingRef.current = null
      if (rec) {
        void rec.stopAndUnloadAsync().catch(() => {})
      }
      void Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch(() => {})
    }
  }, [])

  const resetAudioModeAfterRecording = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      })
    } catch {
      /* */
    }
  }, [])

  const runPipeline = useCallback(
    async (uri: string) => {
      const activePrompt = prompt
      if (!activePrompt) {
        setPhase('idle')
        return
      }
      setPhase('processing')
      setProcessingStep('transcribing')
      setProcessError(null)

      const base = getApiBaseUrl()
      const contentType = audioContentTypeForUri(uri)

      try {
        const buf = await readUriAsArrayBuffer(uri)
        if (buf.byteLength < 32) {
          throw new Error('Recording too small — try again.')
        }

        const whisperResp = await fetch(`${base}/api/oral/whisper`, {
          method: 'POST',
          headers: { 'Content-Type': contentType },
          body: buf,
        })
        const whisperJson = (await whisperResp.json().catch(() => ({}))) as {
          transcript?: string
          error?: string
        }
        if (!whisperResp.ok) {
          throw new Error(whisperJson.error || 'Transcription failed — try again')
        }
        const tr = String(whisperJson.transcript ?? '').trim()
        if (!tr) {
          throw new Error('No speech detected — try again.')
        }
        setLastTranscript(tr)
        setTranscript(tr)

        setProcessingStep('analyzing')
        const analyzeResp = await fetch(`${base}/api/oral/analyze-transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: tr,
            level,
            promptFr: activePrompt.promptFr,
          }),
        })
        const data = (await analyzeResp.json().catch(() => ({}))) as SpeechAnalysisResult & { error?: string }
        if (!analyzeResp.ok) {
          throw new Error(data.error || 'Analysis failed — try again')
        }

        const result: SpeechAnalysisResult = {
          fluency: String(data.fluency ?? ''),
          pronunciation: String(data.pronunciation ?? ''),
          liaisonsFeedback: String(data.liaisonsFeedback ?? ''),
          nasalVowelsFeedback: String(data.nasalVowelsFeedback ?? ''),
          tefScorePredicted: Math.max(0, Math.min(900, Math.round(Number(data.tefScorePredicted) || 0))),
          strengths: Array.isArray(data.strengths) ? data.strengths.map((s) => String(s)) : [],
          improvements: Array.isArray(data.improvements) ? data.improvements.map((s) => String(s)) : [],
        }
        setAnalysis(result)
        setPhase('result')

        try {
          await recordScoreEvent({
            userId: user?.id ?? null,
            ts: Date.now(),
            score: Math.round(result.tefScorePredicted / 9),
            cecr: level,
            provider: 'whisper+gemini',
            skill: 'speaking',
          })
        } catch {
          /* non-fatal */
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setProcessError(msg)
        setPhase('idle')
      }
    },
    [level, prompt, user?.id],
  )

  runPipelineRef.current = runPipeline

  const startRecording = useCallback(async () => {
    if (permission !== 'granted' || phase !== 'idle' || !prompt) return
    setTooShortHint(false)
    setProcessError(null)
    autoStopScheduled.current = false
    cancelStartRef.current = false
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      if (cancelStartRef.current) {
        try {
          await recording.stopAndUnloadAsync()
        } catch {
          /* */
        }
        await resetAudioModeAfterRecording()
        return
      }
      recordingRef.current = recording
      phaseRef.current = 'recording'
      recording.setOnRecordingStatusUpdate((st) => {
        if (!st.isRecording) return
        const d = st.durationMillis ?? 0
        setDurationMs(d)
        if (d >= MAX_RECORD_MS && !autoStopScheduled.current && recordingRef.current) {
          autoStopScheduled.current = true
          void (async () => {
            const r = recordingRef.current
            if (!r) return
            try {
              const status = await r.getStatusAsync()
              const ms = status.durationMillis ?? 0
              if (ms < MIN_RECORD_MS) {
                recordingRef.current = null
                phaseRef.current = 'idle'
                await r.stopAndUnloadAsync()
                await resetAudioModeAfterRecording()
                setPhase('idle')
                setTooShortHint(true)
                return
              }
              await r.stopAndUnloadAsync()
              const uri = r.getURI()
              recordingRef.current = null
              phaseRef.current = 'idle'
              await resetAudioModeAfterRecording()
              if (uri) void runPipelineRef.current(uri)
              else {
                setProcessError('Recording file missing — try again.')
                setPhase('idle')
              }
            } catch {
              recordingRef.current = null
              phaseRef.current = 'idle'
              await resetAudioModeAfterRecording()
              setProcessError('Could not finish recording — try again.')
              setPhase('idle')
            }
          })()
        }
      })
      setDurationMs(0)
      setPhase('recording')
    } catch {
      await resetAudioModeAfterRecording()
      setProcessError('Could not start microphone — check permissions.')
    }
  }, [permission, phase, prompt, resetAudioModeAfterRecording])

  const stopRecordingFromRelease = useCallback(async () => {
    if (!recordingRef.current) {
      cancelStartRef.current = true
      return
    }
    const r = recordingRef.current
    recordingRef.current = null
    phaseRef.current = 'idle'
    autoStopScheduled.current = false
    try {
      const status = await r.getStatusAsync()
      const ms = status.durationMillis ?? 0
      if (ms < MIN_RECORD_MS) {
        await r.stopAndUnloadAsync()
        await resetAudioModeAfterRecording()
        setPhase('idle')
        setDurationMs(0)
        setTooShortHint(true)
        return
      }
      await r.stopAndUnloadAsync()
      const uri = r.getURI()
      await resetAudioModeAfterRecording()
      if (!uri) {
        setProcessError('Recording file missing — try again.')
        setPhase('idle')
        return
      }
      void runPipelineRef.current(uri)
    } catch {
      await resetAudioModeAfterRecording()
      setProcessError('Could not stop recording — try again.')
      setPhase('idle')
    }
  }, [resetAudioModeAfterRecording])

  const retryAnalysisOnly = useCallback(async () => {
    const tr = lastTranscript
    const activePrompt = prompt
    if (!tr || !activePrompt) return
    setPhase('processing')
    setProcessingStep('analyzing')
    setProcessError(null)
    const base = getApiBaseUrl()
    try {
      const analyzeResp = await fetch(`${base}/api/oral/analyze-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: tr,
          level,
          promptFr: activePrompt.promptFr,
        }),
      })
      const data = (await analyzeResp.json().catch(() => ({}))) as SpeechAnalysisResult & { error?: string }
      if (!analyzeResp.ok) {
        throw new Error(data.error || 'Analysis failed — try again')
      }
      const result: SpeechAnalysisResult = {
        fluency: String(data.fluency ?? ''),
        pronunciation: String(data.pronunciation ?? ''),
        liaisonsFeedback: String(data.liaisonsFeedback ?? ''),
        nasalVowelsFeedback: String(data.nasalVowelsFeedback ?? ''),
        tefScorePredicted: Math.max(0, Math.min(900, Math.round(Number(data.tefScorePredicted) || 0))),
        strengths: Array.isArray(data.strengths) ? data.strengths.map((s) => String(s)) : [],
        improvements: Array.isArray(data.improvements) ? data.improvements.map((s) => String(s)) : [],
      }
      setAnalysis(result)
      setPhase('result')
      try {
        await recordScoreEvent({
          userId: user?.id ?? null,
          ts: Date.now(),
          score: Math.round(result.tefScorePredicted / 9),
          cecr: level,
          provider: 'whisper+gemini',
          skill: 'speaking',
        })
      } catch {
        /* */
      }
    } catch (e) {
      setProcessError(e instanceof Error ? e.message : String(e))
      setPhase('idle')
    }
  }, [lastTranscript, level, prompt, user?.id])

  const tryAnotherPrompt = useCallback(() => {
    setPhase('idle')
    setAnalysis(null)
    setTranscript('')
    setLastTranscript(null)
    setProcessError(null)
    setTooShortHint(false)
    void fetchDailyPrompt(level, true)
  }, [fetchDailyPrompt, level])

  const onSelectLevel = useCallback((L: OralLevel) => {
    setLevel(L)
    if (phase === 'result' || phase === 'idle') {
      setAnalysis(null)
      setTranscript('')
      setLastTranscript(null)
      setProcessError(null)
    }
  }, [phase])

  if (permission === 'unknown') {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-sm text-slate-600">Checking microphone access…</Text>
      </View>
    )
  }

  if (permission === 'denied') {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-lg font-semibold text-slate-900">Microphone access needed</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-slate-600">
          Allow the microphone in Settings to practice speaking and get feedback.
        </Text>
        <Pressable
          onPress={() => void Linking.openSettings()}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700"
        >
          <Text className="text-center text-sm font-semibold text-white">Open Settings</Text>
        </Pressable>
      </View>
    )
  }

  const tef = analysis?.tefScorePredicted ?? 0
  const tefPct = Math.min(100, Math.max(0, (tef / 900) * 100))

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 16, paddingBottom: scrollBottomPad }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-slate-900">Speaking coach</Text>
      <Text className="mt-1 text-sm text-slate-500">Hold the mic, answer in French, get AI feedback.</Text>

      {promptLoading && !prompt ? (
        <View className="mt-4 items-center py-6">
          <ActivityIndicator color="#2563eb" />
          <Text className="mt-2 text-xs text-slate-500">Loading prompt…</Text>
        </View>
      ) : null}

      {promptError ? (
        <Text className="mt-2 text-center text-xs text-amber-700">{promptError}</Text>
      ) : null}

      {prompt ? (
        <>
          <View className="mt-4 self-center rounded-full bg-indigo-100 px-3 py-1">
            <Text className="text-center text-xs font-semibold text-indigo-800">
              Topic: {prompt.topicLine}
            </Text>
          </View>

          <View className="mt-3 flex-row flex-wrap justify-center gap-2">
            {ORAL_LEVELS.map((L) => (
              <Pressable
                key={L}
                onPress={() => onSelectLevel(L)}
                disabled={phase === 'recording' || phase === 'processing'}
                className={`rounded-full px-3 py-1.5 ${
                  level === L ? 'bg-blue-600' : 'bg-slate-200'
                } ${phase === 'recording' || phase === 'processing' ? 'opacity-50' : ''}`}
              >
                <Text className={`text-xs font-bold ${level === L ? 'text-white' : 'text-slate-800'}`}>{L}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mt-6 text-center text-xl font-semibold leading-8 text-slate-900">{prompt.promptFr}</Text>
          <Text className="mt-3 text-center text-sm leading-5 text-slate-500">{prompt.promptEn}</Text>
        </>
      ) : null}

      {phase === 'processing' ? (
        <View className="mt-10 items-center py-8">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-center text-sm font-medium text-slate-700">
            {processingStep === 'transcribing' ? 'Transcribing your French…' : 'Analyzing your French…'}
          </Text>
        </View>
      ) : null}

      {processError && phase === 'idle' ? (
        <View className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-900">{processError}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => {
                setProcessError(null)
              }}
              className="rounded-lg bg-red-700 px-4 py-2 active:bg-red-800"
            >
              <Text className="text-xs font-semibold text-white">Dismiss</Text>
            </Pressable>
            {lastTranscript ? (
              <Pressable
                onPress={() => void retryAnalysisOnly()}
                className="rounded-lg bg-slate-700 px-4 py-2 active:bg-slate-800"
              >
                <Text className="text-xs font-semibold text-white">Retry analysis</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {tooShortHint ? (
        <Text className="mt-4 text-center text-xs text-amber-800">Hold at least 5 seconds before releasing.</Text>
      ) : null}

      {phase === 'result' && analysis ? (
        <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your response</Text>
          <Text className="mt-2 text-sm leading-5 text-slate-800">&ldquo;{transcript}&rdquo;</Text>

          <View className="my-4 h-px bg-slate-200" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-800">TEF score estimate</Text>
            <Text className={`text-sm font-bold ${tefTextColor(tef)}`}>
              {tef} / 900
            </Text>
          </View>
          <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <View
              className={`h-2 rounded-full ${tefScoreColor(tef)}`}
              style={{ width: `${tefPct}%` }}
            />
          </View>

          <View className="my-4 h-px bg-slate-200" />

          {[
            ['Fluency', analysis.fluency],
            ['Pronunciation', analysis.pronunciation],
            ['Liaisons', analysis.liaisonsFeedback],
            ['Nasal vowels', analysis.nasalVowelsFeedback],
          ].map(([label, text]) => (
            <View key={String(label)} className="mb-3">
              <Text className="text-xs font-semibold text-slate-500">{label}</Text>
              <Text className="mt-0.5 text-sm leading-5 text-slate-800">{text}</Text>
            </View>
          ))}

          <View className="my-2 h-px bg-slate-200" />

          <Text className="text-xs font-semibold text-emerald-800">Strengths</Text>
          {analysis.strengths.map((s, i) => (
            <Text key={`s-${i}`} className="mt-1 text-sm text-slate-800">
              • {s}
            </Text>
          ))}

          <Text className="mt-4 text-xs font-semibold text-amber-900">Improvements</Text>
          {analysis.improvements.map((s, i) => (
            <Text key={`i-${i}`} className="mt-1 text-sm text-slate-800">
              • {s}
            </Text>
          ))}

          <Pressable
            onPress={tryAnotherPrompt}
            className="mt-6 rounded-xl bg-blue-600 py-3 active:bg-blue-700"
          >
            <Text className="text-center text-sm font-semibold text-white">Try another prompt</Text>
          </Pressable>
        </View>
      ) : null}

      {phase !== 'result' && phase !== 'processing' && prompt ? (
        <View className="mt-10 items-center pb-4">
          <Pressable
            onPressIn={() => void startRecording()}
            onPressOut={() => void stopRecordingFromRelease()}
            delayLongPress={0}
            disabled={phase !== 'idle' && phase !== 'recording'}
            className="items-center justify-center"
          >
            <Animated.View
              style={{
                transform: [{ scale: phase === 'recording' ? pulse : 1 }],
              }}
              className="items-center justify-center"
            >
              <View
                className={`h-28 w-28 items-center justify-center rounded-full ${
                  phase === 'recording' ? 'bg-red-600' : 'bg-red-500'
                } shadow-lg`}
              >
                <Text className="text-4xl text-white">🎙</Text>
              </View>
            </Animated.View>
          </Pressable>
          <Text className="mt-4 text-center text-sm font-medium text-slate-600">
            {phase === 'recording' ? 'Release to stop' : 'Hold to speak'}
          </Text>
          {phase === 'recording' ? (
            <Text className="mt-1 text-center text-lg font-mono font-semibold text-slate-900">
              {formatDuration(durationMs)}
            </Text>
          ) : (
            <Text className="mt-1 text-center text-xs text-slate-400">5s – 90s</Text>
          )}
        </View>
      ) : null}
    </ScrollView>
  )
}
