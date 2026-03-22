import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import WeakAreasCard from '../components/WeakAreasCard'
import { CURRICULUM_MODULES, inferLevelFromUnitId, type CEFRLevel } from '../lib/curriculum'
import { useTabScreenBottomPadding } from '../lib/screenPadding'
import type { MainTabParamList } from '../navigation/AppNavigator'
import { navigateRoot } from '../navigation/rootNavigation'
import { getSyllabusData, type SyllabusRow } from '../database'

const LEVEL_FILTER: { label: string; value: CEFRLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
]

const LEVEL_PATH_LABEL: Record<CEFRLevel, string> = {
  A1: 'A1 Beginner',
  A2: 'A2 Elementary',
  B1: 'B1 Intermediate',
  B2: 'B2 Upper intermediate',
  C1: 'C1 Advanced',
}

const NODE = 72
const ZIG_OFFSET = 68
const PATH_WIDTH = Math.min(Dimensions.get('window').width - 32, 360)

/** Rough lesson length for path labels (no DB field). */
const UNIT_MINUTES: Record<string, number> = {
  'a1-u1': 12,
  'a1-u2': 13,
  'a1-u3': 14,
  'a1-u4': 14,
  'a1-u5': 13,
  'a2-u1': 14,
  'a2-u2': 14,
  'a2-u3': 14,
  'a2-u4': 14,
  'a2-u5': 14,
}

function minutesForUnit(id: string): number {
  return UNIT_MINUTES[id] ?? 15
}

function themeEmoji(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('bonjour') || t.includes('basic')) return '👋'
  if (t.includes('family') || t.includes('friend')) return '👪'
  if (t.includes('daily') || t.includes('routine')) return '☀️'
  if (t.includes('food') || t.includes('cafe')) return '☕'
  if (t.includes('direction') || t.includes('town')) return '🧭'
  if (t.includes('past')) return '📅'
  if (t.includes('travel') || t.includes('booking')) return '✈️'
  if (t.includes('health')) return '🏥'
  if (t.includes('work') || t.includes('study')) return '💼'
  if (t.includes('plan') || t.includes('opinion')) return '💭'
  return '📘'
}

function shortThemeLabel(title: string): string {
  const words = title.trim().split(/\s+/).slice(0, 3)
  return words.join(' ')
}

function unitNumberInLevel(allRows: SyllabusRow[], row: SyllabusRow): number {
  const same = allRows
    .filter((r) => r.level === row.level)
    .sort((a, b) => a.orderIndex - b.orderIndex)
  const i = same.findIndex((r) => r.id === row.id)
  return i >= 0 ? i + 1 : row.orderIndex
}

function moduleIdForUnitId(unitId: string): string | undefined {
  for (const m of CURRICULUM_MODULES) {
    if (m.lessons.some((l) => l.contentUnitId === unitId)) return m.id
  }
  return undefined
}

function lockedToast() {
  const msg = 'Complete the previous unit to unlock'
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
  else Alert.alert('Locked', msg)
}

type PathSegment =
  | { kind: 'banner'; level: CEFRLevel }
  | { kind: 'unit'; row: SyllabusRow; pathIndex: number }

function buildPathSegments(rows: SyllabusRow[]): PathSegment[] {
  const out: PathSegment[] = []
  let prev: CEFRLevel | null = null
  let pathIndex = 0
  for (const row of rows) {
    if (row.level !== prev) {
      out.push({ kind: 'banner', level: row.level })
      prev = row.level
    }
    out.push({ kind: 'unit', row, pathIndex: pathIndex })
    pathIndex += 1
  }
  return out
}

function PulsingAvailableRing({ children }: { children: ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 850, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 850, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [scale])
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
}

