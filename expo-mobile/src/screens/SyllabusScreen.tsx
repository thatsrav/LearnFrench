import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import WeakAreasCard from '../components/WeakAreasCard'
import { CURRICULUM_MODULES, type CEFRLevel } from '../lib/curriculum'
import { useTabScreenBottomPadding } from '../lib/screenPadding'
import type { MainTabParamList } from '../navigation/AppNavigator'
import { navigateRoot } from '../navigation/rootNavigation'

const LEVEL_FILTER: { label: string; value: CEFRLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
]

const TOPIC_PREVIEW = 3

/**
 * FrenchLearn syllabus — matches Figma mobile unit grid + AI banner.
 */
export default function SyllabusScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList, 'Syllabus'>>()
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const [filter, setFilter] = useState<CEFRLevel | 'all'>('all')

  const modules = useMemo(() => {
    if (filter === 'all') return CURRICULUM_MODULES
    return CURRICULUM_MODULES.filter((m) => m.level === filter)
  }, [filter])

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

      {/* AI banner — Figma top card */}
      <View className="mb-5 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-violet-100">
          <Ionicons name="ribbon" size={22} color="#6d28d9" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-slate-900">AI Powered</Text>
          <Text className="text-sm text-slate-500">Instant Feedback</Text>
        </View>
      </View>

      <Text className="text-center text-2xl font-bold text-slate-900">French Syllabus</Text>
      <Text className="mt-2 px-1 text-center text-sm leading-5 text-slate-600">
        Our structured curriculum takes you from beginner to intermediate level with carefully designed units.
      </Text>

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

      <View className="mt-5 gap-4">
        {modules.map((m) => {
          const visibleTopics = m.topics.slice(0, TOPIC_PREVIEW)
          const moreCount = Math.max(0, m.topics.length - TOPIC_PREVIEW)

          return (
            <Pressable
              key={m.id}
              onPress={() => navigateRoot('UnitOverviewScreen', { moduleId: m.id })}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
            >
              <View className="flex-row items-center justify-between gap-2">
                <View className="max-w-[70%] rounded-full bg-slate-100 px-3 py-1.5">
                  <Text className="text-xs font-bold text-slate-700" numberOfLines={1}>
                    {m.levelBadge}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={15} color="#64748b" />
                  <Text className="text-xs font-semibold text-slate-500">{m.durationWeeks} weeks</Text>
                </View>
              </View>

              <Text className="mt-3 text-lg font-bold leading-6 text-slate-900" numberOfLines={3}>
                {m.frenchTitle}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-slate-500" numberOfLines={2}>
                {m.englishTitle}
              </Text>
              <Text className="mt-2 text-sm leading-5 text-slate-600">{m.description}</Text>

              <View className="mt-3 flex-row flex-wrap gap-2">
                {visibleTopics.map((t) => (
                  <View key={t} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-slate-700">{t}</Text>
                  </View>
                ))}
                {moreCount > 0 ? (
                  <View className="justify-center rounded-full border border-dashed border-slate-300 px-2.5 py-1">
                    <Text className="text-xs font-bold text-slate-500">+{moreCount} more</Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-3 text-xs font-medium text-slate-500">{m.lessons.length} lessons included</Text>

              <View className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3">
                <Text className="text-sm font-bold text-slate-900">View Unit</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f172a" />
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* Bottom CTA — Figma AI scorer block */}
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
