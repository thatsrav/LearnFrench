import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import {
  countModuleProgress,
  getLessonCardStatuses,
  getModuleById,
  inferLevelFromUnitId,
  type LessonCardStatus,
} from '../lib/curriculum'
import { getSyllabusData, type SyllabusRow } from '../database'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

type RouteParams = { moduleId: string }

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
  else Alert.alert('Notice', msg)
}

function LessonStatusIcon({
  status,
  locked,
}: {
  status: LessonCardStatus
  locked: boolean
}) {
  const isDone = status === 'completed'
  const isActive = status === 'in_progress'

  if (isDone) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
        <Ionicons name="checkmark" size={22} color="#ffffff" />
      </View>
    )
  }
  if (isActive) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-600">
        <Ionicons name="play" size={20} color="#ffffff" style={{ marginLeft: 2 }} />
      </View>
    )
  }
  return (
    <View
      className={[
        'h-10 w-10 rounded-full border-2 bg-white',
        locked ? 'border-slate-300' : 'border-slate-200',
      ].join(' ')}
    />
  )
}

export default function UnitOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const scrollBottomPad = useStackScreenBottomPadding(32)
  const route = useRoute()
  const { moduleId } = route.params as RouteParams
  const mod = getModuleById(moduleId)

  const [rows, setRows] = useState<SyllabusRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setRows(await getSyllabusData())
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const { statuses, progress } = useMemo(() => {
    if (!mod) return { statuses: [] as LessonCardStatus[], progress: { done: 0, total: 0, percent: 0 } }
    const statuses = getLessonCardStatuses(mod, rows)
    const progress = countModuleProgress(mod, rows)
    return { statuses, progress }
  }, [mod, rows])

  if (!mod) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-base font-semibold text-slate-800">Unit not found</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
          <Text className="font-semibold text-white">Go back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: scrollBottomPad }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => navigation.goBack()} className="mb-4 flex-row items-center gap-1 self-start active:opacity-70">
        <Ionicons name="chevron-back" size={18} color="#2563eb" />
        <Text className="text-sm font-semibold text-blue-600">Back to All Units</Text>
      </Pressable>

      <View className="self-start rounded-full bg-slate-900 px-3 py-1.5">
        <Text className="text-xs font-bold text-white">{mod.levelBadge}</Text>
      </View>

      <Text className="mt-3 text-xl font-bold leading-7 text-slate-900">{mod.frenchTitle}</Text>
      <Text className="mt-1 text-base font-semibold text-slate-500">— {mod.englishTitle}</Text>
      <Text className="mt-2 text-sm leading-5 text-slate-600">{mod.description}</Text>

      <View className="mt-4 flex-row flex-wrap gap-x-5 gap-y-2">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="book-outline" size={18} color="#64748b" />
          <Text className="text-sm font-medium text-slate-600">{mod.lessons.length} Lessons</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text className="text-sm font-medium text-slate-600">{mod.durationWeeks} weeks</Text>
        </View>
      </View>

      <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-base font-bold text-slate-900">Your Progress</Text>
        <Text className="mt-1 text-sm text-slate-500">
          {progress.done} of {progress.total} lessons completed
        </Text>
        <View className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <View
            className="h-full rounded-full bg-slate-800"
            style={{ width: `${progress.percent}%` }}
          />
        </View>
        <Text className="mt-2 text-xs font-bold text-slate-600">{progress.percent}% Complete</Text>
      </View>

      <Text className="mt-8 text-base font-bold text-slate-900">Topics Covered</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {mod.topics.map((t) => (
          <View key={t} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
            <Text className="text-xs font-semibold text-slate-700">{t}</Text>
          </View>
        ))}
      </View>

      <Text className="mt-8 text-base font-bold text-slate-900">Lessons</Text>
      {loading ? (
        <View className="mt-6 items-center py-8">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {mod.lessons.map((lesson, idx) => {
            const status = statuses[idx]
            const isActive = status === 'in_progress'
            const isDone = status === 'completed'
            const isSoon = status === 'coming_soon'
            const isLocked = status === 'locked'

            const openLesson = () => {
              if (!lesson.contentUnitId) return
              if (isLocked || isSoon) {
                toast(isSoon ? 'This lesson is coming soon.' : 'Complete the previous unit in your path to unlock.')
                return
              }
              const level = inferLevelFromUnitId(lesson.contentUnitId)
              navigation.navigate('LessonScreen', { unitId: lesson.contentUnitId, level, moduleId: mod.id })
            }

            return (
              <View
                key={lesson.id}
                className={[
                  'rounded-2xl border bg-white p-3.5 shadow-sm',
                  isActive ? 'border-2 border-blue-500' : 'border border-slate-200',
                  isLocked || isSoon ? 'opacity-60' : '',
                ].join(' ')}
              >
                <View className="flex-row items-start gap-3">
                  <View className="pt-0.5">
                    <LessonStatusIcon status={status} locked={isLocked || isSoon} />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-bold leading-5 text-slate-900" numberOfLines={4}>
                      {lesson.title}
                    </Text>
                    {lesson.subtitle ? (
                      <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={2}>
                        {lesson.subtitle}
                      </Text>
                    ) : null}
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text className="text-xs text-slate-500">{lesson.durationMin} min</Text>
                    </View>
                    {isActive ? (
                      <View className="mt-2 self-start rounded-md bg-slate-900 px-2 py-1">
                        <Text className="text-[10px] font-bold text-white">In Progress</Text>
                      </View>
                    ) : null}
                    {isSoon ? (
                      <View className="mt-2 self-start rounded-md bg-slate-200 px-2 py-1">
                        <Text className="text-[10px] font-bold text-slate-600">Soon</Text>
                      </View>
                    ) : null}
                  </View>

                  <View className="min-w-[76] items-end pt-0.5">
                    {isDone && lesson.contentUnitId ? (
                      <Pressable
                        onPress={openLesson}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 active:bg-slate-50"
                      >
                        <Text className="text-xs font-bold text-slate-800">Review</Text>
                      </Pressable>
                    ) : null}
                    {isActive && lesson.contentUnitId ? (
                      <Pressable onPress={openLesson} className="rounded-lg bg-slate-900 px-4 py-2 active:bg-slate-800">
                        <Text className="text-xs font-bold text-white">Start</Text>
                      </Pressable>
                    ) : null}
                    {(isLocked || isSoon) && !lesson.contentUnitId ? (
                      <Text className="text-xs font-semibold text-slate-400">Soon</Text>
                    ) : null}
                    {isLocked && lesson.contentUnitId ? (
                      <Text className="text-xs font-semibold text-slate-400">Locked</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}
