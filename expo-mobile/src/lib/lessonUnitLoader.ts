import type { LegacyLessonUnit, LessonStep, RichLessonUnit, VocabCard } from '../components/lesson-steps/types'

const a1Legacy: LegacyLessonUnit[] = require('../../assets/syllabus/a1.json')
const a2Legacy: LegacyLessonUnit[] = require('../../assets/syllabus/a2.json')
const b1Legacy: LegacyLessonUnit[] = require('../../assets/syllabus/b1.json')
const b2Legacy: LegacyLessonUnit[] = require('../../assets/syllabus/b2.json')
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

function getLegacyArray(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): LegacyLessonUnit[] {
  switch (level) {
    case 'A1':
      return a1Legacy
    case 'A2':
      return a2Legacy
    case 'B1':
      return b1Legacy
    case 'B2':
      return b2Legacy
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
 * Resolve lesson content: prefer bundled A1 rich JSON; otherwise legacy flat `a1.json`-style → synthetic steps.
 */
export function loadLessonUnit(
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1',
  unitId: string,
): RichLessonUnit | null {
  if (level === 'A1' && A1_RICH[unitId]) {
    return A1_RICH[unitId]
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
