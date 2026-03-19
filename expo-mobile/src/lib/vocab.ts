/** Three daily words by rough CEFR bucket — mirrors web `getDailyVocab`. */
export function getDailyVocab(levelLabel: string): string[] {
  const cecr = levelLabel.toUpperCase()
  if (cecr.startsWith('A')) return ['bonjour', 'merci', 'demain']
  if (cecr.startsWith('B')) return ['cependant', 'améliorer', 'quotidiennement']
  if (cecr.startsWith('C')) return ['nuancer', 'pertinent', 'cohérence']
  return ['mot', 'phrase', 'conversation']
}
