import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { TefSkill } from '../content/tefPrepA1'
import { getTefA1Unit } from '../content/tefPrepA1'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

const SKILLS: { skill: TefSkill; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { skill: 'reading', label: 'Reading', sub: 'Compréhension écrite', icon: 'book-outline', color: '#2563eb' },
  { skill: 'writing', label: 'Writing', sub: 'Expression écrite', icon: 'create-outline', color: '#7c3aed' },
  { skill: 'listening', label: 'Listening', sub: '6 QCM TEF-style', icon: 'headset-outline', color: '#059669' },
  { skill: 'speaking', label: 'Speaking', sub: 'Expression orale — A', icon: 'chatbubbles-outline', color: '#ea580c' },
]

type RouteParams = { unit: number }

export default function TefPrepUnitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { unit } = route.params as RouteParams
  const bottomPad = useStackScreenBottomPadding(28)
  const b = getTefA1Unit(unit)

  if (!b) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f9fb] p-6">
        <Text className="font-sans-semibold text-slate-800">Unité introuvable</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-2xl bg-[#2563eb] px-5 py-2.5 active:opacity-90">
          <Text className="font-sans-bold text-white">Retour</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-[#f8f9fb]" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
      <Pressable onPress={() => navigation.goBack()} className="mb-4 flex-row items-center gap-1 self-start">
        <Ionicons name="chevron-back" size={18} color="#2563eb" />
        <Text className="font-sans-bold text-sm text-[#2563eb]">Retour au parcours TEF</Text>
      </Pressable>

      <Text className="text-xs font-bold uppercase tracking-widest text-red-700">TEF Canada · A1</Text>
      <Text className="font-display mt-2 text-3xl text-slate-900">Unité {unit}</Text>
      <Text className="font-sans mt-1 text-xs text-slate-500">{b.reading.tef_task_id}</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-slate-900 px-3 py-1">
          <Text className="font-sans-bold text-xs text-white">CLB {b.reading.clb_target}</Text>
        </View>
        <View className="rounded-full border border-slate-200 bg-white px-3 py-1">
          <Text className="font-sans-semibold text-xs text-slate-700">{b.reading.strictness_level}</Text>
        </View>
      </View>

      <Text className="font-sans-semibold mt-8 text-sm text-slate-700">Choisir une salle</Text>
      <View className="mt-3 gap-3">
        {SKILLS.map(({ skill, label, sub, icon, color }) => (
          <Pressable
            key={skill}
            onPress={() => navigation.navigate('TefPrepActivity', { unit, skill })}
            className="flex-row items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
          >
            <View className="h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-display text-lg text-slate-900">{label}</Text>
              <Text className="font-sans mt-0.5 text-xs text-slate-500">{sub}</Text>
              <Text className="font-sans-bold mt-2 text-xs text-red-700">Ouvrir →</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
