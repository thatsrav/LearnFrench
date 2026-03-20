import { useCallback, useState } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import AtelierHeader from '../components/atelier/AtelierHeader'
import AgreementChallengeCard from '../components/atelier/AgreementChallengeCard'
import SyntaxReorderCard from '../components/atelier/SyntaxReorderCard'
import TenseSortingCard from '../components/atelier/TenseSortingCard'
import { ATELIER, ATELIER_WIDE_BREAKPOINT } from '../components/atelier/atelierTheme'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

/**
 * Grammar Atelier — interactive B2 lab: tense sorting (drag), agreement MC, syntax reorder.
 * Layout: 2-column grid on wide screens / vertical stack on phones (Expo web + native).
 */
export default function AtelierScreen() {
  const { width } = useWindowDimensions()
  const wide = width >= ATELIER_WIDE_BREAKPOINT
  const bottomPad = useStackScreenBottomPadding(32)

  const [xpStreak, setXpStreak] = useState(1240)
  const [correct, setCorrect] = useState(18)
  const totalTrack = 20

  const onAgreement = useCallback((ok: boolean) => {
    if (ok) {
      setCorrect((c) => Math.min(totalTrack, c + 1))
      setXpStreak((x) => x + 15)
    }
  }, [])

  const onSyntax = useCallback((ok: boolean) => {
    if (ok) {
      setCorrect((c) => Math.min(totalTrack, c + 1))
      setXpStreak((x) => x + 25)
    }
  }, [])

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: ATELIER.surface }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: bottomPad,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ATELIER.accent }}>
        Interactive lab
      </Text>
      <Text className="font-display mt-2 text-3xl font-bold" style={{ color: ATELIER.navy }}>
        Grammar Atelier
      </Text>
      <Text className="mt-2 text-sm leading-5" style={{ color: ATELIER.textMuted }}>
        B2 upper intermediate — tri des temps, accords, and syntax reordering in one session.
      </Text>

      <AtelierHeader xpStreak={xpStreak} correctCount={correct} totalQuestions={totalTrack} />

      {wide ? (
        <View className="flex-row items-start gap-6">
          <View className="min-w-0 flex-[1.55] gap-6">
            <TenseSortingCard />
            <SyntaxReorderCard onValidate={onSyntax} />
          </View>
          <View className="min-w-0 flex-1">
            <AgreementChallengeCard onAnswer={onAgreement} />
          </View>
        </View>
      ) : (
        <View className="gap-6">
          <TenseSortingCard />
          <AgreementChallengeCard onAnswer={onAgreement} />
          <SyntaxReorderCard onValidate={onSyntax} />
        </View>
      )}

      <View className="mt-10 items-center border-t border-slate-200/80 pt-6">
        <Text className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          The digital curator · Modules by L&apos;Atelier français
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-center gap-4">
          <Text className="text-xs font-semibold text-slate-500">Support</Text>
          <Text className="text-xs font-semibold text-slate-500">Methodology</Text>
          <Text className="text-xs font-semibold text-slate-500">Settings</Text>
        </View>
      </View>
    </ScrollView>
  )
}
