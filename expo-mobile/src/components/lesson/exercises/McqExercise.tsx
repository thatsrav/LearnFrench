import { useCallback, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

export type McqExerciseProps = {
  question: string
  options: string[]
  answer_index: number
  explanation?: string
  onComplete: (score: number) => void
}

export default function McqExercise({
  question,
  options,
  answer_index,
  explanation,
  onComplete,
}: McqExerciseProps) {
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [success, setSuccess] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)
  const finishedRef = useRef(false)
  const scoreRef = useRef(0)

  const shakeX = useRef(new Animated.Value(0)).current

  const triggerShake = useCallback(() => {
    setShakeWrong(true)
    setTimeout(() => setShakeWrong(false), 500)
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start()
  }, [shakeX])

  const onPick = (idx: number) => {
    if (success || finishedRef.current) return
    if (idx === answer_index) {
      scoreRef.current = Math.max(0, 100 - 20 * wrongAttempts)
      setSuccess(true)
    } else {
      setWrongAttempts((w) => w + 1)
      triggerShake()
    }
  }

  const onContinue = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete(scoreRef.current)
  }

  return (
    <View>
      <Text className="text-sm font-semibold text-slate-800">{question}</Text>

      {!success ? (
        <Animated.View style={{ transform: [{ translateX: shakeX }] }} className="mt-4">
          <View style={{ gap: 8 }}>
            {options.map((opt, idx) => (
              <Pressable
                key={`mcq-${idx}`}
                onPress={() => onPick(idx)}
                className={[
                  'rounded-xl border-2 px-3 py-3',
                  shakeWrong ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <Text className="text-slate-800">{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : (
        <View className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
          {explanation ? (
            <Text className="text-center text-sm leading-6 text-emerald-900">{explanation}</Text>
          ) : (
            <Text className="text-center text-sm font-semibold text-emerald-900">Correct!</Text>
          )}
          <Pressable
            onPress={onContinue}
            className="mt-3 items-center rounded-xl bg-emerald-700 py-3 active:bg-emerald-800"
          >
            <Text className="text-sm font-semibold text-white">Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
