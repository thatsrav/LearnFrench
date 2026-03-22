import { Text, View } from 'react-native'
import type { DialogueTurn } from './types'

type Props = {
  scene: string
  turns: DialogueTurn[]
}

export default function DialogueStep({ scene, turns }: Props) {
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-lg font-bold text-slate-900">Dialogue</Text>
      <Text className="mt-1 text-sm text-slate-600">{scene}</Text>
      <View className="mt-4" style={{ gap: 12 }}>
        {turns.map((t, i) => (
          <DialogueBubble key={`${t.speaker}-${i}`} turn={t} />
        ))}
      </View>
    </View>
  )
}

function DialogueBubble({ turn }: { turn: DialogueTurn }) {
  const isA = turn.speaker === 'A'
  return (
    <View
      className={[
        'rounded-xl border px-3 py-3',
        isA ? 'border-blue-200 bg-blue-50 self-start' : 'border-emerald-200 bg-emerald-50 self-end',
      ].join(' ')}
      style={{ maxWidth: '92%' }}
    >
      <Text className="text-xs font-semibold text-slate-500">{turn.speaker}</Text>
      <Text className="mt-1 text-sm font-medium leading-6 text-slate-900">{turn.text}</Text>
      {turn.translation ? (
        <Text className="mt-2 text-xs leading-5 text-slate-600">{turn.translation}</Text>
      ) : null}
    </View>
  )
}
