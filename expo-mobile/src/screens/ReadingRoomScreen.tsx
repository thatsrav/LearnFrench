import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { LEVEL_ORDER, PASSAGES, type ReadingLevel } from '../content/readingPassages'
import { useTabScreenBottomPadding } from '../lib/screenPadding'

export default function ReadingRoomScreen() {
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const [level, setLevel] = useState<ReadingLevel>('A1')
  const content = useMemo(() => PASSAGES[level], [level])

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: scrollBottomPad }}>
      <Text className="text-2xl font-bold text-slate-900">Reading room</Text>
      <Text className="mt-1 text-sm text-slate-500">Short passages and comprehension — by CEFR level.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginTop: 16 }}
      >
        {LEVEL_ORDER.map((l) => {
          const active = level === l
          return (
            <Pressable
              key={l}
              onPress={() => setLevel(l)}
              className={['rounded-full px-4 py-2', active ? 'bg-blue-600' : 'bg-slate-200'].join(' ')}
            >
              <Text className={['text-sm font-semibold', active ? 'text-white' : 'text-slate-700'].join(' ')}>
                {l}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View className="mt-4 gap-4">
        {content.map((p) => (
          <View key={p.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="text-base font-semibold text-slate-900">{p.title}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-700">{p.text}</Text>
            <View className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comprehension</Text>
              <Text className="mt-1 text-sm text-slate-800">{p.question}</Text>
              <Text className="mt-2 text-sm text-blue-700">
                <Text className="font-semibold">Answer:</Text> {p.answer}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
