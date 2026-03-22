import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { FeedbackModal } from './components/FeedbackModal'
import { GameHUD } from './components/GameHUD'
import { ProgressBar } from './components/ProgressBar'
import { getConjugationCodexPersistedSnapshot, useConjugationCodexStore } from './conjugationCodexStore'
import { useConjugationFeedback, useConjugationState } from './hooks/useConjugationState'
import { pushConjugationCodexProgressToCloud } from './lib/conjugationCodexCloudSync'
import { Phase1_Discovery } from './phases/Phase1_Discovery'
import { Phase2_RuleMaster } from './phases/Phase2_RuleMaster'
import { Phase3_MastersGuild } from './phases/Phase3_MastersGuild'

const SYNC_DEBOUNCE_MS = 1500

export default function ConjugationCodexPage() {
  const { phase } = useConjugationState()
  const { feedback, clearFeedback } = useConjugationFeedback()
  const { user } = useAuth()
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleCloudSync = useCallback(() => {
    const client = supabase
    const uid = user?.id
    if (!client || !uid) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      syncTimer.current = null
      void pushConjugationCodexProgressToCloud(client, uid, getConjugationCodexPersistedSnapshot())
    }, SYNC_DEBOUNCE_MS)
  }, [user?.id])

  useEffect(() => {
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [])

  useEffect(() => {
    const unsub = useConjugationCodexStore.subscribe((state, prev) => {
      if (
        state.xp !== prev.xp ||
        state.phase !== prev.phase ||
        state.totalReviews !== prev.totalReviews ||
        state.streakDays !== prev.streakDays
      ) {
        scheduleCloudSync()
      }
    })
    return unsub
  }, [scheduleCloudSync])

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      <nav>
        <Link
          to="/game"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--atelier-navy-deep)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Grammar Games
        </Link>
      </nav>

      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Conjugation Codex</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--atelier-navy-deep)] md:text-4xl">
          Three-phase path
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Discovery → Rule Master → Master&apos;s Guild. Progress saves locally; signed-in users also mirror to the cloud
          when configured.
        </p>
      </header>

      <ProgressBar currentPhase={phase} />
      <GameHUD />

      {phase === 'discovery' ? <Phase1_Discovery /> : null}
      {phase === 'rule_master' ? <Phase2_RuleMaster /> : null}
      {phase === 'masters_guild' ? <Phase3_MastersGuild /> : null}

      <FeedbackModal
        open={feedback !== null}
        kind={feedback?.kind ?? 'neutral'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => clearFeedback()}
      />
    </div>
  )
}
