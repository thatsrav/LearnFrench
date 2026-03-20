/**
 * Helper: paste { fr, en }[] → JSON sentences with start/end for Reading Room mock audio.
 * Usage: node scripts/storyTimings.mjs < story-input.json
 * Or import buildSentences from logic below (inline in Node REPL).
 */
export function buildSentences(pairs, secPerWord = 0.48) {
  let t = 0
  return pairs.map(({ fr, en }) => {
    const w = fr.trim().split(/\s+/).filter(Boolean).length
    const dur = Math.max(2.3, w * secPerWord)
    const start = t
    t += dur
    return {
      fr,
      en,
      start: Math.round(start * 10) / 10,
      end: Math.round(t * 10) / 10,
    }
  })
}

export function countWordsFr(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}
