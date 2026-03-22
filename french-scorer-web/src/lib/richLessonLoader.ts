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
import a2u1 from '../content/syllabus/a2_u1.json'
import a2u2 from '../content/syllabus/a2_u2.json'
import a2u3 from '../content/syllabus/a2_u3.json'
import a2u4 from '../content/syllabus/a2_u4.json'
import a2u5 from '../content/syllabus/a2_u5.json'
import b1u1 from '../content/syllabus/b1_u1.json'
import b1u2 from '../content/syllabus/b1_u2.json'
import b1u3 from '../content/syllabus/b1_u3.json'
import b1u4 from '../content/syllabus/b1_u4.json'
import b1u5 from '../content/syllabus/b1_u5.json'
import b1u6 from '../content/syllabus/b1_u6.json'
import b1u7 from '../content/syllabus/b1_u7.json'
import b1u8 from '../content/syllabus/b1_u8.json'
import b1u9 from '../content/syllabus/b1_u9.json'
import b1u10 from '../content/syllabus/b1_u10.json'
import b1u11 from '../content/syllabus/b1_u11.json'
import b1u12 from '../content/syllabus/b1_u12.json'
import b1u13 from '../content/syllabus/b1_u13.json'
import b1u14 from '../content/syllabus/b1_u14.json'
import b1u15 from '../content/syllabus/b1_u15.json'
import b1u16 from '../content/syllabus/b1_u16.json'
import b1u17 from '../content/syllabus/b1_u17.json'
import b1u18 from '../content/syllabus/b1_u18.json'
import b1u19 from '../content/syllabus/b1_u19.json'
import b2u1 from '../content/syllabus/b2_u1.json'
import b2u2 from '../content/syllabus/b2_u2.json'
import b2u3 from '../content/syllabus/b2_u3.json'
import b2u4 from '../content/syllabus/b2_u4.json'
import b2u5 from '../content/syllabus/b2_u5.json'
import b2u6 from '../content/syllabus/b2_u6.json'
import b2u7 from '../content/syllabus/b2_u7.json'
import b2u8 from '../content/syllabus/b2_u8.json'
import b2u9 from '../content/syllabus/b2_u9.json'
import b2u10 from '../content/syllabus/b2_u10.json'
import b2u11 from '../content/syllabus/b2_u11.json'
import b2u12 from '../content/syllabus/b2_u12.json'

const RICH_BY_UNIT_ID: Record<string, RichLessonUnit> = {
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
  'a2-u1': a2u1 as RichLessonUnit,
  'a2-u2': a2u2 as RichLessonUnit,
  'a2-u3': a2u3 as RichLessonUnit,
  'a2-u4': a2u4 as RichLessonUnit,
  'a2-u5': a2u5 as RichLessonUnit,
  'b1-u1': b1u1 as RichLessonUnit,
  'b1-u2': b1u2 as RichLessonUnit,
  'b1-u3': b1u3 as RichLessonUnit,
  'b1-u4': b1u4 as RichLessonUnit,
  'b1-u5': b1u5 as RichLessonUnit,
  'b1-u6': b1u6 as RichLessonUnit,
  'b1-u7': b1u7 as RichLessonUnit,
  'b1-u8': b1u8 as RichLessonUnit,
  'b1-u9': b1u9 as RichLessonUnit,
  'b1-u10': b1u10 as RichLessonUnit,
  'b1-u11': b1u11 as RichLessonUnit,
  'b1-u12': b1u12 as RichLessonUnit,
  'b1-u13': b1u13 as RichLessonUnit,
  'b1-u14': b1u14 as RichLessonUnit,
  'b1-u15': b1u15 as RichLessonUnit,
  'b1-u16': b1u16 as RichLessonUnit,
  'b1-u17': b1u17 as RichLessonUnit,
  'b1-u18': b1u18 as RichLessonUnit,
  'b1-u19': b1u19 as RichLessonUnit,
  'b2-u1': b2u1 as RichLessonUnit,
  'b2-u2': b2u2 as RichLessonUnit,
  'b2-u3': b2u3 as RichLessonUnit,
  'b2-u4': b2u4 as RichLessonUnit,
  'b2-u5': b2u5 as RichLessonUnit,
  'b2-u6': b2u6 as RichLessonUnit,
  'b2-u7': b2u7 as RichLessonUnit,
  'b2-u8': b2u8 as RichLessonUnit,
  'b2-u9': b2u9 as RichLessonUnit,
  'b2-u10': b2u10 as RichLessonUnit,
  'b2-u11': b2u11 as RichLessonUnit,
  'b2-u12': b2u12 as RichLessonUnit,
}

export function getRichLesson(unitId: string): RichLessonUnit | null {
  return RICH_BY_UNIT_ID[unitId] ?? null
}

export function isRichLessonUnit(unitId: string): boolean {
  return unitId in RICH_BY_UNIT_ID
}

/** @deprecated Use `getRichLesson` — kept for call sites that only mention A1. */
export function getRichA1Lesson(unitId: string): RichLessonUnit | null {
  return getRichLesson(unitId)
}

/** @deprecated Use `isRichLessonUnit` */
export function isRichA1Unit(unitId: string): boolean {
  return isRichLessonUnit(unitId)
}
