import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { dayKey, formatWordOfDayNotificationBody, type StudyCefrLevel } from '../content/wordOfTheDay'
import {
  getStudyCefrLevel,
  getWordOfDayNotificationsEnabled,
  getWordOfDayTime,
} from '../lib/studyLevelPreference'

const CHANNEL_ID = 'word-of-day'
const PREFIX = 'wotd-'
const DAYS_AHEAD = 14

function atLocalTime(base: Date, hour: number, minute: number): Date {
  const d = new Date(base)
  d.setHours(hour, minute, 0, 0)
  return d
}

/** Next `count` calendar fires at hour:minute, skipping times already passed today. */
export function nextNotificationDates(now: Date, hour: number, minute: number, count: number): Date[] {
  const out: Date[] = []
  let d = atLocalTime(new Date(now), hour, minute)
  if (d.getTime() <= now.getTime()) {
    d = atLocalTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), hour, minute)
  }
  for (let i = 0; i < count; i++) {
    out.push(new Date(d))
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    d = atLocalTime(d, hour, minute)
  }
  return out
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Mot du jour',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
  })
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  let final = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    final = status
  }
  return final === 'granted'
}

export async function cancelScheduledWordOfDayNotifications(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    all
      .filter((n) => (n.identifier ?? '').startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  )
}

/**
 * Schedules the next {@link DAYS_AHEAD} daily notifications with the correct word per date & level.
 * Call on app launch, resume, and whenever level / time / toggle changes.
 */
export async function refreshWordOfDayNotificationSchedule(): Promise<void> {
  await ensureAndroidChannel()

  const enabled = await getWordOfDayNotificationsEnabled()
  await cancelScheduledWordOfDayNotifications()

  if (!enabled) return

  const granted = await requestNotificationPermissions()
  if (!granted) return

  const level = await getStudyCefrLevel()
  const { hour, minute } = await getWordOfDayTime()
  const now = new Date()
  const dates = nextNotificationDates(now, hour, minute, DAYS_AHEAD)

  for (const when of dates) {
    const { title, body } = formatWordOfDayNotificationBody(level, when)
    const id = `${PREFIX}${dayKey(when)}`
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title,
          body,
          sound: true,
          ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
          data: { type: 'word-of-day', level, dateKey: dayKey(when) },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
        },
      })
    } catch (e) {
      console.warn('[wordOfDayNotifications] schedule failed', id, e)
    }
  }
}

export function configureNotificationForegroundHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}
