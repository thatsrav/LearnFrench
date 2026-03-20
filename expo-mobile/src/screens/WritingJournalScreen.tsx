import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { JOURNAL_CATEGORY_OPTIONS } from '../lib/journalCategories'
import { getModuleIdForContentUnit } from '../lib/curriculum'
import type { RootStackParamList } from '../navigation/AppNavigator'
import {
  deleteEntry,
  getJournalEntries,
  getScoreTrendLastDays,
  getWritingEntryById,
  saveWritingDraft,
  submitForScoring,
  type JournalListEntry,
  type ScoreTrendPoint,
} from '../database/WritingJournalService'
import {
  analyzeErrorPatterns,
  generatePersonalizedTips,
  type ErrorPattern,
} from '../services/errorPatternAnalyzer'
import { syncJournalEntryToCloudIfPossible, deleteWritingEntryFromCloud } from '../services/writingJournalCloudSync'
import type { ScoreProvider } from '../api/scoreFrench'

const PROVIDERS: { value: ScoreProvider; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'groq', label: 'Groq' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
]

type TabKey = 'new' | 'entries' | 'insights'

type Nav = NativeStackNavigationProp<RootStackParamList, 'WritingJournal'>
type R = RouteProp<RootStackParamList, 'WritingJournal'>

function ScoreTrendChart({ points }: { points: ScoreTrendPoint[] }) {
  const max = 100
  const lastWithScore = [...points].reverse().find((p) => p.score != null)?.score ?? 0
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-sm font-bold text-slate-900">Score trend (30 days)</Text>
      <Text className="mt-1 text-xs text-slate-500">Daily = best score that day; line carries forward.</Text>
      <View className="mt-4 h-36 flex-row items-end justify-between gap-0.5">
        {points.map((p) => {
          const h = p.score != null ? Math.max(4, (p.score / max) * 120) : 2
          return (
            <View key={p.dayKey} className="flex-1 items-center">
              <View
                className={p.score != null ? 'w-full rounded-t bg-indigo-500' : 'w-full rounded-t bg-slate-200'}
                style={{ height: h }}
              />
            </View>
          )
        })}
      </View>
      <Text className="mt-2 text-center text-xs text-slate-500">
        Latest carry: {lastWithScore > 0 ? `${lastWithScore}` : '—'} / 100
      </Text>
    </View>
  )
}

function JournalRow({
  item,
  onOpen,
  onDelete,
}: {
  item: JournalListEntry
  onOpen: () => void
  onDelete: () => void
}) {
  const renderRight = useCallback(
    () => (
      <View className="flex-row">
        <Pressable
          onPress={onDelete}
          className="h-full justify-center bg-rose-600 px-5 active:bg-rose-700"
          accessibilityLabel="Delete entry"
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </Pressable>
      </View>
    ),
    [onDelete],
  )

  return (
    <Swipeable renderRightActions={renderRight} overshootRight={false}>
      <Pressable
        onPress={onOpen}
        className="border-b border-slate-100 bg-white px-4 py-3 active:bg-slate-50"
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
              {item.title || 'Untitled'}
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              {item.createdAt.toLocaleDateString()} · {item.wordCount} w · {item.category || '—'}
              {item.draft ? ' · Draft' : ''}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-indigo-700">
              {item.latestOverallScore != null ? item.latestOverallScore : '—'}
            </Text>
            <Text className="text-[10px] text-slate-400">score</Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  )
}

