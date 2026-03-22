/** Phase 2 — ALLER présent: lesson rows + practice items. */

export type AllerPresentRow = {
  pronoun: string
  form: string
  stem: string
  ending: string
  endingClass: 'ais' | 'as' | 'a' | 'ons' | 'ez' | 'ont'
  english: string
}

export const PHASE2_ALLER_PRESENT_ROWS: AllerPresentRow[] = [
  { pronoun: 'je', form: 'vais', stem: 'v', ending: 'ais', endingClass: 'ais', english: 'I go / I am going' },
  { pronoun: 'tu', form: 'vas', stem: 'v', ending: 'as', endingClass: 'as', english: 'you go (informal)' },
  { pronoun: 'il / elle / on', form: 'va', stem: 'v', ending: 'a', endingClass: 'a', english: 'he / she / one goes' },
  { pronoun: 'nous', form: 'allons', stem: 'all', ending: 'ons', endingClass: 'ons', english: 'we go' },
  { pronoun: 'vous', form: 'allez', stem: 'all', ending: 'ez', endingClass: 'ez', english: 'you go (formal / plural)' },
  { pronoun: 'ils / elles', form: 'vont', stem: 'v', ending: 'ont', endingClass: 'ont', english: 'they go' },
]

export type McQuestion = {
  id: string
  prompt: string
  choices: readonly [string, string, string, string]
  answer: string
  explanation: string
  wrongHint: string
}

export type TextQuestion = {
  id: string
  prompt: string
  accepted: readonly string[]
  explanation: string
  wrongHint: string
}

export type ContextQuestion = {
  id: string
  narrative: string
  promptLine?: string
  accepted: readonly string[]
  explanation: string
  wrongHint: string
  optionalHint: string
}

export const PHASE2_MC_QUESTIONS: McQuestion[] = [
  {
    id: 'mc-cinema',
    prompt: 'Nous ____ au cinéma.',
    choices: ['vais', 'vas', 'va', 'allons'] as const,
    answer: 'allons',
    explanation: '**Nous** takes **-ons** on **aller** → **nous allons**.',
    wrongHint: 'Look at the subject **nous** — which ending matches *we*?',
  },
  {
    id: 'mc-ils',
    prompt: 'Ils ____ en ville.',
    choices: ['va', 'vas', 'vont', 'allez'] as const,
    answer: 'vont',
    explanation: '**Ils** uses **vont** (they go).',
    wrongHint: 'Plural *they* needs the **-ont** form.',
  },
  {
    id: 'mc-je',
    prompt: 'Je ____ à la bibliothèque.',
    choices: ['vas', 'vais', 'va', 'allons'] as const,
    answer: 'vais',
    explanation: '**Je** → **vais** (I go).',
    wrongHint: 'First person singular is irregular: **je vais**.',
  },
]

export const PHASE2_TEXT_QUESTIONS: TextQuestion[] = [
  {
    id: 'text-ecole',
    prompt: "Tu ____ à l'école ?",
    accepted: ['vas'],
    explanation: '**Tu** takes **vas** in the present of **aller**.',
    wrongHint: 'After **tu**, the present of *aller* is **vas**.',
  },
  {
    id: 'text-vous',
    prompt: 'Vous ____ au restaurant ce soir ?',
    accepted: ['allez'],
    explanation: '**Vous** → **allez** (you go).',
    wrongHint: 'Think **vous** + **-ez** on this verb stem **all-**.',
  },
  {
    id: 'text-elle',
    prompt: 'Elle ____ au travail en métro.',
    accepted: ['va'],
    explanation: '**Elle** → **va** (she goes).',
    wrongHint: 'Third person singular uses the short form **va**.',
  },
]

export const PHASE2_CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'ctx-parc',
    narrative: 'Sarah est occupée. Elle ____ aller au parc.',
    accepted: ['va'],
    explanation: '**Futur proche**: *subject + **va** + infinitive*. **Elle va aller** = she is going to go.',
    wrongHint: 'After **elle**, you need the present of **aller** before the infinitive **aller**.',
    optionalHint: 'Futur proche pattern: elle + present of *aller* + infinitive.',
  },
  {
    id: 'ctx-nous-demain',
    narrative: "Demain, nous ____ visiter le musée.",
    accepted: ['allons'],
    explanation: '**Nous allons + infinitive** = we are going to …',
    wrongHint: 'Subject **nous** → which **aller** form builds *going to*?',
    optionalHint: 'Same **nous** form as *nous allons au cinéma*.',
  },
]

export const ENDING_BADGE_CLASS: Record<AllerPresentRow['endingClass'], string> = {
  ais: 'bg-sky-100 text-sky-900 ring-sky-200',
  as: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  a: 'bg-amber-100 text-amber-900 ring-amber-200',
  ons: 'bg-violet-100 text-violet-900 ring-violet-200',
  ez: 'bg-rose-100 text-rose-900 ring-rose-200',
  ont: 'bg-indigo-100 text-indigo-900 ring-indigo-200',
}
