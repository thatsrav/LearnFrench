import { CheckCircle2, Info, XCircle } from 'lucide-react'
import type { FeedbackKind } from '../conjugationCodexStore'

export type FeedbackModalProps = {
  open: boolean
  kind: FeedbackKind
  title: string
  message: string
  onClose: () => void
}

function iconFor(kind: FeedbackKind) {
  if (kind === 'correct') return <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
  if (kind === 'incorrect') return <XCircle className="h-10 w-10 text-rose-600" aria-hidden />
  return <Info className="h-10 w-10 text-indigo-600" aria-hidden />
}

export function FeedbackModal({ open, kind, title, message, onClose }: FeedbackModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Close overlay"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          {iconFor(kind)}
          <h2 className="font-display mt-4 text-xl font-bold text-[var(--atelier-navy-deep)]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[var(--atelier-navy-deep)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001438]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
