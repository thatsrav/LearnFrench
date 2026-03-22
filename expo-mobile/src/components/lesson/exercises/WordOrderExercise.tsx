import { useCallback, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

export type WordOrderExerciseProps = {
  words: string[]
  correct_order: number[]
  translation: string
  onComplete: (score: number) => void
}

function shuffleIndices(n: number): number[] {
  const idxs = Array.from({ length: n }, (_, i) => i)
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
  }
  return idxs
}

export default function WordOrderExercise({
  words,
  correct_order,
  translation,
  onComplete,
}: WordOrderExerciseProps) {
  const [bank, setBank] = useState<number[]>(() => shuffleIndices(correct_order.length))
  const [tray, setTray] = useState<number[]>([])
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [success, setSuccess] = useState(false)
  const [trayError, setTrayError] = useState(false)
  const finishedRef = useRef(false)
  const scoreRef = useRef(0)

  const shakeX = useRef(new Animated.Value(0)).current

  const triggerTrayShake = useCallback(() => {
    setTrayError(true)
    setTimeout(() => setTrayError(false), 600)
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }, [shakeX])

  const addFromBank = (wordIdx: number) => {
    if (success || finishedRef.current) return
    setBank((b) => b.filter((i) => i !== wordIdx))
    setTray((t) => [...t, wordIdx])
  }

  const removeFromTray = (at: number) => {
    if (success || finishedRef.current) return
    const w = tray[at]
    if (w === undefined) return
    setTray((t) => t.filter((_, i) => i !== at))
    setBank((b) => [...b, w])
  }

  const onCheck = () => {
    if (success || finishedRef.current) return
    if (tray.length !== correct_order.length) return
    const ok = tray.every((v, i) => v === correct_order[i])
    if (ok) {
      scoreRef.current = Math.max(0, 100 - 20 * wrongAttempts)
      setSuccess(true)
    } else {
      setWrongAttempts((w) => w + 1)
      triggerTrayShake()
    }
  }

  const onContinue = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete(scoreRef.current)
  }

  const canCheck = tray.length === correct_order.length && !success

  return (
    <View>
      <Text className="text-sm font-semibold text-slate-800">Put the words in order</Text>

      <Text className="mt-1 text-xs text-slate-500">Build the sentence in the tray. Tap a chip in the tray to send it back.</Text>

      <Animated.View
        style={{ transform: [{ translateX: shakeX }] }}
        className={[
          'mt-4 min-h-[56px] flex-row flex-wrap gap-2 rounded-xl border-2 p-3',
          success ? 'border-emerald-500 bg-emerald-50' : trayError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50',
        ].join(' ')}
      >
        {tray.length === 0 ? (
          <Text className="self-center text-sm text-slate-400">Your sentence…</Text>
        ) : (
          tray.map((wi, at) => (
            <Pressable
              key={`${wi}-${at}`}
              onPress={() => removeFromTray(at)}
              disabled={success}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <Text className="text-sm font-medium text-slate-900">{words[wi]}</Text>
            </Pressable>
          ))
        )}
      </Animated.View>

      {success ? (
        <>
          <Text className="mt-3 text-center text-sm italic text-slate-600">{translation}</Text>
          <Pressable
            onPress={onContinue}
            className="mt-4 items-center rounded-xl bg-emerald-700 py-3 active:bg-emerald-800"
          >
            <Text className="text-sm font-semibold text-white">Continue</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className="mt-3 text-xs font-semibold uppercase text-slate-500">Word bank</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {bank.map((wi) => (
              <Pressable
                key={`bank-${wi}`}
                onPress={() => addFromBank(wi)}
                className="rounded-full border-2 border-slate-200 bg-white px-3 py-2"
              >
                <Text className="text-sm text-slate-800">{words[wi]}</Text>
              </Pressable>
            ))}
          </View>
          {canCheck ? (
            <Pressable
              onPress={onCheck}
              className="mt-4 items-center rounded-xl bg-slate-900 py-3 active:bg-slate-800"
            >
              <Text className="text-sm font-semibold text-white">Check</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  )
}
