import type { RichLessonUnit } from './richLessonTypes'

import a1u1 from '../content/syllabus/a1_u1.json'
import a1u2 from '../content/syllabus/a1_u2.json'
import a1u3 from '../content/syllabus/a1_u3.json'
import a1u4 from '../content/syllabus/a1_u4.json'
import a1u5 from '../content/syllabus/a1_u5.json'
import a1u6 from '../content/syllabus/a1_u6.json'
import a1u7 from '../content/syllabus/a1_u7.json'
import a1u8 from '../content/syllabus/a1_u8.json'
import a1u9 from '../content/syllabus/a1_u9.json'
import a1u10 from '../content/syllabus/a1_u10.json'

const RICH_A1: Record<string, RichLessonUnit> = {
  'a1-u1': a1u1 as RichLessonUnit,
  'a1-u2': a1u2 as RichLessonUnit,
  'a1-u3': a1u3 as RichLessonUnit,
  'a1-u4': a1u4 as RichLessonUnit,
  'a1-u5': a1u5 as RichLessonUnit,
  'a1-u6': a1u6 as RichLessonUnit,
  'a1-u7': a1u7 as RichLessonUnit,
  'a1-u8': a1u8 as RichLessonUnit,
  'a1-u9': a1u9 as RichLessonUnit,
  'a1-u10': a1u10 as RichLessonUnit,
}

export function getRichA1Lesson(unitId: string): RichLessonUnit | null {
  return RICH_A1[unitId] ?? null
}

export function isRichA1Unit(unitId: string): boolean {
  return unitId in RICH_A1
}
