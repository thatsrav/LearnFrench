# Adding Pronunciation & Sound Effects to French Learning App

Based on analysis of your codebase, here's the complete strategy for:
1. **Pronunciation audio for vocabulary words** in main syllabus
2. **Celebratory & failure sound effects** (Duolingo/Bussuu style)

---

## Part 1: Pronunciation for Main Syllabus Words

### Current State
✅ **Cloud TTS infrastructure exists**:
- `french-scorer-api` has endpoint: `POST /api/tts/french` (returns MP3)
- Mobile: `frenchExpoTts.ts` (expo-av playback + caching)
- Web: `frenchWebTts.ts` (HTML audio element)
- Both configured via `OPENAI_API_KEY` on backend

### Architecture Choice: Static Pre-Generated Audio

**Decision**: Don't generate TTS on-the-fly for every vocabulary word. Instead:
1. **Pre-generate vocabulary audio once** (build step)
2. **Host on CDN** (S3, Vercel public folder, or similar)
3. **Embed CDN URLs in lesson JSON** (a1.json, a2.json, etc.)
4. **Client fetches & plays** via cloud TTS library (already built)

**Why static?**:
- Fast load (cached CDN)
- No API latency during lesson
- Cheap (generate once, not per playback)
- Offline capable (cache to device storage)

### Implementation Steps

#### Step 1: Pre-generation Script
Create `french-scorer-web/scripts/generate-vocab-audio.mjs`:

