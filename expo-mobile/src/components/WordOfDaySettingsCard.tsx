import { useCallback, useState } from 'react'
import { Alert, Pressable, Switch, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'
import {
  getStudyCefrLevel,
  getWordOfDayNotificationsEnabled,
  getWordOfDayTime,
  pushStudyLevelToSupabase,
  setStudyCefrLevel,
  setWordOfDayNotificationsEnabled,
  setWordOfDayTime,
  STUDY_LEVELS,
} from '../lib/studyLevelPreference'
import { refreshWordOfDayNotificationSchedule, requestNotificationPermissions } from '../services/wordOfDayNotifications'
import type { StudyCefrLevel } from '../content/wordOfTheDay'

const TIME_PRESETS: { label: string; hour: number; minute: number }[] = [
  { label: '8:00', hour: 8, minute: 0 },
  { label: '9:00', hour: 9, minute: 0 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '18:00', hour: 18, minute: 0 },
  { label: '20:00', hour: 20, minute: 0 },
]

type Props = {
  /** When set, study level is saved to `profiles.study_cefr` (migration 004). */
  userId?: string
}

export default function WordOfDaySettingsCard({ userId }: Props) {
  const [level, setLevel] = useState<StudyCefrLevel>('A1')
  const [wotdOn, setWotdOn] = useState(false)
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)

  const reload = useCallback(async () => {
    const [l, on, t] = await Promise.all([
      getStudyCefrLevel(),
      getWordOfDayNotificationsEnabled(),
      getWordOfDayTime(),
    ])
    setLevel(l)
    setWotdOn(on)
    setHour(t.hour)
    setMinute(t.minute)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload]),
  )

  const persistLevel = async (next: StudyCefrLevel) => {
    setLevel(next)
    await setStudyCefrLevel(next)
    if (userId && supabase) {
      const r = await pushStudyLevelToSupabase(supabase, userId, next)
      if (!r.ok && __DEV__) console.warn('[WordOfDay] profile sync', r.error)
    }
    await refreshWordOfDayNotificationSchedule()
  }

  const persistTime = async (h: number, m: number) => {
    setHour(h)
    setMinute(m)
    await setWordOfDayTime(h, m)
    await refreshWordOfDayNotificationSchedule()
  }

  const toggleWotd = async (on: boolean) => {
    if (on) {
      const ok = await requestNotificationPermissions()
      if (!ok) {
        Alert.alert(
          'Notifications',
          'Please allow notifications in system settings to receive the daily word.',
        )
        return
      }
    }
    setWotdOn(on)
    await setWordOfDayNotificationsEnabled(on)
    await refreshWordOfDayNotificationSchedule()
  }

  return (
    <View className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <View className="flex-row items-center gap-2">
        <Ionicons name="notifications-outline" size={22} color="#2563eb" />
        <Text className="font-display text-lg text-slate-900">Word of the day</Text>
      </View>
      <Text className="font-sans mt-2 text-xs leading-5 text-slate-600">
        One French word each day, matched to your CEFR level (A1–C2). Reminders are scheduled on this device.
      </Text>

      <Text className="font-sans mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Your level</Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {STUDY_LEVELS.map((lv) => (
          <Pressable
            key={lv}
            onPress={() => void persistLevel(lv)}
            className={[
              'rounded-full px-3 py-1.5',
              level === lv ? 'bg-[#2563eb]' : 'border border-slate-200 bg-slate-50',
            ].join(' ')}
          >
            <Text
              className={['font-sans-bold text-xs', level === lv ? 'text-white' : 'text-slate-700'].join(' ')}
            >
              {lv}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-sans flex-1 pr-3 text-sm font-semibold text-slate-800">Daily notification</Text>
        <Switch value={wotdOn} onValueChange={(v) => void toggleWotd(v)} />
      </View>

      {wotdOn ? (
        <>
          <Text className="font-sans mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Time</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {TIME_PRESETS.map((p) => {
              const active = hour === p.hour && minute === p.minute
              return (
                <Pressable
                  key={p.label}
                  onPress={() => void persistTime(p.hour, p.minute)}
                  className={[
                    'rounded-full px-3 py-1.5',
                    active ? 'bg-emerald-600' : 'border border-slate-200 bg-slate-50',
                  ].join(' ')}
                >
                  <Text
                    className={['font-sans-bold text-xs', active ? 'text-white' : 'text-slate-700'].join(' ')}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </>
      ) : null}
    </View>
  )
}