export default function SyllabusScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Syllabus'>>()
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const [filter, setFilter] = useState<CEFRLevel | 'all'>('all')
  const [rows, setRows] = useState<SyllabusRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setRows(await getSyllabusData())
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter((r) => r.level === filter)
  }, [rows, filter])

  const segments = useMemo(() => buildPathSegments(filteredRows), [filteredRows])

  const firstAvailableId = useMemo(
    () => filteredRows.find((r) => r.status === 'available')?.id ?? null,
    [filteredRows],
  )

  const progressByLevel = useMemo(() => {
    const m = new Map<CEFRLevel, { done: number; total: number }>()
    for (const r of rows) {
      const cur = m.get(r.level) ?? { done: 0, total: 0 }
      cur.total += 1
      if (r.status === 'completed') cur.done += 1
      m.set(r.level, cur)
    }
    return m
  }, [rows])

  const levelsToShow = useMemo(() => {
    const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
    if (filter === 'all') return order.filter((lv) => (progressByLevel.get(lv)?.total ?? 0) > 0)
    return [filter]
  }, [filter, progressByLevel])

  const openLesson = (row: SyllabusRow, reviewMode: boolean) => {
    const level = inferLevelFromUnitId(row.id)
    const moduleId = moduleIdForUnitId(row.id)
    navigateRoot('LessonScreen', {
      unitId: row.id,
      level,
      ...(moduleId ? { moduleId } : {}),
      reviewMode,
    })
  }

  const onPressNode = (row: SyllabusRow) => {
    if (row.status === 'locked') {
      lockedToast()
      return
    }
    if (row.status === 'available') {
      openLesson(row, false)
      return
    }
    openLesson(row, true)
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: scrollBottomPad }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => navigateRoot('TefPrepHub')}
        className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 active:bg-red-100"
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="flag" size={20} color="#b91c1c" />
            <Text className="text-sm font-bold text-red-900">TEF Canada Prep (A1)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#b91c1c" />
        </View>
        <Text className="mt-1 text-xs text-red-800">Hors syllabus principal · 4 salles par unité</Text>
      </Pressable>

      <WeakAreasCard />

      <Pressable
        onPress={() => navigateRoot('GrammarAtelier')}
        className="mb-5 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm active:bg-indigo-100/80"
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#1e293b]">
              <Ionicons name="flask" size={22} color="#e0e7ff" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">Grammar Atelier</Text>
              <Text className="text-base font-bold text-slate-900">Interactive lab · B2</Text>
              <Text className="text-xs text-slate-600">Tense sorting, agreement drills, syntax reordering.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4338ca" />
        </View>
      </Pressable>

      <View className="mb-5 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-violet-100">
          <Ionicons name="ribbon" size={22} color="#6d28d9" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-slate-900">AI Powered</Text>
          <Text className="text-sm text-slate-500">Instant Feedback</Text>
        </View>
      </View>

      <Text className="text-center text-2xl font-bold text-slate-900">Your learning path</Text>
      <Text className="mt-2 px-1 text-center text-sm leading-5 text-slate-600">
        Follow the path unit by unit. Complete each step to unlock the next.
      </Text>

      {/* XP-style progress summary */}
      <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">Progress</Text>
        {levelsToShow.map((lv) => {
          const p = progressByLevel.get(lv) ?? { done: 0, total: 0 }
          const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0
          return (
            <View key={lv} className="mt-3">
              <Text className="text-sm font-semibold text-slate-800">
                {lv}: {p.done} / {p.total} units complete
              </Text>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <View className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
              </View>
            </View>
          )
        })}
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16, flexGrow: 0 }}
        contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}
      >
        {LEVEL_FILTER.map(({ label, value }) => {
          const active = filter === value
          return (
            <Pressable
              key={label}
              onPress={() => setFilter(value)}
              className={['rounded-full px-4 py-2', active ? 'bg-slate-900' : 'bg-slate-200'].join(' ')}
            >
              <Text className={['text-sm font-semibold', active ? 'text-white' : 'text-slate-700'].join(' ')}>
                {label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {loading ? (
        <View className="mt-10 items-center py-8">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-sm text-slate-600">Loading your path…</Text>
        </View>
      ) : filteredRows.length === 0 ? (
        <View className="mt-8 items-center rounded-2xl border border-dashed border-slate-300 bg-white py-10">
          <Text className="text-sm text-slate-600">No units for this filter yet.</Text>
        </View>
      ) : (
        <View className="mt-6" style={{ width: PATH_WIDTH, alignSelf: 'center' }}>
          {segments.map((seg, si) => {
            if (seg.kind === 'banner') {
              return (
                <View key={`banner-${seg.level}-${si}`} className="mb-2 mt-4 flex-row items-center gap-2">
                  <View className="h-px flex-1 bg-slate-300" />
                  <View className="rounded-full bg-slate-200 px-4 py-2">
                    <Text className="text-center text-xs font-bold text-slate-700">
                      ── {LEVEL_PATH_LABEL[seg.level]} ──
                    </Text>
                  </View>
                  <View className="h-px flex-1 bg-slate-300" />
                </View>
              )
            }

            const { row, pathIndex } = seg
            const isLeft = pathIndex % 2 === 0
            const num = unitNumberInLevel(rows, row)
            const mins = minutesForUnit(row.id)
            const isPulse = row.status === 'available' && row.id === firstAvailableId

            const circleInner = (
              <View
                className={[
                  'items-center justify-center rounded-full',
                  row.status === 'completed' && 'bg-emerald-500',
                  row.status === 'available' && 'bg-blue-600',
                  row.status === 'locked' && 'border-2 border-slate-300 bg-slate-200',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ width: NODE, height: NODE }}
              >
                {row.status === 'completed' ? (
                  <Ionicons name="checkmark" size={36} color="#ffffff" />
                ) : null}
                {row.status === 'available' ? (
                  <Text className="text-2xl font-bold text-white">{num}</Text>
                ) : null}
                {row.status === 'locked' ? (
                  <Text className="text-2xl" style={{ opacity: 0.85 }}>
                    🔒
                  </Text>
                ) : null}
              </View>
            )

            return (
              <View key={row.id}>
                {pathIndex > 0 ? (
                  <View style={{ width: PATH_WIDTH, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        width: 0,
                        height: 24,
                        borderLeftWidth: 2,
                        borderLeftColor: '#cbd5e1',
                        borderStyle: 'dashed',
                      }}
                    />
                  </View>
                ) : null}

                <View style={{ width: PATH_WIDTH, alignItems: 'center' }}>
                  {row.status === 'completed' ? (
                    <Text className="mb-1 text-lg">{themeEmoji(row.title)}</Text>
                  ) : (
                    <View style={{ height: 22 }} />
                  )}

                  <View style={{ transform: [{ translateX: isLeft ? -ZIG_OFFSET : ZIG_OFFSET }] }}>
                    <Pressable onPress={() => onPressNode(row)} className="active:opacity-90">
                      {isPulse ? <PulsingAvailableRing>{circleInner}</PulsingAvailableRing> : circleInner}
                    </Pressable>
                  </View>

                  <Text
                    className={[
                      'mt-2 max-w-[200px] text-center text-sm font-semibold',
                      row.status === 'locked' ? 'text-slate-400' : 'text-slate-800',
                    ].join(' ')}
                    numberOfLines={2}
                  >
                    {shortThemeLabel(row.title)}
                  </Text>
                  <Text
                    className={['mt-0.5 text-xs', row.status === 'locked' ? 'text-slate-400' : 'text-slate-500'].join(
                      ' ',
                    )}
                  >
                    {mins} min
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      <View className="mt-8 items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Text className="text-center text-lg font-bold text-slate-900">Ready to Test Your French?</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-slate-600">
          Use our AI-powered French scorer to get instant feedback on your grammar, vocabulary, and writing.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          className="mt-4 w-full flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
        >
          <Ionicons name="sparkles" size={18} color="#ffffff" />
          <Text className="text-center text-base font-bold text-white">Try AI Scorer Now</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
