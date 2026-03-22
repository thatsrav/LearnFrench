import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import type { PracticeExercise } from './types'

export type PracticeResult = { correct: number; total: number }

type Props = {
  exercises: PracticeExercise[]
  onComplete: (result: PracticeResult) => void
  /** 0–1 within the practice step (current exercise / total). */
  onPracticeProgress?: (fraction: number) => void
}

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function PracticeStep({ exercises, onComplete, onPracticeProgress }: Props) {
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [correctSoFar, setCorrectSoFar] = useState(0)

  const total = exercises.length
  const current = exercises[exerciseIndex]

  useEffect(() => {
    if (total <= 0) return
    onPracticeProgress?.(exerciseIndex / total)
  }, [exerciseIndex, onPracticeProgress, total])

  const advance = useCallback(
    (wasCorrect: boolean) => {
      const nextCorrect = correctSoFar + (wasCorrect ? 1 : 0)
      if (exerciseIndex + 1 >= total) {
        onPracticeProgress?.(1)
        onComplete({ correct: nextCorrect, total })
        return
      }
      setCorrectSoFar(nextCorrect)
      setExerciseIndex((i) => i + 1)
    },
    [correctSoFar, exerciseIndex, onComplete, onPracticeProgress, total],
  )

  if (!current) {
    return null
  }

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-lg font-bold text-slate-900">Practice</Text>
      <Text className="mt-1 text-xs text-slate-500">
        Exercise {exerciseIndex + 1} of {total}
      </Text>
      <View className="mt-4">
        <ExerciseView key={exerciseIndex} exercise={current} onGraded={(ok) => advance(ok)} />
      </View>
    </View>
  )
}

function ExerciseView({
  exercise,
  onGraded,
}: {
  exercise: PracticeExercise
  onGraded: (ok: boolean) => void
}) {
  switch (exercise.type) {
    case 'match_pairs':
      return <MatchPairsView exercise={exercise} onGraded={onGraded} />
    case 'fill_blank':
      return <FillBlankView exercise={exercise} onGraded={onGraded} />
    case 'word_order':
      return <WordOrderView exercise={exercise} onGraded={onGraded} />
    case 'mcq':
      return <McqView exercise={exercise} onGraded={onGraded} />
    default:
      return null
  }
}

