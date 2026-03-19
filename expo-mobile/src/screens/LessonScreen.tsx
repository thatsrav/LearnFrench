import { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { unlockNextUnit } from '../database'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

type QuizQuestion = {
  question: string
  options: string[]
  answer_index: number
}

type LessonUnit = {
  id: string
  grammar_rule_text: string
  vocab_list: string[]
  quiz: QuizQuestion[]
}

type RouteParams = {
  unitId: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  /** When set, user opened lesson from FrenchLearn unit overview. */
  moduleId?: string
}

const a1Data: LessonUnit[] = require('../../assets/syllabus/a1.json')
const a2Data: LessonUnit[] = require('../../assets/syllabus/a2.json')
const b1Data: LessonUnit[] = require('../../assets/syllabus/b1.json')
const b2Data: LessonUnit[] = require('../../assets/syllabus/b2.json')
const c1Data: LessonUnit[] = require('../../assets/syllabus/c1.json')

function getLevelUnits(level: RouteParams['level']): LessonUnit[] {
  switch (level) {
    case 'A1':
      return a1Data
    case 'A2':
      return a2Data
    case 'B1':
      return b1Data
    case 'B2':
      return b2Data
    case 'C1':
      return c1Data
    default:
      return []
  }
}

function getUnit(level: RouteParams['level'], unitId: string): LessonUnit | null {
  const source = getLevelUnits(level)
  return source.find((u) => u.id === unitId) ?? null
}

export default function LessonScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const scrollBottomPad = useStackScreenBottomPadding(20)
  const route = useRoute()
  const { unitId, level } = route.params as RouteParams

  const unit = useMemo(() => getUnit(level, unitId), [level, unitId])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)

  const score = useMemo(() => {
    if (!unit) return 0
    const total = unit.quiz.length
    if (total === 0) return 0
    let correct = 0
    unit.quiz.forEach((q, i) => {
      if (answers[i] === q.answer_index) correct += 1
    })
    return Math.round((correct / total) * 100)
  }, [unit, answers])

  const onSubmit = async () => {
    if (!unit) return
    if (Object.keys(answers).length < unit.quiz.length) {
      Alert.alert('Complete Quiz', 'Please answer all quiz questions before submitting.')
      return
    }

    try {
      setSubmitting(true)
      const result = await unlockNextUnit(unit.id, score)
      if (score >= 80) {
        Alert.alert(
          'Great work!',
          result.unlockedUnitId
            ? `Score: ${score}. Next unit unlocked: ${result.unlockedUnitId}`
            : `Score: ${score}. You completed the final unit for now.`,
          [{ text: 'Done', onPress: () => navigation.goBack() }],
        )
      } else {
        Alert.alert(
          'Keep practicing',
          `Score: ${score}. You need 80+ to unlock the next unit.`,
          [{ text: 'Done', onPress: () => navigation.goBack() }],
        )
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!unit) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="text-lg font-semibold text-slate-900">Lesson not found</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
          <Text className="font-semibold text-white">Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 14, paddingBottom: scrollBottomPad }}>
        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-medium uppercase tracking-wide text-blue-700">{level} • {unit.id}</Text>
          <Text className="mt-2 text-lg font-bold text-slate-900">Grammar Rule</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-700">{unit.grammar_rule_text}</Text>
        </View>

        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-lg font-bold text-slate-900">Vocabulary</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {unit.vocab_list.slice(0, 24).map((word) => (
              <View key={word} className="rounded-full bg-slate-100 px-3 py-1">
                <Text className="text-xs text-slate-700">{word}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-xs text-slate-500">
            Showing first 24 words (total {unit.vocab_list.length}).
          </Text>
        </View>

        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-lg font-bold text-slate-900">Quiz</Text>
          <View className="mt-3" style={{ gap: 14 }}>
            {unit.quiz.map((q, qIndex) => (
              <View key={`${unit.id}-q-${qIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Text className="text-sm font-semibold text-slate-800">
                  {qIndex + 1}. {q.question}
                </Text>
                <View className="mt-3" style={{ gap: 8 }}>
                  {q.options.map((opt, optIndex) => {
                    const selected = answers[qIndex] === optIndex
                    return (
                      <Pressable
                        key={`${unit.id}-q-${qIndex}-o-${optIndex}`}
                        onPress={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [qIndex]: optIndex,
                          }))
                        }
                        className={[
                          'rounded-lg border px-3 py-2',
                          selected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white',
                        ].join(' ')}
                      >
                        <Text className={selected ? 'text-blue-700' : 'text-slate-700'}>{opt}</Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="border-t border-slate-200 bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(12, insets.bottom) }}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-slate-600">Current score</Text>
          <Text className="text-sm font-bold text-slate-900">{score}/100</Text>
        </View>
        <Pressable
          onPress={() => void onSubmit()}
          disabled={submitting}
          className={[
            'items-center rounded-xl py-3',
            submitting ? 'bg-slate-300' : 'bg-blue-600',
          ].join(' ')}
        >
          <Text className="text-sm font-semibold text-white">
            {submitting ? 'Submitting...' : 'Submit Lesson'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

