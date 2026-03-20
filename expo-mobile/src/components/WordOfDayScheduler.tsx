import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { syncStudyLevelFromSupabase } from '../lib/studyLevelPreference'
import {
  configureNotificationForegroundHandler,
  refreshWordOfDayNotificationSchedule,
} from '../services/wordOfDayNotifications'

/**
 * Registers foreground notification behavior, syncs study level from Supabase when signed in,
 * and refreshes the next two weeks of local “word of the day” triggers when the app becomes active.
 */
export default function WordOfDayScheduler() {
  const { user } = useAuth()

  useEffect(() => {
    configureNotificationForegroundHandler()
  }, [])

  useEffect(() => {
    void (async () => {
      if (user?.id && supabase) {
        await syncStudyLevelFromSupabase(supabase, user.id)
      }
      await refreshWordOfDayNotificationSchedule()
    })()
  }, [user?.id])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshWordOfDayNotificationSchedule()
    })
    return () => sub.remove()
  }, [])

  return null
}
