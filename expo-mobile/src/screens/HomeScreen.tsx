import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { countDueReviewItems } from '../lib/spacedRepetition'
import {
  generateDailyLessonPlan,
  recordDailyPlanShown,
  recordRecommendationEngagement,
  type DailyLessonPlan,
} from '../services/recommendationEngine'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { speakFrenchListening, stopFrenchExpoTts } from '../lib/frenchExpoTts'
import { recordScoreEvent } from '../database/database'
import { scoreFrench, type FrenchScore, type ScoreProvider } from '../api/scoreFrench'
import { computeDailyStreak, loadRecentScores, saveRecentScores, type StoredScore } from '../lib/history'
import { CURRICULUM_STATS } from '../lib/curriculum'
import { getDailyVocab } from '../lib/vocab'
import { getApiBaseUrl } from '../lib/config'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { syncScoreHistoryToCloud } from '../services/cloudProgress'
import type { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator'
import { useTabScreenBottomPadding } from '../lib/screenPadding'

const PROVIDERS: { value: ScoreProvider; label: string; short: string }[] = [
  { value: 'auto', label: 'Auto', short: 'Auto' },
  { value: 'gemini', label: 'Gemini', short: 'Gem' },
  { value: 'groq', label: 'Groq', short: 'Groq' },
  { value: 'openai', label: 'OpenAI', short: 'OAI' },
  { value: 'claude', label: 'Claude', short: 'Claude' },
]

const BREAKDOWN: { key: keyof Pick<FrenchScore, 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency'>; label: string }[] =
  [
    { key: 'grammar', label: 'Grammar' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'pronunciation', label: 'Pronunciation' },
    { key: 'fluency', label: 'Fluency' },
  ]

export default function HomeScreen() {
  const { width } = useWindowDimensions()
  const headerHeight = useHeaderHeight()
  const scrollBottomPad = useTabScreenBottomPadding(24)
  const compact = width < 390
  const scrollRef = useRef<ScrollView>(null)
  const [scorerOffsetY, setScorerOffsetY] = useState(0)
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>()
  const rootNav = tabNav.getParent<NativeStackNavigationProp<RootStackParamList>>()
  const { user } = useAuth()

  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<ScoreProvider>('auto')
  /** Mirrors backend C1 essay routing (OpenAI → Claude when provider is auto). */
  const [c1EssayMode, setC1EssayMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)
  const [resultProvider, setResultProvider] = useState<string | null>(null)
  const [recentScores, setRecentScores] = useState<StoredScore[]>([])
  const [dueReviewCount, setDueReviewCount] = useState(0)
  const [dailyPlan, setDailyPlan] = useState<DailyLessonPlan | null>(null)

  const refreshHistory = useCallback(async () => {
    const rows = await loadRecentScores()
    setRecentScores(rows)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refreshHistory()
    }, [refreshHistory]),
  )

  useFocusEffect(
    useCallback(() => {
      const uid = user?.id ?? ''
      void countDueReviewItems(uid, new Date()).then(setDueReviewCount).catch(() => setDueReviewCount(0))
    }, [user?.id]),
  )

  useFocusEffect(
    useCallback(() => {
      const uid = user?.id ?? ''
      void (async () => {
        try {
          const plan = await generateDailyLessonPlan(uid)
          setDailyPlan(plan)
          await recordDailyPlanShown(user?.id ?? null, plan)
        } catch {
          setDailyPlan(null)
        }
      })()
    }, [user?.id]),
  )

  const canSubmit = text.trim().length > 0 && !loading && inputMode === 'text'

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
      try {
        await recordScoreEvent({
          userId: user?.id ?? null,
          ts: Date.now(),
          score: Number(next.score),
          cecr: String(next.cecr ?? ''),
          provider: providerUsed ?? '',
        })
      } catch {
        // non-fatal: analytics table optional on very old DB files
      }
      if (supabase && user) {
        void syncScoreHistoryToCloud(supabase, user.id, nextHistory).catch(() => {})
      }
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

  const scrollToScorer = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, scorerOffsetY - 12),
      animated: true,
    })
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f8f9fb]"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-[#f8f9fb]"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: scrollBottomPad }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Hero — Figma: blue → violet gradient, centered */}
      <LinearGradient
        colors={['#1d4ed8', '#4f46e5', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginBottom: 20,
          borderRadius: 24,
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
      >
        <Text className="text-center font-display text-3xl text-white">Maîtrise le Français</Text>
        <Text className="mt-1 text-center font-display text-xl text-white/90">avec Élégance</Text>
        <Text className="mt-3 text-center font-sans text-sm leading-5 text-indigo-50">
          Master French with our comprehensive curriculum and AI-powered scoring system. From beginner to intermediate,
          we&apos;ve got you covered.
        </Text>
        <Pressable
          onPress={() => tabNav.navigate('Syllabus')}
          className="mt-6 rounded-2xl bg-white py-3.5 active:opacity-90"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-center text-base font-bold text-blue-600">Start Learning</Text>
            <Ionicons name="arrow-forward" size={18} color="#2563eb" />
          </View>
        </Pressable>
        <Pressable
          onPress={scrollToScorer}
          className="mt-3 rounded-2xl border-2 border-white/80 py-3 active:bg-white/10"
        >
          <Text className="text-center text-sm font-semibold text-white">Try AI Scorer</Text>
        </Pressable>
      </LinearGradient>

      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="font-display text-lg text-slate-900">Structured pathways</Text>
        <Text className="font-sans mt-1 text-xs text-slate-500">Foundation → Expansion → Mastery</Text>
        {[
          { n: '01', t: 'Foundation (A1)', d: 'First steps in everyday French.' },
          { n: '02', t: 'Expansion (A2)', d: 'Stories, routines, and real life.' },
          { n: '03', t: 'Mastery (B1+)', d: 'TEF readiness and nuance.' },
        ].map((row, i) => (
          <View
            key={row.n}
            className={['flex-row items-center gap-3 border-t border-slate-100 py-3', i === 0 ? 'border-t-0 pt-0' : ''].join(
              ' ',
            )}
          >
            <Text className="font-display w-10 text-2xl text-slate-200">{row.n}</Text>
            <View className="min-w-0 flex-1">
              <Text className="font-sans text-[10px] font-bold uppercase text-indigo-700">{row.t}</Text>
              <Text className="font-sans mt-0.5 text-xs text-slate-600">{row.d}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => rootNav?.navigate('WritingJournal')}
        className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 active:opacity-90"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
            <Ionicons name="journal-outline" size={22} color="#ffffff" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-bold text-violet-950">Writing journal</Text>
            <Text className="text-sm text-violet-900">
              Drafts, AI scores, feedback, and insights — all in one place
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#5b21b6" />
        </View>
      </Pressable>

      {dueReviewCount > 0 ? (
        <Pressable
          onPress={() => rootNav?.navigate('SpacedReview', { maxItems: 5 })}
          className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 active:opacity-90"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <Ionicons name="albums-outline" size={22} color="#ffffff" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-bold text-indigo-950">Spaced repetition</Text>
              <Text className="text-sm text-indigo-900">
                Review {Math.min(5, dueReviewCount)} vocabulary & grammar{' '}
                {dueReviewCount === 1 ? 'item' : 'items'} today
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3730a3" />
          </View>
        </Pressable>
      ) : null}

      {dailyPlan && dailyPlan.items.length > 0 ? (
        <View className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <View className="mb-2 flex-row items-center justify-between gap-2">
            <Text className="text-base font-bold text-sky-950">Daily plan</Text>
            {dailyPlan.lightSchedule ? (
              <View className="rounded-full bg-amber-100 px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase text-amber-900">Light day</Text>
              </View>
            ) : null}
          </View>
          <Text className="mb-3 text-xs text-sky-900">
            {dailyPlan.lightSchedule
              ? `Streak just started — keeping today under ${dailyPlan.maxStudyMinutes} min.`
              : `Streak: ${dailyPlan.streakDays} day${dailyPlan.streakDays === 1 ? '' : 's'} · up to ${dailyPlan.maxStudyMinutes} min`}
          </Text>
          {dailyPlan.items.map((item, i) => (
            <Pressable
              key={item.lessonId}
              onPress={() => {
                const planDate = dailyPlan.dateKey
                void recordRecommendationEngagement(user?.id ?? null, planDate, item.lessonId, 'opened')
                rootNav?.navigate('LessonScreen', {
                  unitId: item.lessonId,
                  level: item.level,
                  fromRecommendation: true,
                })
              }}
              className={`flex-row items-start gap-3 rounded-xl bg-white/90 p-3 active:opacity-90 ${i > 0 ? 'mt-2' : ''}`}
            >
              <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
                <Text className="text-sm font-bold text-white">{i + 1}</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="mt-1 text-xs text-slate-600" numberOfLines={3}>
                  {item.rationale}
                </Text>
                <Text className="mt-1 text-[10px] font-semibold uppercase text-sky-800">
                  {item.difficulty.replace('_', ' ')} · impact {item.impactScore} · ~{item.durationMin} min
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0369a1" />
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Feature cards — Figma */}
      <View className="gap-3">
        <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="layers-outline" size={24} color="#1d4ed8" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-bold text-slate-900">{CURRICULUM_STATS.moduleCount} Units</Text>
            <Text className="text-sm text-slate-500">Comprehensive Curriculum</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Ionicons name="book-outline" size={24} color="#047857" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-bold text-slate-900">{CURRICULUM_STATS.lessonCount} Lessons</Text>
            <Text className="text-sm text-slate-500">Structured Learning Path</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-violet-100">
            <Ionicons name="sparkles" size={22} color="#6d28d9" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-bold text-slate-900">AI Powered</Text>
            <Text className="text-sm text-slate-500">Instant Feedback</Text>
          </View>
        </View>
      </View>

      <Text className="mt-8 text-center text-xl font-bold text-slate-900">French Syllabus</Text>
      <Text className="mt-2 px-1 text-center text-sm leading-5 text-slate-600">
        Our structured curriculum takes you from beginner to intermediate level with carefully designed units.
      </Text>

      <Pressable
        onPress={() => rootNav?.navigate('TefPrepHub')}
        className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 p-4 active:opacity-90"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-600">
            <Ionicons name="flag-outline" size={22} color="#ffffff" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-bold uppercase text-red-800">TEF Canada</Text>
            <Text className="text-base font-bold text-red-950">Préparation A1</Text>
            <Text className="text-xs text-red-800">10 unités · lecture, écriture, oral, compréhension</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#b91c1c" />
        </View>
      </Pressable>

      <Text className="mt-6 text-xs font-bold uppercase tracking-widest text-violet-600">Premium linguistic engine</Text>
      <Text className="font-display mt-2 text-2xl text-slate-900">Master French with AI</Text>
      <Text className="font-sans mt-1 text-sm text-slate-500">
        {compact ? 'Text in, instant breakdown.' : 'Choose input mode, provider, then analyze your text.'}
      </Text>
      <Text className="mt-1 text-xs text-slate-400" numberOfLines={1}>
        API: {apiBase}
      </Text>

      {/* Scorer */}
      <View
        className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        onLayout={(e) => setScorerOffsetY(e.nativeEvent.layout.y)}
      >
        <Text className="font-display text-lg text-slate-900">French Scorer</Text>
        <Text className="font-sans mt-1 text-xs leading-5 text-slate-500">
          Score, CEFR, skill breakdown, and corrections — optimized for mobile.
        </Text>

        <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Input</Text>
        <View className="flex-row gap-2 rounded-xl bg-slate-100 p-1">
          <Pressable
            onPress={() => setInputMode('text')}
            className={['flex-1 items-center rounded-lg py-2', inputMode === 'text' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text className={['text-sm font-semibold', inputMode === 'text' ? 'text-slate-900' : 'text-slate-500'].join(' ')}>
              Text
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setInputMode('voice')}
            className={['flex-1 items-center rounded-lg py-2', inputMode === 'voice' ? 'bg-white shadow-sm' : ''].join(' ')}
          >
            <Text className={['text-sm font-semibold', inputMode === 'voice' ? 'text-slate-900' : 'text-slate-500'].join(' ')}>
              {compact ? 'Voice' : 'Voice (demo)'}
            </Text>
          </Pressable>
        </View>

        <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Essay hint</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setC1EssayMode(false)}
            disabled={loading}
            className={['rounded-full px-4 py-2', !c1EssayMode ? 'bg-slate-800' : 'bg-slate-200'].join(' ')}
          >
            <Text className={['text-sm font-semibold', !c1EssayMode ? 'text-white' : 'text-slate-700'].join(' ')}>
              {compact ? 'Any' : 'Any level'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setC1EssayMode(true)}
            disabled={loading}
            className={['rounded-full px-4 py-2', c1EssayMode ? 'bg-violet-600' : 'bg-slate-200'].join(' ')}
          >
            <Text className={['text-sm font-semibold', c1EssayMode ? 'text-white' : 'text-slate-700'].join(' ')}>
              {compact ? 'C1+' : 'C1 essay (auto routing)'}
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
                  {compact ? p.short : p.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {inputMode === 'text' ? (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Écrivez votre texte en français..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            className={[
              'mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-base text-slate-900',
              compact ? 'min-h-[104]' : 'min-h-[132]',
            ].join(' ')}
            editable={!loading}
          />
        ) : (
          <View className="mt-3 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 px-4">
            <Text className="text-center text-sm text-slate-500">
              Voice capture is a placeholder. Switch to <Text className="font-bold text-slate-700">Text</Text> for live AI scoring.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => void onScore()}
          disabled={!canSubmit}
          className={[
            'mt-4 items-center rounded-2xl py-3.5 shadow-lg',
            canSubmit ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-slate-300',
          ].join(' ')}
        >
          <Text className="text-center font-sans-bold text-base text-white">Analyze my French</Text>
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
          <View className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <View className="bg-indigo-600 px-4 py-4">
              <View className="flex-row flex-wrap items-end justify-between gap-2">
                <View className="flex-row items-end">
                  <Text className="text-4xl font-bold text-white">{result.score}</Text>
                  <Text className="mb-1 ml-1 text-sm text-indigo-100">/100</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {resultProvider ? (
                    <View className="rounded-full bg-indigo-800 px-3 py-1">
                      <Text className="text-xs font-medium text-indigo-100">{resultProvider}</Text>
                    </View>
                  ) : null}
                  <View className="rounded-full bg-white px-3 py-1">
                    <Text className="text-xs font-bold text-indigo-800">CEFR {result.cecr}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="border-b border-slate-100 bg-white px-4 py-4">
              <Text className="text-xs font-bold uppercase text-slate-500">Skill breakdown</Text>
              <View className="mt-3" style={{ gap: 12 }}>
                {BREAKDOWN.map(({ key, label }) => {
                  const val = Math.max(0, Math.min(100, result[key]))
                  return (
                    <View key={key}>
                      <View className="mb-1 flex-row justify-between">
                        <Text className="text-sm font-semibold text-slate-800">{label}</Text>
                        <Text className="text-sm text-slate-500">{val}%</Text>
                      </View>
                      <View className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <View
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${val}%` }}
                        />
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

            <View className="bg-slate-50 p-4">
            {result.strengths?.length ? (
              <View>
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
          </View>
        ) : null}
      </View>

      {/* Stats — single column on phone (Figma) */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Text className="text-base font-bold text-slate-900">Stats</Text>
        <Text className="mt-1 text-xs text-slate-500">From your last AI result & history.</Text>
        <View className="mt-3 w-full gap-3">
          <View className="w-full rounded-2xl bg-blue-600 p-4">
            <Text className="text-xs uppercase text-indigo-100">CEFR</Text>
            <Text adjustsFontSizeToFit className="mt-1 text-3xl font-extrabold text-white">
              {latestCecr}
            </Text>
          </View>
          <View className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="text-xs font-semibold uppercase text-amber-800">Streak</Text>
            <Text className="mt-1 text-2xl font-bold text-amber-900">{streak} days</Text>
          </View>
        </View>
      </View>

      {/* Daily vocab + TTS */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Text className="text-base font-bold text-slate-900">Daily vocab</Text>
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
                  void (async () => {
                    await stopFrenchExpoTts()
                    await speakFrenchListening(word, 'fr-FR')
                  })()
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 active:bg-slate-100"
              >
                <Text className="text-xs font-semibold text-blue-700">Listen</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Progress bars */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">Progress</Text>
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
    </KeyboardAvoidingView>
  )
}
