import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CURRICULUM_MODULES, type CEFRLevel } from '../lib/curriculum'
import type { RootStackParamList } from '../navigation/AppNavigator'

const LEVEL_FILTER: { label: string; value: CEFRLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
]

/**
 * FrenchLearn-style course catalog (matches web landing grid).
 */
export default function SyllabusScreen() {
  const navigation = useNavigation()
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()
  const [filter, setFilter] = useState<CEFRLevel | 'all'>('all')

  const modules = useMemo(() => {
    if (filter === 'all') return CURRICULUM_MODULES
    return CURRICULUM_MODULES.filter((m) => m.level === filter)
  }, [filter])

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text className="text-xs font-semibold text-violet-600">FrenchLearn</Text>
      <Text className="mt-1 text-2xl font-bold text-slate-900">Courses</Text>
      <Text className="mt-1 text-sm text-slate-500">
        {CURRICULUM_MODULES.length} units · structured path from beginner to intermediate.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
        {LEVEL_FILTER.map(({ label, value }) => {
          const active = filter === value
          return (
            <Pressable
              key={label}
              onPress={() => setFilter(value)}
              className={['rounded-full px-4 py-2', active ? 'bg-slate-900' : 'bg-slate-200'].join(' ')}
            >
              <Text className={['text-sm font-semibold', active ? 'text-white' : 'text-slate-700'].join(' ')}>{label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View className="mt-6 gap-4">
        {modules.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => rootNav?.navigate('UnitOverviewScreen', { moduleId: m.id })}
            className="rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="rounded-full bg-slate-100 px-3 py-1">
                <Text className="text-xs font-semibold text-slate-700">{m.levelBadge}</Text>
              </View>
              <Text className="text-xs font-medium text-slate-500">{m.durationWeeks} wk</Text>
            </View>
            <Text className="mt-3 text-base font-bold text-slate-900">
              {m.frenchTitle}
              <Text className="font-semibold text-slate-500">{`\n— ${m.englishTitle}`}</Text>
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-600">{m.description}</Text>
            <Text className="mt-3 text-xs font-medium text-slate-500">{m.lessons.length} lessons</Text>
            <View className="mt-3 rounded-xl border border-slate-200 py-2">
              <Text className="text-center text-sm font-bold text-slate-800">View unit →</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
