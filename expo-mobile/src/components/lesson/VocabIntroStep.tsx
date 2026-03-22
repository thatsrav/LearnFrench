import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type VocabIntroCard = {
  word: string
  translation: string
  example: string
  example_translation: string
  audio_key?: string
}

export type VocabIntroStepProps = {
  cards: VocabIntroCard[]
  /** Fired after the “Vocab done!” slide is shown (brief delay). */
  onComplete?: () => void
  /** Lesson progress bar (0–1), based on card index. */
  onProgressFraction?: (fraction: number) => void
  /** Per-card SR intent — persist later from the parent. */
  onCardOutcome?: (cardIndex: number, outcome: 'got_it' | 'review_again') => void
  /** Optional: play bundled audio; stay offline if unimplemented. */
  onAudioPress?: (audio_key: string) => void
}

const DONE_SLIDE_MS = 1800

type ListItem = { kind: 'card'; card: VocabIntroCard; index: number } | { kind: 'done' }

function FlipCard({
  card,
  cardIndex,
  width,
  onCardOutcome,
  onAudioPress,
}: {
  card: VocabIntroCard
  cardIndex: number
  width: number
  onCardOutcome?: VocabIntroStepProps['onCardOutcome']
  onAudioPress?: VocabIntroStepProps['onAudioPress']
}) {
  const [flipped, setFlipped] = useState(false)

  const mark = (outcome: 'got_it' | 'review_again') => {
    onCardOutcome?.(cardIndex, outcome)
  }

  return (
    <View style={{ width }} className="px-3">
      <View className="min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!flipped ? (
          <Pressable
            onPress={() => setFlipped(true)}
            className="flex-1 items-center justify-center px-5 py-10"
            accessibilityRole="button"
            accessibilityLabel="Show translation and examples"
          >
            <Text className="text-center text-4xl font-bold text-slate-900">{card.word}</Text>
            <Text className="mt-3 text-center text-xs text-slate-500">Tap to flip</Text>
            {card.audio_key ? (
              <Pressable
                onPress={() => onAudioPress?.(card.audio_key!)}
                className="mt-8 h-12 w-12 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Play pronunciation"
              >
                <Ionicons name="volume-medium" size={26} color="#334155" />
              </Pressable>
            ) : null}
          </Pressable>
        ) : (
          <View className="flex-1 justify-between px-5 py-6">
            <Pressable
              onPress={() => setFlipped(false)}
              className="flex-1"
              accessibilityRole="button"
              accessibilityLabel="Show French word"
            >
              <Text className="text-center text-xl font-bold text-slate-900">{card.translation}</Text>
              <Text className="mt-4 text-center text-sm italic leading-6 text-slate-800">{card.example}</Text>
              <Text className="mt-3 text-center text-xs leading-5 text-slate-500">{card.example_translation}</Text>
              <Text className="mt-4 text-center text-[10px] text-slate-400">Tap to flip back</Text>
            </Pressable>
            <View className="mt-2 flex-row gap-2">
              <Pressable
                onPress={() => mark('review_again')}
                className="flex-1 items-center rounded-xl border border-amber-300 bg-amber-50 py-3 active:bg-amber-100"
              >
                <Text className="text-sm font-semibold text-amber-900">Review again</Text>
              </Pressable>
              <Pressable
                onPress={() => mark('got_it')}
                className="flex-1 items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
              >
                <Text className="text-sm font-semibold text-white">Got it</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default function VocabIntroStep({
  cards,
  onComplete,
  onProgressFraction,
  onCardOutcome,
  onAudioPress,
}: VocabIntroStepProps) {
  const [pageW, setPageW] = useState(() => Math.min(Dimensions.get('window').width - 32, 400))
  const [visibleIndex, setVisibleIndex] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    completedRef.current = false
  }, [cards])

  const data: ListItem[] =
    cards.length === 0
      ? []
      : [...cards.map((card, index) => ({ kind: 'card' as const, card, index })), { kind: 'done' as const }]

  const totalSlides = data.length

  const onLayoutRoot = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0) setPageW(w)
  }, [])

  const reportProgress = useCallback(
    (clamped: number) => {
      if (cards.length <= 1) {
        onProgressFraction?.(clamped >= cards.length ? 1 : 0)
      } else {
        const prog = clamped >= cards.length ? 1 : clamped / (cards.length - 1)
        onProgressFraction?.(prog)
      }
    },
    [cards.length, onProgressFraction],
  )

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const w = e.nativeEvent.layoutMeasurement.width
      if (w <= 0) return
      const x = e.nativeEvent.contentOffset.x
      const i = Math.round(x / w)
      const clamped = Math.max(0, Math.min(totalSlides - 1, i))
      setVisibleIndex(clamped)
      reportProgress(clamped)
    },
    [reportProgress, totalSlides],
  )

  useEffect(() => {
    reportProgress(0)
  }, [cards.length, reportProgress])

  useEffect(() => {
    if (cards.length === 0) return
    if (visibleIndex < cards.length) return
    if (completedRef.current) return
    completedRef.current = true
    const t = setTimeout(() => {
      onComplete?.()
    }, DONE_SLIDE_MS)
    return () => clearTimeout(t)
  }, [visibleIndex, cards.length, onComplete])

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'done') {
        return (
          <View style={{ width: pageW }} className="min-h-[320px] justify-center px-4 py-10">
            <View className="items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8">
              <Text className="text-center text-xl font-bold text-emerald-900">Vocab done!</Text>
              <Text className="mt-2 text-center text-base text-emerald-800">
                You learned {cards.length} {cards.length === 1 ? 'word' : 'words'}.
              </Text>
            </View>
          </View>
        )
      }
      return (
        <FlipCard
          card={item.card}
          cardIndex={item.index}
          width={pageW}
          onCardOutcome={onCardOutcome}
          onAudioPress={onAudioPress}
        />
      )
    },
    [cards.length, onAudioPress, onCardOutcome, pageW],
  )

  if (cards.length === 0) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm text-slate-600">No vocabulary cards for this step.</Text>
      </View>
    )
  }

  const cardPositionLabel =
    visibleIndex < cards.length ? `Card ${visibleIndex + 1} of ${cards.length}` : 'Complete'

  const dotActiveIndex = visibleIndex >= cards.length ? cards.length - 1 : visibleIndex

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white" onLayout={onLayoutRoot}>
      <Text className="px-4 pt-4 text-lg font-bold text-slate-900">New words</Text>
      <Text className="mt-0.5 px-4 text-xs text-slate-500">Swipe for the next card · Tap the card to flip</Text>

      <FlatList
        data={data}
        keyExtractor={(item, i) => (item.kind === 'done' ? 'done' : `card-${item.index}-${i}`)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        bounces={false}
      />

      <View className="flex-row items-center justify-center gap-1.5 pb-2 pt-1">
        {cards.map((_, i) => (
          <View
            key={`dot-${i}`}
            className={[
              'h-1.5 rounded-full',
              i === dotActiveIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300',
            ].join(' ')}
          />
        ))}
      </View>
      <Text className="pb-4 text-center text-xs font-medium text-slate-600">{cardPositionLabel}</Text>
    </View>
  )
}
