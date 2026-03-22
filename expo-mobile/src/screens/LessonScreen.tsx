import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NavigationAction } from '@react-navigation/native'
import { unlockNextUnit } from '../database'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadUnitProgressToCloud } from '../services/cloudProgress'
import {
  getDueReviewItemsForUnit,
  seedSpacedRepetitionFromLesson,
  updateSpacedRepetitionItem,
  type SpacedRepetitionReviewItem,
} from '../lib/spacedRepetition'
import { recordRecommendationEngagement } from '../services/recommendationEngine'
import { useStackScreenBottomPadding } from '../lib/screenPadding'
import DialogueStep from '../components/lesson-steps/DialogueStep'
import GrammarTipStep from '../components/lesson-steps/GrammarTipStep'
import PracticeStep from '../components/lesson-steps/PracticeStep'
import VocabIntroStep from '../components/lesson-steps/VocabIntroStep'
import type { LessonStep } from '../components/lesson-steps/types'
import {
  extractGrammarRuleForSpacedRepetition,
  extractVocabEntriesForSpacedRepetition,
  extractVocabForSpacedRepetition,
  loadLessonUnit,
} from '../lib/lessonUnitLoader'

type RouteParams = {
  unitId: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  /** When set, user opened lesson from FrenchLearn unit overview. */
  moduleId?: string
  fromRecommendation?: boolean
  reviewMode?: boolean
}

type FinishSnapshot = {
  score: number
  xp: number
  unlockedUnitId: string | null
  passed: boolean
}

function xpFromScore(score: number): number {
  return Math.max(15, Math.round(40 + score * 0.65))
}

