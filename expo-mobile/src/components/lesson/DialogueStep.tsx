import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

export type DialogueTurn = {
  speaker: 'A' | 'B'
  text: string
  translation: string
}

export type DialogueStepProps = {
  scene: string
  turns: DialogueTurn[]
  /** Fires when the user taps Continue (after engaging with at least one bubble). */
  onContinue?: () => void
}

const STAGGER_MS = 300

function Bubble({
  turn,
  index,
  showTranslation,
  onToggle,
}: {
  turn: DialogueTurn
  index: number
  showTranslation: boolean
  onToggle: () => void
}) {
  const isB = turn.speaker === 'B'

  return (
    <Animated.View
      entering={FadeInDown.delay(index * STAGGER_MS).duration(380)}
      className={isB ? 'self-end' : 'self-start'}
      style={{ maxWidth: '88%' }}
    >
      <Pressable
        onPress={onToggle}
        className={[
          'rounded-2xl border px-3.5 py-3',
          isB ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-100',
        ].join(' ')}
      >
        <Text className="text-[10px] font-bold uppercase text-slate-500">Speaker {turn.speaker}</Text>
        <Text className="mt-1 text-sm font-medium leading-6 text-slate-900">{turn.text}</Text>
        {showTranslation ? (
          <Text className="mt-2 border-t border-slate-200/80 pt-2 text-xs leading-5 text-slate-600">
            {turn.translation}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  )
}

export default function DialogueStep({ scene, turns, onContinue }: DialogueStepProps) {
  const [translationVisible, setTranslationVisible] = useState<Record<number, boolean>>({})
  const [anyBubbleTapped, setAnyBubbleTapped] = useState(false)

  const toggle = useCallback((i: number) => {
    setAnyBubbleTapped(true)
    setTranslationVisible((prev) => ({ ...prev, [i]: !prev[i] }))
  }, [])

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-lg font-bold text-slate-900">Dialogue</Text>
      <Text className="mt-2 text-sm italic leading-6 text-slate-600">
        Scene: {scene}
      </Text>

      <ScrollView className="mt-4 max-h-[420px]" contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
        {turns.map((turn, i) => (
          <Bubble
            key={`${turn.speaker}-${i}-${turn.text.slice(0, 12)}`}
            turn={turn}
            index={i}
            showTranslation={!!translationVisible[i]}
            onToggle={() => toggle(i)}
          />
        ))}
      </ScrollView>

      <Text className="mt-2 text-center text-xs text-slate-500">
        Tap a bubble to show or hide its translation.
      </Text>

      <Pressable
        onPress={() => onContinue?.()}
        disabled={!anyBubbleTapped}
        className={[
          'mt-4 items-center rounded-xl py-3',
          anyBubbleTapped ? 'bg-blue-600 active:bg-blue-700' : 'bg-slate-200',
        ].join(' ')}
      >
        <Text className={['text-sm font-semibold', anyBubbleTapped ? 'text-white' : 'text-slate-400'].join(' ')}>
          Continue
        </Text>
      </Pressable>
    </View>
  )
}
