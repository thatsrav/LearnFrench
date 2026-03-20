import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { MotiView } from 'moti'
import { ChevronRight } from 'lucide-react-native'
import { ATELIER } from './atelierTheme'

type Task = {
  id: string
  prompt: string
  hint: string
  choices: string[]
  correctIndex: number
}

const TASKS: Task[] = [
  {
    id: '1',
    prompt: 'Les filles sont ____.',
    hint: '(heureux)',
    choices: ['heureux', 'heureuse', 'heureuxs', 'heureuses'],
    correctIndex: 3,
  },
  {
    id: '2',
    prompt: 'La porte est ____.',
    hint: '(ouvert)',
    choices: ['ouvert', 'ouverte', 'ouverts', 'ouvertes'],
    correctIndex: 1,
  },
  {
    id: '3',
    prompt: 'Les livres sont ____.',
    hint: '(nouveau)',
    choices: ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles'],
    correctIndex: 2,
  },
  {
    id: '4',
    prompt: 'Elle est ____.',
    hint: '(content)',
    choices: ['content', 'contente', 'contents', 'contentes'],
    correctIndex: 1,
  },
]

type Props = {
  onAnswer?: (correct: boolean) => void
}

export default function AgreementChallengeCard({ onAnswer }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const task = TASKS[index]

  const pick = (i: number) => {
    setSelected(i)
    const ok = i === task.correctIndex
    onAnswer?.(ok)
  }

  const next = () => {
    setSelected(null)
    setIndex((i) => (i + 1) % TASKS.length)
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 }}
    >
      <Text className="font-display text-lg font-bold" style={{ color: ATELIER.navy }}>
        Agreement challenge
      </Text>
      <Text className="mt-2 text-sm leading-5" style={{ color: ATELIER.textMuted }}>
        Match the adjective ending to the subject gender and number.
      </Text>

      <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: ATELIER.cardMuted }}>
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Task {String(index + 1).padStart(2, '0')}
        </Text>
        <Text className="mt-3 font-display text-base font-bold" style={{ color: ATELIER.navy }}>
          {task.prompt}
        </Text>
        <Text className="mt-1 text-xs italic" style={{ color: ATELIER.textMuted }}>
          {task.hint}
        </Text>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {task.choices.map((c, i) => {
            const active = selected === i
            return (
              <Pressable
                key={c}
                onPress={() => pick(i)}
                className="rounded-full border-2 px-4 py-2.5"
                style={{
                  borderColor: active ? ATELIER.accent : ATELIER.border,
                  backgroundColor: active ? ATELIER.accentLight : '#fff',
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: active ? ATELIER.accent : ATELIER.text }}
                >
                  {c}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          {TASKS.map((t, i) => (
            <View
              key={t.id}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: i === index ? ATELIER.navy : ATELIER.cardMuted,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: i === index ? '#fff' : ATELIER.textMuted }}
              >
                {String(i + 1).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={next}
          className="flex-row items-center gap-1 rounded-full px-3 py-2"
          style={{ backgroundColor: ATELIER.accentLight }}
        >
          <Text className="text-sm font-bold" style={{ color: ATELIER.accent }}>
            Next sentence
          </Text>
          <ChevronRight size={18} color={ATELIER.accent} />
        </Pressable>
      </View>
    </MotiView>
  )
}
