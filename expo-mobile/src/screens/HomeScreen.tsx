import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import * as Speech from 'expo-speech'
import { scoreFrench, type FrenchScore, type ScoreProvider } from '../api/scoreFrench'
import { computeDailyStreak, loadRecentScores, saveRecentScores, type StoredScore } from '../lib/history'
import { getDailyVocab } from '../lib/vocab'
import { getApiBaseUrl } from '../lib/config'

const PROVIDERS: { value: ScoreProvider; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
]

function cefrBadgeClass(cecr: string): string {
  const level = cecr.toUpperCase()
  if (level.startsWith('A')) return 'bg-emerald-100'
  if (level.startsWith('B')) return 'bg-indigo-100'
  if (level.startsWith('C')) return 'bg-violet-100'
  return 'bg-slate-100'
}

export default function HomeScreen() {
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<ScoreProvider>('auto')
  /** Mirrors backend C1 essay routing (OpenAI → Claude when provider is auto). */
  const [c1EssayMode, setC1EssayMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>([])

  const refreshHistory = useCallback(async () => {
    const rows = await loadRecentScores()
    setRecentScores(rows)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refreshHistory()
    }, [refreshHistory]),
  )

  const canSubmit = text.trim().length > 0 && !loading

  const onScore = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    setResultProvider(null)
    try {
      const { result: next, providerUsed } = await scoreFrench(trimmed, provider, {
        essayLevel: c1EssayMode ? 'C1' : undefined,
      })
      setResult(next)
      setResultProvider(providerUsed || null)
      const nextHistory = [
        ...recentScores,
        {
          ts: Date.now(),
          score: Number(next.score),
          cecr: String(next.cecr ?? ''),
          provider: providerUsed,
        },
      ].slice(-30)
      setRecentScores(nextHistory)
      await saveRecentScores(nextHistory)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const streak = useMemo(() => computeDailyStreak(recentScores), [recentScores])
  const latestCecr = result?.cecr ?? recentScores.at(-1)?.cecr ?? '—'
  const dailyVocab = useMemo(() => getDailyVocab(latestCecr), [latestCecr])

  const chartBars = useMemo(() => {
    return recentScores.map((s) => ({
      t: new Date(s.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.max(0, Math.min(100, s.score)),
    }))
  }, [recentScores])

  const apiBase = getApiBaseUrl()

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text className="text-xs font-semibold text-blue-700">Modern French</Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900">Writing Lab</Text>
      <Text className="mt-1 text-sm text-slate-500">AI feedback powered by your backend — keys stay on the server.</Text>
      <Text className="mt-2 text-xs text-slate-400" numberOfLines={1}>
        API: {apiBase}
      </Text>

      {/* Scorer */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-semibold text-slate-900">French Scorer</Text>
        <Text className="mt-1 text-sm text-slate-500">Paste French text; get score, CEFR, fixes, and tips.</Text>

        <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Essay hint</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setC1EssayMode(false)}
            disabled={loading}
            className={['rounded-full px-4 py-2', !c1EssayMode ? 'bg-slate-800' : 'bg-slate-200'].join(' ')}
          >
            <Text className={['text-sm font-semibold', !c1EssayMode ? 'text-white' : 'text-slate-700'].join(' ')}>
              Any level
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setC1EssayMode(true)}
            disabled={loading}
            className={['rounded-full px-4 py-2', c1EssayMode ? 'bg-violet-600' : 'bg-slate-200'].join(' ')}
          >
            <Text className={['text-sm font-semibold', c1EssayMode ? 'text-white' : 'text-slate-700'].join(' ')}>
              C1 essay (auto routing)
            </Text>
          </Pressable>
        </ScrollView>

        <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {PROVIDERS.map((p) => {
            const active = provider === p.value
            return (
              <Pressable
                key={p.value}
                onPress={() => setProvider(p.value)}
                disabled={loading}
                className={[
                  'rounded-full px-4 py-2',
                  active ? 'bg-blue-600' : 'bg-slate-200',
                ].join(' ')}
              >
                <Text className={['text-sm font-semibold', active ? 'text-white' : 'text-slate-700'].join(' ')}>
                  {p.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Écrivez votre texte en français..."
          placeholderTextColor="#94a3b8"
          multiline
          textAlignVertical="top"
          className="mt-3 min-h-[140] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          editable={!loading}
        />

        <Pressable
          onPress={() => void onScore()}
          disabled={!canSubmit}
          className={[
            'mt-4 items-center rounded-xl py-3',
            canSubmit ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-300',
          ].join(' ')}
        >
          <Text className="text-center text-base font-semibold text-white">Score my French</Text>
        </Pressable>

        {error ? (
          <View className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <Text className="text-sm text-rose-800">
              <Text className="font-semibold">Error:</Text> {error}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="mt-4 items-center rounded-xl border border-slate-200 bg-slate-50 py-8">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-sm text-slate-600">Grading with AI…</Text>
          </View>
        ) : null}

        {!loading && result ? (
          <View className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <View className="flex-row flex-wrap items-end justify-between gap-2">
              <View className="flex-row items-end">
                <Text className="text-4xl font-bold text-slate-900">{result.score}</Text>
                <Text className="mb-1 ml-1 text-sm text-slate-500">/100</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {resultProvider ? (
                  <View className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                    <Text className="text-xs font-medium text-slate-600">{resultProvider}</Text>
                  </View>
                ) : null}
                <View className={['rounded-full px-3 py-1', cefrBadgeClass(result.cecr)].join(' ')}>
                  <Text className="text-xs font-semibold text-slate-800">CEFR {result.cecr}</Text>
                </View>
              </View>
            </View>

            {result.strengths?.length ? (
              <View className="mt-4">
                <Text className="text-xs font-semibold uppercase text-emerald-700">Strengths</Text>
                {result.strengths.map((s, i) => (
                  <Text key={i} className="mt-1 text-sm leading-5 text-slate-700">
                    • {s}
                  </Text>
                ))}
              </View>
            ) : null}

            {result.improvements?.length ? (
              <View className="mt-3">
                <Text className="text-xs font-semibold uppercase text-amber-800">Improvements</Text>
                {result.improvements.map((s, i) => (
                  <Text key={i} className="mt-1 text-sm leading-5 text-slate-700">
                    • {s}
                  </Text>
                ))}
              </View>
            ) : null}

            {result.corrected_version ? (
              <View className="mt-3 rounded-xl border border-blue-100 bg-white p-3">
                <Text className="text-xs font-semibold uppercase text-blue-800">Corrected version</Text>
                <Text className="mt-2 text-sm leading-5 text-slate-800">{result.corrected_version}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Stats */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-semibold text-slate-900">Stats</Text>
        <Text className="mt-1 text-sm text-slate-500">From your last AI result & history.</Text>
        <View className="mt-4 flex-row flex-wrap gap-4">
          <View className="min-w-[120] flex-1 rounded-2xl bg-blue-600 p-4">
            <Text className="text-xs uppercase text-white/80">CEFR</Text>
            <Text adjustsFontSizeToFit className="mt-1 text-3xl font-extrabold text-white">
              {latestCecr}
            </Text>
          </View>
          <View className="min-w-[120] flex-1 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-xs font-semibold uppercase text-amber-800">Streak</Text>
            <Text className="mt-1 text-2xl font-bold text-amber-900">{streak} days</Text>
          </View>
        </View>
      </View>

      {/* Daily vocab + TTS */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-semibold text-slate-900">Daily vocab</Text>
        <Text className="mt-1 text-sm text-slate-500">Tap listen for French TTS (device offline may vary).</Text>
        <View className="mt-3 gap-2">
          {dailyVocab.map((word) => (
            <View
              key={word}
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <Text className="font-medium text-slate-800">{word}</Text>
              <Pressable
                onPress={() => {
                  Speech.stop()
                  Speech.speak(word, { language: 'fr-FR' })
                }}
                className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200 active:bg-slate-100"
              >
                <Text className="text-xs font-semibold text-blue-700">Listen</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Progress bars */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-slate-900">Progress</Text>
          <Text className="text-xs text-slate-400">0–100</Text>
        </View>
        {chartBars.length === 0 ? (
          <Text className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Score a few texts to see your trend.
          </Text>
        ) : (
          <View className="mt-4 h-36 flex-row items-end justify-between gap-1">
            {chartBars.map((d, i) => {
              const h = Math.round((d.score / 100) * 120)
              return (
                <View key={`${d.t}-${i}`} className="flex-1 items-center justify-end">
                  <View
                    style={{ height: Math.max(6, h), width: '75%' }}
                    className="rounded-t-lg bg-blue-600"
                  />
                  <Text className="mt-1 text-center text-[10px] text-slate-500" numberOfLines={1}>
                    {d.t}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
