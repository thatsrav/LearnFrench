import type { StudyCefrLevel } from '../content/wordOfTheDay'

/** Extra practice words by level (short list) — complements “word of the day”. */
export function getDailyVocab(levelLabel: string | StudyCefrLevel): string[] {
  const cecr = typeof levelLabel === 'string' ? levelLabel.toUpperCase() : levelLabel
  if (cecr.startsWith('A')) return ['bonjour', 'merci', 'demain']
  if (cecr.startsWith('B')) return ['cependant', 'améliorer', 'quotidiennement']
  if (cecr.startsWith('C')) return ['nuancer', 'pertinent', 'cohérence']
  return ['mot', 'phrase', 'conversation']
}
