import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { LEVEL_ORDER, PASSAGES, type ReadingLevel } from '../content/readingPassages'
import {
  isFrenchCloudTtsConfigured,
  speakFrenchListening,
  stopFrenchExpoTts,
} from '../lib/frenchExpoTts'
import { useTabScreenBottomPadding } from '../lib/screenPadding'

const TTS_ALERT_MESSAGE = 'TTS not available — set EXPO_PUBLIC_API_BASE_URL'

function fullFrenchForScreen(passages: (typeof PASSAGES)['A1']): string {
  return passages
    .flatMap((passage) => passage.paragraphs.map((p) => p.fr.trim()))
    .filter(Boolean)
    .join(' ')
}

export default function ReadingRoomScreen() {
  const scrollBottomPad = useTabScreenBottomPadding(28)
  const [level, setLevel] = useState<ReadingLevel>('A1')
  const [translationOn, setTranslationOn] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isTtsLoading, setIsTtsLoading] = useState(false)

  const content = useMemo(() => PASSAGES[level], [level])
  const ttsConfigured = isFrenchCloudTtsConfigured()
  const ttsRunIdRef = useRef(0)

  const resetTtsUi = useCallback(() => {
    setIsSpeaking(false)
    setIsTtsLoading(false)
  }, [])

  useEffect(() => {
    return () => {
      void stopFrenchExpoTts()
    }
  }, [])

  useEffect(() => {
    ttsRunIdRef.current += 1
    void stopFrenchExpoTts()
    resetTtsUi()
  }, [level, resetTtsUi])

  const onListenPress = useCallback(async () => {
    if (isSpeaking || isTtsLoading) {
      ttsRunIdRef.current += 1
      await stopFrenchExpoTts()
      resetTtsUi()
      return
    }

    if (!ttsConfigured) {
      Alert.alert('TTS not available', TTS_ALERT_MESSAGE)
      return
    }

    const runId = ++ttsRunIdRef.current
    const text = fullFrenchForScreen(content)
    if (!text.trim()) return

    setIsTtsLoading(true)
    try {
      await speakFrenchListening(text, undefined, {
        onPlaybackStarted: () => {
          if (ttsRunIdRef.current === runId) {
            setIsTtsLoading(false)
            setIsSpeaking(true)
          }
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      Alert.alert('TTS error', msg)
    } finally {
      if (ttsRunIdRef.current === runId) {
        setIsSpeaking(false)
        setIsTtsLoading(false)
      }
    }
  }, [content, isSpeaking, isTtsLoading, resetTtsUi, ttsConfigured])

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: scrollBottomPad }}>
      <Text className="text-2xl font-bold text-slate-900">Reading room</Text>
      <Text className="mt-1 text-sm text-slate-500">Short passages and comprehension — by CEFR level.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginTop: 16, alignItems: 'center', flexDirection: 'row' }}
      >
        {LEVEL_ORDER.map((l) => {
          const active = level === l
          return (
            <Pressable
              key={l}
              onPress={() => setLevel(l)}
              className={['rounded-full px-4 py-2', active ? 'bg-blue-600' : 'bg-slate-200'].join(' ')}
            >
              <Text className={['text-sm font-semibold', active ? 'text-white' : 'text-slate-700'].join(' ')}>
                {l}
              </Text>
            </Pressable>
          )
        })}

        <Pressable
          onPress={() => setTranslationOn((v) => !v)}
          className={['rounded-full px-4 py-2', translationOn ? 'bg-blue-600' : 'bg-slate-200'].join(' ')}
        >
          <Text className={['text-sm font-semibold', translationOn ? 'text-white' : 'text-slate-700'].join(' ')}>
            Translation
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void onListenPress()}
          disabled={isTtsLoading && !isSpeaking}
          className={[
            'flex-row items-center gap-2 rounded-full px-4 py-2',
            isTtsLoading && !isSpeaking ? 'bg-slate-300' : isSpeaking ? 'bg-slate-800' : 'bg-slate-200',
          ].join(' ')}
        >
          {isTtsLoading && !isSpeaking ? <ActivityIndicator size="small" color="#1e293b" /> : null}
          <Text
            className={[
              'text-sm font-semibold',
              isSpeaking ? 'text-white' : 'text-slate-700',
            ].join(' ')}
          >
            {isSpeaking ? 'Stop' : '🔊 Listen'}
          </Text>
        </Pressable>
      </ScrollView>

      {!ttsConfigured ? (
        <Text className="mt-3 text-xs leading-5 text-amber-800">{TTS_ALERT_MESSAGE}</Text>
      ) : null}

      <View className="mt-4 gap-4">
        {content.map((p, passageIdx) => (
          <View key={`${p.title}-${passageIdx}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="text-base font-semibold text-slate-900">{p.title}</Text>

            <View className="mt-3">
              {p.paragraphs.map((para, i) => (
                <View
                  key={i}
                  className="border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <Text className="text-sm leading-6 text-slate-900">{para.fr}</Text>
                  {translationOn ? (
                    <Text className="mt-2 text-sm italic leading-6 text-slate-500">{para.en}</Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comprehension</Text>
              <Text className="mt-1 text-sm text-slate-800">{p.question}</Text>
              <Text className="mt-2 text-sm text-blue-700">
                <Text className="font-semibold">Answer:</Text> {p.answer}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
