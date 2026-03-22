/**
 * Phase 1 · Pattern discovery — sample A1 dialogues.
 * Each scene weaves all six persons (je, tu, il/elle, nous, vous, ils/elles) naturally.
 */

export type PronounKey = 'je' | 'tu' | 'il/elle' | 'nous' | 'vous' | 'ils/elles'

export type VerbHighlight = {
  surface: string
  infinitive: string
  glossEn: string
  table: Record<PronounKey, string>
}

export type BubblePart = { type: 'text'; value: string } | { type: 'verb'; verb: VerbHighlight }

export type ConversationTurn = {
  speaker: string
  /** Stable key for avatar colour */
  speakerKey: string
  parts: BubblePart[]
  /** Full line in English — shown on hover / focus */
  translationEn: string
}

export type ReflectionChoice = { id: string; label: string }

export type DiscoveryConversation = {
  id: string
  infinitive: string
  verbLabelFr: string
  sceneTitle: string
  setting: string
  turns: ConversationTurn[]
  reflection: {
    prompt: string
    choices: ReflectionChoice[]
    takeaway: string
  }
  hint: string
}

const T_ALLER: Record<PronounKey, string> = {
  je: 'vais',
  tu: 'vas',
  'il/elle': 'va',
  nous: 'allons',
  vous: 'allez',
  'ils/elles': 'vont',
}

const AVOIR_TABLE: Record<PronounKey, string> = {
  je: 'ai',
  tu: 'as',
  'il/elle': 'a',
  nous: 'avons',
  vous: 'avez',
  'ils/elles': 'ont',
}

const ETRE_TABLE: Record<PronounKey, string> = {
  je: 'suis',
  tu: 'es',
  'il/elle': 'est',
  nous: 'sommes',
  vous: 'êtes',
  'ils/elles': 'sont',
}

const VENIR_TABLE: Record<PronounKey, string> = {
  je: 'viens',
  tu: 'viens',
  'il/elle': 'vient',
  nous: 'venons',
  vous: 'venez',
  'ils/elles': 'viennent',
}

function v(surface: string, infinitive: string, glossEn: string, table: Record<PronounKey, string>): VerbHighlight {
  return { surface, infinitive, glossEn, table }
}

