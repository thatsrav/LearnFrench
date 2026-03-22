import { Volume2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { playSoundEffect } from '../services/soundEffects'
import {
  getSoundFxEnabled,
  getSoundFxVolume,
  setSoundFxEnabled,
  setSoundFxVolume,
  SOUND_SETTINGS_EVENT,
} from '../lib/soundSettings'

export function SoundPreferencesCard() {
  const [enabled, setEnabled] = useState(getSoundFxEnabled)
  const [volume, setVolume] = useState(getSoundFxVolume)

  const sync = useCallback(() => {
    setEnabled(getSoundFxEnabled())
    setVolume(getSoundFxVolume())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const on = () => sync()
    window.addEventListener(SOUND_SETTINGS_EVENT, on)
    return () => window.removeEventListener(SOUND_SETTINGS_EVENT, on)
  }, [sync])

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Volume2 className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900">Sound effects</h2>
          <p className="text-xs text-slate-600">Lessons, quizzes, and games (Duolingo-style cues).</p>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">Enable sounds</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const v = e.target.checked
            setSoundFxEnabled(v)
            setEnabled(v)
            if (v) playSoundEffect('success')
          }}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </label>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Volume</span>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          disabled={!enabled}
          onChange={(e) => {
            const n = Number(e.target.value) / 100
            setSoundFxVolume(n)
            setVolume(n)
          }}
          className="mt-2 w-full accent-indigo-600 disabled:opacity-40"
        />
      </div>

      <button
        type="button"
        disabled={!enabled}
        onClick={() => playSoundEffect('success')}
        className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-40"
      >
        Preview success sound
      </button>
    </div>
  )
}