export default function LessonScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const scrollBottomPad = useStackScreenBottomPadding(20)
  const route = useRoute()
  const { unitId, level, fromRecommendation, reviewMode } = route.params as RouteParams

  const unit = useMemo(() => loadLessonUnit(level, unitId), [level, unitId])
  const steps = unit?.steps ?? []
  const totalSteps = steps.length

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [vocabFrac, setVocabFrac] = useState(0)
  const [practiceFrac, setPracticeFrac] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [finishSnapshot, setFinishSnapshot] = useState<FinishSnapshot | null>(null)
  const [allowLeaveWithoutPrompt, setAllowLeaveWithoutPrompt] = useState(false)
  const [practiceResetKey, setPracticeResetKey] = useState(0)
  const [inlineReviewOpen, setInlineReviewOpen] = useState(false)
  const [inlineItems, setInlineItems] = useState<SpacedRepetitionReviewItem[]>([])
  const [inlineIndex, setInlineIndex] = useState(0)
  const [inlineFlipped, setInlineFlipped] = useState(false)
  const [inlineGrading, setInlineGrading] = useState(false)
  const pendingFinishRef = useRef<FinishSnapshot | null>(null)

  const currentStep: LessonStep | undefined = steps[currentStepIndex]

  useEffect(() => {
    setVocabFrac(0)
    setPracticeFrac(0)
  }, [currentStepIndex])

  const innerProgress = useMemo(() => {
    if (!currentStep) return 0
    if (currentStep.type === 'vocab_intro') return vocabFrac
    if (currentStep.type === 'practice') return practiceFrac
    return 1
  }, [currentStep, practiceFrac, vocabFrac])

  const progressPercent = useMemo(() => {
    if (totalSteps === 0) return 0
    return Math.min(100, Math.round(((currentStepIndex + innerProgress) / totalSteps) * 100))
  }, [currentStepIndex, innerProgress, totalSteps])

  const shouldWarnOnLeave = useMemo(() => {
    if (allowLeaveWithoutPrompt || completeOpen) return false
    if (inlineReviewOpen) return true
    if (currentStepIndex > 0) return true
    return vocabFrac > 0.02
  }, [allowLeaveWithoutPrompt, completeOpen, currentStepIndex, inlineReviewOpen, vocabFrac])

  useEffect(() => {
    const sub = navigation.addListener(
      'beforeRemove',
      (e: { preventDefault: () => void; data: { action: NavigationAction } }) => {
      if (!shouldWarnOnLeave) return
      e.preventDefault()
      Alert.alert('Leave lesson?', 'Your progress in this lesson will be lost.', [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setAllowLeaveWithoutPrompt(true)
            navigation.dispatch(e.data.action)
          },
        },
      ])
    },
    )
    return sub
  }, [navigation, shouldWarnOnLeave])

  const advanceStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, Math.max(0, totalSteps - 1)))
  }, [totalSteps])

  const userKey = user?.id ?? ''

  const handlePracticeComplete = useCallback(
    async (result: { correct: number; total: number }) => {
      if (!unit) return
      const total = result.total > 0 ? result.total : 1
      const score = Math.round((result.correct / total) * 100)
      const xp = xpFromScore(score)

      try {
        setSubmitting(true)
        const unlock = await unlockNextUnit(unit.id, score)
        if (supabase && user) {
          void uploadUnitProgressToCloud(supabase, user.id).catch(() => {})
        }

        const snap: FinishSnapshot = {
          score,
          xp,
          unlockedUnitId: unlock.unlockedUnitId,
          passed: score >= 80,
        }

        if (score >= 80) {
          const vocabEntries = extractVocabEntriesForSpacedRepetition(unit)
          try {
            await seedSpacedRepetitionFromLesson(user?.id ?? null, {
              id: unit.id,
              grammar_rule_text: extractGrammarRuleForSpacedRepetition(unit),
              vocab_list: extractVocabForSpacedRepetition(unit),
              vocab_entries: vocabEntries.length > 0 ? vocabEntries : undefined,
            })
          } catch {
            // non-fatal
          }
          if (fromRecommendation) {
            const planDate = new Date().toISOString().slice(0, 10)
            void recordRecommendationEngagement(user?.id ?? null, planDate, unit.id, 'completed').catch(
              () => {},
            )
          }

          let due: SpacedRepetitionReviewItem[] = []
          try {
            due = await getDueReviewItemsForUnit(userKey, unit.id, new Date(), 3)
          } catch {
            due = []
          }

          if (due.length >= 1) {
            pendingFinishRef.current = snap
            setInlineItems(due)
            setInlineIndex(0)
            setInlineFlipped(false)
            setInlineReviewOpen(true)
            return
          }
        } else {
          setFinishSnapshot(snap)
          setCompleteOpen(true)
          setAllowLeaveWithoutPrompt(true)
          return
        }

        setFinishSnapshot(snap)
        setAllowLeaveWithoutPrompt(true)
        setCompleteOpen(true)
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : String(err))
      } finally {
        setSubmitting(false)
      }
    },
    [fromRecommendation, unit, user, userKey],
  )

  const finishInlineReviewAndShowModal = useCallback(() => {
    const snap = pendingFinishRef.current
    pendingFinishRef.current = null
    setInlineReviewOpen(false)
    setInlineGrading(false)
    if (snap) {
      setFinishSnapshot(snap)
      setAllowLeaveWithoutPrompt(true)
      setCompleteOpen(true)
    }
  }, [])

  const onInlineQuality = useCallback(
    async (quality: number) => {
      const current = inlineItems[inlineIndex]
      if (!current || inlineGrading) return
      try {
        setInlineGrading(true)
        await updateSpacedRepetitionItem(user?.id ?? null, current.itemId, quality)
        setInlineFlipped(false)
        if (inlineIndex + 1 >= inlineItems.length) {
          finishInlineReviewAndShowModal()
        } else {
          setInlineIndex((i) => i + 1)
        }
      } catch (e) {
        Alert.alert('Review', e instanceof Error ? e.message : String(e))
      } finally {
        setInlineGrading(false)
      }
    },
    [finishInlineReviewAndShowModal, inlineGrading, inlineIndex, inlineItems, user?.id],
  )

  const closeCompleteAndExit = useCallback(() => {
    setCompleteOpen(false)
    navigation.goBack()
  }, [navigation])

  const restartLesson = useCallback(() => {
    setCompleteOpen(false)
    setFinishSnapshot(null)
    setAllowLeaveWithoutPrompt(false)
    setCurrentStepIndex(0)
    setPracticeResetKey((k) => k + 1)
    setVocabFrac(0)
    setPracticeFrac(0)
  }, [])

  if (!unit || totalSteps === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="text-lg font-semibold text-slate-900">Lesson not found</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
          <Text className="font-semibold text-white">Back</Text>
        </Pressable>
      </View>
    )
  }

  const title = unit.theme ?? unit.id

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium uppercase tracking-wide text-blue-700">
            {level} · {unit.id}
          </Text>
          <Text className="text-xs font-semibold text-slate-600">
            {currentStepIndex + 1} / {totalSteps}
          </Text>
        </View>
        <View className="mt-1 flex-row flex-wrap items-center gap-2">
          <Text className="text-base font-bold text-slate-900" numberOfLines={2} style={{ flex: 1, minWidth: 0 }}>
            {title}
          </Text>
          {reviewMode ? (
            <View className="rounded-full bg-amber-100 px-2 py-0.5">
              <Text className="text-[10px] font-bold uppercase text-amber-900">Review</Text>
            </View>
          ) : null}
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <View className="h-2 rounded-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className="mt-1 text-right text-[10px] text-slate-400">{progressPercent}%</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ gap: 14, paddingBottom: scrollBottomPad }}
      >
        {currentStep?.type === 'vocab_intro' ? (
          <VocabIntroStep cards={currentStep.cards} onProgressFraction={setVocabFrac} />
        ) : null}
        {currentStep?.type === 'dialogue' ? (
          <DialogueStep scene={currentStep.scene} turns={currentStep.turns} />
        ) : null}
        {currentStep?.type === 'grammar_tip' ? (
          <GrammarTipStep rule={currentStep.rule} examples={currentStep.examples} />
        ) : null}
        {currentStep?.type === 'practice' ? (
          <PracticeStep
            key={practiceResetKey}
            exercises={currentStep.exercises}
            onComplete={(r) => void handlePracticeComplete(r)}
            onPracticeProgress={setPracticeFrac}
          />
        ) : null}

        {unit.production_task ? (
          <View className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <Text className="text-xs font-semibold uppercase text-indigo-900">Production (optional)</Text>
            <Text className="mt-2 text-sm leading-6 text-indigo-950">{unit.production_task.prompt}</Text>
            <Text className="mt-2 text-xs leading-5 text-indigo-800/90">{unit.production_task.example}</Text>
          </View>
        ) : null}
      </ScrollView>

      {currentStep && currentStep.type !== 'practice' ? (
        <View
          className="border-t border-slate-200 bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(12, insets.bottom) }}
        >
          <Pressable
            onPress={advanceStep}
            className="items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
          >
            <Text className="text-sm font-semibold text-white">Continue</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep?.type === 'practice' ? (
        <View
          className="border-t border-slate-200 bg-white px-4 py-2"
          style={{ paddingBottom: Math.max(8, insets.bottom) }}
        >
          <Text className="text-center text-xs text-slate-500">
            Finish all exercises to complete the lesson.
          </Text>
        </View>
      ) : null}

      {inlineReviewOpen && inlineItems.length > 0 ? (
        <View
          className="absolute inset-0 z-[100] justify-end bg-black/50 px-3"
          style={{ paddingBottom: Math.max(16, insets.bottom) }}
        >
          <View className="mb-2 max-h-[78%] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <Text className="text-center text-base font-bold text-slate-900">
              Before you go — review 3 words from this unit
            </Text>
            <Text className="mt-1 text-center text-xs text-slate-500">
              {inlineIndex + 1} / {inlineItems.length}
            </Text>
            {(() => {
              const card = inlineItems[inlineIndex]
              if (!card) return null
              return (
                <>
                  <Pressable
                    onPress={() => setInlineFlipped((f) => !f)}
                    className="mt-4 min-h-[160px] justify-center rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-6 active:bg-slate-100"
                  >
                    <Text
                      className={
                        inlineFlipped
                          ? 'text-center text-base font-semibold leading-6 text-slate-900'
                          : 'text-center text-2xl font-bold text-slate-900'
                      }
                    >
                      {inlineFlipped ? card.backText : card.frontText}
                    </Text>
                    <Text className="mt-3 text-center text-xs text-slate-500">
                      {inlineFlipped ? 'Tap to flip back' : 'Tap to reveal translation'}
                    </Text>
                  </Pressable>
                  <View className="mt-4 flex-row gap-3">
                    <Pressable
                      onPress={() => void onInlineQuality(1)}
                      disabled={inlineGrading || !inlineFlipped}
                      className={[
                        'flex-1 items-center rounded-xl border-2 border-rose-300 py-3',
                        inlineFlipped && !inlineGrading ? 'bg-rose-50 active:bg-rose-100' : 'opacity-40',
                      ].join(' ')}
                    >
                      <Text className="text-sm font-semibold text-rose-800">Forgot ✗</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void onInlineQuality(4)}
                      disabled={inlineGrading || !inlineFlipped}
                      className={[
                        'flex-1 items-center rounded-xl bg-emerald-600 py-3',
                        inlineFlipped && !inlineGrading ? 'active:bg-emerald-700' : 'opacity-40',
                      ].join(' ')}
                    >
                      <Text className="text-sm font-semibold text-white">Remembered ✓</Text>
                    </Pressable>
                  </View>
                  {inlineGrading ? (
                    <ActivityIndicator color="#64748b" style={{ marginTop: 12 }} />
                  ) : null}
                </>
              )
            })()}
          </View>
        </View>
      ) : null}

      <Modal visible={completeOpen} animationType="fade" transparent>
        <View className="flex-1 items-center justify-center bg-black/40 px-5">
          <View className="w-full max-w-sm rounded-2xl bg-white p-6">
            <Text className="text-center text-lg font-bold text-slate-900">
              {finishSnapshot?.passed ? 'Lesson complete' : 'Try again'}
            </Text>
            {finishSnapshot ? (
              <>
                <Text className="mt-4 text-center text-3xl font-extrabold text-blue-700">
                  {finishSnapshot.score}%
                </Text>
                <Text className="mt-1 text-center text-sm text-slate-600">Score</Text>
                <Text className="mt-4 text-center text-base font-semibold text-amber-700">
                  +{finishSnapshot.xp} XP
                </Text>
                {finishSnapshot.passed ? (
                  <>
                    <Text className="mt-3 text-center text-sm text-slate-700">
                      {finishSnapshot.unlockedUnitId
                        ? `Next unit unlocked: ${finishSnapshot.unlockedUnitId}`
                        : 'You completed the final unit in this stretch.'}
                    </Text>
                    <Text className="mt-2 text-center text-xs leading-5 text-slate-500">
                      Cards you practiced are saved in Spaced Repetition for next time.
                    </Text>
                  </>
                ) : (
                  <Text className="mt-3 text-center text-sm leading-6 text-slate-700">
                    You need 80% or higher to unlock the next unit and to add review cards. Review the lesson and
                    give the quiz another shot.
                  </Text>
                )}
              </>
            ) : null}
            {finishSnapshot && !finishSnapshot.passed ? (
              <View className="mt-6" style={{ gap: 10 }}>
                <Pressable
                  onPress={restartLesson}
                  className="items-center rounded-xl bg-blue-600 py-3 active:bg-blue-700"
                >
                  <Text className="text-sm font-semibold text-white">Try again</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setAllowLeaveWithoutPrompt(true)
                    closeCompleteAndExit()
                  }}
                  className="items-center rounded-xl border border-slate-300 py-3"
                >
                  <Text className="text-sm font-semibold text-slate-700">Exit</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={closeCompleteAndExit}
                className="mt-6 items-center rounded-xl bg-slate-900 py-3"
              >
                <Text className="text-sm font-semibold text-white">Continue</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {submitting ? (
        <View
          className="absolute inset-0 items-center justify-center bg-white/60"
          pointerEvents="auto"
        >
          <Text className="text-sm font-medium text-slate-700">Saving progress…</Text>
        </View>
      ) : null}
    </View>
  )
}
