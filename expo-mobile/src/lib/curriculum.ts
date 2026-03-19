/**
 * FrenchLearn curriculum — matches web `french-scorer-web/src/lib/curriculum.ts`.
 */
import type { SyllabusRow } from '../database'

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type CurriculumLesson = {
  id: string
  title: string
  subtitle?: string
  durationMin: number
  contentUnitId: string | null
}

export type CurriculumModule = {
  id: string
  level: CEFRLevel
  levelBadge: string
  frenchTitle: string
  englishTitle: string
  description: string
  durationWeeks: number
  topics: string[]
  lessons: CurriculumLesson[]
}

export const CURRICULUM_STATS = {
  moduleCount: 6,
  lessonCount: 51,
} as const

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod-a1-bases',
    level: 'A1',
    levelBadge: 'A1 - Beginner',
    frenchTitle: 'Les Bases',
    englishTitle: 'Greetings & Introductions',
    description:
      'Master French greetings, introduce yourself confidently, and handle numbers, days, and essential questions.',
    durationWeeks: 2,
    topics: ['Greetings', 'Self-introduction', 'Numbers 1-100', 'Days & Months'],
    lessons: [
      { id: 'm1-l1', title: 'Bonjour! - Basic Greetings', subtitle: 'Les salutations', durationMin: 15, contentUnitId: 'a1-u1' },
      { id: 'm1-l2', title: "Je m'appelle… - Introducing Yourself", subtitle: 'Se présenter', durationMin: 18, contentUnitId: 'a1-u2' },
      { id: 'm1-l3', title: 'Numbers 1-20', subtitle: 'Les nombres', durationMin: 20, contentUnitId: 'a1-u3' },
      { id: 'm1-l4', title: 'Numbers 21-100', subtitle: 'Compter plus loin', durationMin: 20, contentUnitId: 'a1-u4' },
      { id: 'm1-l5', title: 'Days of the Week', subtitle: 'Les jours', durationMin: 18, contentUnitId: 'a1-u5' },
      { id: 'm1-l6', title: 'Months of the Year', subtitle: 'Les mois', durationMin: 18, contentUnitId: 'a2-u1' },
      { id: 'm1-l7', title: 'Asking Questions - Comment ? Quoi ?', subtitle: 'Les questions', durationMin: 22, contentUnitId: 'a2-u2' },
      { id: 'm1-l8', title: 'Unit 1 Review & Practice', subtitle: 'Révision', durationMin: 25, contentUnitId: 'a2-u3' },
    ],
  },
  {
    id: 'mod-a1-family',
    level: 'A1',
    levelBadge: 'A1 - Beginner',
    frenchTitle: 'La Famille et Les Amis',
    englishTitle: 'Family & Friends',
    description: 'Describe your family members, friends, and relationships in French.',
    durationWeeks: 2,
    topics: ['Family vocabulary', 'Possessive adjectives', 'Descriptions', 'Relationships'],
    lessons: [
      { id: 'm2-l1', title: 'Family Members Vocabulary', subtitle: 'La famille', durationMin: 20, contentUnitId: 'a2-u4' },
      { id: 'm2-l2', title: 'Mon, Ma, Mes - Possessive Adjectives', subtitle: 'Les possessifs', durationMin: 22, contentUnitId: 'a2-u5' },
      { id: 'm2-l3', title: 'Describing People - Physical Appearance', subtitle: 'Le physique', durationMin: 22, contentUnitId: null },
      { id: 'm2-l4', title: 'Personality Traits', subtitle: 'Le caractère', durationMin: 20, contentUnitId: null },
      { id: 'm2-l5', title: 'Talking About Age', subtitle: "L'âge", durationMin: 18, contentUnitId: null },
      { id: 'm2-l6', title: 'Relationships & Friends', subtitle: 'Les relations', durationMin: 20, contentUnitId: null },
      { id: 'm2-l7', title: 'Unit 2 Review & Practice', subtitle: 'Révision', durationMin: 25, contentUnitId: null },
    ],
  },
  {
    id: 'mod-a2-daily',
    level: 'A2',
    levelBadge: 'A2 - Elementary',
    frenchTitle: 'Les Activités Quotidiennes',
    englishTitle: 'Daily Activities',
    description: 'Express daily routines, hobbies, and common activities in French with confidence.',
    durationWeeks: 3,
    topics: ['Present tense verbs', 'Daily routines', 'Hobbies', 'Time expressions'],
    lessons: [
      { id: 'm3-l1', title: 'Morning Routine Vocabulary', subtitle: 'Le matin', durationMin: 20, contentUnitId: null },
      { id: 'm3-l2', title: 'Telling Time - Quelle heure est-il ?', subtitle: "L'heure", durationMin: 22, contentUnitId: null },
      { id: 'm3-l3', title: 'Hobbies and Leisure Activities', subtitle: 'Les loisirs', durationMin: 20, contentUnitId: null },
      { id: 'm3-l4', title: 'Frequency Adverbs', subtitle: 'Souvent, parfois…', durationMin: 18, contentUnitId: null },
      { id: 'm3-l5', title: 'Faire and Jouer', subtitle: 'Sports & instruments', durationMin: 22, contentUnitId: null },
      { id: 'm3-l6', title: 'Weekend Activities', subtitle: 'Le weekend', durationMin: 20, contentUnitId: null },
      { id: 'm3-l7', title: 'Household Chores', subtitle: 'Les tâches', durationMin: 20, contentUnitId: null },
      { id: 'm3-l8', title: 'Talking About Plans', subtitle: 'Les projets', durationMin: 22, contentUnitId: null },
      { id: 'm3-l9', title: 'Unit 3 Review & Practice', subtitle: 'Révision', durationMin: 25, contentUnitId: null },
    ],
  },
  {
    id: 'mod-a2-food',
    level: 'A2',
    levelBadge: 'A2 - Elementary',
    frenchTitle: 'La Nourriture',
    englishTitle: 'Food & Dining',
    description: 'Order meals, describe tastes, and navigate restaurants and markets like a local.',
    durationWeeks: 2,
    topics: ['Food vocabulary', 'Restaurants', 'Quantities', 'Preferences'],
    lessons: [
      { id: 'm4-l1', title: 'French Cuisine Basics', subtitle: 'La cuisine', durationMin: 20, contentUnitId: null },
      { id: 'm4-l2', title: 'At the Restaurant', subtitle: 'Au restaurant', durationMin: 22, contentUnitId: null },
      { id: 'm4-l3', title: 'Cooking Verbs and Ingredients', subtitle: 'Cuisiner', durationMin: 22, contentUnitId: null },
      { id: 'm4-l4', title: 'Expressing Likes and Dislikes', subtitle: 'Aimer / détester', durationMin: 18, contentUnitId: null },
      { id: 'm4-l5', title: 'Market Shopping', subtitle: 'Au marché', durationMin: 20, contentUnitId: null },
      { id: 'm4-l6', title: 'Dietary Requirements', subtitle: 'Régimes', durationMin: 18, contentUnitId: null },
      { id: 'm4-l7', title: 'Regional Specialties', subtitle: 'Spécialités', durationMin: 20, contentUnitId: null },
      { id: 'm4-l8', title: 'Unit 4 Review & Practice', subtitle: 'Révision', durationMin: 25, contentUnitId: null },
    ],
  },
  {
    id: 'mod-b1-travel',
    level: 'B1',
    levelBadge: 'B1 - Intermediate',
    frenchTitle: 'Les Voyages',
    englishTitle: 'Travel & Transportation',
    description: 'Plan trips, buy tickets, and handle travel problems with clearer, connected French.',
    durationWeeks: 3,
    topics: ['Transport', 'Bookings', 'Directions', 'Problems & delays'],
    lessons: [
      { id: 'm5-l1', title: 'Airports and Stations', subtitle: 'Aéroport & gare', durationMin: 22, contentUnitId: null },
      { id: 'm5-l2', title: 'Buying Tickets', subtitle: 'Les billets', durationMin: 20, contentUnitId: null },
      { id: 'm5-l3', title: 'Asking for Directions', subtitle: "S'orienter", durationMin: 22, contentUnitId: null },
      { id: 'm5-l4', title: 'Hotel Check-in', subtitle: "À l'hôtel", durationMin: 20, contentUnitId: null },
      { id: 'm5-l5', title: 'Transport Types', subtitle: 'Train, bus, métro…', durationMin: 18, contentUnitId: null },
      { id: 'm5-l6', title: 'Travel Problems', subtitle: 'Imprévus', durationMin: 22, contentUnitId: null },
      { id: 'm5-l7', title: 'Describing a Trip', subtitle: 'Récit de voyage', durationMin: 24, contentUnitId: null },
      { id: 'm5-l8', title: 'Future Travel Plans', subtitle: 'Projets', durationMin: 20, contentUnitId: null },
      { id: 'm5-l9', title: 'Sustainable Tourism', subtitle: 'Écotourisme', durationMin: 20, contentUnitId: null },
      { id: 'm5-l10', title: 'Unit 5 Review & Practice', subtitle: 'Révision', durationMin: 28, contentUnitId: null },
    ],
  },
  {
    id: 'mod-b1-past',
    level: 'B1',
    levelBadge: 'B1 - Intermediate',
    frenchTitle: 'Le Passé',
    englishTitle: 'Past Tenses',
    description: 'Narrate past events using passé composé and imparfait with clearer time markers.',
    durationWeeks: 3,
    topics: ['Passé composé', 'Imparfait', 'Narration', 'Time expressions'],
    lessons: [
      { id: 'm6-l1', title: 'Passé Composé Formation', subtitle: 'Auxiliaires', durationMin: 24, contentUnitId: null },
      { id: 'm6-l2', title: 'Common Irregular Participles', subtitle: 'Participes', durationMin: 22, contentUnitId: null },
      { id: 'm6-l3', title: 'Imparfait Introduction', subtitle: "L'imparfait", durationMin: 22, contentUnitId: null },
      { id: 'm6-l4', title: 'PC vs Imparfait', subtitle: 'Choisir', durationMin: 26, contentUnitId: null },
      { id: 'm6-l5', title: 'Telling a Story', subtitle: 'Le récit', durationMin: 24, contentUnitId: null },
      { id: 'm6-l6', title: 'Childhood Memories', subtitle: 'Enfance', durationMin: 22, contentUnitId: null },
      { id: 'm6-l7', title: 'News and Past Events', subtitle: 'Actualité', durationMin: 22, contentUnitId: null },
      { id: 'm6-l8', title: 'Written Narratives', subtitle: 'Production écrite', durationMin: 26, contentUnitId: null },
      { id: 'm6-l9', title: 'Unit 6 Review & Practice', subtitle: 'Révision', durationMin: 28, contentUnitId: null },
    ],
  },
]

