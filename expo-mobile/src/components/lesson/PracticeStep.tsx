import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Text, View } from 'react-native'
import type { Exercise } from './exercises/types'
import FillBlankExercise from './exercises/FillBlankExercise'
import MatchPairsExercise from './exercises/MatchPairsExercise'
import McqExercise from './exercises/McqExercise'
import WordOrderExercise from './exercises/WordOrderExercise'

export type PracticeStepProps = {
  exercises: Exercise[]
  /** Single score 0–100 for the whole practice block (average of exercise scores). */
  onComplete: (score: number) => void
}

function average(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

export default function PracticeStep({ exercises, onComplete }: PracticeStepProps) {
  const [index, setIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const fade = useRef(new Animated.Value(1)).current
  const reportedRef = useRef(false)

  const total = exercises.length
  const current = exercises[index]

  const runFade = useCallback(() => {
    fade.setValue(0)
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start()
  }, [fade])

  useEffect(() => {
    runFade()
  }, [index, runFade])

  const goNext = useCallback(
    (exerciseScore: number) => {
      setScores((prev) => {
        const next = [...prev, exerciseScore]
        if (next.length >= total) {
          if (!reportedRef.current) {
            reportedRef.current = true
            const finalScore = average(next)
            queueMicrotask(() => onComplete(finalScore))
          }
        }
        return next
      })
      setIndex((i) => {
        if (i + 1 >= total) return i
        return i + 1
      })
    },
    [onComplete, total],
  )

  if (total === 0) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm text-slate-600">No exercises in this step.</Text>
      </View>
    )
  }

  if (!current) {
    return null
  }

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-lg font-bold text-slate-900">Practice</Text>
      <Text className="mt-1 text-xs font-medium text-slate-600">
        Exercise {index + 1} of {total}
      </Text>

      <Animated.View style={{ opacity: fade }} className="mt-4">
        {current.type === 'match_pairs' ? (
          <MatchPairsExercise
            instruction={current.instruction}
            pairs={current.pairs}
            onComplete={goNext}
          />
        ) : null}
        {current.type === 'fill_blank' ? (
          <FillBlankExercise
            sentence={current.sentence}
            answer={current.answer}
            options={current.options}
            hint={current.hint}
            explanation={current.explanation}
            onComplete={goNext}
          />
        ) : null}
        {current.type === 'word_order' ? (
          <WordOrderExercise
            words={current.words}
            correct_order={current.correct_order}
            translation={current.translation}
            onComplete={goNext}
          />
        ) : null}
        {current.type === 'mcq' ? (
          <McqExercise
            question={current.question}
            options={current.options}
            answer_index={current.answer_index}
            explanation={current.explanation}
            onComplete={goNext}
          />
        ) : null}
      </Animated.View>
    </View>
  )
}
