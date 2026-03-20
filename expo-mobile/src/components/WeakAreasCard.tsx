import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { NavigationProp, ParamListBase } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { getModuleIdForContentUnit } from '../lib/curriculum'
import type { RootStackParamList } from '../navigation/AppNavigator'
import {
  getRecurringMistakes,
  type RecurringMistake,
} from '../services/errorPatternAnalyzer'

type Props = {
  /** Override signed-in user (e.g. tests). Defaults to AuthContext user id or guest `''`. */
  userId?: string
}

/**
 * Syllabus insight card: recurring mistakes from AI writing feedback + practice links.
 */
export default function WeakAreasCard({ userId: userIdProp }: Props) {
  const { user } = useAuth()
  const uid = userIdProp ?? user?.id ?? ''
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()
  const [loading, setLoading] = useState(true)
  const [mistakes, setMistakes] = useState<RecurringMistake[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const top = await getRecurringMistakes(uid)
      setMistakes(top)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  const summary =
    mistakes.length === 0
      ? null
      : mistakes
          .slice(0, 4)
          .map((m) => `${m.label} (${m.frequency}×)`)
          .join(', ')

  if (loading) {
    return (
      <View className="mb-5 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <ActivityIndicator size="small" color="#64748b" />
        <Text className="text-sm text-slate-500">Analyzing your writing feedback…</Text>
      </View>
    )
  }

  if (mistakes.length === 0) {
    return (
      <View className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="analytics-outline" size={20} color="#475569" />
          <Text className="text-sm font-bold text-slate-800">Weak areas</Text>
        </View>
        <Text className="mt-2 text-sm leading-5 text-slate-600">
          Score a few journal entries with the AI to see your top recurring mistakes and lesson links here.
        </Text>
      </View>
    )
  }

  return (
    <View className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="warning-outline" size={22} color="#b45309" />
          <Text className="text-base font-bold text-amber-950">Your top mistakes</Text>
        </View>
        <Pressable onPress={() => void refresh()} hitSlop={8} accessibilityLabel="Refresh weak areas">
          <Ionicons name="refresh" size={20} color="#92400e" />
        </Pressable>
      </View>
      {summary ? (
        <Text className="mt-2 text-sm font-medium leading-5 text-amber-950">{summary}</Text>
      ) : null}
      <Text className="mt-1 text-xs text-amber-900/80">
        Patterns are inferred from feedback keywords; confidence rises as you score more entries.
      </Text>

      <View className="mt-3 gap-2">
        {mistakes.map((m) => {
          const first = m.practiceLessons[0]
          const moduleId = first ? getModuleIdForContentUnit(first.unitId) : undefined
          return (
            <Pressable
              key={m.errorType}
              onPress={() => {
                if (!first) return
                rootNav?.navigate('LessonScreen', {
                  unitId: first.unitId,
                  level: first.level,
                  ...(moduleId ? { moduleId } : {}),
                })
              }}
              disabled={!first}
              className="flex-row items-center justify-between rounded-xl border border-amber-200/80 bg-white/90 px-3 py-2.5 active:bg-amber-100/50"
            >
              <View className="min-w-0 flex-1 pr-2">
                <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                  {m.label} · {m.frequency}×
                </Text>
                <Text className="text-xs text-slate-500">
                  Confidence {Math.round(m.confidence * 100)}%
                  {first ? ` · Practice: ${first.title}` : ''}
                </Text>
              </View>
              {first ? <Ionicons name="chevron-forward" size={18} color="#b45309" /> : null}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
