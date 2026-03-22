import type { LegacyLessonUnit, LessonStep, RichLessonUnit, VocabCard } from '../components/lesson-steps/types'

const c1Legacy: LegacyLessonUnit[] = require('../../assets/syllabus/c1.json')

/** Bundled offline-first A1 units (Busuu-style `steps[]`). */
const A1_RICH: Record<string, RichLessonUnit> = {
  'a1-u1': require('../../assets/syllabus/a1_u1.json'),
  'a1-u2': require('../../assets/syllabus/a1_u2.json'),
  'a1-u3': require('../../assets/syllabus/a1_u3.json'),
  'a1-u4': require('../../assets/syllabus/a1_u4.json'),
  'a1-u5': require('../../assets/syllabus/a1_u5.json'),
  'a1-u6': require('../../assets/syllabus/a1_u6.json'),
  'a1-u7': require('../../assets/syllabus/a1_u7.json'),
  'a1-u8': require('../../assets/syllabus/a1_u8.json'),
  'a1-u9': require('../../assets/syllabus/a1_u9.json'),
  'a1-u10': require('../../assets/syllabus/a1_u10.json'),
}

/** Bundled A2 rich units (same JSON as web). */
const A2_RICH: Record<string, RichLessonUnit> = {
  'a2-u1': require('../../assets/syllabus/a2_u1.json'),
  'a2-u2': require('../../assets/syllabus/a2_u2.json'),
  'a2-u3': require('../../assets/syllabus/a2_u3.json'),
  'a2-u4': require('../../assets/syllabus/a2_u4.json'),
  'a2-u5': require('../../assets/syllabus/a2_u5.json'),
}

const B1_RICH: Record<string, RichLessonUnit> = {
  'b1-u1': require('../../assets/syllabus/b1_u1.json'),
  'b1-u2': require('../../assets/syllabus/b1_u2.json'),
  'b1-u3': require('../../assets/syllabus/b1_u3.json'),
  'b1-u4': require('../../assets/syllabus/b1_u4.json'),
  'b1-u5': require('../../assets/syllabus/b1_u5.json'),
  'b1-u6': require('../../assets/syllabus/b1_u6.json'),
  'b1-u7': require('../../assets/syllabus/b1_u7.json'),
  'b1-u8': require('../../assets/syllabus/b1_u8.json'),
  'b1-u9': require('../../assets/syllabus/b1_u9.json'),
  'b1-u10': require('../../assets/syllabus/b1_u10.json'),
  'b1-u11': require('../../assets/syllabus/b1_u11.json'),
  'b1-u12': require('../../assets/syllabus/b1_u12.json'),
  'b1-u13': require('../../assets/syllabus/b1_u13.json'),
  'b1-u14': require('../../assets/syllabus/b1_u14.json'),
  'b1-u15': require('../../assets/syllabus/b1_u15.json'),
  'b1-u16': require('../../assets/syllabus/b1_u16.json'),
  'b1-u17': require('../../assets/syllabus/b1_u17.json'),
  'b1-u18': require('../../assets/syllabus/b1_u18.json'),
  'b1-u19': require('../../assets/syllabus/b1_u19.json'),
}

const B2_RICH: Record<string, RichLessonUnit> = {
  'b2-u1': require('../../assets/syllabus/b2_u1.json'),
  'b2-u2': require('../../assets/syllabus/b2_u2.json'),
  'b2-u3': require('../../assets/syllabus/b2_u3.json'),
  'b2-u4': require('../../assets/syllabus/b2_u4.json'),
  'b2-u5': require('../../assets/syllabus/b2_u5.json'),
  'b2-u6': require('../../assets/syllabus/b2_u6.json'),
  'b2-u7': require('../../assets/syllabus/b2_u7.json'),
  'b2-u8': require('../../assets/syllabus/b2_u8.json'),
  'b2-u9': require('../../assets/syllabus/b2_u9.json'),
  'b2-u10': require('../../assets/syllabus/b2_u10.json'),
  'b2-u11': require('../../assets/syllabus/b2_u11.json'),
  'b2-u12': require('../../assets/syllabus/b2_u12.json'),
}

