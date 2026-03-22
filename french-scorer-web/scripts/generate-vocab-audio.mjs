/**
 * Pre-generate syllabus vocabulary MP3s via french-scorer-api (POST /api/tts/french).
 *
 * Run from french-scorer-web:
 *   API_BASE_URL=http://localhost:8787 node scripts/generate-vocab-audio.mjs
 *
 * Output: public/audio/vocab/{audio_key}.mp3
 */

import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')
const SYLLABUS_DIR = join(WEB_ROOT, 'src/content/syllabus')
const AUDIO_DIR = join(WEB_ROOT, 'public/audio/vocab')

const API_BASE = (process.env.API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '')

async function collectJobs() {
  /** @type {Map<string, string>} */
  const byKey = new Map()
  const files = await readdir(SYLLABUS_DIR)
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const raw = await readFile(join(SYLLABUS_DIR, f), 'utf8')
    const data = JSON.parse(raw)
    const steps = data.steps ?? []
    for (const step of steps) {
      if (step?.type !== 'vocab_intro' || !Array.isArray(step.cards)) continue
      for (const card of step.cards) {
        const key = card.audio_key?.trim()
        if (!key) continue
        const phrase = String(card.word || '')
          .replace(/\s*·\s*/g, ', ')
          .trim()
        if (!phrase) continue
        if (!byKey.has(key)) byKey.set(key, phrase)
      }
    }
  }
  return byKey
}

async function main() {
  const jobs = await collectJobs()
  console.log(`Found ${jobs.size} unique audio_key entries under src/content/syllabus.`)

  await mkdir(AUDIO_DIR, { recursive: true })

  let i = 0
  for (const [audioKey, text] of jobs) {
    i++
    const safe = audioKey.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filepath = join(AUDIO_DIR, `${safe}.mp3`)

    try {
      await stat(filepath)
      console.log(`[${i}/${jobs.size}] ${audioKey} ✓ (exists)`)
      continue
    } catch {
      /* generate */
    }

    try {
      const resp = await fetch(`${API_BASE}/api/tts/french`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!resp.ok) {
        const err = await resp.text().catch(() => '')
        console.error(`[${i}/${jobs.size}] ${audioKey} ✗ HTTP ${resp.status} ${err}`)
        continue
      }
      const buf = Buffer.from(await resp.arrayBuffer())
      await writeFile(filepath, buf)
      console.log(`[${i}/${jobs.size}] ${audioKey} ✓ wrote ${safe}.mp3`)
    } catch (e) {
      console.error(`[${i}/${jobs.size}] ${audioKey} ✗`, e instanceof Error ? e.message : e)
    }

    await new Promise((r) => setTimeout(r, 220))
  }

  console.log(`Done. Files in ${AUDIO_DIR}`)
}

main().catch(console.error)
