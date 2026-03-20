import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { buildHighlightedSegments } from '../lib/journalHighlight'
import { getModuleIdForContentUnit } from '../lib/curriculum'
import type { RootStackParamList } from '../navigation/AppNavigator'
import {
  getEntryWithFeedback,
  submitForScoring,
  type EntryWithFeedback,
  type WritingJournalFeedback,
  type WritingJournalScore,
} from '../database/WritingJournalService'
import { getPracticeLessonsForFeedback } from '../services/errorPatternAnalyzer'
import { syncJournalEntryToCloudIfPossible } from '../services/writingJournalCloudSync'
import type { ScoreProvider } from '../api/scoreFrench'

const PROVIDERS: { value: ScoreProvider; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
]

type Nav = NativeStackNavigationProp<RootStackParamList, 'JournalEntryDetail'>
type R = RouteProp<RootStackParamList, 'JournalEntryDetail'>

export default function JournalEntryDetailScreen() {
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const navigation = useNavigation<Nav>()
  const route = useRoute<R>()
  const { entryId } = route.params

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EntryWithFeedback | null>(null)
  const [scoreIdx, setScoreIdx] = useState(0)
  const [rescoring, setRescoring] = useState(false)
  const [provider, setProvider] = useState<ScoreProvider>('auto')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const row = await getEntryWithFeedback(entryId, uid)
      setData(row)
      if (row && row.scores.length > 0) {
        setScoreIdx(row.scores.length - 1)
      } else {
        setScoreIdx(0)
      }
    } finally {
      setLoading(false)
    }
  }, [entryId, uid])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const active = useMemo(() => {
    if (!data || data.scores.length === 0) return null
    const i = Math.min(Math.max(0, scoreIdx), data.scores.length - 1)
    return data.scores[i]
  }, [data, scoreIdx])

  const feedback: WritingJournalFeedback | null = active?.feedback ?? null
  const score: WritingJournalScore | undefined = active?.score

  const segments = useMemo(() => {
    if (!data) return []
    const fb = feedback
    return buildHighlightedSegments(
      data.entry.content,
      fb?.errorExamples ?? [],
      fb?.suggestions ?? [],
      fb?.feedbackText ?? '',
    )
  }, [data, feedback])

  const lessonLinks = useMemo(() => {
    const blob = feedback?.feedbackText ?? ''
    return getPracticeLessonsForFeedback(blob)
  }, [feedback?.feedbackText])

  const onRescore = async () => {
    setRescoring(true)
    try {
      await submitForScoring(entryId, provider, { userId: uid })
      await syncJournalEntryToCloudIfPossible(supabase, uid, entryId)
      await load()
      Alert.alert('Done', 'New score saved. Scroll versions below if you re-scored before.')
    } catch (e) {
      Alert.alert('Scoring failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setRescoring(false)
    }
  }

  if (loading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-3 text-sm text-slate-500">Loading entry…</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-base font-semibold text-slate-700">Entry not found</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5">
          <Text className="font-bold text-white">Go back</Text>
        </Pressable>
      </View>
    )
  }

  const { entry } = data

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-bold text-slate-900">{entry.title || 'Untitled'}</Text>
        <Text className="mt-1 text-xs text-slate-500">
          {entry.createdAt.toLocaleString()} · {entry.wordCount} words · {entry.category || 'No category'}
          {entry.draft ? ' · Draft' : ''}
        </Text>
      </View>

      <Text className="mb-2 mt-4 text-sm font-bold text-slate-800">Your text</Text>
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-base leading-7 text-slate-900">
          {segments.map((seg, i) => (
            <Text
              key={i}
              className={seg.highlight ? 'bg-amber-200/90 text-amber-950' : ''}
              style={seg.highlight ? { backgroundColor: '#fde68a' } : undefined}
            >
              {seg.text}
            </Text>
          ))}
        </Text>
        {segments.length === 1 && !segments[0].highlight ? (
          <Text className="mt-2 text-xs text-slate-400">
            Highlights appear when feedback includes matching phrases or quoted examples.
          </Text>
        ) : null}
      </View>

      {data.scores.length > 1 ? (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-bold text-slate-800">Score version</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {data.scores.map((s, i) => (
              <Pressable
                key={s.score.id}
                onPress={() => setScoreIdx(i)}
                className={[
                  'rounded-xl border px-3 py-2',
                  i === scoreIdx ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <Text className="text-xs font-semibold text-slate-800">
                  #{i + 1} · {s.score.overallScore}
                </Text>
                <Text className="text-[10px] text-slate-500">{s.score.scoredAt.toLocaleString()}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {score ? (
        <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Text className="text-base font-bold text-slate-900">Overall {score.overallScore}</Text>
          <Text className="text-xs text-slate-500">CEFR {score.cecr} · {score.aiProvider}</Text>
          <View className="mt-3 gap-2">
            {(
              [
                ['Grammar', score.grammarScore],
                ['Vocabulary', score.vocabScore],
                ['Pronunciation', score.pronunciationScore],
                ['Fluency', score.fluencyScore],
              ] as const
            ).map(([label, v]) => (
              <View key={label}>
                <View className="mb-1 flex-row justify-between">
                  <Text className="text-xs font-semibold text-slate-600">{label}</Text>
                  <Text className="text-xs font-bold text-slate-900">{v}%</Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <View className="h-2 rounded-full bg-indigo-500" style={{ width: `${v}%` }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <Text className="text-sm text-slate-600">Not scored yet. Submit from the journal tab or below.</Text>
        </View>
      )}

      {feedback ? (
        <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-sm font-bold text-slate-900">AI feedback</Text>
          <Text className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-700">{feedback.feedbackText}</Text>
        </View>
      ) : null}

      {lessonLinks.length > 0 ? (
        <View className="mt-4">
          <Text className="mb-2 text-sm font-bold text-slate-800">Practice this grammar point</Text>
          {lessonLinks.map((l) => {
            const moduleId = getModuleIdForContentUnit(l.unitId)
            return (
              <Pressable
                key={l.unitId + l.title}
                onPress={() =>
                  navigation.navigate('LessonScreen', {
                    unitId: l.unitId,
                    level: l.level,
                    ...(moduleId ? { moduleId } : {}),
                  })
                }
                className="mb-2 flex-row items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3"
              >
                <Text className="flex-1 text-sm font-semibold text-emerald-950">{l.title}</Text>
                <Ionicons name="open-outline" size={18} color="#047857" />
              </Pressable>
            )
          })}
        </View>
      ) : null}

      <Text className="mb-2 mt-6 text-sm font-bold text-slate-800">Re-score with AI</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 8 }}>
        {PROVIDERS.map((p) => {
          const on = provider === p.value
          return (
            <Pressable
              key={p.value}
              onPress={() => setProvider(p.value)}
              disabled={rescoring}
              className={['rounded-full px-3 py-1.5', on ? 'bg-slate-900' : 'bg-slate-200'].join(' ')}
            >
              <Text className={['text-xs font-semibold', on ? 'text-white' : 'text-slate-700'].join(' ')}>
                {p.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
      <Pressable
        onPress={() => void onRescore()}
        disabled={rescoring || entry.draft}
        className={[
          'flex-row items-center justify-center gap-2 rounded-xl py-3.5',
          rescoring || entry.draft ? 'bg-slate-300' : 'bg-indigo-600 active:bg-indigo-700',
        ].join(' ')}
      >
        {rescoring ? <ActivityIndicator color="#fff" /> : <Ionicons name="refresh" size={20} color="#fff" />}
        <Text className="text-center text-base font-bold text-white">
          {entry.draft ? 'Save & submit from Journal first' : 'Re-submit for scoring'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate('WritingJournal', { focusTab: 'new', editEntryId: entry.id })
        }
        className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3.5 active:bg-slate-50"
      >
        <Ionicons name="create-outline" size={20} color="#0f172a" />
        <Text className="text-center text-base font-bold text-slate-900">Edit & resubmit</Text>
      </Pressable>
    </ScrollView>
  )
}
