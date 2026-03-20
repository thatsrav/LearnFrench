/**
 * Level-matched French words for "word of the day" (notifications + Home).
 * Deterministic pick per calendar day so the app and scheduled notifications stay in sync.
 */

export type StudyCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type WordOfDayEntry = { fr: string; en: string }

const A1: WordOfDayEntry[] = [
  { fr: 'bonjour', en: 'hello / good morning' },
  { fr: 'merci', en: 'thank you' },
  { fr: 's’il vous plaît', en: 'please' },
  { fr: 'au revoir', en: 'goodbye' },
  { fr: 'oui', en: 'yes' },
  { fr: 'non', en: 'no' },
  { fr: 'eau', en: 'water' },
  { fr: 'pain', en: 'bread' },
  { fr: 'maison', en: 'house' },
  { fr: 'famille', en: 'family' },
  { fr: 'ami', en: 'friend' },
  { fr: 'travail', en: 'work' },
  { fr: 'demain', en: 'tomorrow' },
  { fr: 'aujourd’hui', en: 'today' },
  { fr: 'maintenant', en: 'now' },
  { fr: 'beaucoup', en: 'a lot' },
  { fr: 'petit', en: 'small' },
  { fr: 'grand', en: 'big / tall' },
  { fr: 'heureux', en: 'happy' },
  { fr: 'fatigué', en: 'tired' },
  { fr: 'manger', en: 'to eat' },
  { fr: 'boire', en: 'to drink' },
  { fr: 'aller', en: 'to go' },
  { fr: 'venir', en: 'to come' },
  { fr: 'acheter', en: 'to buy' },
  { fr: 'payer', en: 'to pay' },
  { fr: 'porte', en: 'door' },
  { fr: 'fenêtre', en: 'window' },
  { fr: 'rue', en: 'street' },
  { fr: 'ville', en: 'city' },
]

const A2: WordOfDayEntry[] = [
  { fr: 'rendez-vous', en: 'appointment' },
  { fr: 'quartier', en: 'neighbourhood' },
  { fr: 'billet', en: 'ticket' },
  { fr: 'retard', en: 'delay / lateness' },
  { fr: 'à l’heure', en: 'on time' },
  { fr: 'plaire', en: 'to please / to like' },
  { fr: 'décider', en: 'to decide' },
  { fr: 'préparer', en: 'to prepare' },
  { fr: 'oublier', en: 'to forget' },
  { fr: 'se souvenir', en: 'to remember' },
  { fr: 'emprunter', en: 'to borrow' },
  { fr: 'prêter', en: 'to lend' },
  { fr: 'panne', en: 'breakdown' },
  { fr: 'consigne', en: 'left-luggage / instructions' },
  { fr: 'horaire', en: 'timetable / schedule' },
  { fr: 'embouteillage', en: 'traffic jam' },
  { fr: 'voisin', en: 'neighbour' },
  { fr: 'colis', en: 'parcel' },
  { fr: 'remplir', en: 'to fill in' },
  { fr: 'signer', en: 'to sign' },
  { fr: 'interdit', en: 'forbidden' },
  { fr: 'autorisé', en: 'allowed' },
  { fr: 'danger', en: 'danger' },
  { fr: 'secours', en: 'help / rescue' },
  { fr: 'pharmacie', en: 'pharmacy' },
  { fr: 'ordonnance', en: 'prescription' },
  { fr: 'malade', en: 'sick' },
  { fr: 'douleur', en: 'pain' },
  { fr: 'repos', en: 'rest' },
  { fr: 'vacances', en: 'holiday' },
]

const B1: WordOfDayEntry[] = [
  { fr: 'cependant', en: 'however' },
  { fr: 'pourtant', en: 'yet / nevertheless' },
  { fr: 'd’ailleurs', en: 'besides / by the way' },
  { fr: 'néanmoins', en: 'nevertheless' },
  { fr: 'améliorer', en: 'to improve' },
  { fr: 'réussir', en: 'to succeed' },
  { fr: 'échouer', en: 'to fail' },
  { fr: 'objectif', en: 'goal' },
  { fr: 'étape', en: 'step' },
  { fr: 'enquête', en: 'survey / investigation' },
  { fr: 'sondage', en: 'poll' },
  { fr: 'environnement', en: 'environment' },
  { fr: 'développement durable', en: 'sustainable development' },
  { fr: 'emploi', en: 'job / employment' },
  { fr: 'formation', en: 'training' },
  { fr: 'expérience', en: 'experience' },
  { fr: 'compétence', en: 'skill' },
  { fr: 'négocier', en: 'to negotiate' },
  { fr: 'contrainte', en: 'constraint' },
  { fr: 'solution', en: 'solution' },
  { fr: 'réunion', en: 'meeting' },
  { fr: 'compte rendu', en: 'report' },
  { fr: 'fournisseur', en: 'supplier' },
  { fr: 'client', en: 'client' },
  { fr: 'facture', en: 'invoice' },
  { fr: 'échéance', en: 'deadline / due date' },
  { fr: 'prévoir', en: 'to plan ahead' },
  { fr: 'report', en: 'postponement' },
  { fr: 'priorité', en: 'priority' },
  { fr: 'charge de travail', en: 'workload' },
]

