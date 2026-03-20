import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { TefSkill } from '../content/tefPrepA1'
import { getTefA1Unit } from '../content/tefPrepA1'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

const SKILLS: { skill: TefSkill; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { skill: 'reading', label: 'Reading Room', icon: 'book-outline', color: '#2563eb' },
  { skill: 'writing', label: 'Writing (Section A)', icon: 'create-outline', color: '#7c3aed' },
  { skill: 'listening', label: 'Listening', icon: 'headset-outline', color: '#059669' },
  { skill: 'speaking', label: 'Speaking (Section A)', icon: 'chatbubbles-outline', color: '#ea580c' },
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
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="font-semibold text-slate-800">Unité introuvable</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
          <Text className="font-semibold text-white">Retour</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
      <Pressable onPress={() => navigation.goBack()} className="mb-4 flex-row items-center gap-1 self-start">
        <Ionicons name="chevron-back" size={18} color="#2563eb" />
        <Text className="text-sm font-semibold text-blue-600">TEF Prep</Text>
      </Pressable>

      <Text className="text-2xl font-bold text-slate-900">Unité {unit}</Text>
      <Text className="mt-1 text-sm text-slate-500">{b.reading.tef_task_id}</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-slate-900 px-3 py-1">
          <Text className="text-xs font-bold text-white">CLB {b.reading.clb_target}</Text>
        </View>
        <View className="rounded-full border border-slate-300 bg-white px-3 py-1">
          <Text className="text-xs font-semibold text-slate-700">{b.reading.strictness_level}</Text>
        </View>
      </View>

      <Text className="mt-6 text-sm font-semibold text-slate-700">Choisir une salle</Text>
      <View className="mt-3 gap-3">
        {SKILLS.map(({ skill, label, icon, color }) => (
          <Pressable
            key={skill}
            onPress={() => navigation.navigate('TefPrepActivity', { unit, skill })}
            className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <Ionicons name={icon} size={22} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900">{label}</Text>
              <Text className="text-xs text-slate-500 capitalize">{skill}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
