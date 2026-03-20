export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type UnitStatus = 'locked' | 'available' | 'completed'

export type QuizQuestion = {
  question: string
  options: string[]
  answerIndex: number
}

export type UnitLesson = {
  id: string
  level: CEFRLevel
  title: string
  orderIndex: number
  grammarRuleText: string
  vocabList: string[]
  quiz: QuizQuestion[]
}

export type SyllabusRow = UnitLesson & {
  status: UnitStatus
  score: number
}

type ProgressMap = Record<string, { status: UnitStatus; score: number }>

const PROGRESS_KEY = 'french_syllabus_progress_v1'

export const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export const UNITS: UnitLesson[] = [
  {
    id: 'a1-u1',
    level: 'A1',
    title: 'Greetings and Introductions',
    orderIndex: 1,
    grammarRuleText:
      "Use 'bonjour', 'salut', and introduce yourself with 'je m'appelle'. Present tense of etre: je suis, tu es, il/elle est.",
    vocabList: ['bonjour', 'salut', 'au revoir', 'merci', 'je', 'tu', 'suis', 'es', 'ami', 'famille'],
    quiz: [
      { question: "How do you say 'I am'?", options: ['je es', 'je suis', 'je est', 'je sommes'], answerIndex: 1 },
      { question: "Pick a daytime greeting.", options: ['bonjour', 'bonne nuit', 'pardon', 'de rien'], answerIndex: 0 },
      { question: "Fill in: Tu ___ etudiant.", options: ['es', 'suis', 'est', 'sommes'], answerIndex: 0 },
      { question: "How do you politely thank someone?", options: ['salut', 'merci', 'oui', 'non'], answerIndex: 1 },
      { question: "Which pronoun is 'she'?", options: ['il', 'nous', 'elle', 'vous'], answerIndex: 2 },
    ],
  },
  {
    id: 'a1-u2',
    level: 'A1',
    title: 'Articles in Daily Objects',
    orderIndex: 2,
    grammarRuleText:
      "Use definite (le, la, les) and indefinite (un, une, des) articles with common nouns in daily life.",
    vocabList: ['le', 'la', 'les', 'un', 'une', 'des', 'table', 'livre', 'chaise', 'porte'],
    quiz: [
      { question: 'Choose correct article: ___ table', options: ['le', 'la', 'les', 'un'], answerIndex: 1 },
      { question: 'Choose correct article: ___ livre', options: ['une', 'la', 'le', 'des'], answerIndex: 2 },
      { question: "Plural definite article is:", options: ['des', 'les', 'une', 'du'], answerIndex: 1 },
      { question: "Say 'a chair':", options: ['le chaise', 'une chaise', 'la chaise', 'des chaise'], answerIndex: 1 },
      { question: "Say 'some books':", options: ['des livres', 'les livre', 'un livres', 'du livre'], answerIndex: 0 },
    ],
  },
  {
    id: 'a1-u3',
    level: 'A1',
    title: 'Present Tense -ER Verbs',
    orderIndex: 3,
    grammarRuleText:
      'Regular -ER verbs in present: -e, -es, -e, -ons, -ez, -ent. Example verbs: parler, aimer, habiter.',
    vocabList: ['parler', 'aimer', 'habiter', 'travailler', 'etudier', 'matin', 'soir', 'jour', 'heure', 'ecole'],
    quiz: [
      { question: "Nous ___ francais. (parler)", options: ['parle', 'parlons', 'parlez', 'parlent'], answerIndex: 1 },
      { question: "Vous ___ ici. (habiter)", options: ['habitez', 'habitons', 'habites', 'habite'], answerIndex: 0 },
      { question: "Tu ___ la musique. (aimer)", options: ['aime', 'aimes', 'aimons', 'aimez'], answerIndex: 1 },
      { question: "Ils ___ le soir. (travailler)", options: ['travaille', 'travaillez', 'travaillons', 'travaillent'], answerIndex: 3 },
      { question: "Je ___ au cafe. (etudier)", options: ['etudie', 'etudies', 'etudions', 'etudiez'], answerIndex: 0 },
    ],
  },
  {
    id: 'a1-u4',
    level: 'A1',
    title: 'Avoir and Basic Needs',
    orderIndex: 4,
    grammarRuleText:
      "Present tense of avoir: j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont. Use: avoir faim, avoir soif.",
    vocabList: ['avoir', 'ai', 'as', 'a', 'avons', 'avez', 'ont', 'faim', 'soif', 'eau'],
    quiz: [
      { question: "Conjugate with je:", options: ['je as', "j'ai", 'je a', 'je avons'], answerIndex: 1 },
      { question: "Nous ___ faim.", options: ['sommes', 'avons', 'avez', 'ont'], answerIndex: 1 },
      { question: "Vous ___ soif.", options: ['as', 'a', 'avez', 'ont'], answerIndex: 2 },
      { question: "Elle ___ 18 ans.", options: ['est', 'a', 'as', 'ont'], answerIndex: 1 },
      { question: "Ils ___ faim.", options: ['a', 'as', 'ont', 'avez'], answerIndex: 2 },
    ],
  },
  {
    id: 'a1-u5',
    level: 'A1',
    title: 'Questions and Negation',
    orderIndex: 5,
    grammarRuleText:
      "Negation uses ne ... pas around the verb. Ask questions with intonation or 'est-ce que'.",
    vocabList: ['ne', 'pas', 'qui', 'quoi', 'ou', 'quand', 'comment', 'pourquoi', 'ici', 'la'],
    quiz: [
      { question: "Negate: Je parle.", options: ['Je ne parle pas.', 'Je parle ne pas.', 'Je pas parle.', 'Je ne pas parle.'], answerIndex: 0 },
      { question: "Correct question form?", options: ['Est-ce que tu viens ?', 'Tu est-ce viens ?', 'Est que tu viens ?', 'Tu viens est-ce ?'], answerIndex: 0 },
      { question: "Word for 'where'?", options: ['qui', 'quoi', 'ou', 'quand'], answerIndex: 2 },
      { question: "Fill: Il ___ mange pas.", options: ['pas', 'ne', 'est', 'a'], answerIndex: 1 },
      { question: "Word for 'why'?", options: ['comment', 'pourquoi', 'quand', 'combien'], answerIndex: 1 },
    ],
  },
  {
    id: 'a2-u1',
    level: 'A2',
    title: 'Daily Work and Study',
    orderIndex: 1,
    grammarRuleText: 'Use present tense confidently in work/study contexts and connect ideas with ensuite, puis, finalement.',
    vocabList: ['bureau', 'metier', 'collegue', 'cours', 'universite', 'projet', 'reunion', 'devoir', 'examen', 'resultat'],
    quiz: [
      { question: "Best word for 'first'?", options: ['ensuite', "d'abord", 'puis', 'finalement'], answerIndex: 1 },
      { question: "Correct sentence?", options: ['Je travaille au bureau.', 'Je travailles au bureau.', 'Je travail au bureau.', 'Je travaillons au bureau.'], answerIndex: 0 },
      { question: "Meaning of 'devoir'?", options: ['holiday', 'homework', 'office', 'meeting'], answerIndex: 1 },
      { question: "Pick connector for next step.", options: ['puis', 'mais', 'car', 'ou'], answerIndex: 0 },
      { question: "Meaning of 'resultat'?", options: ['result', 'reason', 'route', 'room'], answerIndex: 0 },
    ],
  },
  {
    id: 'a2-u2',
    level: 'A2',
    title: 'Food Quantities and Partitives',
    orderIndex: 2,
    grammarRuleText:
      "Use du, de la, de l', des for food quantities. After negation, use de.",
    vocabList: ['du', 'de la', "de l", 'des', 'pain', 'eau', 'riz', 'pates', 'sucre', 'sel'],
    quiz: [
      { question: "Je prends ___ pain.", options: ['du', 'de la', 'des', 'de'], answerIndex: 0 },
      { question: "Je ne bois pas ___ cafe.", options: ['du', 'de', 'des', 'de la'], answerIndex: 1 },
      { question: "Correct for feminine singular: ___ salade", options: ['du', 'de la', 'des', 'de'], answerIndex: 1 },
      { question: "A bottle of water?", options: ["une bouteille d'eau", "un kilo d'eau", "un paquet d'eau", "une tranche d'eau"], answerIndex: 0 },
      { question: "1000 grams is:", options: ['litre', 'kilo', 'portion', 'boite'], answerIndex: 1 },
    ],
  },
  {
    id: 'a2-u3',
    level: 'A2',
    title: 'Reflexive Daily Routines',
    orderIndex: 3,
    grammarRuleText:
      'Reflexive verbs: se lever, se laver, se preparer. Pronouns: me, te, se, nous, vous, se.',
    vocabList: ['se lever', 'se coucher', 'se laver', 'se preparer', 'reveil', 'matin', 'soir', 'savon', 'vetement', 'trajet'],
    quiz: [
      { question: "Nous ___ levons a 7h.", options: ['me', 'te', 'nous', 'vous'], answerIndex: 2 },
      { question: "Correct sentence?", options: ['Je me douche le matin.', 'Je douche me le matin.', 'Je me douches le matin.', 'Je douche le matin me.'], answerIndex: 0 },
      { question: "Negative form correct?", options: ['Tu ne te couches pas tard.', 'Tu te ne couches pas tard.', 'Tu ne couches te pas tard.', 'Tu ne te couche pas tard.'], answerIndex: 0 },
      { question: "Pronoun with vous?", options: ['me', 'te', 'se', 'vous'], answerIndex: 3 },
      { question: "Meaning of reveil?", options: ['alarm clock', 'soap', 'mirror', 'station'], answerIndex: 0 },
    ],
  },
  {
    id: 'a2-u4',
    level: 'A2',
    title: 'Future Proche and Plans',
    orderIndex: 4,
    grammarRuleText:
      "Near future uses aller + infinitive: je vais partir. Use direct object pronouns: le, la, les.",
    vocabList: ['aller', 'vais', 'vas', 'va', 'allons', 'allez', 'vont', 'demain', 'semaine', 'vacances'],
    quiz: [
      { question: "Je ___ visiter Paris.", options: ['vais', 'va', 'allons', 'vont'], answerIndex: 0 },
      { question: "Replace object: Je vois Marie.", options: ['Je la vois.', 'Je vois la.', 'Je le vois.', 'Je vois lui.'], answerIndex: 0 },
      { question: "Correct with nous?", options: ['Nous allons partir demain.', 'Nous allez partir demain.', 'Nous va partir demain.', 'Nous vont partir demain.'], answerIndex: 0 },
      { question: "Replace object: Tu prends les billets.", options: ['Tu les prends.', 'Tu prends les.', 'Tu le prends.', 'Tu en prends.'], answerIndex: 0 },
      { question: "Next week in French?", options: ['ce soir', 'la semaine prochaine', 'demain matin', 'hier'], answerIndex: 1 },
    ],
  },
  {
    id: 'a2-u5',
    level: 'A2',
    title: 'Comparisons and Opinions',
    orderIndex: 5,
    grammarRuleText:
      "Compare with plus/moins/aussi ... que. Give reasons with parce que, donc, mais.",
    vocabList: ['plus', 'moins', 'aussi', 'parce que', 'donc', 'mais', 'choix', 'avis', 'difference', 'decision'],
    quiz: [
      { question: "Ce cafe est ___ cher que l'autre.", options: ['plus', 'aussi', 'moins', 'tres'], answerIndex: 0 },
      { question: "Cette option est ___ pratique que celle-la.", options: ['moins', 'aussi', 'plus', 'mieux'], answerIndex: 1 },
      { question: "Connector for reason?", options: ['donc', 'parce que', 'alors', 'ensuite'], answerIndex: 1 },
      { question: "Cheaper in French?", options: ['plus cher', 'moins cher', 'aussi cher', 'tres cher'], answerIndex: 1 },
      { question: "Connector for consequence?", options: ['mais', 'parce que', 'donc', 'si'], answerIndex: 2 },
    ],
  },
]