function getLegacyArray(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): LegacyLessonUnit[] {
  switch (level) {
    case 'A1':
    case 'A2':
    case 'B1':
    case 'B2':
      return []
    case 'C1':
      return c1Legacy
    default:
      return []
  }
}

function legacyVocabCards(list: string[]): VocabCard[] {
  return list.slice(0, 12).map((word) => ({
    word: word.trim(),
    translation: '—',
    example: word.trim(),
    example_translation: '',
    audio_key: word.trim().replace(/\s+/g, '_').slice(0, 48),
  }))
}

function legacyToRich(legacy: LegacyLessonUnit): RichLessonUnit {
  const steps: LessonStep[] = [
    {
      type: 'grammar_tip',
      rule: legacy.grammar_rule_text,
      examples: [],
    },
    {
      type: 'vocab_intro',
      cards: legacyVocabCards(legacy.vocab_list),
    },
    {
      type: 'dialogue',
      scene: 'Review',
      turns: [
        {
          speaker: '…',
          text: 'Tu es prêt·e pour le quiz de cette leçon?',
          translation: 'Ready for this lesson’s quiz?',
        },
        {
          speaker: '…',
          text: 'Réponds aux questions pour débloquer la suite.',
          translation: 'Answer the questions to unlock what’s next.',
        },
      ],
    },
    {
      type: 'practice',
      exercises: legacy.quiz.map((q) => ({
        type: 'mcq' as const,
        question: q.question,
        options: q.options,
        answer_index: q.answer_index,
      })),
    },
  ]

  return {
    id: legacy.id,
    theme: legacy.id,
    steps,
    production_task: null,
  }
}

/**
 * A1–B2: bundled `a1_u*.json` … `b2_u12.json` (same as web). Legacy `b1.json` / `b2.json` are not used for syllabus ids.
 * C1: legacy flat JSON → synthetic rich-style steps.
 */
export function loadLessonUnit(
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1',
  unitId: string,
): RichLessonUnit | null {
  if (level === 'A1') {
    return A1_RICH[unitId] ?? null
  }
  if (level === 'A2') {
    return A2_RICH[unitId] ?? null
  }
  if (level === 'B1') {
    return B1_RICH[unitId] ?? null
  }
  if (level === 'B2') {
    return B2_RICH[unitId] ?? null
  }

  const legacy = getLegacyArray(level).find((u) => u.id === unitId)
  if (!legacy) return null
  return legacyToRich(legacy)
}

/** Vocab strings for spaced repetition seeding (words from cards, legacy list fallback). */
export function extractVocabForSpacedRepetition(unit: RichLessonUnit): string[] {
  const out: string[] = []
  for (const step of unit.steps) {
    if (step.type !== 'vocab_intro') continue
    for (const c of step.cards) {
      const w = c.word.trim()
      if (w && w !== '—') out.push(w)
    }
  }
  return out
}

/** Word + translation backs for SR seeding (vocab_intro cards). */
export function extractVocabEntriesForSpacedRepetition(unit: RichLessonUnit): { word: string; back: string }[] {
  const out: { word: string; back: string }[] = []
  for (const step of unit.steps) {
    if (step.type !== 'vocab_intro') continue
    for (const c of step.cards) {
      const w = c.word.trim()
      if (!w || w === '—') continue
      const back = (c.translation ?? '').trim() || `From unit ${unit.id}. Recall meaning / use in a short phrase.`
      out.push({ word: w, back })
    }
  }
  return out
}

/** Grammar text for SR grammar card. */
export function extractGrammarRuleForSpacedRepetition(unit: RichLessonUnit): string {
  const parts: string[] = []
  for (const s of unit.steps) {
    if (s.type === 'grammar_tip') parts.push(s.rule)
  }
  return parts.length > 0 ? parts.join('\n\n') : `Grammar · ${unit.id}`
}
