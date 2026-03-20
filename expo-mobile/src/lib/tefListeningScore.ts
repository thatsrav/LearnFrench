/** Heuristic CEFR band from listening % (practice, not official TEF mapping). */
export function cefrFromListeningPercent(percent: number): string {
  if (percent >= 92) return 'C1'
  if (percent >= 83) return 'B2'
  if (percent >= 72) return 'B1'
  if (percent >= 58) return 'A2'
  return 'A1'
}

export function listeningStrengthMessage(percent: number): string {
  if (percent >= 92) return 'Excellente compréhension orale'
  if (percent >= 83) return 'Très bonne compréhension orale'
  if (percent >= 72) return 'Bonne compréhension orale'
  if (percent >= 58) return 'Compréhension orale à consolider'
  return 'Compréhension orale à renforcer'
}

/** Short English line for score breakdown UI */
export function listeningStrengthMessageEn(percent: number): string {
  if (percent >= 92) return 'Outstanding listening comprehension'
  if (percent >= 83) return 'Strong listening comprehension'
  if (percent >= 72) return 'Solid listening comprehension'
  if (percent >= 58) return 'Listening comprehension needs work'
  return 'Keep practicing listening'
}

export function listeningWeakAreasHint(percent: number): string | null {
  if (percent >= 80) return null
  return "Moins de 80 % : révisez les consignes détaillées, les chiffres et les paraphrases — pratiquez encore avec le syllabus « Daily Routine » et « Past Events »."
}
