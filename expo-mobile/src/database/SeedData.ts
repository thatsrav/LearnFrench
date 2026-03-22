export type UnitSeed = {
  id: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  title: string
  orderIndex: number
}

/**
 * Local syllabus rows (new installs). A1 titles match rich JSON / web `syllabus.UNITS`.
 * `order_index` is per level (used by unlock-next within the same CEFR band).
 */
export const UNIT_SEED_DATA: UnitSeed[] = [
  { id: 'a1-u1', level: 'A1', title: 'Greetings & Meeting People', orderIndex: 1 },
  { id: 'a1-u2', level: 'A1', title: 'Numbers & Telling Time', orderIndex: 2 },
  { id: 'a1-u3', level: 'A1', title: 'Family Members', orderIndex: 3 },
  { id: 'a1-u4', level: 'A1', title: 'Food & Ordering at a Café', orderIndex: 4 },
  { id: 'a1-u5', level: 'A1', title: 'Colors & Clothes Shopping', orderIndex: 5 },
  { id: 'a1-u6', level: 'A1', title: 'Home & Describing Rooms', orderIndex: 6 },
  { id: 'a1-u7', level: 'A1', title: 'Daily Routine & Regular Verbs', orderIndex: 7 },
  { id: 'a1-u8', level: 'A1', title: 'Transport & Directions', orderIndex: 8 },
  { id: 'a1-u9', level: 'A1', title: 'Weather & Seasons', orderIndex: 9 },
  { id: 'a1-u10', level: 'A1', title: 'Hobbies & Free Time', orderIndex: 10 },
  { id: 'a2-u1', level: 'A2', title: 'Daily Work and Study', orderIndex: 1 },
  { id: 'a2-u2', level: 'A2', title: 'Food Quantities and Partitives', orderIndex: 2 },
  { id: 'a2-u3', level: 'A2', title: 'Reflexive Daily Routines', orderIndex: 3 },
  { id: 'a2-u4', level: 'A2', title: 'Future Proche and Plans', orderIndex: 4 },
  { id: 'a2-u5', level: 'A2', title: 'Comparisons and Opinions', orderIndex: 5 },
  { id: 'b1-u1', level: 'B1', title: 'Airports and Stations', orderIndex: 1 },
  { id: 'b1-u2', level: 'B1', title: 'Buying Tickets', orderIndex: 2 },
  { id: 'b1-u3', level: 'B1', title: 'Asking for Directions', orderIndex: 3 },
  { id: 'b1-u4', level: 'B1', title: 'Hotel Check-in', orderIndex: 4 },
  { id: 'b1-u5', level: 'B1', title: 'Transport Types', orderIndex: 5 },
  { id: 'b1-u6', level: 'B1', title: 'Travel Problems', orderIndex: 6 },
  { id: 'b1-u7', level: 'B1', title: 'Describing a Trip', orderIndex: 7 },
  { id: 'b1-u8', level: 'B1', title: 'Future Travel Plans', orderIndex: 8 },
  { id: 'b1-u9', level: 'B1', title: 'Sustainable Tourism', orderIndex: 9 },
  { id: 'b1-u10', level: 'B1', title: 'Unit 5 Review & Practice', orderIndex: 10 },
  { id: 'b1-u11', level: 'B1', title: 'Passé Composé Formation', orderIndex: 11 },
  { id: 'b1-u12', level: 'B1', title: 'Common Irregular Participles', orderIndex: 12 },
  { id: 'b1-u13', level: 'B1', title: 'Imparfait Introduction', orderIndex: 13 },
  { id: 'b1-u14', level: 'B1', title: 'PC vs Imparfait', orderIndex: 14 },
  { id: 'b1-u15', level: 'B1', title: 'Telling a Story', orderIndex: 15 },
  { id: 'b1-u16', level: 'B1', title: 'Childhood Memories', orderIndex: 16 },
  { id: 'b1-u17', level: 'B1', title: 'News and Past Events', orderIndex: 17 },
  { id: 'b1-u18', level: 'B1', title: 'Written Narratives', orderIndex: 18 },
  { id: 'b1-u19', level: 'B1', title: 'Unit 6 Review & Practice', orderIndex: 19 },
  { id: 'b2-u1', level: 'B2', title: 'Reading Headlines', orderIndex: 1 },
  { id: 'b2-u2', level: 'B2', title: 'Giving Your Opinion', orderIndex: 2 },
  { id: 'b2-u3', level: 'B2', title: 'Bien que / quoique + subjunctive', orderIndex: 3 },
  { id: 'b2-u4', level: 'B2', title: 'Summarizing and Paraphrasing', orderIndex: 4 },
  { id: 'b2-u5', level: 'B2', title: 'Polite Disagreement', orderIndex: 5 },
  { id: 'b2-u6', level: 'B2', title: 'Travel & Media Capstone', orderIndex: 6 },
  { id: 'b2-u7', level: 'B2', title: 'Job Interview Basics', orderIndex: 7 },
  { id: 'b2-u8', level: 'B2', title: 'Professional Email', orderIndex: 8 },
  { id: 'b2-u9', level: 'B2', title: 'Si + imparfait (hypotheses)', orderIndex: 9 },
  { id: 'b2-u10', level: 'B2', title: 'Forms and Procedures', orderIndex: 10 },
  { id: 'b2-u11', level: 'B2', title: 'Running a Meeting', orderIndex: 11 },
  { id: 'b2-u12', level: 'B2', title: 'Workplace Capstone', orderIndex: 12 },
]