```javascript
/**
 * Pre-generate pronunciation audio for all vocabulary words
 * Run: node scripts/generate-vocab-audio.mjs
 * Output: public/audio/vocab/{word_id}.mp3
 */

import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8787'
const AUDIO_DIR = path.join(__dirname, '../public/audio/vocab')

async function generateVocabAudio() {
  // 1. Load all syllabus JSON files (a1.json, a2.json, etc.)
  const syllabusFiles = ['a1', 'a2', 'b1', 'b2', 'c1']
  const allWords = new Set()

  for (const level of syllabusFiles) {
    const filePath = path.join(__dirname, `../src/lib/content/${level}.json`)
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
    
    data.units?.forEach(unit => {
      unit.vocabulary?.forEach(vocab => {
        allWords.add(vocab.word)
      })
    })
  }

  console.log(`Found ${allWords.size} unique words. Generating audio...`)

  // 2. Create output directory
  await fs.mkdir(AUDIO_DIR, { recursive: true })

  // 3. Generate audio for each word
  let count = 0
  for (const word of allWords) {
    const filename = `${word.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`
    const filepath = path.join(AUDIO_DIR, filename)

    // Check if already exists
    try {
      await fs.stat(filepath)
      console.log(`[${count}/${allWords.size}] ${word} ✓ (cached)`)
      count++
      continue
    } catch {
      // File doesn't exist, generate
    }

    try {
      const resp = await fetch(`${API_BASE}/api/tts/french`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word }),
      })

      if (!resp.ok) {
        console.error(`[${count}/${allWords.size}] ${word} ✗ (HTTP ${resp.status})`)
        count++
        continue
      }

      const buf = await resp.arrayBuffer()
      await fs.writeFile(filepath, Buffer.from(buf))
      console.log(`[${count}/${allWords.size}] ${word} ✓`)
    } catch (err) {
      console.error(`[${count}/${allWords.size}] ${word} ✗ (${err.message})`)
    }

    count++
    // Rate-limit: 5 req/sec
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`Audio generation complete! Files saved to ${AUDIO_DIR}`)
}

generateVocabAudio().catch(console.error)
```

Run once (or in CI/CD):
```bash
cd french-scorer-web
API_BASE_URL=https://your-api.com node scripts/generate-vocab-audio.mjs
```

#### Step 2: Update Lesson JSON Structure
Modify a1.json, a2.json, etc. to include audio URLs:

```json
{
  "units": [
    {
      "id": "a1-u1",
      "title": "Greetings",
      "vocabulary": [
        {
          "word": "bonjour",
          "translation": "hello",
          "example_sentence": "Bonjour, comment vas-tu?",
          "example_translation": "Hello, how are you?",
          "audio_url": "/audio/vocab/bonjour.mp3"
        },
        {
          "word": "bonsoir",
          "translation": "good evening",
          "example_sentence": "Bonsoir, ça va bien?",
          "example_translation": "Good evening, is everything well?",
          "audio_url": "/audio/vocab/bonsoir.mp3"
        }
      ]
    }
  ]
}
```

**Or** use a lookup generated from the build step:
```json
{
  "word": "bonjour",
  "translation": "hello",
  "audio_id": "bonjour"  // Client maps to /audio/vocab/{audio_id}.mp3
}
```

#### Step 3: Vocabulary Card Component with Audio Button
Update lesson vocabulary card UI (e.g., `expo-mobile/src/components/VocabularyCard.tsx`):

```typescript
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Volume2 } from 'lucide-react-native'
import { Audio } from 'expo-av'

interface VocabWord {
  word: string
  translation: string
  example_sentence: string
  example_translation: string
  audio_url?: string
  audio_id?: string
}

interface VocabularyCardProps {
  word: VocabWord
  onAudioPlay?: () => void
  onAudioEnd?: () => void
}

export function VocabularyCard({ word, onAudioPlay, onAudioEnd }: VocabularyCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null)

  const audioUrl = word.audio_url || (word.audio_id ? `/audio/vocab/${word.audio_id}.mp3` : null)

  async function playPronunciation() {
    if (!audioUrl) return

    try {
      setIsPlaying(true)
      onAudioPlay?.()

      // Unload previous sound
      if (audioSound) {
        await audioSound.unloadAsync()
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl })
      setAudioSound(sound)

      return new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish || status.isBuffering === false && status.durationMillis === status.positionMillis) {
            setIsPlaying(false)
            onAudioEnd?.()
            resolve()
          }
        })
        void sound.playAsync()
      })
    } catch (err) {
      console.error('Failed to play pronunciation:', err)
      setIsPlaying(false)
    }
  }

  return (
    <View className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
      {/* Word + Audio Button */}
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-900">{word.word}</Text>
        {audioUrl && (
          <Pressable
            onPress={playPronunciation}
            disabled={isPlaying}
            className={`rounded-full p-2 ${isPlaying ? 'bg-indigo-100' : 'bg-slate-100 hover:bg-indigo-50'}`}
            accessibilityLabel={`Pronounce ${word.word}`}
          >
            <Volume2 
              className={`h-5 w-5 ${isPlaying ? 'text-indigo-600' : 'text-slate-700'}`}
              strokeWidth={2}
            />
          </Pressable>
        )}
      </View>

      {/* Translation */}
      <Text className="mt-2 text-lg text-slate-600">{word.translation}</Text>

      {/* Example Sentence */}
      <View className="mt-4 border-l-4 border-indigo-200 bg-indigo-50 p-3">
        <Text className="text-sm italic text-slate-700">{word.example_sentence}</Text>
        <Text className="mt-1 text-xs text-slate-600">{word.example_translation}</Text>
      </View>
    </View>
  )
}
```

**Web version** (`french-scorer-web/src/components/VocabularyCard.tsx`):

```typescript
import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { stopFrenchWebTts, playFrenchWebTtsUrl } from '../lib/frenchWebTts'

interface VocabWord {
  word: string
  translation: string
  example_sentence: string
  example_translation: string
  audio_url?: string
  audio_id?: string
}

export function VocabularyCard({ word, onAudioPlay, onAudioEnd }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)

  const audioUrl = word.audio_url || (word.audio_id ? `/audio/vocab/${word.audio_id}.mp3` : null)

  async function playPronunciation() {
    if (!audioUrl) return

    try {
      setIsPlaying(true)
      onAudioPlay?.()
      
      const audio = new Audio(audioUrl)
      audio.onended = () => {
        setIsPlaying(false)
        onAudioEnd?.()
      }
      audio.onerror = () => {
        setIsPlaying(false)
      }
      await audio.play()
    } catch (err) {
      console.error('Failed to play pronunciation:', err)
      setIsPlaying(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Word + Audio Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{word.word}</h3>
        {audioUrl && (
          <button
            onClick={playPronunciation}
            disabled={isPlaying}
            className={`rounded-full p-2 transition ${
              isPlaying 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            aria-label={`Pronounce ${word.word}`}
          >
            <Volume2 className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Translation */}
      <p className="mt-2 text-lg text-slate-600">{word.translation}</p>

      {/* Example */}
      <div className="mt-4 border-l-4 border-indigo-200 bg-indigo-50 p-3">
        <p className="text-sm italic text-slate-700">{word.example_sentence}</p>
        <p className="mt-1 text-xs text-slate-600">{word.example_translation}</p>
      </div>
    </div>
  )
}
```

---

## Part 2: Sound Effects (Duolingo/Bussuu Style)

### Strategy
Duolingo/Bussuu use:
- **Success sound**: Bright, celebratory chime (200-400ms)
- **Error sound**: Short buzz or descending tone (100-200ms)
- **Unlock/level-up**: Ascending chime or fanfare
- **Streak/milestone**: Longer celebration (1-2s)

### Implementation

#### Step 1: Audio Assets
Create directory for sound effects:
```
french-scorer-web/
  public/
    sounds/
      success.mp3        (bright chime, ~300ms)
      error.mp3          (buzz, ~150ms)
      unlock.mp3         (ascending tone, ~400ms)
      streak.mp3         (fanfare, ~1s)
      levelup.mp3        (celebration, ~800ms)
