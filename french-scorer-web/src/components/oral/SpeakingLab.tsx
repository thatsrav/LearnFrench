import { Mic, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  analyzeTranscript,
  transcribeRecordingWebm,
  type DailySpeakingPrompt,
  type SpeechAnalysisResult,
} from '../../lib/OralMissionEngine'
import { formatCountdown, msUntilLocalMidnight } from '../../lib/readingRoomMissionStorage'
import { isSpeakingMissionLockedToday, markSpeakingMissionComplete } from '../../lib/oralLabStorage'
import { addExamReadiness, incrementOralStreakOncePerDay } from '../../lib/tefSharedFooterStats'

type Props = {
  userLevel: string
  prompt: DailySpeakingPrompt | null
}

function MissionDoneSpeaking() {
  const [ms, setMs] = useState(() => msUntilLocalMidnight())
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilLocalMidnight()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-bold text-emerald-700">Mission accomplie — Expression orale</p>
      <p className="mt-2 text-xs text-slate-600">Prochaine consigne dans :</p>
      <p className="mt-3 font-mono text-2xl font-bold tabular-nums text-[#1e293b]">{formatCountdown(ms)}</p>
    </div>
  )
}

export default function SpeakingLab({ userLevel, prompt }: Props) {
  const [locked, setLocked] = useState(() => isSpeakingMissionLockedToday(userLevel))
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<SpeechAnalysisResult | null>(null)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const stopVisualizer = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
  }, [])

  const drawBars = useCallback(() => {
    const analyser = analyserRef.current
    const canvas = canvasRef.current
    if (!analyser || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    const loop = () => {
      analyser.getByteFrequencyData(data)
      const w = canvas.width
      const h = canvas.height
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(0, 0, w, h)
      const bars = 32
      const step = Math.floor(data.length / bars)
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        let v = 0
        for (let j = 0; j < step; j++) v += data[i * step + j] ?? 0
        v /= step
        const bh = (v / 255) * (h * 0.85)
        ctx.fillStyle = '#6366f1'
        ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const stopRecording = useCallback(async () => {
    setRecording(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    stopVisualizer()
    const rec = mediaRecorderRef.current
    mediaRecorderRef.current = null
    if (rec && rec.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        rec.onstop = () => resolve()
        rec.stop()
      })
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    chunksRef.current = []
    if (blob.size < 2000) {
      setError('Enregistrement trop court.')
      return
    }

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
  }, [prompt, userLevel, stopVisualizer])

  const startRecording = useCallback(async () => {
    setError(null)
    setAnalysis(null)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyserRef.current = analyser
      drawBars()

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const rec = new MediaRecorder(stream, { mimeType: mime })
      mediaRecorderRef.current = rec
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      rec.start(200)
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      setError('Microphone refusé ou indisponible.')
    }
  }, [drawBars])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      stopVisualizer()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [stopVisualizer])

  const toggleRec = () => {
    if (recording) void stopRecording()
    else void startRecording()
  }

  if (locked && !analysis) {
    return <MissionDoneSpeaking />
  }

  return (
    <div id="speaking" className="scroll-mt-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <Mic className="h-8 w-8 text-[#1e293b]" />
        <div>
          <h2 className="font-display text-xl font-bold text-[#1e293b]">Speaking Lab</h2>
          {prompt ? (
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold text-[#1e293b]">Prompt :</span> « {prompt.promptFr} »
            </p>
          ) : (
            <p className="text-sm text-slate-500">Chargement de la consigne…</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <canvas ref={canvasRef} width={320} height={72} className="mx-auto w-full max-w-md rounded-lg bg-white" />
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={toggleRec}
            disabled={processing || !prompt || locked}
            className={[
              'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition',
              recording ? 'bg-slate-700' : 'bg-red-600 hover:bg-red-700',
              processing || !prompt || locked ? 'cursor-not-allowed opacity-50' : '',
            ].join(' ')}
            aria-label={recording ? 'Stop' : 'Record'}
          >
            {recording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
          </button>
          <p className="font-mono text-sm font-bold text-slate-700">
            {recording ? `RECORDING ${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}` : processing ? 'Analyse en cours…' : 'Appuyez pour enregistrer'}
          </p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {analysis ? (
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 text-sm">
          <div className="rounded-2xl bg-[#1e293b] p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">TEF score (predicted)</p>
            <p className="font-display text-3xl font-bold">{analysis.tefScorePredicted} / 900</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Fluency</p>
            <p className="mt-1 text-slate-700">{analysis.fluency}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Pronunciation</p>
            <p className="mt-1 text-slate-700">{analysis.pronunciation}</p>
          </div>
          {analysis.strengths.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Strengths</p>
              <ul className="mt-1 list-inside list-disc text-slate-600">
                {analysis.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {analysis.improvements.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase text-amber-700">Improve</p>
              <ul className="mt-1 list-inside list-disc text-slate-600">
                {analysis.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