const B2: WordOfDayEntry[] = [
  { fr: 'nuancer', en: 'to qualify / add nuance' },
  { fr: 'synthèse', en: 'summary / synthesis' },
  { fr: 'argumenter', en: 'to argue (logically)' },
  { fr: 'contredit', en: 'contradicted' },
  { fr: 'présupposer', en: 'to presuppose' },
  { fr: 'implicite', en: 'implicit' },
  { fr: 'explicite', en: 'explicit' },
  { fr: 'pertinent', en: 'relevant' },
  { fr: 'superflu', en: 'superfluous' },
  { fr: 'cohérence', en: 'coherence' },
  { fr: 'paradoxe', en: 'paradox' },
  { fr: 'enjeu', en: 'stake / issue' },
  { fr: 'recommandation', en: 'recommendation' },
  { fr: 'mise en œuvre', en: 'implementation' },
  { fr: 'cadre juridique', en: 'legal framework' },
  { fr: 'tendance', en: 'trend' },
  { fr: 'perspective', en: 'perspective / outlook' },
  { fr: 'à court terme', en: 'short-term' },
  { fr: 'à long terme', en: 'long-term' },
  { fr: 'pragmatique', en: 'pragmatic' },
  { fr: 'critique (adj.)', en: 'critical / crucial' },
  { fr: 'lucide', en: 'clear-sighted' },
  { fr: 'aléas', en: 'uncertainties / hazards' },
  { fr: 'précaution', en: 'precaution' },
  { fr: 'méfiance', en: 'distrust' },
  { fr: 'consensus', en: 'consensus' },
  { fr: 'dissensus', en: 'disagreement' },
  { fr: 'légitimité', en: 'legitimacy' },
  { fr: 'transparence', en: 'transparency' },
  { fr: 'redevabilité', en: 'accountability' },
]

const C1: WordOfDayEntry[] = [
  { fr: 'acuité', en: 'sharpness / acuity' },
  { fr: 'subtilité', en: 'subtlety' },
  { fr: 'présager', en: 'to foreshadow / portend' },
  { fr: 'préjugé', en: 'prejudice' },
  { fr: 'préconçu', en: 'preconceived' },
  { fr: 'désamorcer', en: 'to defuse' },
  { fr: 'atténuer', en: 'to mitigate' },
  { fr: 'exacerber', en: 'to exacerbate' },
  { fr: 'déployer', en: 'to deploy / unfold' },
  { fr: 'surgir', en: 'to arise suddenly' },
  { fr: 'sous-jacent', en: 'underlying' },
  { fr: 'préalable', en: 'prerequisite' },
  { fr: 'corollaire', en: 'corollary' },
  { fr: 'prémisse', en: 'premise' },
  { fr: 'déduction', en: 'deduction' },
  { fr: 'induction', en: 'induction' },
  { fr: 'éluder', en: 'to evade' },
  { fr: 'élucider', en: 'to elucidate' },
  { fr: 'élaborer', en: 'to elaborate / develop' },
  { fr: 'prééminence', en: 'pre-eminence' },
  { fr: 'prépondérant', en: 'predominant' },
  { fr: 'irréfragable', en: 'irrefutable' },
  { fr: 'spécieux', en: 'specious' },
  { fr: 'fallacieux', en: 'fallacious' },
  { fr: 'sophisme', en: 'sophism' },
  { fr: 'dialectique', en: 'dialectic' },
  { fr: 'herméneutique', en: 'hermeneutics' },
  { fr: 'prolégomènes', en: 'preliminary remarks' },
  { fr: 'déconstruction', en: 'deconstruction' },
  { fr: 'aporie', en: 'aporia (logical impasse)' },
]

const BANK: Record<Exclude<StudyCefrLevel, 'C2'>, WordOfDayEntry[]> = {
  A1,
  A2,
  B1,
  B2,
  C1,
}

function poolForLevel(level: StudyCefrLevel): WordOfDayEntry[] {
  if (level === 'C2') return BANK.C1
  return BANK[level] ?? BANK.A1
}

/** C2 shares C1 vocabulary but rotates with a different offset for variety. */
function indexSalt(level: StudyCefrLevel): number {
  return level === 'C2' ? 17 : 0
}

function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Stable index from calendar date (local timezone). */
function dayIndex(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export function getWordOfTheDayForDate(level: StudyCefrLevel, date: Date): WordOfDayEntry {
  const pool = poolForLevel(level)
  const idx = (date.getFullYear() * 367 + dayIndex(date) + indexSalt(level)) % pool.length
  return pool[idx]!
}

export function formatWordOfDayNotificationBody(level: StudyCefrLevel, date: Date): { title: string; body: string } {
  const w = getWordOfTheDayForDate(level, date)
  return {
    title: `Mot du jour · ${level}`,
    body: `${w.fr} — ${w.en}`,
  }
}

export { dayKey }
