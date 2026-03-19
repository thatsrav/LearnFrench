import { useCallback, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { loadRecentScores, type StoredScore } from '../lib/history'
import { useTabScreenBottomPadding } from '../lib/screenPadding'

type Row = {
  rank: number
  score: number
  cecr: string
  provider: string
  date: string
}

export default function LeaderboardScreen() {
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const [scores, setScores] = useState<StoredScore[]>([])

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setScores(await loadRecentScores())
      })()
    }, []),
  )

  const topEntries = useMemo((): Row[] => {
    return [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s, idx) => ({
        rank: idx + 1,
        score: s.score,
        cecr: s.cecr || '—',
        provider: s.provider || '—',
        date: new Date(s.ts).toLocaleDateString(),
      }))
  }, [scores])

  const average = useMemo(() => {
    if (!scores.length) return 0
    return Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)
  }, [scores])

  const best = topEntries[0]?.score ?? 0

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: scrollBottomPad }}>
      <Text className="text-2xl font-bold text-slate-900">Leaderboard</Text>
      <Text className="mt-1 text-sm text-slate-500">Top writing scores from this device (Writing Lab).</Text>

      <View className="mt-4 flex-row flex-wrap gap-3">
        <View className="min-w-[100] flex-1 rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs uppercase text-slate-500">Attempts</Text>
          <Text className="mt-1 text-2xl font-bold text-slate-900">{scores.length}</Text>
        </View>
        <View className="min-w-[100] flex-1 rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs uppercase text-slate-500">Average</Text>
          <Text className="mt-1 text-2xl font-bold text-slate-900">{average}</Text>
        </View>
        <View className="min-w-[100] flex-1 rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs uppercase text-slate-500">Best</Text>
          <Text className="mt-1 text-2xl font-bold text-slate-900">{best}</Text>
        </View>
      </View>

      <View className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <View className="flex-row border-b border-slate-200 bg-slate-50 px-3 py-2">
          <Text className="w-10 text-xs font-semibold text-slate-500">#</Text>
          <Text className="w-14 text-xs font-semibold text-slate-500">Pts</Text>
          <Text className="w-12 text-xs font-semibold text-slate-500">CEFR</Text>
          <Text className="flex-1 text-xs font-semibold text-slate-500">Provider</Text>
          <Text className="w-20 text-xs font-semibold text-slate-500">Date</Text>
        </View>

        {topEntries.length === 0 ? (
          <Text className="p-6 text-center text-sm text-slate-500">
            No attempts yet. Use Home → French Scorer to add scores.
          </Text>
        ) : (
          topEntries.map((row) => (
            <View key={`${row.rank}-${row.date}-${row.score}`} className="flex-row border-b border-slate-100 px-3 py-2">
              <Text className="w-10 text-sm font-semibold text-slate-800">{row.rank}</Text>
              <Text className="w-14 text-sm text-slate-700">{row.score}</Text>
              <Text className="w-12 text-sm text-slate-700">{row.cecr}</Text>
              <Text className="flex-1 text-sm text-slate-700" numberOfLines={1}>
                {row.provider}
              </Text>
              <Text className="w-20 text-xs text-slate-500">{row.date}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
