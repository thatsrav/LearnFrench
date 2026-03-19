import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SPEAKING_PROMPTS } from '../content/speakingPrompts'

export default function SpeakingCoachScreen() {
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const prompt = useMemo(() => SPEAKING_PROMPTS[index % SPEAKING_PROMPTS.length], [index])

  const nextPrompt = () => {
    setFeedback(null)
    setIndex((v) => v + 1)
  }

  /** Lightweight placeholder — full ASR + AI evaluation can plug in later. */
  const simulateCheck = () => {
    setFeedback(
      'Good attempt. Focus on clearer connectors (et, puis, parce que) and slower pronunciation. Record yourself and replay to catch liaisons.',
    )
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text className="text-2xl font-bold text-slate-900">Speaking coach</Text>
      <Text className="mt-1 text-sm text-slate-500">Oral prompts — practice out loud.</Text>

      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt</Text>
        <Text className="mt-2 text-base font-medium text-slate-900">{prompt}</Text>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-3">
        <Pressable
          onPress={simulateCheck}
          className="rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700"
        >
          <Text className="text-center text-sm font-semibold text-white">Check speaking</Text>
        </Pressable>
        <Pressable onPress={nextPrompt} className="rounded-xl bg-slate-200 px-5 py-3 active:bg-slate-300">
          <Text className="text-center text-sm font-semibold text-slate-800">Next prompt</Text>
        </Pressable>
      </View>

      {feedback ? (
        <View className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <Text className="text-sm leading-5 text-emerald-900">{feedback}</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}
