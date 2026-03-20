import { BookOpen, CheckCircle2, Clock, Rocket, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ensureDailyTopic, type DailyWritingTopic } from '../../lib/WritingService'
import {
  formatCountdown,
  localDateKey,
  msUntilLocalMidnight,
} from '../../lib/readingRoomMissionStorage'
import {
  isWritingCompositionLockedToday,
  markWritingCompositionSubmitted,
  SCORER_PREFILL_FROM_WRITING_KEY,
} from '../../lib/writingAreaStorage'
import { levelBadgeLabel } from '../../lib/userCefr'
import TefTrackFooterBar from '../tef/TefTrackFooterBar'

const navy = '#1e293b'
const RECENT_SCORES_KEY = 'french_scorer_recent_scores_v1'

type StoredScore = { ts: number; score: number; cecr: string }

function loadRecentScores(): StoredScore[] {
  try {
    const raw = localStorage.getItem(RECENT_SCORES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((x) => x as Partial<StoredScore>)
      .filter((x) => typeof x.ts === 'number' && typeof x.score === 'number')
      .map((x) => ({ ts: x.ts as number, score: x.score as number, cecr: String(x.cecr ?? '') }))
      .sort((a, b) => a.ts - b.ts)
      .slice(-30)
  } catch {
    return []
  }
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computeDailyStreak(scores: StoredScore[]): number {
  const days = new Set(scores.map((s) => dayKey(s.ts)))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function gradeLetter(score: number): string {
  if (score >= 93) return 'A+'
  if (score >= 88) return 'A'
  if (score >= 83) return 'A-'
  if (score >= 78) return 'B+'
  if (score >= 73) return 'B'
  if (score >= 68) return 'B-'
  if (score >= 60) return 'C+'
  return 'C'
}

function xpProgress(scores: StoredScore[]): { cur: number; max: number } {
  const last = scores[scores.length - 1]
  const base = last ? Math.min(600, 300 + Math.round(last.score * 3)) : 200
  return { cur: Math.min(base, 600), max: 600 }
}

export type WritingAreaProps = {
  userLevel: string
}

export default function WritingArea({ userLevel }: WritingAreaProps) {
  const badge = levelBadgeLabel(userLevel)
  const [topic, setTopic] = useState<DailyWritingTopic | null>(null)
  const [topicSource, setTopicSource] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingTopic, setLoadingTopic] = useState(true)
  const [text, setText] = useState('')
  const [locked, setLocked] = useState(() => isWritingCompositionLockedToday(userLevel))
  const [midnightMs, setMidnightMs] = useState(() => msUntilLocalMidnight())
  const [secondsOnPage, setSecondsOnPage] = useState(0)
  const lastDayRef = useRef(localDateKey())
  const taRef = useRef<HTMLTextAreaElement>(null)

  const scores = loadRecentScores()
  const lastScore = scores[scores.length - 1]
  const accuracyPct = lastScore ? Math.round(lastScore.score) : null
  const streak = computeDailyStreak(scores)
  const xp = xpProgress(scores)

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0),
    [text],
  )
  const maxWords = 150

  const refreshTopic = useCallback(async () => {
    setLoadingTopic(true)
    setLoadError(null)
    try {
      const { topic: t, source } = await ensureDailyTopic(userLevel)
      setTopic(t)
      setTopicSource(source)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Échec du chargement du sujet.')
    } finally {
      setLoadingTopic(false)
    }
  }, [userLevel])

  useEffect(() => {
    void refreshTopic()
  }, [refreshTopic])

  useEffect(() => {
    const id = setInterval(() => {
      setMidnightMs(msUntilLocalMidnight())
      const today = localDateKey()
      if (lastDayRef.current !== today) {
        lastDayRef.current = today
        setLocked(isWritingCompositionLockedToday(userLevel))
        void refreshTopic()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [userLevel, refreshTopic])

  useEffect(() => {
    const id = setInterval(() => setSecondsOnPage((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const wrapSelection = (before: string, after: string) => {
    const el = taRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const v = text
    const sel = v.slice(start, end)
    const next = v.slice(0, start) + before + sel + after + v.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, end + before.length)
    })
  }

  const insertAtCursor = (chunk: string) => {
    const el = taRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const v = text
    const next = v.slice(0, start) + chunk + v.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      const p = start + chunk.length
      el.setSelectionRange(p, p)
    })
  }

  const onSubmitForAnalysis = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || locked) return
    try {
      sessionStorage.setItem(SCORER_PREFILL_FROM_WRITING_KEY, trimmed)
    } catch {
      /* */
    }
    markWritingCompositionSubmitted(userLevel)
    setLocked(true)
  }, [text, locked, userLevel])

  const openScorerHref = '/scorer'

  const focusColors = ['bg-indigo-500', 'bg-pink-400', 'bg-sky-500'] as const

  if (locked) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <p className="font-display text-lg italic text-indigo-800 md:text-xl">Writing Production</p>
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-900">
            {badge}
          </span>
        </header>
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="font-display mt-6 text-2xl font-bold text-[#1e293b]">Composition terminée</h1>
          <p className="mt-3 text-sm text-slate-600">
            Vous avez soumis votre texte du jour
            {topic ? ` pour « ${topic.title} »` : ''}. Un nouveau sujet IA sera disponible après minuit (heure locale).
          </p>
          <div className="mx-auto mt-8 flex max-w-xs items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
            <Clock className="h-5 w-5 shrink-0 text-indigo-600" />
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">Prochain sujet</p>
              <p className="font-mono text-xl font-bold tabular-nums text-[#1e293b]">{formatCountdown(midnightMs)}</p>
            </div>
          </div>
          <Link
            to={openScorerHref}
            className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[#1e293b] py-3.5 text-sm font-bold text-white shadow-md"
          >
            <Rocket className="h-4 w-4" />
            Ouvrir l’AI Scorer avec mon texte
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Ouvrez l’AI Scorer : votre composition sera préremplie automatiquement pour cette session.
          </p>
        </div>
        <section className="space-y-3 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TEF track pulse</p>
          <TefTrackFooterBar />
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <p className="font-display text-lg italic text-indigo-800 md:text-xl">Writing Production</p>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-900">
          {badge}
        </span>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</div>
      ) : null}
      {topicSource === 'fallback' && !loadError ? (
        <p className="text-xs text-slate-500">
          Sujet du jour (hors ligne / API indisponible) — cache pédagogique local pour 24 h.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500">Accuracy</p>
          <p className="font-display mt-1 text-3xl font-bold text-[#1e293b]">
            {accuracyPct !== null ? `${accuracyPct}%` : '—'}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500">Combo streak</p>
          <p className="font-display mt-1 flex items-center gap-1 text-3xl font-bold text-[#1e293b]">
            <Zap className="h-7 w-7 text-pink-500" />
            {streak}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-slate-500">XP progress</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(xp.cur / xp.max) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">
            {xp.cur} / {xp.max}
          </p>
        </div>
        <div
          className="rounded-3xl p-6 text-white shadow-md sm:col-span-2 lg:col-span-1"
          style={{ backgroundColor: navy }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Current assignment</p>
          {loadingTopic || !topic ? (
            <p className="mt-3 text-sm text-slate-300">Chargement du sujet…</p>
          ) : (
            <>
              <p className="font-display mt-3 text-lg font-bold leading-snug">{topic.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{topic.description}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1e293b] md:text-3xl">
              Composition <em className="font-serif font-normal text-slate-400 not-italic">Libre</em>
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Affinez vos nuances linguistiques. Travaillez la syntaxe et le lexique adaptés au niveau {badge}. Le Curateur
              veille à l’élégance structurelle.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => wrapSelection('**', '**')}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold text-[#1e293b]"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('*', '*')}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm italic text-[#1e293b]"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor('é')}
                className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800"
              >
                文A ACCENTS
              </button>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:ml-auto sm:w-auto">
                {topic?.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={locked || loadingTopic}
              placeholder={
                topic
                  ? 'Rédigez votre texte en français ici…'
                  : 'Chargement du sujet du jour…'
              }
              className="min-h-[240px] w-full resize-y rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-[#1e293b] outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="mt-3 flex justify-end">
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  wordCount > maxWords ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600',
                ].join(' ')}
              >
                {wordCount} / {maxWords} mots
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/syllabus"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              View reference grammar
            </Link>
            <button
              type="button"
              onClick={onSubmitForAnalysis}
              disabled={locked || loadingTopic || !topic || wordCount < 1}
              className="inline-flex items-center gap-2 rounded-full bg-[#1e293b] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Rocket className="h-4 w-4" />
              Submit for Analysis
            </button>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Linguistic focus</p>
            <div className="mt-4 space-y-4">
              {(topic?.grammarFocus ?? []).map((g, i) => (
                <div key={g.label + i}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${focusColors[i % focusColors.length]}`} />
                    <span className="text-sm font-semibold text-[#1e293b]">{g.label}</span>
                    <span className="ml-auto text-xs font-bold text-slate-500">{g.masteryPercent}%</span>
                  </div>
                  <p className="mt-1 pl-4 text-[11px] text-slate-500">Mastery in current focus (daily target)</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={['h-full rounded-full', focusColors[i % focusColors.length]].join(' ')}
                      style={{ width: `${g.masteryPercent}%` }}
                    />
                  </div>
                </div>
              ))}
              {loadingTopic ? <p className="text-sm text-slate-500">Chargement…</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">The Curator&apos;s tip</p>
            <p className="mt-3 text-sm italic leading-relaxed text-slate-700">
              {topic?.curatorTip ??
                'Relisez votre production en soulignant chaque accord sujet-adjectif et participe passé.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase text-slate-500">Recent grade</p>
              <p className="font-display mt-1 text-2xl font-bold text-[#1e293b]">
                {lastScore ? gradeLetter(lastScore.score) : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase text-slate-500">Time spent</p>
              <p className="mt-1 flex items-center gap-1 font-mono text-lg font-bold tabular-nums text-[#1e293b]">
                <Clock className="h-4 w-4 text-slate-400" />
                {String(Math.floor(secondsOnPage / 60)).padStart(2, '0')}:
                {String(secondsOnPage % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-3 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TEF track pulse</p>
        <TefTrackFooterBar />
      </section>
    </div>
  )
}
