/**
 * UI sound effects — tries `/public/sounds/{name}.mp3` first, then Web Audio synthesis (no assets required).
 */

import { getSoundFxEnabled, getSoundFxVolume } from '../lib/soundSettings'

export type SoundEffect = 'success' | 'error' | 'unlock' | 'levelup' | 'streak'

const PATHS: Record<SoundEffect, string> = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  unlock: '/sounds/unlock.mp3',
  levelup: '/sounds/levelup.mp3',
  streak: '/sounds/streak.mp3',
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  return new Ctx()
}

function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

/** Synthetic fallback when MP3 is missing or autoplay blocks file playback. */
function playSynth(effect: SoundEffect, master: number) {
  const ctx = getAudioContext()
  if (!ctx) return
  void ctx.resume().catch(() => {})
  const t0 = ctx.currentTime
  const g = master * 0.22

  if (effect === 'success') {
    playTone(ctx, 784, t0, 0.11, 'sine', g)
    playTone(ctx, 988, t0 + 0.08, 0.12, 'sine', g * 0.95)
  } else if (effect === 'error') {
    playTone(ctx, 120, t0, 0.14, 'triangle', g * 0.9)
    playTone(ctx, 90, t0 + 0.1, 0.12, 'triangle', g * 0.75)
  } else if (effect === 'unlock') {
    playTone(ctx, 523, t0, 0.1, 'sine', g)
    playTone(ctx, 659, t0 + 0.09, 0.1, 'sine', g)
    playTone(ctx, 784, t0 + 0.18, 0.14, 'sine', g)
  } else if (effect === 'levelup') {
    ;[523, 659, 784, 1046].forEach((f, i) => playTone(ctx, f, t0 + i * 0.07, 0.14, 'sine', g * (1 - i * 0.12)))
  } else {
    ;[659, 784, 988, 1175].forEach((f, i) => playTone(ctx, f, t0 + i * 0.12, 0.16, 'triangle', g * (0.9 - i * 0.15)))
  }
}

function tryPlayMp3(effect: SoundEffect, volume: number): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(PATHS[effect])
    audio.volume = Math.min(1, Math.max(0, volume))
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }
    audio.addEventListener('error', () => finish(false))
    void audio.play().then(() => finish(true)).catch(() => finish(false))
  })
}

export function playSoundEffect(effect: SoundEffect, options?: { volume?: number }): void {
  if (typeof window === 'undefined') return
  if (!getSoundFxEnabled()) return

  const base = options?.volume ?? getSoundFxVolume()

  void tryPlayMp3(effect, base).then((ok) => {
    if (!ok) playSynth(effect, base)
  })
}

export function stopSoundEffect(_effect?: SoundEffect): void {
  void _effect
  /* File-based one-shots stop naturally; synth uses short envelopes. */
}