export type LessonCardStatus = 'completed' | 'in_progress' | 'locked' | 'coming_soon'

export function getModuleById(moduleId: string): CurriculumModule | undefined {
  return CURRICULUM_MODULES.find((m) => m.id === moduleId)
}

export function inferLevelFromUnitId(unitId: string): CEFRLevel {
  const p = unitId.toLowerCase()
  if (p.startsWith('a1-')) return 'A1'
  if (p.startsWith('a2-')) return 'A2'
  if (p.startsWith('b1-')) return 'B1'
  if (p.startsWith('b2-')) return 'B2'
  if (p.startsWith('c1-')) return 'C1'
  return 'A1'
}

function syllabusMap(rows: SyllabusRow[]): Record<string, SyllabusRow> {
  return Object.fromEntries(rows.map((r) => [r.id, r]))
}

export function getLessonCardStatuses(module: CurriculumModule, syllabusRows: SyllabusRow[]): LessonCardStatus[] {
  const map = syllabusMap(syllabusRows)
  return module.lessons.map((lesson) => {
    if (!lesson.contentUnitId) return 'coming_soon'
    const row = map[lesson.contentUnitId]
    if (!row) return 'locked'
    if (row.status === 'completed') return 'completed'
    if (row.status === 'available') return 'in_progress'
    return 'locked'
  })
}

export function countModuleProgress(
  module: CurriculumModule,
  syllabusRows: SyllabusRow[],
): { done: number; total: number; percent: number } {
  const statuses = getLessonCardStatuses(module, syllabusRows)
  const total = module.lessons.length
  const done = statuses.filter((s, i) => s === 'completed' && module.lessons[i].contentUnitId).length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, percent }
}
