import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Speech from 'expo-speech'
import { Ionicons } from '@expo/vector-icons'
import AudioPlayer from './AudioPlayer'
import { getListeningContentForTefUnit } from '../content/listeningContent'
import { useAuth } from '../contexts/AuthContext'
import { insertTefPrepProgress, type TefPrepAnswerRecord } from '../database/TefPrepProgressService'
import { buildSixListeningQuestions, type ListeningMcqWithExpl } from '../lib/listeningQuestionAugment'
import {
  cefrFromListeningPercent,
  listeningStrengthMessage,
  listeningStrengthMessageEn,
  listeningWeakAreasHint,
} from '../lib/tefListeningScore'
import { getModuleIdForContentUnit } from '../lib/curriculum'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { useStackScreenBottomPadding } from '../lib/screenPadding'

const LETTERS = ['A', 'B', 'C', 'D'] as const

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function clampPlayerSpeed(rate: number): 0.8 | 1 | 1.2 {
  if (rate <= 0.85) return 0.8
  if (rate >= 1.05) return 1.2
  return 1.0
}

type Props = {
  tefUnit: number
}

export default function TefPrepListeningPractice({ tefUnit }: Props) {
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const bottomPad = useStackScreenBottomPadding(32)
  const startedAtRef = useRef(Date.now())
  const savedRef = useRef(false)

  const content = useMemo(() => getListeningContentForTefUnit(tefUnit), [tefUnit])
  const questions = useMemo(
    () => (content ? buildSixListeningQuestions(content.questions, content.scenario) : []),
    [content],
  )

  const [ttsEngaged, setTtsEngaged] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [answersLog, setAnswersLog] = useState<TefPrepAnswerRecord[]>([])
  const [phase, setPhase] = useState<'practice' | 'summary'>('practice')
  const [reviewOpen, setReviewOpen] = useState(false)

  const currentQ = questions[qIndex]

  const correctCount = useMemo(() => results.filter(Boolean).length, [results])
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const cefr = cefrFromListeningPercent(percent)
  const strength = listeningStrengthMessage(percent)
  const strengthEn = listeningStrengthMessageEn(percent)
  const weakHint = listeningWeakAreasHint(percent)

  const persistAttempt = useCallback(async () => {
    if (!content || savedRef.current || phase !== 'summary') return
    savedRef.current = true
    const timeSpentMs = Date.now() - startedAtRef.current
    try {
      await insertTefPrepProgress({
        userId: uid,
        tefUnit,
        skill: 'listening',
        listeningCatalogId: content.tef_task_id,
        scorePercent: percent,
        correctCount,
        totalQuestions: questions.length,
        answers: answersLog,
        timeSpentMs,
        cefrEstimate: cefr,
      })
    } catch (e) {
      console.warn('[tef_prep_progress]', e)
      savedRef.current = false
    }
  }, [answersLog, cefr, content, correctCount, percent, phase, questions.length, tefUnit, uid])

  useEffect(() => {
    if (phase === 'summary') void persistAttempt()
  }, [phase, persistAttempt])

  const onSubmit = () => {
    if (currentQ == null || selected == null) return
    const ok = selected === currentQ.answer_index
    setResults((r) => [...r, ok])
    setAnswersLog((a) => [
      ...a,
      { questionIndex: qIndex, selectedIndex: selected, correct: ok },
    ])
    setShowResult(true)
  }

  const onNext = () => {
    if (qIndex >= questions.length - 1) {
      setPhase('summary')
      return
    }
    setQIndex((i) => i + 1)
    setSelected(null)
    setShowResult(false)
  }

  const goWeakPractice = () => {
    const unitId = 'a2-u1'
    const moduleId = getModuleIdForContentUnit(unitId)
    navigation.navigate('LessonScreen', {
      unitId,
      level: 'A2',
      ...(moduleId ? { moduleId } : {}),
    })
  }

  const goSyllabus = () => {
    // Nested tab navigation (typed as MainTabs: undefined in stack)
    ;(navigation as { navigate: (n: string, p?: object) => void }).navigate('MainTabs', { screen: 'Syllabus' })
  }

  if (!content) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-center text-slate-700">Contenu d’écoute introuvable pour cette unité.</Text>
      </View>
    )
  }

  const answeredCount = results.length
  const progressRatio = questions.length ? answeredCount / questions.length : 0

  if (phase === 'summary') {
    return (
      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        nestedScrollEnabled
      >
        <View className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <Text className="text-center text-xl font-bold text-slate-900">Bravo !</Text>
          <Text className="mt-2 text-center text-3xl font-extrabold text-emerald-700">
            {correctCount}/{questions.length}
          </Text>
          <Text className="mt-1 text-center text-base text-slate-600">{percent} % correct</Text>
          <Text className="mt-2 text-center text-base font-semibold text-slate-800">
            You got {percent}% — {strengthEn}
          </Text>
          <Text className="mt-3 text-center text-lg font-semibold text-slate-800">
            Niveau estimé (pratique) : {cefr}
          </Text>
          <Text className="mt-1 text-center text-sm leading-5 text-slate-600">{strength}</Text>
          {weakHint ? (
            <View className="mt-4 rounded-xl bg-amber-50 p-3">
              <Text className="text-sm text-amber-950">{weakHint}</Text>
              <Pressable onPress={goWeakPractice} className="mt-3 rounded-xl bg-amber-600 py-2.5 active:bg-amber-700">
                <Text className="text-center text-sm font-bold text-white">Leçon suggérée : événements passés (A2)</Text>
              </Pressable>
              <Pressable onPress={goSyllabus} className="mt-2 rounded-xl border border-amber-300 bg-white py-2.5">
                <Text className="text-center text-sm font-bold text-amber-900">Ouvrir le syllabus</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => setReviewOpen(true)}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-4 active:bg-slate-50"
        >
          <Ionicons name="document-text-outline" size={22} color="#0f172a" />
          <Text className="text-base font-bold text-slate-900">Revoir la transcription</Text>
        </Pressable>

        <Modal visible={reviewOpen} animationType="slide" transparent>
          <View className="flex-1 justify-end bg-black/50">
            <View className="max-h-[85%] rounded-t-3xl bg-white p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-slate-900">Transcription</Text>
                <Pressable onPress={() => setReviewOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={28} color="#64748b" />
                </Pressable>
              </View>
              <ScrollView className="mt-2" nestedScrollEnabled>
                <Text className="text-sm leading-7 text-slate-800">{content.transcript_fr}</Text>
                {content.gloss_en ? (
                  <Text className="mt-4 text-xs italic text-slate-500">{content.gloss_en}</Text>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
        <Text className="text-xs font-semibold text-slate-500">{content.tef_task_id}</Text>
        <Text className="mt-2 text-lg font-bold text-slate-900">
          Unit {tefUnit}: Listening Practice — Duration {formatDuration(content.duration_seconds_approx ?? 60)}
        </Text>
        <Text className="mt-1 text-sm text-slate-600">
          Unité {tefUnit} : pratique orale · ~{formatDuration(content.duration_seconds_approx ?? 60)}
        </Text>
        <Text className="mt-1 text-xs text-slate-500">
          {content.level} · scénario : {content.scenario.replace(/_/g, ' ')}
        </Text>
      </View>

      <AudioPlayer
        contentId={`${content.tef_task_id}_tef_u${tefUnit}`}
        audioUri={content.audio_uri}
        transcript={content.transcript_fr}
        title="Écoute"
        durationHintMs={(content.duration_seconds_approx ?? 60) * 1000}
        initialSpeed={clampPlayerSpeed(content.playback_speed)}
        persistPosition
        answerGate="after_play_started"
        playbackEngagedOverride={ttsEngaged}
      >
        {(gate) => (
          <>
            {!content.audio_uri ? (
              <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Text className="text-xs text-amber-900">Pas de fichier audio : lecture TTS pour simuler l’écoute.</Text>
                <Pressable
                  onPress={() => {
                    Speech.stop()
                    Speech.speak(content.transcript_fr, { language: 'fr-CA' })
                    setTtsEngaged(true)
                  }}
                  className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2"
                >
                  <Ionicons name="volume-high" size={18} color="#fff" />
                  <Text className="font-semibold text-white">Lancer la lecture TTS</Text>
                </Pressable>
              </View>
            ) : null}

            {!gate.hasPlaybackEverStarted ? (
              <View className="mt-4 rounded-xl bg-slate-100 p-4">
                <Text className="text-center text-sm text-slate-600">
                  Appuyez sur lecture (ou TTS) pour afficher les questions — format TEF.
                </Text>
              </View>
            ) : (
              <View className="mt-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-slate-800">
                    Question {qIndex + 1} of {questions.length}
                  </Text>
                  <Text className="text-xs font-medium text-slate-600">
                    {answeredCount}/{questions.length} answered
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <View className="h-2 rounded-full bg-blue-600" style={{ width: `${progressRatio * 100}%` }} />
                </View>

                {currentQ ? (
                  <>
                    <Text className="mt-4 text-base font-semibold leading-6 text-slate-900">{currentQ.question_fr}</Text>

                    <View className="mt-3 gap-2">
                      {currentQ.options.map((opt, oi) => {
                        const picked = selected === oi
                        const locked = !gate.canSelectAnswers || showResult
                        return (
                          <Pressable
                            key={oi}
                            disabled={locked}
                            onPress={() => {
                              if (locked) return
                              setSelected(oi)
                            }}
                            className={[
                              'flex-row items-center gap-3 rounded-xl border px-3 py-3',
                              locked ? 'opacity-50' : '',
                              picked ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white',
                            ].join(' ')}
                          >
                            <View
                              className={[
                                'h-8 w-8 items-center justify-center rounded-full border-2',
                                picked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white',
                              ].join(' ')}
                            >
                              <Text
                                className={['text-sm font-bold', picked ? 'text-white' : 'text-slate-600'].join(' ')}
                              >
                                {LETTERS[oi]}
                              </Text>
                            </View>
                            <Text className="flex-1 text-sm text-slate-800">{opt}</Text>
                          </Pressable>
                        )
                      })}
                    </View>

                    {showResult && selected != null ? (
                      <View
                        className={[
                          'mt-4 rounded-xl border p-4',
                          selected === currentQ.answer_index
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-rose-300 bg-rose-50',
                        ].join(' ')}
                      >
                        <Text className="text-base font-bold text-slate-900">
                          {selected === currentQ.answer_index ? 'Correct !' : 'Incorrect'}
                        </Text>
                        <Text className="mt-2 text-sm leading-5 text-slate-700">{currentQ.explanation_fr}</Text>
                        <Pressable
                          onPress={onNext}
                          className="mt-4 rounded-xl bg-slate-900 py-3 active:bg-slate-800"
                        >
                          <Text className="text-center text-base font-bold text-white">
                            {qIndex >= questions.length - 1 ? 'Voir le bilan' : 'Question suivante'}
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={onSubmit}
                        disabled={selected == null || !gate.canSelectAnswers}
                        className={[
                          'mt-5 rounded-xl py-3.5',
                          selected == null || !gate.canSelectAnswers ? 'bg-slate-300' : 'bg-blue-600 active:bg-blue-700',
                        ].join(' ')}
                      >
                        <Text className="text-center text-base font-bold text-white">Valider la réponse</Text>
                      </Pressable>
                    )}
                  </>
                ) : null}
              </View>
            )}
          </>
        )}
      </AudioPlayer>
    </ScrollView>
  )
}
