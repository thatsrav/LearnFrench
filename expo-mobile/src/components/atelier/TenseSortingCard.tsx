import { useCallback, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { MotiView } from 'moti'
import { GripVertical } from 'lucide-react-native'
import { ATELIER } from './atelierTheme'

export type TenseKey = 'passe' | 'present' | 'futur'

export type TenseChip = { id: string; text: string; correct: TenseKey }

type Rect = { x: number; y: number; w: number; h: number }

const ZONES: { key: TenseKey; label: string }[] = [
  { key: 'passe', label: 'PASSÉ' },
  { key: 'present', label: 'PRÉSENT' },
  { key: 'futur', label: 'FUTUR' },
]

const SPRING = { damping: 18, stiffness: 220 }

function DraggableTrayChip({
  chip,
  getZoneRects,
  onDrop,
}: {
  chip: TenseChip
  getZoneRects: () => Partial<Record<TenseKey, Rect>>
  onDrop: (chipId: string, zone: TenseKey | null, correct: boolean) => void
}) {
  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const z = useSharedValue(1)

  const hitTest = useCallback(
    (px: number, py: number): TenseKey | null => {
      const rects = getZoneRects()
      for (const { key } of ZONES) {
        const r = rects[key]
        if (r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return key
      }
      return null
    },
    [getZoneRects],
  )

  const endDrag = useCallback(
    (absX: number, absY: number) => {
      const zone = hitTest(absX, absY)
      if (!zone) {
        onDrop(chip.id, null, false)
        return
      }
      const correct = zone === chip.correct
      onDrop(chip.id, zone, correct)
    },
    [chip.correct, chip.id, hitTest, onDrop],
  )

  const pan = Gesture.Pan()
    .onBegin(() => {
      z.value = 48
    })
    .onUpdate((e) => {
      tx.value = e.translationX
      ty.value = e.translationY
    })
    .onEnd((e) => {
      runOnJS(endDrag)(e.absoluteX, e.absoluteY)
      tx.value = withSpring(0, SPRING)
      ty.value = withSpring(0, SPRING)
      z.value = 1
    })

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    zIndex: z.value,
    elevation: z.value > 1 ? 14 : 2,
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <View
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: ATELIER.navy }}
        >
          <GripVertical size={16} color="rgba(255,255,255,0.5)" />
          <Text className="ml-1 text-sm font-bold text-white">{chip.text}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

export default function TenseSortingCard() {
  const [tray, setTray] = useState<TenseChip[]>([
    { id: 'c3', text: "J'irai", correct: 'futur' },
    { id: 'c4', text: 'Tu chantes', correct: 'present' },
    { id: 'c5', text: 'Nous avons fini', correct: 'passe' },
  ])
  const [placed, setPlaced] = useState<Record<TenseKey, TenseChip[]>>({
    passe: [{ id: 'c1', text: 'Je suis allé', correct: 'passe' }],
    present: [{ id: 'c2', text: 'Je vais', correct: 'present' }],
    futur: [],
  })
  const [glow, setGlow] = useState<TenseKey | null>(null)

  const zoneRects = useRef<Partial<Record<TenseKey, Rect>>>({})
  const zoneRefs = useRef<Partial<Record<TenseKey, View | null>>>({})
  const trayRef = useRef(tray)
  trayRef.current = tray

  const captureZoneLayout = useCallback((key: TenseKey) => {
    const node = zoneRefs.current[key]
    node?.measureInWindow((x, y, w, h) => {
      zoneRects.current[key] = { x, y, w, h }
    })
  }, [])

  const getZoneRects = useCallback(() => zoneRects.current, [])

  const onDrop = useCallback((chipId: string, zone: TenseKey | null, correct: boolean) => {
    if (!correct || !zone) return
    const chip = trayRef.current.find((c) => c.id === chipId)
    if (!chip) return
    setTray((t) => t.filter((c) => c.id !== chipId))
    setPlaced((p) => ({ ...p, [zone]: [...p[zone], chip] }))
    setGlow(zone)
    setTimeout(() => setGlow(null), 700)
  }, [])

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-1 rounded-full" style={{ backgroundColor: ATELIER.navy }} />
          <Text className="font-display text-lg font-bold" style={{ color: ATELIER.navy }}>
            Tense sorting
          </Text>
        </View>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: ATELIER.accentLight }}>
          <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ATELIER.accent }}>
            Interactive drag
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {ZONES.map(({ key, label }) => (
          <View
            key={key}
            ref={(r) => {
              zoneRefs.current[key] = r
            }}
            onLayout={() => captureZoneLayout(key)}
            className="flex-1"
          >
            <MotiView
              className="rounded-2xl border-2 border-dashed p-2"
              animate={{
                borderColor: glow === key ? ATELIER.success : ATELIER.border,
              }}
              transition={{ type: 'timing', duration: 200 }}
              style={{
                backgroundColor: ATELIER.cardMuted,
                minHeight: 140,
                shadowColor: ATELIER.success,
                shadowOpacity: glow === key ? 0.5 : 0,
                shadowRadius: glow === key ? 18 : 0,
              }}
            >
              <Text
                className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest"
                style={{ color: ATELIER.textMuted }}
              >
                {label}
              </Text>
              <View className="flex-1 gap-2">
                {placed[key].map((c) => (
                  <View key={c.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <Text className="text-center text-sm font-semibold" style={{ color: ATELIER.text }}>
                      {c.text}
                    </Text>
                  </View>
                ))}
              </View>
            </MotiView>
          </View>
        ))}
      </View>

      <Text className="mb-2 mt-5 text-xs font-semibold" style={{ color: ATELIER.textMuted }}>
        Drag chips into the correct tense column
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {tray.map((chip) => (
          <DraggableTrayChip key={chip.id} chip={chip} getZoneRects={getZoneRects} onDrop={onDrop} />
        ))}
      </View>
    </MotiView>
  )
}
