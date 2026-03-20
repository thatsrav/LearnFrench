import { Mic, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const navy = '#1e293b'
const accent = '#6366f1'

type Props = {
  disabled?: boolean
  /** Called once with audio/webm blob when user stops and clip is long enough */
  onRecordComplete: (blob: Blob) => void
}

/**
 * Web MediaRecorder + live frequency-bar waveform (AnalyserNode).
 */
export default function VoiceRecorder({ disabled, onRecordComplete }: Props) {
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)

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
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, w, h)
      const bars = 40
      const step = Math.max(1, Math.floor(data.length / bars))
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        let v = 0
        for (let j = 0; j < step; j++) v += data[i * step + j] ?? 0
        v /= step
        const bh = (v / 255) * (h * 0.88)
        const grad = ctx.createLinearGradient(0, h - bh, 0, h)
        grad.addColorStop(0, accent)
        grad.addColorStop(1, '#4f46e5')
        ctx.fillStyle = grad
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
      setLocalError('Enregistrement trop court.')
      return
    }
    setLocalError(null)
    onRecordComplete(blob)
  }, [onRecordComplete, stopVisualizer])

  const startRecording = useCallback(async () => {
    setLocalError(null)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
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
      setLocalError('Microphone refusé ou indisponible.')
    }
  }, [drawBars])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      stopVisualizer()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [stopVisualizer])

  const toggle = () => {
    if (disabled) return
    if (recording) void stopRecording()
    else void startRecording()
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
      <canvas
        ref={canvasRef}
        width={640}
        height={96}
        className="mx-auto h-20 w-full max-w-xl rounded-xl border border-slate-100 bg-slate-50"
      />
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className={[
            'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition',
            recording ? 'bg-slate-700 ring-4 ring-red-200' : 'bg-red-600 hover:bg-red-700',
            disabled ? 'cursor-not-allowed opacity-45' : '',
          ].join(' ')}
          aria-label={recording ? 'Arrêter' : 'Enregistrer'}
        >
          {recording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
        </button>
        <p className="font-mono text-xs font-bold tabular-nums" style={{ color: navy }}>
          {recording
            ? `REC ${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}`
            : 'Appuyez pour enregistrer votre réponse'}
        </p>
      </div>
      {localError ? <p className="mt-3 text-center text-sm text-red-600">{localError}</p> : null}
    </div>
  )
}
