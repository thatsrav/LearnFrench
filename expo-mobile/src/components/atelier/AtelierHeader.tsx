import { View, Text, useWindowDimensions } from 'react-native'
import { Flame, CheckCircle2 } from 'lucide-react-native'
import { ATELIER, ATELIER_WIDE_BREAKPOINT } from './atelierTheme'

type Props = {
  xpStreak: number
  correctCount: number
  totalQuestions: number
}

export default function AtelierHeader({ xpStreak, correctCount, totalQuestions }: Props) {
  const { width } = useWindowDimensions()
  const compact = width < ATELIER_WIDE_BREAKPOINT
  return (
    <View className="mb-4 flex-row flex-wrap items-stretch justify-end gap-3">
      <View
        className={`min-w-[120px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${compact ? 'flex-1' : 'max-w-[160px] flex-none'}`}
        style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}
      >
        <View className="flex-row items-center gap-2">
          <Flame size={20} color="#f97316" />
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: ATELIER.textMuted }}>
            XP Streak
          </Text>
        </View>
        <Text className="mt-1 font-display text-2xl font-bold" style={{ color: ATELIER.navy }}>
          {xpStreak.toLocaleString()}
        </Text>
      </View>
      <View
        className={`min-w-[120px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${compact ? 'flex-1' : 'max-w-[160px] flex-none'}`}
        style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}
      >
        <View className="flex-row items-center gap-2">
          <CheckCircle2 size={20} color={ATELIER.accent} />
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: ATELIER.textMuted }}>
            Correct
          </Text>
        </View>
        <Text className="mt-1 font-display text-2xl font-bold" style={{ color: ATELIER.navy }}>
          {correctCount}/{totalQuestions}
        </Text>
      </View>
    </View>
  )
}
