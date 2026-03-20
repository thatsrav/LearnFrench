import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import * as Speech from 'expo-speech'
import { Ionicons } from '@expo/vector-icons'
import TefPrepListeningPractice from '../components/TefPrepListeningPractice'
import type { TefSkill, TefReadingJson } from '../content/tefPrepA1'
import { getTefA1SkillData } from '../content/tefPrepA1'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

type RouteParams = { unit: number; skill: TefSkill }

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

export default function TefPrepActivityScreen() {
  const route = useRoute()
  const { unit, skill } = route.params as RouteParams
  const bottomPad = useStackScreenBottomPadding(32)
  const data = getTefA1SkillData(unit, skill)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [draft, setDraft] = useState('')

  const readingBlocks = useMemo(() => {
    if (!data || skill !== 'reading') return null
    const r = data as TefReadingJson
    if (r.document?.body_fr && r.items?.length) {
      return r.items.map((it, idx) => ({
        key: `i${it.item_number}`,
        question: `${it.item_number}. ${it.question_fr}`,
        options: it.options.map((o) => `${o.letter}) ${o.text_fr}`),
        answer_index: it.answer_index,
        storageIndex: idx,
      }))
    }
    if (r.questions?.length) {
      return r.questions.map((q, idx) => ({
        key: `q${idx}`,
        question: q.question_fr,
        options: q.options,
        answer_index: q.answer_index,
        storageIndex: idx,
      }))
    }
    return []
  }, [data, skill])

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-slate-700">Contenu introuvable.</Text>
      </View>
    )
  }

  const meta = (
    <View className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
      <Text className="text-xs font-semibold text-slate-500">{data.tef_task_id}</Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        <Text className="text-xs text-slate-600">CLB cible: {(data as { clb_target: number }).clb_target}</Text>
        <Text className="text-xs text-slate-600">· strictness: {(data as { strictness_level: string }).strictness_level}</Text>
        <Text className="text-xs text-slate-600">· densité: {data.lexical_density.toFixed(2)}</Text>
      </View>
    </View>
  )

  if (skill === 'reading') {
    const r = data as TefReadingJson
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        {meta}
        {r.instructions_fr ? (
          <Text className="mb-3 text-sm font-semibold text-slate-800">{r.instructions_fr}</Text>
        ) : null}
        {r.document ? (
          <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            {r.document.label_fr ? (
              <Text className="text-xs font-bold uppercase text-slate-500">{r.document.label_fr}</Text>
            ) : null}
            <Text className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{r.document.body_fr}</Text>
          </View>
        ) : null}
        {r.title_fr && r.content_fr ? (
          <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-base font-bold text-slate-900">{r.title_fr}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-800">{r.content_fr}</Text>
            {r.gloss_en ? <Text className="mt-2 text-xs italic text-slate-500">{r.gloss_en}</Text> : null}
          </View>
        ) : null}

        {readingBlocks?.map((block) => (
          <View key={block.key} className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
            <Text className="text-sm font-semibold text-slate-900">{block.question}</Text>
            <View className="mt-2 gap-2">
              {block.options.map((opt, oi) => {
                const picked = answers[block.storageIndex] === oi
                return (
                  <Pressable
                    key={oi}
                    onPress={() => setAnswers((p) => ({ ...p, [block.storageIndex]: oi }))}
                    className={[
                      'rounded-lg border px-3 py-2',
                      picked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50',
                    ].join(' ')}
                  >
                    <Text className={picked ? 'text-blue-800' : 'text-slate-800'}>{opt}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    )
  }

  if (skill === 'writing') {
    const w = data as import('../content/tefPrepA1').TefWritingJson
    const wc = wordCount(draft)
    const ok = wc >= w.min_words && wc <= w.max_words
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
        {meta}
        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-bold uppercase text-violet-700">{w.genre ?? w.task_type}</Text>
          <Text className="mt-2 text-base font-semibold text-slate-900">{w.prompt_fr}</Text>
          <Text className="mt-2 text-sm text-slate-600">{w.prompt_en}</Text>
          {w.constraints_fr?.length ? (
            <View className="mt-3">
              {w.constraints_fr.map((c, i) => (
                <Text key={i} className="text-xs text-slate-600">
                  • {c}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        <Text className="mt-3 text-sm text-slate-600">
          Mots: {wc} / {w.min_words}–{w.max_words} {ok ? '✓' : ''}
        </Text>
        <TextInput
          multiline
          value={draft}
          onChangeText={setDraft}
          placeholder="Écrivez ici…"
          placeholderTextColor="#94a3b8"
          className="mt-2 min-h-[160] rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900"
          textAlignVertical="top"
        />
        <Text className="mt-3 text-xs text-slate-500">
          Astuce: utilisez l’onglet Home → AI Scorer pour un retour sur votre texte.
        </Text>
      </ScrollView>
    )
  }

  if (skill === 'listening') {
    return (
      <View className="flex-1 bg-slate-50">
        <TefPrepListeningPractice tefUnit={unit} />
      </View>
    )
  }

  // speaking
  const s = data as import('../content/tefPrepA1').TefSpeakingJson
  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
      {meta}
      <View className="rounded-2xl border border-orange-200 bg-white p-4">
        <Text className="text-sm font-semibold text-slate-900">{s.situation_fr}</Text>
        <Text className="mt-2 text-sm text-slate-600">{s.situation_en}</Text>
      </View>
      <Text className="mt-4 text-xs font-bold uppercase text-slate-500">Formules possibles</Text>
      {s.cues_oral_fr.map((line, i) => (
        <Pressable
          key={i}
          onPress={() => {
            Speech.stop()
            Speech.speak(line, { language: 'fr-CA' })
          }}
          className="mt-2 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
        >
          <Ionicons name="play-circle-outline" size={20} color="#ea580c" />
          <Text className="flex-1 text-sm text-slate-800">{line}</Text>
        </Pressable>
      ))}
      {s.evaluation_criteria?.length ? (
        <View className="mt-4">
          <Text className="text-xs font-bold text-slate-600">Critères (auto-évaluation)</Text>
          {s.evaluation_criteria.map((c, i) => (
            <Text key={i} className="mt-1 text-xs text-slate-600">
              • {c}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  )
}
