import { Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { TEF_A1_UNIT_COUNT, getTefA1Unit } from '../content/tefPrepA1'
import { useStackScreenBottomPadding } from '../lib/screenPadding'
import { TEF_HUB_UNIT_BLURBS } from '../content/tefPrepHubCopy'

const SKILLS_PREVIEW = [
  { icon: 'book-outline' as const, title: 'Reading', sub: 'Compréhension écrite', color: '#2563eb' },
  { icon: 'create-outline' as const, title: 'Writing', sub: 'Expression écrite', color: '#7c3aed' },
  { icon: 'headset-outline' as const, title: 'Listening', sub: 'Compréhension orale', color: '#059669' },
  { icon: 'mic-outline' as const, title: 'Speaking', sub: 'Expression orale', color: '#ea580c' },
]

export default function TefPrepHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const bottomPad = useStackScreenBottomPadding(32)

  return (
    <ScrollView className="flex-1 bg-[#f8f9fb]" contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}>
      <View className="flex-row flex-wrap items-start justify-between gap-4">
        <View className="max-w-[90%]">
          <Text className="text-xs font-bold uppercase tracking-widest text-red-700">TEF Canada</Text>
          <Text className="font-display mt-2 text-3xl text-slate-900">Mastering Proficiency.</Text>
          <Text className="font-sans mt-3 text-sm leading-5 text-slate-600">
            A1 skill rooms — reading, writing, listening, and speaking. Listening uses the extended catalog (6 questions per
            unit).
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <View className="flex-row items-center gap-1">
              <Ionicons name="flame" size={16} color="#7c3aed" />
              <Text className="font-sans text-[10px] font-bold uppercase text-slate-500">Streak</Text>
            </View>
            <Text className="font-display mt-1 text-xl text-slate-900">12</Text>
          </View>
          <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Text className="font-sans text-[10px] font-bold uppercase text-slate-500">Exam</Text>
            <Text className="font-display mt-1 text-xl text-slate-900">45</Text>
            <Text className="font-sans text-[9px] text-slate-400">days</Text>
          </View>
        </View>
      </View>

      <Text className="font-sans-semibold mb-3 mt-8 text-xs uppercase tracking-wide text-slate-500">Skill overview</Text>
      <View className="flex-row flex-wrap gap-3">
        {SKILLS_PREVIEW.map((s) => (
          <Pressable
            key={s.title}
            onPress={() => navigation.navigate('TefPrepUnit', { unit: 1 })}
            className="min-w-[47%] flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:opacity-90"
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${s.color}18` }}
            >
              <Ionicons name={s.icon} size={22} color={s.color} />
            </View>
            <Text className="font-display mt-3 text-base text-slate-900">{s.title}</Text>
            <Text className="font-sans mt-1 text-xs capitalize text-slate-500">{s.sub}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-10 flex-row items-center gap-3">
        <View className="h-1 w-10 rounded-full bg-[#2563eb]" />
        <Text className="font-display text-xl text-slate-900">Preparation Pathway</Text>
      </View>

      <View className="mt-4 gap-3">
        {Array.from({ length: TEF_A1_UNIT_COUNT }, (_, i) => i + 1).map((unit) => {
          const b = getTefA1Unit(unit)
          const clb = b?.reading.clb_target ?? 1
          const blurb = TEF_HUB_UNIT_BLURBS[unit] ?? 'Skill-room practice for this unit.'
          return (
            <Pressable
              key={unit}
              onPress={() => navigation.navigate('TefPrepUnit', { unit })}
              className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:bg-red-50/40"
            >
              <View className="flex-1 flex-row items-start gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50">
                  <Text className="font-sans-bold text-sm text-slate-700">{String(unit).padStart(2, '0')}</Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-display text-base text-slate-900">Unité {unit}</Text>
                  <Text className="font-sans mt-1 text-xs leading-4 text-slate-600">{blurb}</Text>
                  <Text className="font-sans mt-1 text-[10px] text-slate-400">
                    CLB ~{clb} · {b?.reading.strictness_level ?? '—'}
                  </Text>
                </View>
              </View>
              <Text className="font-sans-bold ml-2 text-sm text-red-700">Ouvrir →</Text>
            </Pressable>
          )
        })}
      </View>

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginTop: 28, borderRadius: 20, padding: 22 }}
      >
        <Ionicons name="sparkles" size={28} color="#a5b4fc" />
        <Text className="font-sans mt-3 text-[10px] font-bold uppercase tracking-widest text-white/70">AI benchmark</Text>
        <Text className="font-display mt-2 text-xl text-white">Need a score prediction?</Text>
        <Text className="font-sans mt-2 text-sm leading-5 text-white/80">
          Use the Home tab AI scorer for CEFR-style feedback alongside TEF prep.
        </Text>
      </LinearGradient>
    </ScrollView>
  )
}