export const PHASE1_DISCOVERY_CONVERSATIONS: DiscoveryConversation[] = [
  {
    id: 'aller-marche',
    infinitive: 'aller',
    verbLabelFr: 'aller',
    sceneTitle: 'Samedi matin au marché',
    setting: 'Montréal — entre voisins et amis',
    turns: [
      {
        speaker: 'Marie',
        speakerKey: 'marie',
        translationEn: "I'm going to the bakery first.",
        parts: [
          { type: 'text', value: 'Je ' },
          { type: 'verb', verb: v('vais', 'aller', 'I go / I am going', T_ALLER) },
          { type: 'text', value: ' à la boulangerie en premier.' },
        ],
      },
      {
        speaker: 'Pierre',
        speakerKey: 'pierre',
        translationEn: 'Are you going straight there?',
        parts: [
          { type: 'verb', verb: v('Vas', 'aller', 'you go (informal)', T_ALLER) },
          { type: 'text', value: '-tu directement là-bas ?' },
        ],
      },
      {
        speaker: 'Marie',
        speakerKey: 'marie',
        translationEn: 'Maybe. And your brother — is he going with you?',
        parts: [
          { type: 'text', value: 'Peut-être. Et ton frère, est-ce qu’' },
          { type: 'verb', verb: v('il va', 'aller', 'he goes', T_ALLER) },
          { type: 'text', value: ' avec toi?' },
        ],
      },
      {
        speaker: 'Pierre',
        speakerKey: 'pierre',
        translationEn: "Yes, he's going too.",
        parts: [
          { type: 'text', value: 'Oui, ' },
          { type: 'verb', verb: v('il va', 'aller', 'he goes', T_ALLER) },
          { type: 'text', value: ' aussi.' },
        ],
      },
      {
        speaker: 'Sophie',
        speakerKey: 'sophie',
        translationEn: "Lucas and I — we're going by métro.",
        parts: [
          { type: 'text', value: 'Lucas et moi, ' },
          { type: 'verb', verb: v('nous allons', 'aller', 'we go', T_ALLER) },
          { type: 'text', value: ' en métro.' },
        ],
      },
      {
        speaker: 'Mme Dubois',
        speakerKey: 'dubois',
        translationEn: 'Are you all going before nine?',
        parts: [
          { type: 'text', value: 'Excusez-moi — est-ce que ' },
          { type: 'verb', verb: v('vous allez', 'aller', 'you go (formal/plural)', T_ALLER) },
          { type: 'text', value: ' tous avant neuf heures?' },
        ],
      },
      {
        speaker: 'Sophie',
        speakerKey: 'sophie',
        translationEn: 'The neighbours? They are going later.',
        parts: [
          { type: 'text', value: 'Les voisins? ' },
          { type: 'verb', verb: v('Ils vont', 'aller', 'they go', T_ALLER) },
          { type: 'text', value: ' plus tard, je crois.' },
        ],
      },
    ],
    reflection: {
      prompt: 'After reading, what do you notice about the endings of aller in this dialogue?',
      choices: [
        { id: 'a', label: 'The ending changes depending on who is speaking (the subject).' },
        { id: 'b', label: 'Every form ends exactly the same way.' },
        { id: 'c', label: 'Only the first letter of the verb changes.' },
      ],
      takeaway:
        'Right — French verbs change their ending (and sometimes the stem) to match the subject: je vais, tu vas, il va, nous allons, vous allez, ils vont.',
    },
    hint:
      'Trace each subject (je, tu, il, nous, vous, ils) and its verb form: vais, vas, va, allons, allez, vont. The stem all- stays; the ending carries the person.',
  },
  {
    id: 'avoir-famille',
    infinitive: 'avoir',
    verbLabelFr: 'avoir',
    sceneTitle: 'Chez les Gagnon',
    setting: 'Une famille parle de routine et d’âge',
    turns: [
      {
        speaker: 'Thomas',
        speakerKey: 'thomas',
        translationEn: "I'm ten years old and I have a little sister.",
        parts: [
          { type: 'verb', verb: v("J'ai", 'avoir', 'I have', AVOIR_TABLE) },
          { type: 'text', value: ' dix ans et ' },
          { type: 'verb', verb: v("j'ai", 'avoir', 'I have', AVOIR_TABLE) },
          { type: 'text', value: ' une petite sœur.' },
        ],
      },
      {
        speaker: 'Claire',
        speakerKey: 'claire',
        translationEn: 'You have patience with her!',
        parts: [
          { type: 'text', value: 'Tu ' },
          { type: 'verb', verb: v('as', 'avoir', 'you have (informal)', AVOIR_TABLE) },
          { type: 'text', value: ' de la patience avec elle!' },
        ],
      },
      {
        speaker: 'Thomas',
        speakerKey: 'thomas',
        translationEn: 'Grandpa has a funny dog.',
        parts: [
          { type: 'text', value: 'Papi, il ' },
          { type: 'verb', verb: v('a', 'avoir', 'he has', AVOIR_TABLE) },
          { type: 'text', value: ' un chien drôle.' },
        ],
      },
      {
        speaker: 'Maman',
        speakerKey: 'maman',
        translationEn: 'We have a big garden behind the house.',
        parts: [
          { type: 'text', value: 'Oui, et ' },
          { type: 'verb', verb: v('nous avons', 'avoir', 'we have', AVOIR_TABLE) },
          { type: 'text', value: ' un grand jardin derrière la maison.' },
        ],
      },
      {
        speaker: 'Grand-mère',
        speakerKey: 'grandmere',
        translationEn: 'You (all) have beautiful tomatoes this summer.',
        parts: [
          { type: 'text', value: 'Mes chers, ' },
          { type: 'verb', verb: v('vous avez', 'avoir', 'you have (formal/plural)', AVOIR_TABLE) },
          { type: 'text', value: ' de belles tomates cet été.' },
        ],
      },
      {
        speaker: 'Papa',
        speakerKey: 'papa',
        translationEn: 'The twins? They have music lessons on Thursdays.',
        parts: [
          { type: 'text', value: 'Les jumelles? Elles ' },
          { type: 'verb', verb: v('ont', 'avoir', 'they have', AVOIR_TABLE) },
          { type: 'text', value: ' cours de musique le jeudi.' },
        ],
      },
    ],
    reflection: {
      prompt: 'What pattern links j’ai, tu as, il a, nous avons, vous avez, elles ont?',
      choices: [
        { id: 'a', label: 'They are all forms of the same verb (avoir) for different people.' },
        { id: 'b', label: 'They are six completely unrelated words.' },
        { id: 'c', label: 'Only “avons” and “avez” belong to avoir.' },
      ],
      takeaway:
        'Avoir is irregular but still one family: ai, as, a, avons, avez, ont — each form matches je, tu, il/elle, nous, vous, ils/elles.',
    },
    hint:
      'Say the subjects aloud with their forms: j’ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont. Notice the “av-” in plural nous/vous.',
  },
  {
    id: 'etre-cours',
    infinitive: 'être',
    verbLabelFr: 'être',
    sceneTitle: 'Premier jour de cours de français',
    setting: 'Salle de classe à Québec',
    turns: [
      {
        speaker: 'Élise',
        speakerKey: 'elise',
        translationEn: "I'm a bit nervous today.",
        parts: [
          { type: 'text', value: 'Je ' },
          { type: 'verb', verb: v('suis', 'être', 'I am', ETRE_TABLE) },
          { type: 'text', value: ' un peu nerveuse aujourd’hui.' },
        ],
      },
      {
        speaker: 'Marc',
        speakerKey: 'marc',
        translationEn: "You're already very good!",
        parts: [
          { type: 'text', value: 'Tu ' },
          { type: 'verb', verb: v('es', 'être', 'you are (informal)', ETRE_TABLE) },
          { type: 'text', value: ' déjà très forte!' },
        ],
      },
      {
        speaker: 'Professeure Martin',
        speakerKey: 'martin',
        translationEn: 'The course is welcoming — everyone is kind here.',
        parts: [
          { type: 'text', value: 'Le cours ' },
          { type: 'verb', verb: v('est', 'être', 'it is / is', ETRE_TABLE) },
          { type: 'text', value: ' accueillant; tout le monde ' },
          { type: 'verb', verb: v('est', 'être', 'is', ETRE_TABLE) },
          { type: 'text', value: ' gentil ici.' },
        ],
      },
      {
        speaker: 'Marc',
        speakerKey: 'marc',
        translationEn: 'We are from Gatineau originally.',
        parts: [
          { type: 'text', value: 'Élise et moi, nous ' },
          { type: 'verb', verb: v('sommes', 'être', 'we are', ETRE_TABLE) },
          { type: 'text', value: ' de Gatineau, au départ.' },
        ],
      },
      {
        speaker: 'Professeure Martin',
        speakerKey: 'martin',
        translationEn: 'You (all) are in the right room — B1, door 204.',
        parts: [
          { type: 'text', value: 'Parfait. ' },
          { type: 'verb', verb: v('Vous êtes', 'être', 'you are (formal/plural)', ETRE_TABLE) },
          { type: 'text', value: ' dans la bonne salle — B1, porte 204.' },
        ],
      },
      {
        speaker: 'Élise',
        speakerKey: 'elise',
        translationEn: 'The other students — are they from Montreal?',
        parts: [
          { type: 'text', value: 'Les autres étudiants, ' },
          { type: 'verb', verb: v('ils sont', 'être', 'they are', ETRE_TABLE) },
          { type: 'text', value: ' de Montréal, surtout?' },
        ],
      },
    ],
    reflection: {
      prompt: 'Être often links a person or thing to a quality or place. What did you observe?',
      choices: [
        { id: 'a', label: 'Forms like suis, es, est, sommes, êtes, sont all express “to be” for different subjects.' },
        { id: 'b', label: 'Only “est” is a real verb; the rest are adjectives.' },
        { id: 'c', label: 'The verb never changes after je or tu.' },
      ],
      takeaway:
        'Être is highly irregular: je suis, tu es, il/elle/on est, nous sommes, vous êtes, ils/elles sont — but the job is always “to be”.',
    },
    hint:
      'Match: je → suis, tu → es, il/elle → est, nous → sommes, vous → êtes, ils/elles → sont. Say them in rhythm like a short poem.',
  },
  {
    id: 'venir-souper',
    infinitive: 'venir',
    verbLabelFr: 'venir',
    sceneTitle: 'Invitation pour le souper',
    setting: 'Appel téléphonique entre amis',
    turns: [
      {
        speaker: 'Julie',
        speakerKey: 'julie',
        translationEn: "I'm coming to your place around six.",
        parts: [
          { type: 'text', value: 'Salut! Je ' },
          { type: 'verb', verb: v('viens', 'venir', 'I come / I am coming', VENIR_TABLE) },
          { type: 'text', value: ' chez toi vers six heures.' },
        ],
      },
      {
        speaker: 'Alex',
        speakerKey: 'alex',
        translationEn: 'Perfect — are you bringing dessert?',
        parts: [
          { type: 'text', value: 'Super! Tu ' },
          { type: 'verb', verb: v('viens', 'venir', 'you come', VENIR_TABLE) },
          { type: 'text', value: ' avec le dessert?' },
        ],
      },
      {
        speaker: 'Julie',
        speakerKey: 'julie',
        translationEn: "My sister is coming with the cake.",
        parts: [
          { type: 'text', value: 'Ma sœur ' },
          { type: 'verb', verb: v('vient', 'venir', 'she comes', VENIR_TABLE) },
          { type: 'text', value: ' avec le gâteau.' },
        ],
      },
      {
        speaker: 'Alex',
        speakerKey: 'alex',
        translationEn: 'Léo and I — we are coming by bus.',
        parts: [
          { type: 'text', value: 'Léo et moi, nous ' },
          { type: 'verb', verb: v('venons', 'venir', 'we come', VENIR_TABLE) },
          { type: 'text', value: ' en autobus.' },
        ],
      },
      {
        speaker: 'Julie',
        speakerKey: 'julie',
        translationEn: 'Are you (both) coming through the métro station Berri?',
        parts: [
          { type: 'text', value: 'Est-ce que ' },
          { type: 'verb', verb: v('vous venez', 'venir', 'you come (formal/plural)', VENIR_TABLE) },
          { type: 'text', value: ' par Berri-UQAM?' },
        ],
      },
      {
        speaker: 'Alex',
        speakerKey: 'alex',
        translationEn: 'Yes — and Sam and Kim? They are coming later.',
        parts: [
          { type: 'text', value: 'Oui. Et Sam et Kim? Ils ' },
          { type: 'verb', verb: v('viennent', 'venir', 'they come', VENIR_TABLE) },
          { type: 'text', value: ' plus tard, vers huit heures.' },
        ],
      },
    ],
    reflection: {
      prompt: 'Venir looks a bit like aller, but the stem and endings differ. What stands out?',
      choices: [
        { id: 'a', label: 'Singular forms share viens / viens / vient; plural uses ven-, venez, viennent.' },
        { id: 'b', label: 'Every person uses exactly the same form.' },
        { id: 'c', label: 'Only “venons” is a conjugated form of venir.' },
      ],
      takeaway:
        'Venir: je/tu viens (same spelling!), il/elle vient, nous venons, vous venez, ils/elles viennent — watch the double n in viennent.',
    },
    hint:
      'Group: viens (je & tu), vient (il/elle), venons, venez, viennent. The stem ven- carries into the plural; the singular has tighter forms.',
  },
]
