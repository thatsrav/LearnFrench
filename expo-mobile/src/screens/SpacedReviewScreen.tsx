import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import type { RootStackParamList } from '../navigation/AppNavigator'
import {
  getReviewItems,
  recordSpacedRepetitionReview,
  type SpacedRepetitionReviewItem,
} from '../lib/spacedRepetition'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

type Nav = NativeStackNavigationProp<RootStackParamList, 'SpacedReview'>

export default function SpacedReviewScreen() {
  const navigation = useNavigation<Nav>()
  const route = useRoute()
  const { user } = useAuth()
  const maxItems = (route.params as { maxItems?: number } | undefined)?.maxItems ?? 20
  const bottomPad = useStackScreenBottomPadding(24)

  const userKey = user?.id ?? ''

  const [items, setItems] = useState<SpacedRepetitionReviewItem[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const due = await getReviewItems(userKey, new Date())
      setItems(due.slice(0, maxItems))
      setIndex(0)
      setFlipped(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [userKey, maxItems])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload]),
  )

  const sessionComplete = items.length > 0 && index >= items.length
  const current = items[index] ?? null

  const onQuality = async (quality: number) => {
    if (!current) return
    try {
      await recordSpacedRepetitionReview(userKey, current.id, quality)
      setFlipped(false)
      if (index + 1 >= items.length) {
        setIndex(items.length)
        return
      }
      setIndex((i) => i + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-slate-600">Loading reviews…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-rose-600">{error}</Text>
        <Pressable onPress={() => void reload()} className="mt-4 rounded-xl bg-slate-900 px-4 py-3">
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
      </View>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Ionicons name="checkmark-circle-outline" size={56} color="#16a34a" />
        <Text className="mt-4 text-center text-lg font-bold text-slate-900">You&apos;re caught up</Text>
        <Text className="mt-2 text-center text-sm text-slate-600">
          Nothing due today. Complete a lesson with 80%+ to add vocabulary & grammar cards.
        </Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-6 rounded-xl bg-slate-900 px-5 py-3">
          <Text className="font-semibold text-white">Back</Text>
        </Pressable>
      </View>
    )
  }

  if (sessionComplete) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-lg font-bold text-slate-900">Session complete</Text>
        <Text className="mt-2 text-center text-sm text-slate-600">Nice work — see you next review.</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-6 rounded-xl bg-slate-900 px-5 py-3">
          <Text className="font-semibold text-white">Done</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-xs font-semibold uppercase text-slate-500">
        {current?.contentType} · {index + 1} / {items.length}
      </Text>

      <Pressable
        onPress={() => setFlipped((f) => !f)}
        className="mt-4 min-h-[200px] justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm active:opacity-95"
      >
        <Text className="text-center text-lg font-semibold text-slate-900">
          {flipped ? current.backText : current.frontText}
        </Text>
        <Text className="mt-4 text-center text-xs text-slate-400">{flipped ? 'Answer' : 'Tap to reveal'}</Text>
      </Pressable>

      <Text className="mt-6 text-sm font-semibold text-slate-700">How well did you remember?</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => void onQuality(0)}
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 active:opacity-80"
        >
          <Text className="text-center text-xs font-bold text-rose-800">Forgot</Text>
          <Text className="text-center text-[10px] text-rose-600">0</Text>
        </Pressable>
        <Pressable
          onPress={() => void onQuality(2)}
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 active:opacity-80"
        >
          <Text className="text-center text-xs font-bold text-amber-900">Hard</Text>
          <Text className="text-center text-[10px] text-amber-700">2</Text>
        </Pressable>
        <Pressable
          onPress={() => void onQuality(3)}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 active:opacity-80"
        >
          <Text className="text-center text-xs font-bold text-emerald-900">Good</Text>
          <Text className="text-center text-[10px] text-emerald-700">3</Text>
        </Pressable>
        <Pressable
          onPress={() => void onQuality(5)}
          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 active:opacity-80"
        >
          <Text className="text-center text-xs font-bold text-blue-900">Easy</Text>
          <Text className="text-center text-[10px] text-blue-700">5</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
