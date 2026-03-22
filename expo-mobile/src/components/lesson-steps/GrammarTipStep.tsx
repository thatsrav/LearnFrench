import { Text, View } from 'react-native'
import type { GrammarExample } from './types'

type Props = {
  rule: string
  examples: GrammarExample[]
}

export default function GrammarTipStep({ rule, examples }: Props) {
  return (
    <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <Text className="text-xs font-semibold uppercase tracking-wide text-amber-900">Grammar tip</Text>
      <Text className="mt-2 text-sm leading-7 text-amber-950">{rule}</Text>
      {examples.length > 0 ? (
        <View className="mt-4 border-t border-amber-200/80 pt-3" style={{ gap: 10 }}>
          {examples.map((ex, i) => (
            <View key={`ex-${i}`} className="rounded-lg bg-white/70 px-3 py-2">
              <Text className="text-sm font-medium text-slate-900">{ex.fr}</Text>
              <Text className="mt-1 text-xs text-slate-600">{ex.en}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}
