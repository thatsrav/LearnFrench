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

/** A1–B2 units use rich lesson JSON on web (`RichLessonFlow`); legacy quiz fields stay empty. */
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
    grammarRuleText: 'Guided lesson: work and study routines, sequence words, and professional vocabulary.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a2-u2',
    level: 'A2',
    title: 'Food Quantities and Partitives',
    orderIndex: 2,
    grammarRuleText: 'Guided lesson: partitives, shopping, and quantities at the market or grocery.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a2-u3',
    level: 'A2',
    title: 'Reflexive Daily Routines',
    orderIndex: 3,
    grammarRuleText: 'Guided lesson: reflexive verbs for morning and evening routines.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a2-u4',
    level: 'A2',
    title: 'Future Proche and Plans',
    orderIndex: 4,
    grammarRuleText: 'Guided lesson: near future (aller + infinitive) and object pronouns in plans.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'a2-u5',
    level: 'A2',
    title: 'Comparisons and Opinions',
    orderIndex: 5,
    grammarRuleText: 'Guided lesson: comparisons (plus/moins/aussi … que) and giving reasons.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u1',
    level: 'B1',
    title: 'Airports and Stations',
    orderIndex: 1,
    grammarRuleText: 'Guided lesson: airports, stations, boarding, and delays in Canadian French contexts.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u2',
    level: 'B1',
    title: 'Buying Tickets',
    orderIndex: 2,
    grammarRuleText: 'Guided lesson: ticket types, prices, and buying at the counter or online.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u3',
    level: 'B1',
    title: 'Asking for Directions',
    orderIndex: 3,
    grammarRuleText: 'Guided lesson: directions, métro/STM vocabulary, and polite requests.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u4',
    level: 'B1',
    title: 'Hotel Check-in',
    orderIndex: 4,
    grammarRuleText: 'Guided lesson: hotel check-in, room issues, and useful phrases at the desk.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u5',
    level: 'B1',
    title: 'Transport Types',
    orderIndex: 5,
    grammarRuleText: 'Guided lesson: comparing train, bus, métro, and car travel.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u6',
    level: 'B1',
    title: 'Travel Problems',
    orderIndex: 6,
    grammarRuleText: 'Guided lesson: cancellations, refunds, and rebooking when plans go wrong.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u7',
    level: 'B1',
    title: 'Describing a Trip',
    orderIndex: 7,
    grammarRuleText: 'Guided lesson: short travel narratives with passé composé.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u8',
    level: 'B1',
    title: 'Future Travel Plans',
    orderIndex: 8,
    grammarRuleText: 'Guided lesson: future plans and projects with aller + infinitive and time phrases.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u9',
    level: 'B1',
    title: 'Sustainable Tourism',
    orderIndex: 9,
    grammarRuleText: 'Guided lesson: eco-travel vocabulary and expressing opinions about tourism.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u10',
    level: 'B1',
    title: 'Unit 5 Review & Practice',
    orderIndex: 10,
    grammarRuleText: 'Capstone: mixed travel scenarios — directions, tickets, hotels, and problems.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u11',
    level: 'B1',
    title: 'Passé Composé Formation',
    orderIndex: 11,
    grammarRuleText: 'Guided lesson: forming passé composé with avoir and être.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u12',
    level: 'B1',
    title: 'Common Irregular Participles',
    orderIndex: 12,
    grammarRuleText: 'Guided lesson: frequent irregular past participles and agreement basics.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u13',
    level: 'B1',
    title: 'Imparfait Introduction',
    orderIndex: 13,
    grammarRuleText: 'Guided lesson: forming and using imparfait for description and habit.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u14',
    level: 'B1',
    title: 'PC vs Imparfait',
    orderIndex: 14,
    grammarRuleText: 'Guided lesson: choosing passé composé vs imparfait in narratives.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u15',
    level: 'B1',
    title: 'Telling a Story',
    orderIndex: 15,
    grammarRuleText: 'Guided lesson: story structure, connectors, and past tenses together.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u16',
    level: 'B1',
    title: 'Childhood Memories',
    orderIndex: 16,
    grammarRuleText: 'Guided lesson: childhood and background with imparfait.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u17',
    level: 'B1',
    title: 'News and Past Events',
    orderIndex: 17,
    grammarRuleText: 'Guided lesson: short news-style past events and time expressions.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u18',
    level: 'B1',
    title: 'Written Narratives',
    orderIndex: 18,
    grammarRuleText: 'Guided lesson: guided written narrative with PC and imparfait.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b1-u19',
    level: 'B1',
    title: 'Unit 6 Review & Practice',
    orderIndex: 19,
    grammarRuleText: 'Capstone: mixed past-tense review — narration, memories, and opinions.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u1',
    level: 'B2',
    title: 'Reading Headlines',
    orderIndex: 1,
    grammarRuleText: 'Guided lesson: decoding French headlines and key media vocabulary.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u2',
    level: 'B2',
    title: 'Giving Your Opinion',
    orderIndex: 2,
    grammarRuleText: 'Guided lesson: nuanced opinions, hedging, and supporting arguments.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u3',
    level: 'B2',
    title: 'Bien que / quoique + subjunctive',
    orderIndex: 3,
    grammarRuleText: 'Guided lesson: concession with bien que / quoique + subjonctif.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u4',
    level: 'B2',
    title: 'Summarizing and Paraphrasing',
    orderIndex: 4,
    grammarRuleText: 'Guided lesson: summary language and paraphrasing for B2.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u5',
    level: 'B2',
    title: 'Polite Disagreement',
    orderIndex: 5,
    grammarRuleText: 'Guided lesson: debating politely and challenging ideas without sounding rude.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u6',
    level: 'B2',
    title: 'Travel & Media Capstone',
    orderIndex: 6,
    grammarRuleText: 'Capstone: media, travel, and opinion — mixed B2 tasks.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u7',
    level: 'B2',
    title: 'Job Interview Basics',
    orderIndex: 7,
    grammarRuleText: 'Guided lesson: interview questions, strengths, and professional tone.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u8',
    level: 'B2',
    title: 'Professional Email',
    orderIndex: 8,
    grammarRuleText: 'Guided lesson: formal courriel structure and fixed phrases.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u9',
    level: 'B2',
    title: 'Si + imparfait (hypotheses)',
    orderIndex: 9,
    grammarRuleText: 'Guided lesson: hypothetical si + imparfait with present or conditional result.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u10',
    level: 'B2',
    title: 'Forms and Procedures',
    orderIndex: 10,
    grammarRuleText: 'Guided lesson: administrative vocabulary and describing steps.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u11',
    level: 'B2',
    title: 'Running a Meeting',
    orderIndex: 11,
    grammarRuleText: 'Guided lesson: chairing a meeting, turn-taking, and action items.',
    vocabList: [],
    quiz: [],
  },
  {
    id: 'b2-u12',
    level: 'B2',
    title: 'Workplace Capstone',
    orderIndex: 12,
    grammarRuleText: 'Capstone: interviews, email, meetings, and admin — mixed workplace French.',
    vocabList: [],
    quiz: [],
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

