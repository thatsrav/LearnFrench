import { useCallback, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native'
import type { VocabCard } from './types'

type Props = {
  cards: VocabCard[]
  onProgressFraction?: (fraction: number) => void
}

export default function VocabIntroStep({ cards, onProgressFraction }: Props) {
  const [index, setIndex] = useState(0)
  const [pageW, setPageW] = useState(0)

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const w = e.nativeEvent.layoutMeasurement.width
      if (w <= 0) return
      const x = e.nativeEvent.contentOffset.x
      const i = Math.round(x / w)
      const clamped = Math.max(0, Math.min(cards.length - 1, i))
      setIndex(clamped)
      if (cards.length <= 1) {
        onProgressFraction?.(1)
      } else {
        onProgressFraction?.(clamped / (cards.length - 1))
      }
    },
    [cards.length, onProgressFraction],
  )

  if (cards.length === 0) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm text-slate-600">No vocabulary cards for this step.</Text>
      </View>
    )
  }

  return (
    <View className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <Text className="px-4 pt-4 text-lg font-bold text-slate-900">New words</Text>
      <Text className="mt-1 px-4 text-xs text-slate-500">Swipe sideways to flip through cards</Text>

      <View
        className="mt-3"
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width
          if (w > 0 && w !== pageW) setPageW(w)
        }}
      >
        {pageW > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width
              if (w > 0 && w !== pageW) setPageW(w)
            }}
            decelerationRate="fast"
            snapToInterval={pageW}
            snapToAlignment="start"
          >
            {cards.map((card, i) => (
              <View key={`${card.word}-${i}`} style={{ width: pageW }} className="px-4">
                <View className="min-h-[220px] rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Text className="text-2xl font-bold text-blue-800">{card.word}</Text>
                  <Text className="mt-2 text-base text-slate-800">{card.translation}</Text>
                  <View className="mt-4 border-t border-slate-200 pt-3">
                    <Text className="text-sm italic leading-6 text-slate-700">{card.example}</Text>
                    {card.example_translation ? (
                      <Text className="mt-2 text-xs leading-5 text-slate-500">{card.example_translation}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="h-[240px]" />
        )}
      </View>

      <View className="flex-row items-center justify-center gap-1.5 pb-4">
        {cards.map((_, i) => (
          <View
            key={`dot-${i}`}
            className={['h-1.5 rounded-full', i === index ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300'].join(' ')}
          />
        ))}
      </View>
    </View>
  )
}