function MatchPairsView({
  exercise,
  onGraded,
}: {
  exercise: Extract<PracticeExercise, { type: 'match_pairs' }>
  onGraded: (ok: boolean) => void
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [error, setError] = useState(false)
  const reportedRef = useRef(false)

  const leftKeys = useMemo(() => exercise.pairs.map((p) => p.left), [exercise.pairs])
  const rightPool = useMemo(() => shuffleIndices(exercise.pairs.length).map((i) => exercise.pairs[i].right), [exercise.pairs])

  const matchedCount = Object.keys(matched).length
  useEffect(() => {
    if (reportedRef.current) return
    if (exercise.pairs.length === 0) return
    if (matchedCount === exercise.pairs.length) {
      reportedRef.current = true
      onGraded(true)
    }
  }, [exercise.pairs.length, matchedCount, onGraded])

  const onPickLeft = (L: string) => {
    if (matched[L]) return
    setSelectedLeft(L)
    setError(false)
  }

  const onPickRight = (R: string) => {
    if (!selectedLeft) return
    const pair = exercise.pairs.find((p) => p.left === selectedLeft)
    if (pair && pair.right === R) {
      setMatched((m) => ({ ...m, [selectedLeft]: R }))
      setSelectedLeft(null)
      setError(false)
    } else {
      setError(true)
    }
  }

  const allMatched = matchedCount === exercise.pairs.length

  return (
    <View style={{ gap: 12 }}>
      <Text className="text-sm font-semibold text-slate-800">{exercise.instruction}</Text>
      <Text className="text-xs text-slate-500">Tap a French word, then its English meaning.</Text>
      <Text className="text-xs text-amber-800">French</Text>
      <View style={{ gap: 8 }}>
        {leftKeys.map((L) => {
          const done = !!matched[L]
          const sel = selectedLeft === L
          return (
            <Pressable
              key={L}
              onPress={() => onPickLeft(L)}
              disabled={done || allMatched}
              className={[
                'rounded-lg border px-3 py-2',
                done
                  ? 'border-emerald-300 bg-emerald-50'
                  : sel
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white',
              ].join(' ')}
            >
              <Text className={done ? 'text-emerald-900' : 'text-slate-800'}>
                {L} {done ? `→ ${matched[L]}` : ''}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <Text className="text-xs text-amber-800">Meanings (shuffled)</Text>
      <View className="flex-row flex-wrap gap-2">
        {rightPool.map((R) => {
          const used = Object.values(matched).includes(R)
          return (
            <Pressable
              key={R}
              onPress={() => onPickRight(R)}
              disabled={used || allMatched}
              className={[
                'rounded-full border px-3 py-1.5',
                used ? 'border-slate-100 bg-slate-100 opacity-40' : 'border-slate-200 bg-white',
              ].join(' ')}
            >
              <Text className="text-xs text-slate-800">{R}</Text>
            </Pressable>
          )
        })}
      </View>
      {error ? <Text className="text-xs text-red-600">Not a match — try another pair.</Text> : null}
    </View>
  )
}

function FillBlankView({
  exercise,
  onGraded,
}: {
  exercise: Extract<PracticeExercise, { type: 'fill_blank' }>
  onGraded: (ok: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const submit = (idx: number) => {
    if (locked) return
    setPicked(idx)
    setLocked(true)
    const ok = norm(exercise.options[idx]) === norm(exercise.answer)
    setTimeout(() => onGraded(ok), ok ? 400 : 900)
  }

  return (
    <View style={{ gap: 12 }}>
      <Text className="text-sm font-semibold text-slate-800">Fill in the blank</Text>
      <Text className="text-base leading-7 text-slate-900">
        {exercise.sentence.split('___').join(' _____ ')}
      </Text>
      {exercise.hint ? <Text className="text-xs italic text-slate-500">Hint: {exercise.hint}</Text> : null}
      <View style={{ gap: 8 }}>
        {exercise.options.map((opt, idx) => {
          const selected = picked === idx
          const correct = norm(opt) === norm(exercise.answer)
          return (
            <Pressable
              key={`${opt}-${idx}`}
              onPress={() => submit(idx)}
              disabled={locked}
              className={[
                'rounded-lg border px-3 py-2',
                locked && selected
                  ? correct
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-slate-200 bg-white',
              ].join(' ')}
            >
              <Text className="text-slate-800">{opt}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function WordOrderView({
  exercise,
  onGraded,
}: {
  exercise: Extract<PracticeExercise, { type: 'word_order' }>
  onGraded: (ok: boolean) => void
}) {
  const initialPool = useMemo(() => {
    const n = exercise.words.length
    const idxs = Array.from({ length: n }, (_, i) => i)
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
    }
    return idxs
  }, [exercise.words])

  const [picked, setPicked] = useState<number[]>([])
  const [available, setAvailable] = useState<number[]>(() => initialPool)

  const pick = (wordIdx: number) => {
    setPicked((p) => [...p, wordIdx])
    setAvailable((a) => a.filter((i) => i !== wordIdx))
  }

  const undo = () => {
    if (picked.length === 0) return
    const last = picked[picked.length - 1]
    setPicked((p) => p.slice(0, -1))
    setAvailable((a) => [...a, last])
  }

  const check = () => {
    const ok =
      picked.length === exercise.correct_order.length &&
      picked.every((v, i) => v === exercise.correct_order[i])
    if (!ok) {
      Alert.alert('Try again', 'Reorder the words to match the French sentence.', [{ text: 'OK' }])
      return
    }
    onGraded(true)
  }

  return (
    <View style={{ gap: 12 }}>
      <Text className="text-sm font-semibold text-slate-800">Put the words in order</Text>
      {exercise.translation ? (
        <Text className="text-xs text-slate-500">Meaning: {exercise.translation}</Text>
      ) : null}
      <View className="min-h-[48px] flex-row flex-wrap gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2">
        {picked.map((wi, i) => (
          <View key={`${wi}-${i}`} className="rounded-md bg-white px-2 py-1">
            <Text className="text-sm text-slate-900">{exercise.words[wi]}</Text>
          </View>
        ))}
      </View>
      <Text className="text-xs text-slate-500">Tap a word to add it to your sentence.</Text>
      <View className="flex-row flex-wrap gap-2">
        {available.map((wordIdx) => (
          <Pressable
            key={`pool-${wordIdx}`}
            onPress={() => pick(wordIdx)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5"
          >
            <Text className="text-sm text-slate-800">{exercise.words[wordIdx]}</Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row gap-2">
        <Pressable onPress={undo} className="flex-1 items-center rounded-lg border border-slate-200 py-2">
          <Text className="text-sm font-medium text-slate-700">Undo</Text>
        </Pressable>
        <Pressable onPress={check} className="flex-1 items-center rounded-lg bg-blue-600 py-2">
          <Text className="text-sm font-semibold text-white">Check</Text>
        </Pressable>
      </View>
    </View>
  )
}

function McqView({
  exercise,
  onGraded,
}: {
  exercise: Extract<PracticeExercise, { type: 'mcq' }>
  onGraded: (ok: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const submit = (idx: number) => {
    if (locked) return
    setPicked(idx)
    setLocked(true)
    const ok = idx === exercise.answer_index
    setTimeout(() => onGraded(ok), ok ? 450 : 1100)
  }

  return (
    <View style={{ gap: 12 }}>
      <Text className="text-sm font-semibold text-slate-800">{exercise.question}</Text>
      <View style={{ gap: 8 }}>
        {exercise.options.map((opt, idx) => {
          const selected = picked === idx
          const correct = idx === exercise.answer_index
          return (
            <Pressable
              key={`${opt}-${idx}`}
              onPress={() => submit(idx)}
              disabled={locked}
              className={[
                'rounded-lg border px-3 py-2',
                locked && selected
                  ? correct
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-slate-200 bg-white',
              ].join(' ')}
            >
              <Text className="text-slate-800">{opt}</Text>
            </Pressable>
          )
        })}
      </View>
      {locked && picked !== null && exercise.explanation ? (
        <Text className="text-xs leading-5 text-slate-600">{exercise.explanation}</Text>
      ) : null}
    </View>
  )
}
