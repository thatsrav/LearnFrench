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
import {
  countModuleProgress,
  getLessonCardStatuses,
  getModuleById,
  inferLevelFromUnitId,
  type LessonCardStatus,
} from '../lib/curriculum'
import { getSyllabusData, type SyllabusRow } from '../database'
import type { RootStackParamList } from '../navigation/AppNavigator'

type RouteParams = { moduleId: string }

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
  else Alert.alert('Notice', msg)
}

export default function UnitOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
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
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Pressable onPress={() => navigation.goBack()} className="mb-4 self-start">
        <Text className="text-sm font-semibold text-blue-600">‹ Back to courses</Text>
      </Pressable>

      <View className="rounded-full bg-slate-900 px-3 py-1 self-start">
        <Text className="text-xs font-bold text-white">{mod.levelBadge}</Text>
      </View>

      <Text className="mt-3 text-2xl font-bold text-slate-900">
        {mod.frenchTitle}
        <Text className="block text-lg font-semibold text-slate-500">{mod.englishTitle}</Text>
      </Text>
      <Text className="mt-2 text-base leading-6 text-slate-600">{mod.description}</Text>
      <Text className="mt-3 text-sm text-slate-500">
        {mod.lessons.length} lessons · {mod.durationWeeks} weeks
      </Text>

      <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm font-bold text-slate-900">Your progress</Text>
        <Text className="mt-1 text-sm text-slate-500">
          {progress.done} of {progress.total} lessons completed
        </Text>
        <View className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <View
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progress.percent}%` }}
          />
        </View>
        <Text className="mt-2 text-xs font-semibold text-slate-600">{progress.percent}% complete</Text>
      </View>

      <Text className="mt-8 text-base font-bold text-slate-900">Topics covered</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
        {mod.topics.map((t, i) => (
          <View key={t} className={['rounded-full px-4 py-2', i === 0 ? 'bg-slate-800' : 'bg-slate-200'].join(' ')}>
            <Text className={['text-sm font-semibold', i === 0 ? 'text-white' : 'text-slate-700'].join(' ')}>{t}</Text>
          </View>
        ))}
      </ScrollView>

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
                  'rounded-2xl border bg-white p-4',
                  isActive ? 'border-blue-400' : 'border-slate-200',
                  isLocked || isSoon ? 'opacity-70' : '',
                ].join(' ')}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-bold text-slate-900">{lesson.title}</Text>
                    {lesson.subtitle ? <Text className="text-sm text-slate-500">{lesson.subtitle}</Text> : null}
                    <Text className="mt-1 text-xs text-slate-500">{lesson.durationMin} min</Text>
                    {isActive ? (
                      <View className="mt-2 self-start rounded-full bg-slate-900 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-white">IN PROGRESS</Text>
                      </View>
                    ) : null}
                    {isSoon ? (
                      <View className="mt-2 self-start rounded-full bg-slate-200 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-slate-600">SOON</Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="items-end">
                    {isDone && lesson.contentUnitId ? (
                      <Pressable onPress={openLesson} className="rounded-xl border-2 border-slate-300 px-4 py-2">
                        <Text className="text-xs font-bold text-slate-800">Review</Text>
                      </Pressable>
                    ) : null}
                    {isActive && lesson.contentUnitId ? (
                      <Pressable onPress={openLesson} className="rounded-xl bg-slate-900 px-5 py-2">
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