```

**Where to get sounds**:
- **Free options**:
  - Freesound.org (download .wav, convert to .mp3)
  - Zapsplat.com (free SFX library)
  - Pixabay.com/sounds
- **Recommended** (similar to Duolingo):
  - Duolingo open-sources their assets (check their GitHub)
  - Logic Pro / GarageBand default sounds
  - Create using tone.js (programmatic synthesis)

#### Step 2: Sound Manager Service
Create `french-scorer-web/src/services/soundEffects.ts`:

```typescript
/**
 * Sound effects player — cache audio elements & manage playback
 */

export type SoundEffect = 'success' | 'error' | 'unlock' | 'levelup' | 'streak'

interface SoundMap {
  [key in SoundEffect]: {
    path: string
    volume?: number  // 0-1, default 0.7
    playbackRate?: number  // 0.5-2, default 1.0
  }
}

const SOUND_MANIFEST: SoundMap = {
  success: { path: '/sounds/success.mp3', volume: 0.8 },
  error: { path: '/sounds/error.mp3', volume: 0.6 },
  unlock: { path: '/sounds/unlock.mp3', volume: 0.9 },
  levelup: { path: '/sounds/levelup.mp3', volume: 1.0 },
  streak: { path: '/sounds/streak.mp3', volume: 0.85 },
}

// Cache audio elements
const audioCache = new Map<SoundEffect, HTMLAudioElement>()

export function playSoundEffect(effect: SoundEffect, options?: { volume?: number }): void {
  if (typeof window === 'undefined') return
  if (!SOUND_MANIFEST[effect]) return

  try {
    let audio = audioCache.get(effect)
    if (!audio) {
      audio = new Audio(SOUND_MANIFEST[effect].path)
      audio.volume = options?.volume ?? SOUND_MANIFEST[effect].volume ?? 0.7
      audioCache.set(effect, audio)
    }

    // Reset playback
    audio.currentTime = 0
    audio.volume = options?.volume ?? SOUND_MANIFEST[effect].volume ?? 0.7
    void audio.play().catch(() => {
      // Silently fail on permission errors (some browsers autoplay blocked)
    })
  } catch (err) {
    console.warn(`Failed to play sound effect "${effect}":`, err)
  }
}

