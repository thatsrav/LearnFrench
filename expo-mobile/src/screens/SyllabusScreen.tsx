import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useNavigation } from '@react-navigation/native'
import { getSyllabusData, type SyllabusRow } from '../database'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

type Level = (typeof LEVELS)[number]

function showLockedToast() {
  const message = 'Complete the previous unit to unlock!'
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
    return
  }
  Alert.alert('Unit Locked', message)
}

export default function SyllabusScreen() {
  const navigation = useNavigation<any>()
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1')
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<SyllabusRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const rows = await getSyllabusData()
      setUnits(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredUnits = useMemo(
    () => units.filter((u) => u.level === selectedLevel),
    [units, selectedLevel],
  )

  const onUnitPress = (unit: SyllabusRow) => {
    if (unit.status === 'locked') {
      showLockedToast()
      return
    }

    navigation.navigate('LessonScreen', { unitId: unit.id, level: unit.level })
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-4 pt-6">
        <Text className="text-2xl font-bold text-slate-900">Syllabus</Text>
        <Text className="mt-1 text-sm text-slate-500">Choose a level and continue your progression.</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 14 }}
        >
          {LEVELS.map((level) => {
            const active = selectedLevel === level
            return (
              <Pressable
                key={level}
                onPress={() => setSelectedLevel(level)}
                className={[
                  'rounded-full px-4 py-2',
                  active ? 'bg-blue-600' : 'bg-slate-200',
                ].join(' ')}
              >
                <Text
                  className={[
                    'text-sm font-semibold',
                    active ? 'text-white' : 'text-slate-700',
                  ].join(' ')}
                >
                  {level}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-sm text-slate-500">Loading syllabus...</Text>
        </View>
      ) : error ? (
        <View className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <Text className="text-sm font-semibold text-rose-700">Failed to load syllabus</Text>
          <Text className="mt-1 text-xs text-rose-600">{error}</Text>
          <Pressable onPress={() => void loadData()} className="mt-3 self-start rounded-lg bg-rose-600 px-3 py-2">
            <Text className="text-xs font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          {filteredUnits.map((unit) => {
            const isCompleted = unit.status === 'completed'
            const isAvailable = unit.status === 'available'
            const isLocked = unit.status === 'locked'

            return (
              <Pressable
                key={unit.id}
                onPress={() => onUnitPress(unit)}
                className={[
                  'rounded-2xl border bg-white p-4',
                  isAvailable ? 'border-blue-400 bg-blue-50' : 'border-slate-200',
                  isLocked ? 'opacity-40' : 'opacity-100',
                ].join(' ')}
              >
                <View className="flex-row items-center justify-between">
                  <View className="pr-3">
                    <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {unit.level} • Unit {unit.orderIndex}
                    </Text>
                    <Text className="mt-1 text-base font-semibold text-slate-900">{unit.title}</Text>
                  </View>

                  {isCompleted ? (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <Text className="text-xl text-emerald-600">✓</Text>
                    </View>
                  ) : isAvailable ? (
                    <View className="rounded-lg bg-blue-600 px-3 py-2">
                      <Text className="text-xs font-semibold text-white">Start</Text>
                    </View>
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                      <Text className="text-lg text-slate-600">🔒</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )
          })}

          {filteredUnits.length === 0 && (
            <View className="rounded-2xl border border-slate-200 bg-white p-5">
              <Text className="text-sm text-slate-500">No units available for {selectedLevel} yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

