import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'

export type MatchPairsExerciseProps = {
  instruction: string
  pairs: { left: string; right: string }[]
  /** 0–100 for this exercise when every pair is matched. */
  onComplete: (score: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchPairsExercise({ instruction, pairs, onComplete }: MatchPairsExerciseProps) {
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [doneBanner, setDoneBanner] = useState(false)
  const finishedRef = useRef(false)
  const reportedRef = useRef(false)

  const shakeX = useRef(new Animated.Value(0)).current

  const leftColumn = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs])
  const rightColumn = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs])

  const triggerShake = useCallback(() => {
    setErrorFlash(true)
    setTimeout(() => setErrorFlash(false), 500)
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start()
  }, [shakeX])

  const tryPair = useCallback(
    (L: string | null, R: string | null) => {
      if (!L || !R || finishedRef.current) return
      const valid = pairs.some((p) => p.left === L && p.right === R)
      if (valid) {
        setMatched((m) => ({ ...m, [L]: R }))
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        setWrongAttempts((w) => w + 1)
        setSelectedLeft(null)
        setSelectedRight(null)
        triggerShake()
      }
    },
    [pairs, triggerShake],
  )

  useEffect(() => {
    if (reportedRef.current) return
    if (pairs.length === 0) return
    if (Object.keys(matched).length < pairs.length) return
    reportedRef.current = true
    finishedRef.current = true
    const score = Math.max(0, 100 - 10 * wrongAttempts)
    setDoneBanner(true)
    const t = setTimeout(() => onComplete(score), 1100)
    return () => clearTimeout(t)
  }, [matched, onComplete, pairs.length, wrongAttempts])

  const onTapLeft = (L: string) => {
    if (finishedRef.current || matched[L]) return
    if (selectedLeft === L) {
      setSelectedLeft(null)
      return
    }
    const nextL = L
    setSelectedLeft(nextL)
    if (selectedRight !== null) tryPair(nextL, selectedRight)
  }

  const onTapRight = (R: string) => {
    if (finishedRef.current) return
    if (Object.values(matched).includes(R)) return
    if (selectedRight === R) {
      setSelectedRight(null)
      return
    }
    const nextR = R
    setSelectedRight(nextR)
    if (selectedLeft !== null) tryPair(selectedLeft, nextR)
  }

  const matchedCount = Object.keys(matched).length

  return (
    <View>
      <Text className="text-sm font-semibold text-slate-800">{instruction}</Text>
      <Text className="mt-1 text-xs text-slate-500">Pick one word and one meaning to pair them.</Text>

      <Animated.View
        style={{ transform: [{ translateX: shakeX }] }}
        className={[
          'mt-4 flex-row gap-3 rounded-xl p-2',
          errorFlash ? 'bg-red-50' : 'bg-transparent',
        ].join(' ')}
      >
        <View className="flex-1" style={{ gap: 8 }}>
          <Text className="text-xs font-bold uppercase text-slate-500">French</Text>
          {leftColumn.map((L) => {
            const isMatched = !!matched[L]
            const isSel = selectedLeft === L
            return (
              <Pressable
                key={`L-${L}`}
                onPress={() => onTapLeft(L)}
                disabled={isMatched || doneBanner}
                className={[
                  'rounded-xl border-2 px-3 py-3',
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50'
                    : isSel
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <Text className={isMatched ? 'text-emerald-900' : 'text-slate-800'}>
                  {L}
                  {isMatched ? `  →  ${matched[L]}` : ''}
                </Text>
              </Pressable>
            )
          })}
        </View>
        <View className="flex-1" style={{ gap: 8 }}>
          <Text className="text-xs font-bold uppercase text-slate-500">Meaning</Text>
          {rightColumn.map((R) => {
            const isUsed = Object.values(matched).includes(R)
            const isSel = selectedRight === R
            return (
              <Pressable
                key={`R-${R}`}
                onPress={() => onTapRight(R)}
                disabled={isUsed || doneBanner}
                className={[
                  'rounded-xl border-2 px-3 py-3',
                  isUsed
                    ? 'border-emerald-500 bg-emerald-50 opacity-70'
                    : isSel
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <Text className={isUsed ? 'text-emerald-800' : 'text-slate-800'}>{R}</Text>
              </Pressable>
            )
          })}
        </View>
      </Animated.View>

      {doneBanner ? (
        <View className="mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3">
          <Text className="text-center text-base font-bold text-emerald-900">
            {wrongAttempts === 0 ? '✓ Perfect!' : '✓ All pairs matched!'}
          </Text>
          <Text className="mt-1 text-center text-xs text-emerald-800">
            {matchedCount}/{pairs.length} pairs · Score this exercise: {Math.max(0, 100 - 10 * wrongAttempts)}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
