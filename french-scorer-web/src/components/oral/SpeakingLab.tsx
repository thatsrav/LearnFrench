import { Mic } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import {
  analyzeTranscript,
  transcribeRecordingWebm,
  type DailySpeakingPrompt,
  type SpeechAnalysisResult,
} from '../../lib/OralMissionEngine'
import { msUntilEdmontonMidnight } from '../../lib/edmontonTime'
import { formatCountdown } from '../../lib/readingRoomMissionStorage'
import { isSpeakingMissionLockedToday, markSpeakingMissionComplete } from '../../lib/oralLabStorage'
import { addExamReadiness, incrementOralStreakOncePerDay } from '../../lib/tefSharedFooterStats'

const navy = '#1e293b'

type Props = {
  userLevel: string
  prompt: DailySpeakingPrompt | null
}

function MissionDoneSpeaking() {
  const [ms, setMs] = useState(() => msUntilEdmontonMidnight())
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilEdmontonMidnight()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-4 text-white" style={{ backgroundColor: navy }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Speaking lab</p>
        <p className="font-display mt-1 text-lg font-bold">Mission accomplie</p>
      </div>
      <div className="p-6 text-center">
        <p className="text-sm font-bold text-emerald-700">Expression orale — session validée</p>
        <p className="mt-2 text-xs text-slate-600">Prochaine consigne (minuit Edmonton) dans :</p>
        <p className="mt-3 font-mono text-2xl font-bold tabular-nums text-[#1e293b]">{formatCountdown(ms)}</p>
      </div>
    </div>
  )
}

export default function SpeakingLab({ userLevel, prompt }: Props) {
  const [locked, setLocked] = useState(() => isSpeakingMissionLockedToday(userLevel))
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<SpeechAnalysisResult | null>(null)

  const onRecordComplete = useCallback(
    async (blob: Blob) => {
      if (!prompt) {
        setError('Consigne indisponible.')
        return
      }
      setProcessing(true)
      setError(null)
      try {
        const transcript = await transcribeRecordingWebm(blob)
        if (!transcript.trim()) throw new Error('Transcription vide — réessayez plus fort.')
        const result = await analyzeTranscript(transcript, userLevel, prompt.promptFr)
        setAnalysis(result)
        markSpeakingMissionComplete(userLevel)
        addExamReadiness(10)
        incrementOralStreakOncePerDay()
        setLocked(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analyse impossible')
      } finally {
        setProcessing(false)
      }
    },
    [prompt, userLevel],
  )

  if (locked && !analysis) {
    return <MissionDoneSpeaking />
  }

  return (
    <div id="speaking" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-5 text-white md:px-8" style={{ backgroundColor: navy }}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Mic className="h-6 w-6 text-indigo-100" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">TEF preparation track</p>
            <h2 className="font-display text-xl font-bold md:text-2xl">Speaking Lab</h2>
            {prompt ? (
              <p className="mt-1 max-w-xl text-xs text-indigo-100/95">
                <span className="font-bold text-white">Consigne :</span> {prompt.promptFr}
              </p>
            ) : (
              <p className="mt-1 text-xs text-indigo-200">Chargement Whisper + Gemini…</p>
            )}
          </div>
        </div>
        {prompt?.topicLine ? (
          <span className="mt-3 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-100">
            {prompt.topicLine}
          </span>
        ) : null}
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Enregistrement</p>
          <p className="mt-1 text-xs text-slate-600">
            Whisper (OpenAI) pour la transcription, puis analyse Gemini : fluidité, liaisons, voyelles nasales, score TEF
            estimé.
          </p>
          <div className="mt-4">
            <VoiceRecorder
              disabled={processing || !prompt || locked}
              onRecordComplete={(blob) => void onRecordComplete(blob)}
            />
          </div>
          {processing ? (
            <p className="mt-3 text-center text-sm font-semibold text-indigo-600">Transcription et analyse en cours…</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {analysis ? (
          <div className="space-y-4 border-t border-slate-100 pt-6 text-sm">
            <div className="rounded-2xl p-5 text-white shadow-md" style={{ backgroundColor: navy }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">TEF — score estimé</p>
              <p className="font-display mt-2 text-4xl font-bold tabular-nums">{analysis.tefScorePredicted}</p>
              <p className="mt-1 text-xs text-indigo-200">sur 900 (prédiction pédagogique, non officielle)</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fluidité</p>
              <p className="mt-2 leading-relaxed text-slate-700">{analysis.fluency}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prononciation (vue d’ensemble)</p>
              <p className="mt-2 leading-relaxed text-slate-700">{analysis.pronunciation}</p>
            </div>

            {analysis.liaisonsFeedback ? (
              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-800">Liaisons & enchaînements</p>
                <p className="mt-2 leading-relaxed text-slate-800">{analysis.liaisonsFeedback}</p>
              </div>
            ) : null}

            {analysis.nasalVowelsFeedback ? (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-900">Voyelles nasales</p>
                <p className="mt-2 leading-relaxed text-slate-800">{analysis.nasalVowelsFeedback}</p>
              </div>
            ) : null}

            {analysis.strengths.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase text-emerald-700">Points forts</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {analysis.improvements.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase text-amber-800">À travailler</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
                  {analysis.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
