import { useCallback, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

export type FillBlankExerciseProps = {
  sentence: string
  answer: string
  options: string[]
  hint?: string
  explanation?: string
  onComplete: (score: number) => void
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function FillBlankExercise({
  sentence,
  answer,
  options,
  hint,
  explanation,
  onComplete,
}: FillBlankExerciseProps) {
  const [picked, setPicked] = useState<string | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [success, setSuccess] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const finishedRef = useRef(false)

  const shakeX = useRef(new Animated.Value(0)).current

  const parts = sentence.split('___')
  const before = parts[0] ?? ''
  const after = parts[1] ?? ''

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start()
  }, [shakeX])

  const onPickChip = (opt: string) => {
    if (success || finishedRef.current) return
    setPicked(opt)
    setShowCheck(true)
  }

  const scoreRef = useRef(0)

  const onCheck = () => {
    if (!picked || success || finishedRef.current) return
    if (norm(picked) === norm(answer)) {
      scoreRef.current = Math.max(0, 100 - 15 * wrongAttempts)
      setSuccess(true)
    } else {
      setWrongAttempts((w) => w + 1)
      triggerShake()
      setPicked(null)
      setShowCheck(false)
    }
  }

  const onContinue = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete(scoreRef.current)
  }

  return (
    <View>
      <Text className="text-sm font-semibold text-slate-800">Fill in the blank</Text>

      <Animated.View style={{ transform: [{ translateX: shakeX }] }} className="mt-3">
        <View className="flex-row flex-wrap items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-4">
          <Text className="text-base leading-8 text-slate-900">{before}</Text>
          <View
            className={[
              'mx-1 min-w-[100px] items-center justify-center rounded-lg border-2 border-dashed px-3 py-2',
              success ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white',
            ].join(' ')}
          >
            <Text
              className={[
                'text-center text-base font-semibold',
                success ? 'text-emerald-900' : picked ? 'text-slate-900' : 'text-slate-400',
              ].join(' ')}
            >
              {picked ?? '_____'}
            </Text>
          </View>
          <Text className="text-base leading-8 text-slate-900">{after}</Text>
        </View>
      </Animated.View>

      {wrongAttempts >= 2 && hint ? (
        <Text className="mt-2 text-xs italic text-amber-800">Hint: {hint}</Text>
      ) : null}

      {!success ? (
        <>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {options
              .map((opt, i) => ({ opt, i }))
              .filter(({ opt }) => opt !== picked)
              .map(({ opt, i }) => (
                <Pressable
                  key={`${i}-${opt}`}
                  onPress={() => onPickChip(opt)}
                  className="rounded-full border-2 border-slate-200 bg-white px-4 py-2"
                >
                  <Text className="text-sm text-slate-800">{opt}</Text>
                </Pressable>
              ))}
          </View>
          {showCheck && picked ? (
            <Pressable
              onPress={onCheck}
              className="mt-4 items-center rounded-xl bg-slate-900 py-3 active:bg-slate-800"
            >
              <Text className="text-sm font-semibold text-white">Check</Text>
            </Pressable>
          ) : null}
        </>
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