export function stopSoundEffect(effect: SoundEffect): void {
  const audio = audioCache.get(effect)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function setSoundEffectVolume(effect: SoundEffect, volume: number): void {
  const audio = audioCache.get(effect)
  if (audio) {
    audio.volume = Math.max(0, Math.min(1, volume))
  }
}

export function setGlobalSoundVolume(volume: number): void {
  for (const audio of audioCache.values()) {
    audio.volume = Math.max(0, Math.min(1, volume))
  }
}
```

**Mobile version** (`expo-mobile/src/services/soundEffects.ts`):

```typescript
import { Audio } from 'expo-av'
import { Asset } from 'expo-asset'

export type SoundEffect = 'success' | 'error' | 'unlock' | 'levelup' | 'streak'

const SOUND_MANIFEST: Record<SoundEffect, string> = {
  success: require('../../../assets/sounds/success.mp3'),
  error: require('../../../assets/sounds/error.mp3'),
  unlock: require('../../../assets/sounds/unlock.mp3'),
  levelup: require('../../../assets/sounds/levelup.mp3'),
  streak: require('../../../assets/sounds/streak.mp3'),
}

interface CachedSound {
  sound: Audio.Sound
  volume: number
}

const soundCache = new Map<SoundEffect, CachedSound>()

export async function initSoundEffects(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  })

  // Pre-load sounds
  for (const [effect, source] of Object.entries(SOUND_MANIFEST)) {
    try {
      const { sound } = await Audio.Sound.createAsync(source)
      soundCache.set(effect as SoundEffect, { sound, volume: 0.7 })
    } catch (err) {
      console.warn(`Failed to load sound "${effect}":`, err)
    }
  }
}

export async function playSoundEffect(effect: SoundEffect, options?: { volume?: number }): Promise<void> {
  const cached = soundCache.get(effect)
  if (!cached) {
    console.warn(`Sound effect "${effect}" not loaded`)
    return
  }

  const { sound } = cached
  volume = options?.volume ?? cached.volume

  try {
    await sound.setVolumeAsync(volume)
    await sound.setPositionAsync(0)
    await sound.playAsync()
  } catch (err) {
    console.warn(`Failed to play sound effect "${effect}":`, err)
  }
}

export async function cleanup(): Promise<void> {
  for (const { sound } of soundCache.values()) {
    try {
      await sound.unloadAsync()
    } catch {
      /* ignore */
    }
  }
  soundCache.clear()
}
```

#### Step 3: Integration Points

**1. Conjugation Game (Phase 2 & 3)**
```typescript
import { playSoundEffect } from '../services/soundEffects'

// In answer validation:
if (isCorrect) {
  playSoundEffect('success')
  addXp(10)
  recordReview(true)
} else {
  playSoundEffect('error')
  addXp(2)
  recordReview(false)
}

// On completing all questions:
if (questionsCompleted) {
  playSoundEffect('unlock')
  advanceToNextPhase()
}
```

**2. Quiz Completion**
```typescript
// When user passes unit quiz (>80%):
if (score >= 80) {
  playSoundEffect('levelup')
  unlockNextUnit()
}
```

**3. Daily Streak**
```typescript
// When streak reaches milestone (7, 30, 100 days):
if (streakMilestone) {
  playSoundEffect('streak')
  showStreakBadge()
}
```

**4. VocabularyCard Component**
```typescript
// When audio pronunciation plays:
function playPronunciation() {
  playSoundEffect('unlock')  // Light notification
  startAudioPlayback()
}
```

#### Step 4: Settings & User Preferences
Add sound toggle to **AccountScreen**:

```typescript
import { useSettings } from '../contexts/SettingsContext'