export default function WritingJournalScreen() {
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const navigation = useNavigation<Nav>()
  const route = useRoute<R>()

  const [tab, setTab] = useState<TabKey>('new')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>(JOURNAL_CATEGORY_OPTIONS[0])
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ScoreProvider>('auto')
  const [saving, setSaving] = useState(false)
  const [scoring, setScoring] = useState(false)

  const [list, setList] = useState<JournalListEntry[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMinScore, setFilterMinScore] = useState('')
  const [filterMaxScore, setFilterMaxScore] = useState('')

  const [trend, setTrend] = useState<ScoreTrendPoint[]>([])
  const [patterns, setPatterns] = useState<ErrorPattern[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  const applyRouteParams = useCallback(async () => {
    const ft = route.params?.focusTab
    if (ft === 'new' || ft === 'entries' || ft === 'insights') setTab(ft)
    const eid = route.params?.editEntryId
    if (eid != null) {
      const row = await getWritingEntryById(eid, uid)
      if (row) {
        setTitle(row.title)
        setContent(row.content)
        setCategory(row.category || JOURNAL_CATEGORY_OPTIONS[0])
        setEditingEntryId(row.id)
        setTab('new')
      }
      navigation.setParams({ editEntryId: undefined, focusTab: undefined })
    }
  }, [navigation, route.params?.editEntryId, route.params?.focusTab, uid])

  const refreshList = useCallback(async () => {
    setListLoading(true)
    try {
      const minS = filterMinScore.trim() === '' ? undefined : Number(filterMinScore)
      const maxS = filterMaxScore.trim() === '' ? undefined : Number(filterMaxScore)
      const df =
        filterDateFrom.trim() === ''
          ? undefined
          : (() => {
              const d = new Date(filterDateFrom)
              return Number.isNaN(d.getTime()) ? undefined : d
            })()
      const dt =
        filterDateTo.trim() === ''
          ? undefined
          : (() => {
              const d = new Date(filterDateTo)
              return Number.isNaN(d.getTime()) ? undefined : d
            })()

      const res = await getJournalEntries(uid, {
        limit: 80,
        offset: 0,
        filters: {
          dateFrom: df,
          dateTo: dt,
          category: filterCategory.trim() || undefined,
          minScore: minS != null && Number.isFinite(minS) ? minS : undefined,
          maxScore: maxS != null && Number.isFinite(maxS) ? maxS : undefined,
        },
      })
      setList(res.entries)
    } finally {
      setListLoading(false)
    }
  }, [uid, filterCategory, filterDateFrom, filterDateTo, filterMinScore, filterMaxScore])

  useFocusEffect(
    useCallback(() => {
      if (tab === 'entries') void refreshList()
    }, [tab, refreshList]),
  )

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true)
    try {
      const [tr, pat] = await Promise.all([
        getScoreTrendLastDays(uid, 30),
        analyzeErrorPatterns(uid, 'month'),
      ])
      setTrend(tr)
      setPatterns(pat)
    } finally {
      setInsightsLoading(false)
    }
  }, [uid])

  useFocusEffect(
    useCallback(() => {
      if (tab === 'insights') void refreshInsights()
    }, [tab, refreshInsights]),
  )

  useFocusEffect(
    useCallback(() => {
      void applyRouteParams()
    }, [applyRouteParams]),
  )

  const tips = useMemo(() => generatePersonalizedTips(patterns), [patterns])

  const persistDraft = async (asDraft: boolean): Promise<number> => {
    const id = await saveWritingDraft(uid, title, content, {
      category,
      entryId: editingEntryId ?? undefined,
      draft: asDraft,
    })
    if (editingEntryId == null) setEditingEntryId(id)
    return id
  }

  const onSaveDraft = async () => {
    if (!content.trim()) {
      Alert.alert('Empty', 'Write something before saving.')
      return
    }
    setSaving(true)
    try {
      const id = await persistDraft(true)
      try {
        await syncJournalEntryToCloudIfPossible(supabase, uid, id)
      } catch (e) {
        console.warn('[journal cloud]', e)
      }
      Alert.alert('Saved', 'Draft stored locally' + (user ? ' and synced if online.' : '.'))
      void refreshList()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onSubmitScore = async () => {
    if (!content.trim()) {
      Alert.alert('Empty', 'Write something before submitting.')
      return
    }
    setScoring(true)
    try {
      const id = await persistDraft(true)
      await submitForScoring(id, provider, { userId: uid })
      try {
        await syncJournalEntryToCloudIfPossible(supabase, uid, id)
      } catch (e) {
        console.warn('[journal cloud]', e)
      }
      setEditingEntryId(null)
      setTitle('')
      setContent('')
      setCategory(JOURNAL_CATEGORY_OPTIONS[0])
      void refreshList()
      navigation.navigate('JournalEntryDetail', { entryId: id })
    } catch (e) {
      Alert.alert('Scoring failed', e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setScoring(false)
    }
  }

  const confirmDelete = (item: JournalListEntry) => {
    Alert.alert('Delete entry?', `"${item.title || 'Untitled'}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          void (async () => {
            try {
              if (item.remoteId && supabase && uid) {
                await deleteWritingEntryFromCloud(supabase, uid, item.remoteId)
              }
            } catch (e) {
              console.warn('[journal cloud delete]', e)
            }
            await deleteEntry(item.id, uid)
            if (editingEntryId === item.id) {
              setEditingEntryId(null)
              setTitle('')
              setContent('')
            }
            void refreshList()
          })(),
      },
    ])
  }

  const TabChip = ({ k, label }: { k: TabKey; label: string }) => {
    const on = tab === k
    return (
      <Pressable
        onPress={() => setTab(k)}
        className={['flex-1 items-center rounded-xl py-2.5', on ? 'bg-slate-900' : 'bg-transparent'].join(' ')}
      >
        <Text className={['text-center text-xs font-bold', on ? 'text-white' : 'text-slate-600'].join(' ')}>{label}</Text>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row gap-1 border-b border-slate-200 bg-white px-2 py-2">
        <TabChip k="new" label="New entry" />
        <TabChip k="entries" label="My entries" />
        <TabChip k="insights" label="Insights" />
      </View>

      {tab === 'new' ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {editingEntryId != null ? (
            <Text className="mb-2 text-xs font-semibold text-indigo-700">Editing entry #{editingEntryId}</Text>
          ) : null}
          <Text className="mb-1 text-xs font-semibold uppercase text-slate-500">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Optional title"
            className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900"
            placeholderTextColor="#94a3b8"
          />
          <Text className="mb-1 text-xs font-semibold uppercase text-slate-500">Category</Text>
          <Pressable
            onPress={() => setCategoryOpen(true)}
            className="mb-3 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            <Text className="text-base text-slate-900">{category}</Text>
            <Ionicons name="chevron-down" size={18} color="#64748b" />
          </Pressable>
          <Modal visible={categoryOpen} transparent animationType="fade">
            <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setCategoryOpen(false)}>
              <View className="rounded-t-3xl bg-white p-4">
                <Text className="mb-3 text-base font-bold text-slate-900">Category</Text>
                {JOURNAL_CATEGORY_OPTIONS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setCategory(c)
                      setCategoryOpen(false)
                    }}
                    className="border-b border-slate-100 py-3"
                  >
                    <Text className="text-base text-slate-800">{c}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>

          <Text className="mb-1 text-xs font-semibold uppercase text-slate-500">Your French text</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Écrivez en français…"
            multiline
            textAlignVertical="top"
            className="mb-3 min-h-[180px] rounded-xl border border-slate-200 bg-white px-3 py-3 text-base leading-6 text-slate-900"
            placeholderTextColor="#94a3b8"
          />

          <Text className="mb-1 text-xs font-semibold uppercase text-slate-500">AI provider</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            {PROVIDERS.map((p) => {
              const on = provider === p.value
              return (
                <Pressable
                  key={p.value}
                  onPress={() => setProvider(p.value)}
                  disabled={scoring || saving}
                  className={['rounded-full px-3 py-1.5', on ? 'bg-slate-900' : 'bg-slate-200'].join(' ')}
                >
                  <Text className={['text-xs font-semibold', on ? 'text-white' : 'text-slate-700'].join(' ')}>
                    {p.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {(saving || scoring) && (
            <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2">
              <ActivityIndicator color="#4f46e5" />
              <Text className="text-sm text-indigo-900">{scoring ? 'Scoring with AI…' : 'Saving…'}</Text>
            </View>
          )}

          <Pressable
            onPress={() => void onSaveDraft()}
            disabled={saving || scoring}
            className="mb-2 rounded-xl border border-slate-300 bg-white py-3.5 active:bg-slate-50"
          >
            <Text className="text-center text-base font-bold text-slate-900">Save draft</Text>
          </Pressable>
          <Pressable
            onPress={() => void onSubmitScore()}
            disabled={saving || scoring}
            className="rounded-xl bg-indigo-600 py-3.5 active:bg-indigo-700"
          >
            <Text className="text-center text-base font-bold text-white">Submit for AI score</Text>
          </Pressable>
          <Text className="mt-3 text-center text-xs text-slate-500">
            Drafts sync to the cloud when you&apos;re signed in (Supabase). Scoring uses your FrenchLearn API.
          </Text>
        </ScrollView>
      ) : null}

      {tab === 'entries' ? (
        <View className="flex-1">
          <View className="border-b border-slate-200 bg-white px-3 py-2">
            <Text className="mb-2 text-xs font-bold uppercase text-slate-500">Filters</Text>
            <View className="flex-row flex-wrap gap-2">
              <TextInput
                value={filterDateFrom}
                onChangeText={setFilterDateFrom}
                placeholder="From YYYY-MM-DD"
                className="min-w-[120px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                value={filterDateTo}
                onChangeText={setFilterDateTo}
                placeholder="To YYYY-MM-DD"
                className="min-w-[120px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <TextInput
                value={filterCategory}
                onChangeText={setFilterCategory}
                placeholder="Category (exact)"
                className="min-w-[100px] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                value={filterMinScore}
                onChangeText={setFilterMinScore}
                placeholder="Min score"
                keyboardType="number-pad"
                className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                value={filterMaxScore}
                onChangeText={setFilterMaxScore}
                placeholder="Max"
                keyboardType="number-pad"
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <Pressable onPress={() => void refreshList()} className="mt-2 self-start rounded-lg bg-slate-900 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">Apply</Text>
            </Pressable>
          </View>
          {listLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={list}
              keyExtractor={(i) => String(i.id)}
              ListEmptyComponent={
                <Text className="px-4 py-8 text-center text-sm text-slate-500">No entries match your filters.</Text>
              }
              renderItem={({ item }) => (
                <JournalRow
                  item={item}
                  onOpen={() => navigation.navigate('JournalEntryDetail', { entryId: item.id })}
                  onDelete={() => confirmDelete(item)}
                />
              )}
            />
          )}
        </View>
      ) : null}

      {tab === 'insights' ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {insightsLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-2 text-sm text-slate-500">Loading insights…</Text>
            </View>
          ) : (
            <>
              <ScoreTrendChart points={trend} />
              <Text className="mb-2 mt-6 text-sm font-bold text-slate-900">Top repeated issues</Text>
              {patterns.length === 0 ? (
                <Text className="text-sm text-slate-500">Score more journal entries this month to see patterns.</Text>
              ) : (
                patterns.map((p) => (
                  <View key={p.errorType} className="mb-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3">
                    <Text className="text-sm font-bold text-amber-950">
                      {p.errorType.replace(/-/g, ' ')} · {p.frequency}× · {Math.round(p.confidence * 100)}% conf.
                    </Text>
                    {p.examples.slice(0, 2).map((ex, i) => (
                      <Text key={i} className="mt-1 text-xs text-amber-900" numberOfLines={3}>
                        “{ex}”
                      </Text>
                    ))}
                    <Text className="mt-2 text-xs font-semibold text-amber-800">Suggested lessons</Text>
                    {p.practiceLessons.map((l) => {
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
                          className="mt-1"
                        >
                          <Text className="text-xs font-bold text-indigo-700">→ {l.title}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                ))
              )}
              <Text className="mb-2 mt-6 text-sm font-bold text-slate-900">Tips for you</Text>
              {tips.map((t, i) => (
                <Text key={i} className="mb-2 text-sm leading-5 text-slate-700">
                  • {t}
                </Text>
              ))}
            </>
          )}
        </ScrollView>
      ) : null}
    </View>
  )
}
