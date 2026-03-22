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

/** A1 units use the rich lesson JSON on web (`RichLessonFlow`); legacy quiz fields stay empty. */
export const UNITS: UnitLesson[] = [
  {
    id: 'a1-u1',
    level: 'A1',
    title: 'Greetings & Meeting People',
    orderIndex: 1,
    grammarRuleText: 'Guided lesson: greetings, introductions, and meeting people.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u2',
    level: 'A1',
    title: 'Numbers & Telling Time',
    orderIndex: 2,
    grammarRuleText: 'Guided lesson: numbers, clock time, and simple scheduling phrases.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u3',
    level: 'A1',
    title: 'Family Members',
    orderIndex: 3,
    grammarRuleText: 'Guided lesson: family vocabulary and talking about relatives.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u4',
    level: 'A1',
    title: 'Food & Ordering at a Café',
    orderIndex: 4,
    grammarRuleText: 'Guided lesson: food, drinks, and ordering politely at a café.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u5',
    level: 'A1',
    title: 'Colors & Clothes Shopping',
    orderIndex: 5,
    grammarRuleText: 'Guided lesson: colors, clothes, and basic shopping phrases.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u6',
    level: 'A1',
    title: 'Home & Describing Rooms',
    orderIndex: 6,
    grammarRuleText: 'Guided lesson: rooms, furniture, and describing where things are.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u7',
    level: 'A1',
    title: 'Daily Routine & Regular Verbs',
    orderIndex: 7,
    grammarRuleText: 'Guided lesson: daily routine and present-tense regular verbs.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u8',
    level: 'A1',
    title: 'Transport & Directions',
    orderIndex: 8,
    grammarRuleText: 'Guided lesson: transport, directions, and getting around.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u9',
    level: 'A1',
    title: 'Weather & Seasons',
    orderIndex: 9,
    grammarRuleText: 'Guided lesson: weather, seasons, and simple forecasts.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a1-u10',
    level: 'A1',
    title: 'Hobbies & Free Time',
    orderIndex: 10,
    grammarRuleText: 'Guided lesson: hobbies, free time, and leisure vocabulary.',
    vocabList: [],
    quiz: [],
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

