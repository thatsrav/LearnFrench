export type UnitSeed = {
  id: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  title: string
  orderIndex: number
}

export const UNIT_SEED_DATA: UnitSeed[] = [
  { id: 'a1-u1', level: 'A1', title: 'Bonjour Basics', orderIndex: 1 },
  { id: 'a1-u2', level: 'A1', title: 'Family and Friends', orderIndex: 2 },
  { id: 'a1-u3', level: 'A1', title: 'Daily Routine', orderIndex: 3 },
  { id: 'a1-u4', level: 'A1', title: 'Food and Cafe', orderIndex: 4 },
  { id: 'a1-u5', level: 'A1', title: 'Directions in Town', orderIndex: 5 },
  { id: 'a2-u1', level: 'A2', title: 'Past Events', orderIndex: 6 },
  { id: 'a2-u2', level: 'A2', title: 'Travel and Booking', orderIndex: 7 },
  { id: 'a2-u3', level: 'A2', title: 'Health and Appointments', orderIndex: 8 },
  { id: 'a2-u4', level: 'A2', title: 'Work and Study', orderIndex: 9 },
  { id: 'a2-u5', level: 'A2', title: 'Plans and Opinions', orderIndex: 10 },
]