export function AccountScreen() {
  const { soundEnabled, setSoundEnabled } = useSettings()

  return (
    <View>
      <Text>Sound Effects</Text>
      <Switch
        value={soundEnabled}
        onValueChange={(val) => {
          setSoundEnabled(val)
          if (val) {
            playSoundEffect('success')  // Preview
          }
        }}
      />
    </View>
  )
}
```

Add to settings context:
```typescript
export function useSettings() {
  return {
    soundEnabled: localStorage.getItem('setting:sound') !== 'false',
    setSoundEnabled: (enabled: boolean) => {
      localStorage.setItem('setting:sound', String(enabled))
    },
    soundVolume: Number(localStorage.getItem('setting:sound-volume') ?? '0.7'),
    setSoundVolume: (vol: number) => {
      localStorage.setItem('setting:sound-volume', String(vol))
      setGlobalSoundVolume(vol)
    },
  }
}
```

---

## Sound Effect Mapping (Recommended)

| Moment | Sound | Duration | When |
|--------|-------|----------|------|
| **Correct answer** | `success` | 300ms | Conjugation/quiz correct |
| **Wrong answer** | `error` | 150ms | Incorrect attempt |
| **Level/phase unlock** | `unlock` | 400ms | Advance to next phase |
| **Big milestone** | `levelup` | 800ms | Pass quiz, unlock unit |
| **Streak celebration** | `streak` | 1000ms | 7th, 30th, 100th day |
| **Pronunciation play** | Short chime | 100ms | Click audio button |

---

## Free Sound Sources

1. **Freesound.org** → Download → Convert to MP3:
   - "notification ding" / "correct" / "positive"
   - Search tags: duolingo-like, game-sound, notification

2. **Zapsplat**:
   - SFX_Correct_Answer.wav
   - SFX_Error_Buzz.wav
   - SFX_Achievement_Unlock.wav

3. **Pixabay Sounds**:
   - "positive ding"
   - "error buzz"
   - "level up fanfare"

4. **Duolingo's GitHub** (`github.com/duolingo/challenge-evaluator`):
   - Check for open-source assets

---

## Implementation Priority

### Phase 1 (Immediate)
- [ ] Generate vocab audio for A1/A2 verbs & common nouns
- [ ] Add audio_id to lesson JSON
- [ ] Implement VocabularyCard audio button (mobile + web)
- [ ] Add 3 essential sound effects: success, error, unlock

### Phase 2 (Week 2)
- [ ] Generate audio for all A1-B1 vocabulary
- [ ] Add volume control to settings
- [ ] Implement sound for all quiz interactions
- [ ] Test on both iOS & Android

### Phase 3 (Polish)
- [ ] Generate remaining C1 vocabulary
- [ ] Add streak/milestone sounds
- [ ] UX: sound preview in settings
- [ ] Analytics: track which sounds drive engagement

---

## Testing Checklist

**Pronunciation Audio**:
- [ ] Audio loads from CDN without blocking UI
- [ ] Multiple playbacks don't overlap (reset on play)
- [ ] Works offline (cached)
- [ ] Handles missing audio gracefully (hide button, no error)
- [ ] Mobile: audio pauses other playback (podcast, music)
- [ ] Web: respects browser autoplay policy

**Sound Effects**:
- [ ] Sound plays on correct answer
- [ ] Sound plays on error
- [ ] Sound plays on unlock
- [ ] Volume control works (0-100%)
- [ ] Can disable sound effects globally
- [ ] Mobile: respects device mute switch
- [ ] Web: respects browser autoplay policy

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│ Lesson / Quiz / Game (Component)                │
│ - VocabularyCard                                │
│ - ConjugationCard                               │
│ - QuizQuestion                                  │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ soundEffects.ts  │      │ frenchWebTts.ts  │
│ (SFX player)     │      │ (pronunciation)  │
└─────────┬────────┘      └────────┬─────────┘
          │                        │
          ▼                        ▼
  ┌───────────────────────────────────────┐
  │ Browser AudioContext / expo-av API    │
  └───────────────────────────────────────┘
          │                        │
    ┌─────▼──────┐           ┌────▼──────┐
    │ /sounds/   │           │ /audio/   │
    │ success.mp3│           │ vocab/    │
    │ error.mp3  │           │ bonjour.mp3
    │ unlock.mp3 │           │ ...       │
    └────────────┘           └───────────┘
```

---

## Done! 🎉

Once complete:
- ✅ Every vocabulary word has clickable pronunciation
- ✅ Correct answers trigger celebratory sounds
- ✅ Wrong answers get error chimes
- ✅ Milestones trigger fanfares
- ✅ Users can customize volume in settings
