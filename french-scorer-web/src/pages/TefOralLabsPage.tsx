import { ArrowRight, BookOpen, Check, Headphones, Mic, Pencil, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ListeningLab from '../components/oral/ListeningLab'
import SpeakingLab from '../components/oral/SpeakingLab'
import TefTrackFooterBar from '../components/tef/TefTrackFooterBar'
import { edmontonDateKey } from '../lib/edmontonTime'
import { ensureDailySpeakingPrompt, type DailySpeakingPrompt } from '../lib/OralMissionEngine'
import { normalizeWritingLevel } from '../lib/WritingService'
import { readUserCefrLevel } from '../lib/userCefr'

const navy = '#1e293b'

type MobileTab = 'listening' | 'speaking'

export default function TefOralLabsPage() {
  const location = useLocation()
  const userLevel = readUserCefrLevel()
  const prepBadge = `${normalizeWritingLevel(userLevel)} Level Prep`
  const [speakPrompt, setSpeakPrompt] = useState<DailySpeakingPrompt | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('listening')

  useEffect(() => {
    if (location.hash === '#speaking') {
      setMobileTab('speaking')
      requestAnimationFrame(() =>
        document.getElementById('speaking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [location.hash])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await ensureDailySpeakingPrompt(userLevel)
        if (!cancelled) setSpeakPrompt(p)
      } catch {
        if (!cancelled) setSpeakPrompt(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userLevel])

  const contentDay = edmontonDateKey()

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-28 lg:pb-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1e293b] md:text-2xl">TEF Preparation Track</h1>
          <p className="mt-1 text-xs text-slate-500">
            Contenu oral du jour : <span className="font-mono font-semibold text-slate-700">{contentDay}</span> (America/
            Edmonton)
          </p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-900">
          {prepBadge}
        </span>
      </header>

      <section
        className="relative overflow-hidden rounded-3xl px-8 py-10 text-white shadow-xl md:px-12 md:py-12"
        style={{ backgroundColor: navy }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-200">Section technique</p>
        <h2 className="relative font-display mt-3 text-3xl font-bold leading-tight md:text-4xl">
          Maîtrisez l&apos;examen TEF
        </h2>
        <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
          Écoute HD (ElevenLabs Multilingual v2) et analyse orale (Whisper + Gemini). Protocole sans retour arrière pour
          l&apos;écoute — comme en salle d&apos;examen.
        </p>
        <Link
          to="/tef-prep"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-400"
        >
          <Play className="h-4 w-4 fill-current" />
          Resume track
        </Link>
      </section>

      {/* Desktop: two columns */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        <ListeningLab userLevel={userLevel} />
        <SpeakingLab userLevel={userLevel} prompt={speakPrompt} />
      </div>

      {/* Mobile / tablet: single column + bottom sheet nav */}
      <div className="lg:hidden">
        {mobileTab === 'listening' ? (
          <ListeningLab userLevel={userLevel} />
        ) : (
          <SpeakingLab userLevel={userLevel} prompt={speakPrompt} />
        )}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden"
        aria-label="Oral labs"
      >
        <div className="mx-auto flex max-w-md gap-2">
          <button
            type="button"
            onClick={() => {
              setMobileTab('listening')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={[
              'flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition',
              mobileTab === 'listening' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500',
            ].join(' ')}
          >
            <Headphones className="h-5 w-5" />
            Listening
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('speaking')
              requestAnimationFrame(() =>
                document.getElementById('speaking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
              )
            }}
            className={[
              'flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition',
              mobileTab === 'speaking' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500',
            ].join(' ')}
          >
            <Mic className="h-5 w-5" />
            Speaking
          </button>
        </div>
      </nav>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500">Reading syllabus</p>
            <span className="text-sm font-bold text-emerald-600">75% Complete</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2 font-medium text-[#1e293b]">
              <Check className="h-4 w-4 text-emerald-500" /> U1: Textual cohesion
            </li>
            <li className="flex items-center gap-2 text-slate-600">
              <span className="h-4 w-4 rounded-full border-2 border-slate-300" /> U2: Inference &amp; subtext
            </li>
          </ul>
          <Link
            to="/reading-room"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            Open reading room <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Writing area</p>
          <p className="mt-2 text-sm font-bold text-[#1e293b]">2 / 5 tasks</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-xl bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-900">Argumentative essay</span>
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Formal inquiry</span>
          </div>
          <Link
            to="/writing"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            <Pencil className="h-3 w-3" /> Daily composition
          </Link>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to="/tef-prep/a1/1"
          className="rounded-2xl border-2 border-dashed border-slate-300 px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-800"
        >
          Explore full unit structure
        </Link>
      </div>

      <TefTrackFooterBar />

      <p className="text-center text-xs text-slate-500">
        <BookOpen className="mr-1 inline h-3 w-3" />
        Clés API (Gemini, OpenAI Whisper, ElevenLabs) sur le serveur. Fuseau quotidien : America/Edmonton.
      </p>
    </div>
  )
}
