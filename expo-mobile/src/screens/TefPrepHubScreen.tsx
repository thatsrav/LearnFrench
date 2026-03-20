import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { TEF_A1_UNIT_COUNT, getTefA1Unit } from '../content/tefPrepA1'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

export default function TefPrepHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const bottomPad = useStackScreenBottomPadding(28)

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
      <Text className="text-xs font-bold uppercase text-red-700">TEF Canada — Préparation</Text>
      <Text className="mt-2 text-2xl font-bold text-slate-900">A1 Skill Rooms</Text>
      <Text className="mt-2 text-sm leading-5 text-slate-600">
        10 unités : lecture, écriture, compréhension orale, expression orale. Contenu distinct du syllabus principal.
      </Text>

      <View className="mt-6 gap-3">
        {Array.from({ length: TEF_A1_UNIT_COUNT }, (_, i) => i + 1).map((unit) => {
          const b = getTefA1Unit(unit)
          const clb = b?.reading.clb_target ?? 1
          return (
            <Pressable
              key={unit}
              onPress={() => navigation.navigate('TefPrepUnit', { unit })}
              className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900">Unité {unit}</Text>
                <Text className="mt-1 text-xs text-slate-500">
                  CLB ~{clb} · {b?.reading.strictness_level ?? '—'} · densité {b?.reading.lexical_density?.toFixed(2) ?? '—'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}
