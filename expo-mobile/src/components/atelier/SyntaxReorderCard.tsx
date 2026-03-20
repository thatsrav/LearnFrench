import { useCallback, useMemo, useState } from 'react'
import { Platform, Pressable, Text, useWindowDimensions, View, Vibration } from 'react-native'
import { MotiView } from 'moti'
import { Menu } from 'lucide-react-native'
import { ATELIER, ATELIER_WIDE_BREAKPOINT } from './atelierTheme'

const BANK = ['souvent', 'Elle', 'nous', 'rend', 'visite', '.'] as const
const CORRECT = ['Elle', 'nous', 'rend', 'souvent', 'visite', '.']

function playWebChime() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.value = 0.08
    o.start()
    o.stop(ctx.currentTime + 0.12)
  } catch {
    /* ignore */
  }
}

function playNativeChime() {
  Vibration.vibrate([0, 40, 60, 40])
}

type Props = {
  onValidate?: (ok: boolean) => void
}

export default function SyntaxReorderCard({ onValidate }: Props) {
  const { width } = useWindowDimensions()
  const wide = width >= ATELIER_WIDE_BREAKPOINT
  const [bank, setBank] = useState<string[]>([...BANK])
  const [active, setActive] = useState<string[]>([])

  const moveToActive = useCallback((word: string) => {
    setBank((b) => b.filter((w) => w !== word))
    setActive((a) => [...a, word])
  }, [])

  const moveToBank = useCallback((word: string) => {
    setActive((a) => a.filter((w) => w !== word))
    setBank((b) => [...b, word])
  }, [])

  const validate = useCallback(() => {
    const ok = active.length === CORRECT.length && active.every((w, i) => w === CORRECT[i])
    onValidate?.(ok)
    if (ok) {
      if (Platform.OS === 'web') playWebChime()
      else playNativeChime()
    } else {
      Vibration.vibrate(40)
    }
  }, [active, onValidate])

  const shuffleReset = useMemo(() => () => {
    setBank([...BANK])
    setActive([])
  }, [])

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="overflow-hidden rounded-3xl shadow-lg"
      style={{
        backgroundColor: ATELIER.navy,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <View
        className={wide ? 'flex-row items-start justify-between gap-6 p-6' : 'flex-col gap-6 p-6'}
      >
        <View className={`max-w-md ${wide ? 'flex-1' : ''}`}>
          <View className="flex-row items-center gap-2">
            <Menu size={18} color="rgba(248,250,252,0.85)" />
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">
              Syntax reordering
            </Text>
          </View>
          <Text className="font-display mt-3 text-2xl font-bold text-white md:text-3xl">
            Reconstruct the sentence
          </Text>
          <Text className="mt-3 text-sm leading-6 text-white/80">
            Tap words in order to build a grammatically sound French sentence. Focus on pronoun placement and adverb position.
          </Text>
          <Pressable onPress={shuffleReset} className="mt-4 self-start">
            <Text className="text-xs font-bold text-sky-200 underline">Reset words</Text>
          </Pressable>
        </View>

        <View className={`min-w-0 ${wide ? 'flex-1' : ''}`}>
          <Text className="mb-2 text-[10px] font-bold uppercase tracking-wide text-white/50">Compose here</Text>
          <Pressable
            onPress={() => {
              if (active.length) moveToBank(active[active.length - 1]!)
            }}
            className="min-h-[52px] flex-row flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-white/25 bg-white/5 px-3 py-3"
          >
            {active.length === 0 ? (
              <Text className="text-sm text-white/40">Tap chips below…</Text>
            ) : (
              active.map((w, i) => (
                <Pressable key={`active-${i}-${w}`} onPress={() => moveToBank(w)}>
                  <View className="rounded-lg bg-white px-3 py-2">
                    <Text className="text-sm font-bold" style={{ color: ATELIER.navy }}>
                      {w}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </Pressable>

          <Text className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-wide text-white/50">Word bank</Text>
          <View className="flex-row flex-wrap gap-2">
            {bank.map((w) => (
              <Pressable key={w} onPress={() => moveToActive(w)}>
                <View className="rounded-xl bg-white/95 px-3 py-2.5 shadow-sm">
                  <Text className="text-sm font-bold" style={{ color: ATELIER.navy }}>
                    {w}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={validate}
            className="mt-6 items-center rounded-2xl py-4"
            style={{ backgroundColor: ATELIER.coral }}
          >
            <Text className="text-sm font-bold uppercase tracking-wider text-white">Validate syntax</Text>
          </Pressable>
        </View>
      </View>
    </MotiView>
  )
}