function defaultProgress(): ProgressMap {
  const map: ProgressMap = {}
  for (const u of UNITS) {
    map[u.id] = { status: 'locked', score: 0 }
  }
  map['a1-u1'] = { status: 'available', score: 0 }
  return map
}

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as ProgressMap
    return { ...defaultProgress(), ...parsed }
  } catch {
    return defaultProgress()
  }
}

function saveProgress(progress: ProgressMap) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function getSyllabusData(): SyllabusRow[] {
  const progress = loadProgress()
  return UNITS.map((u) => ({
    ...u,
    status: progress[u.id]?.status ?? 'locked',
    score: progress[u.id]?.score ?? 0,
  })).sort((a, b) => {
    const lv = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
    return lv !== 0 ? lv : a.orderIndex - b.orderIndex
  })
}

export function unlockNextUnit(currentUnitId: string, score: number): { completed: boolean; unlockedUnitId: string | null } {
  if (score < 80) return { completed: false, unlockedUnitId: null }

  const progress = loadProgress()
  if (!progress[currentUnitId]) return { completed: false, unlockedUnitId: null }
  progress[currentUnitId] = { status: 'completed', score }

  const current = UNITS.find((u) => u.id === currentUnitId)
  if (!current) {
    saveProgress(progress)
    return { completed: true, unlockedUnitId: null }
  }

  let next =
    UNITS.filter((u) => u.level === current.level && u.orderIndex > current.orderIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex)[0] ?? null

  if (!next) {
    const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(current.level) + 1]
    if (nextLevel) {
      next =
        UNITS.filter((u) => u.level === nextLevel)
          .sort((a, b) => a.orderIndex - b.orderIndex)[0] ?? null
    }
  }

  if (next && progress[next.id]?.status === 'locked') {
    progress[next.id] = { status: 'available', score: 0 }
  }

  saveProgress(progress)
  return { completed: true, unlockedUnitId: next?.id ?? null }
}

export function getUnitById(unitId: string): UnitLesson | null {
  return UNITS.find((u) => u.id === unitId) ?? null
}

/** Merge remote unit rows into localStorage progress (Supabase sync). */
export function mergeRemoteUnitProgress(
  rows: { unit_id: string; status: UnitStatus; score: number }[],
): void {
  const progress = loadProgress()
  for (const r of rows) {
    progress[r.unit_id] = { status: r.status, score: r.score }
  }
  saveProgress(progress)
}

/** Serialize current progress for cloud upload. */
export function getAllProgressRows(): { unit_id: string; status: UnitStatus; score: number }[] {
  const progress = loadProgress()
  return Object.entries(progress).map(([unit_id, v]) => ({
    unit_id,
    status: v.status,
    score: v.score,
  }))
}

