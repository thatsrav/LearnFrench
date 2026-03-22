/**
 * Generates src/games/ConjugationCodex/data/conjugations.json
 * Run from french-scorer-web: node scripts/build-conjugations.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = join(__dirname, '../src/games/ConjugationCodex/data/conjugations.json')

const verbs = [
  {
    id: 'aller_001',
    infinitive: 'aller',
    english: 'to go',
    level: 'A1',
    frequency: 95,
    regular: false,
    tenses: {
      present: { je: 'vais', tu: 'vas', il: 'va', nous: 'allons', vous: 'allez', ils: 'vont' },
      passe_compose: {
        je: 'suis allé(e)',
        tu: 'es allé(e)',
        il: 'est allé',
        nous: 'sommes allé(e)s',
        vous: 'êtes allé(e)s',
        ils: 'sont allés',
      },
    },
  },
  {
    id: 'etre_001',
    infinitive: 'être',
    english: 'to be',
    level: 'A1',
    frequency: 98,
    regular: false,
    tenses: {
      present: { je: 'suis', tu: 'es', il: 'est', nous: 'sommes', vous: 'êtes', ils: 'sont' },
      passe_compose: {
        je: 'ai été',
        tu: 'as été',
        il: 'a été',
        nous: 'avons été',
        vous: 'avez été',
        ils: 'ont été',
      },
    },
  },
  {
    id: 'avoir_001',
    infinitive: 'avoir',
    english: 'to have',
    level: 'A1',
    frequency: 97,
    regular: false,
    tenses: {
      present: { je: 'ai', tu: 'as', il: 'a', nous: 'avons', vous: 'avez', ils: 'ont' },
      passe_compose: {
        je: 'ai eu',
        tu: 'as eu',
        il: 'a eu',
        nous: 'avons eu',
        vous: 'avez eu',
        ils: 'ont eu',
      },
    },
  },
  {
    id: 'faire_001',
    infinitive: 'faire',
    english: 'to do / to make',
    level: 'A1',
    frequency: 92,
    regular: false,
    tenses: {
      present: { je: 'fais', tu: 'fais', il: 'fait', nous: 'faisons', vous: 'faites', ils: 'font' },
      passe_compose: {
        je: 'ai fait',
        tu: 'as fait',
        il: 'a fait',
        nous: 'avons fait',
        vous: 'avez fait',
        ils: 'ont fait',
      },
    },
  },
  {
    id: 'venir_001',
    infinitive: 'venir',
    english: 'to come',
    level: 'A1',
    frequency: 88,
    regular: false,
    tenses: {
      present: { je: 'viens', tu: 'viens', il: 'vient', nous: 'venons', vous: 'venez', ils: 'viennent' },
      passe_compose: {
        je: 'suis venu(e)',
        tu: 'es venu(e)',
        il: 'est venu',
        nous: 'sommes venu(e)s',
        vous: 'êtes venu(e)s',
        ils: 'sont venus',
      },
    },
  },
  {
    id: 'pouvoir_001',
    infinitive: 'pouvoir',
    english: 'to be able to / can',
    level: 'A2',
    frequency: 90,
    regular: false,
    tenses: {
      present: { je: 'peux', tu: 'peux', il: 'peut', nous: 'pouvons', vous: 'pouvez', ils: 'peuvent' },
      passe_compose: {
        je: 'ai pu',
        tu: 'as pu',
        il: 'a pu',
        nous: 'avons pu',
        vous: 'avez pu',
        ils: 'ont pu',
      },
    },
  },
  {
    id: 'vouloir_001',
    infinitive: 'vouloir',
    english: 'to want',
    level: 'A2',
    frequency: 89,
    regular: false,
    tenses: {
      present: { je: 'veux', tu: 'veux', il: 'veut', nous: 'voulons', vous: 'voulez', ils: 'veulent' },
      passe_compose: {
        je: 'ai voulu',
        tu: 'as voulu',
        il: 'a voulu',
        nous: 'avons voulu',
        vous: 'avez voulu',
        ils: 'ont voulu',
      },
    },
  },
  {
    id: 'devoir_001',
    infinitive: 'devoir',
    english: 'to have to / must',
    level: 'A2',
    frequency: 87,
    regular: false,
    tenses: {
      present: { je: 'dois', tu: 'dois', il: 'doit', nous: 'devons', vous: 'devez', ils: 'doivent' },
      passe_compose: {
        je: 'ai dû',
        tu: 'as dû',
        il: 'a dû',
        nous: 'avons dû',
        vous: 'avez dû',
        ils: 'ont dû',
      },
    },
  },
  {
    id: 'savoir_001',
    infinitive: 'savoir',
    english: 'to know (a fact)',
    level: 'A2',
    frequency: 85,
    regular: false,
    tenses: {
      present: { je: 'sais', tu: 'sais', il: 'sait', nous: 'savons', vous: 'savez', ils: 'savent' },
      passe_compose: {
        je: 'ai su',
        tu: 'as su',
        il: 'a su',
        nous: 'avons su',
        vous: 'avez su',
        ils: 'ont su',
      },
    },
  },
  {
    id: 'prendre_001',
    infinitive: 'prendre',
    english: 'to take',
    level: 'A2',
    frequency: 86,
    regular: false,
    tenses: {
      present: { je: 'prends', tu: 'prends', il: 'prend', nous: 'prenons', vous: 'prenez', ils: 'prennent' },
      passe_compose: {
        je: 'ai pris',
        tu: 'as pris',
        il: 'a pris',
        nous: 'avons pris',
        vous: 'avez pris',
        ils: 'ont pris',
      },
    },
  },
  {
    id: 'parler_001',
    infinitive: 'parler',
    english: 'to speak',
    level: 'A1',
    frequency: 84,
    regular: true,
    tenses: {
      present: { je: 'parle', tu: 'parles', il: 'parle', nous: 'parlons', vous: 'parlez', ils: 'parlent' },
      passe_compose: {
        je: 'ai parlé',
        tu: 'as parlé',
        il: 'a parlé',
        nous: 'avons parlé',
        vous: 'avez parlé',
        ils: 'ont parlé',
      },
    },
  },
  {
    id: 'dire_001',
    infinitive: 'dire',
    english: 'to say / to tell',
    level: 'A2',
    frequency: 88,
    regular: false,
    tenses: {
      present: { je: 'dis', tu: 'dis', il: 'dit', nous: 'disons', vous: 'dites', ils: 'disent' },
      passe_compose: {
        je: 'ai dit',
        tu: 'as dit',
        il: 'a dit',
        nous: 'avons dit',
        vous: 'avez dit',
        ils: 'ont dit',
      },
    },
  },
]

/** Two scenes per verb id — grammatical French, highlights ⊆ text */
const dialoguesByVerb = {
  aller_001: [
    {
      id: 'aller_conv_01',
      verb_id: 'aller_001',
      level: 'A1',
      scene: 'At a café',
      dialogues: [
        { speaker: 'Marie', text: 'Bonjour! Tu vas bien?', highlighted: ['vas'] },
        { speaker: 'Pierre', text: 'Oui, je vais très bien.', highlighted: ['vais'] },
      ],
    },
    {
      id: 'aller_conv_02',
      verb_id: 'aller_001',
      level: 'A1',
      scene: 'Planning the evening',
      dialogues: [
        { speaker: 'Léa', text: 'Nous allons au cinéma ce soir?', highlighted: ['allons'] },
        { speaker: 'Tom', text: 'Oui, ils vont nous rejoindre vers 20h.', highlighted: ['vont'] },
      ],
    },
  ],
  etre_001: [
    {
      id: 'etre_conv_01',
      verb_id: 'etre_001',
      level: 'A1',
      scene: 'At school',
      dialogues: [
        { speaker: 'Prof', text: 'Vous êtes prêts pour le test?', highlighted: ['êtes'] },
        { speaker: 'Clara', text: 'Oui, nous sommes prêts.', highlighted: ['sommes'] },
      ],
    },
    {
      id: 'etre_conv_02',
      verb_id: 'etre_001',
      level: 'A1',
      scene: 'At home',
      dialogues: [
        { speaker: 'Maman', text: 'Tu es fatigué?', highlighted: ['es'] },
        { speaker: 'Paul', text: 'Un peu, je suis rentré tard.', highlighted: ['suis'] },
      ],
    },
  ],
  avoir_001: [
    {
      id: 'avoir_conv_01',
      verb_id: 'avoir_001',
      level: 'A1',
      scene: 'At breakfast',
      dialogues: [
        { speaker: 'Julie', text: "Tu as faim?", highlighted: ['as'] },
        { speaker: 'Marc', text: "Oui, j'ai très faim.", highlighted: ['ai'] },
      ],
    },
    {
      id: 'avoir_conv_02',
      verb_id: 'avoir_001',
      level: 'A1',
      scene: 'Homework',
      dialogues: [
        { speaker: 'Nadia', text: 'Nous avons un contrôle demain.', highlighted: ['avons'] },
        { speaker: 'Sam', text: 'Ils ont déjà révisé?', highlighted: ['ont'] },
      ],
    },
  ],
  faire_001: [
    {
      id: 'faire_conv_01',
      verb_id: 'faire_001',
      level: 'A1',
      scene: 'Weekend plans',
      dialogues: [
        { speaker: 'Inès', text: 'Tu fais du sport ce weekend?', highlighted: ['fais'] },
        { speaker: 'Hugo', text: 'Oui, je fais du vélo.', highlighted: ['fais'] },
      ],
    },
    {
      id: 'faire_conv_02',
      verb_id: 'faire_001',
      level: 'A1',
      scene: 'Office',
      dialogues: [
        { speaker: 'Boss', text: 'Nous faisons une réunion à 14h.', highlighted: ['faisons'] },
        { speaker: 'Lina', text: 'Parfait, ils font la présentation?', highlighted: ['font'] },
      ],
    },
  ],
  venir_001: [
    {
      id: 'venir_conv_01',
      verb_id: 'venir_001',
      level: 'A1',
      scene: 'At the door',
      dialogues: [
        { speaker: 'Ana', text: 'Tu viens avec nous?', highlighted: ['viens'] },
        { speaker: 'Leo', text: 'Oui, je viens dans cinq minutes.', highlighted: ['viens'] },
      ],
    },
    {
      id: 'venir_conv_02',
      verb_id: 'venir_001',
      level: 'A1',
      scene: 'Party',
      dialogues: [
        { speaker: 'Sara', text: 'Ils viennent de Paris pour le week-end.', highlighted: ['viennent'] },
        { speaker: 'Noah', text: 'Nous venons aussi en train.', highlighted: ['venons'] },
      ],
    },
  ],
  pouvoir_001: [
    {
      id: 'pouvoir_conv_01',
      verb_id: 'pouvoir_001',
      level: 'A2',
      scene: 'Making plans',
      dialogues: [
        { speaker: 'Emma', text: 'Tu peux venir demain?', highlighted: ['peux'] },
        { speaker: 'Jules', text: 'Je peux après 18h.', highlighted: ['peux'] },
      ],
    },
    {
      id: 'pouvoir_conv_02',
      verb_id: 'pouvoir_001',
      level: 'A2',
      scene: 'Classroom',
      dialogues: [
        { speaker: 'Prof', text: 'Nous pouvons commencer?', highlighted: ['pouvons'] },
        { speaker: 'Élève', text: 'Oui, nous pouvons écouter le texte.', highlighted: ['pouvons'] },
      ],
    },
  ],
  vouloir_001: [
    {
      id: 'vouloir_conv_01',
      verb_id: 'vouloir_001',
      level: 'A2',
      scene: 'Restaurant',
      dialogues: [
        { speaker: 'Serveur', text: 'Vous voulez une table près de la fenêtre?', highlighted: ['voulez'] },
        { speaker: 'Client', text: 'Oui, nous voulons celle-ci.', highlighted: ['voulons'] },
      ],
    },
    {
      id: 'vouloir_conv_02',
      verb_id: 'vouloir_001',
      level: 'A2',
      scene: 'Friends',
      dialogues: [
        { speaker: 'Zoé', text: 'Tu veux du thé?', highlighted: ['veux'] },
        { speaker: 'Milo', text: 'Merci, je veux bien.', highlighted: ['veux'] },
      ],
    },
  ],
  devoir_001: [
    {
      id: 'devoir_conv_01',
      verb_id: 'devoir_001',
      level: 'A2',
      scene: 'Homework',
      dialogues: [
        { speaker: 'Liam', text: 'Tu dois finir ce soir?', highlighted: ['dois'] },
        { speaker: 'Maya', text: 'Oui, je dois rendre le devoir demain.', highlighted: ['dois'] },
      ],
    },
    {
      id: 'devoir_conv_02',
      verb_id: 'devoir_001',
      level: 'A2',
      scene: 'Work',
      dialogues: [
        { speaker: 'Chef', text: 'Nous devons envoyer le rapport.', highlighted: ['devons'] },
        { speaker: 'Stagiaire', text: 'Ils doivent valider avant midi?', highlighted: ['doivent'] },
      ],
    },
  ],
  savoir_001: [
    {
      id: 'savoir_conv_01',
      verb_id: 'savoir_001',
      level: 'A2',
      scene: 'Directions',
      dialogues: [
        { speaker: 'Touriste', text: 'Tu sais où est la gare?', highlighted: ['sais'] },
        { speaker: 'Local', text: 'Oui, je sais, c’est à deux rues.', highlighted: ['sais'] },
      ],
    },
    {
      id: 'savoir_conv_02',
      verb_id: 'savoir_001',
      level: 'A2',
      scene: 'Quiz',
      dialogues: [
        { speaker: 'Prof', text: 'Vous savez la réponse?', highlighted: ['savez'] },
        { speaker: 'Classe', text: 'Nous savons la règle.', highlighted: ['savons'] },
      ],
    },
  ],
  prendre_001: [
    {
      id: 'prendre_conv_01',
      verb_id: 'prendre_001',
      level: 'A2',
      scene: 'Café',
      dialogues: [
        { speaker: 'Barista', text: 'Tu prends un café?', highlighted: ['prends'] },
        { speaker: 'Client', text: 'Oui, je prends un cappuccino.', highlighted: ['prends'] },
      ],
    },
    {
      id: 'prendre_conv_02',
      verb_id: 'prendre_001',
      level: 'A2',
      scene: 'Transport',
      dialogues: [
        { speaker: 'Ami', text: 'Nous prenons le bus à 8h.', highlighted: ['prenons'] },
        { speaker: 'Amie', text: 'Ils prennent le métro, non?', highlighted: ['prennent'] },
      ],
    },
  ],
  parler_001: [
    {
      id: 'parler_conv_01',
      verb_id: 'parler_001',
      level: 'A1',
      scene: 'Language class',
      dialogues: [
        { speaker: 'Prof', text: 'Tu parles français à la maison?', highlighted: ['parles'] },
        { speaker: 'Élève', text: 'Oui, je parle avec mes cousins.', highlighted: ['parle'] },
      ],
    },
    {
      id: 'parler_conv_02',
      verb_id: 'parler_001',
      level: 'A1',
      scene: 'Travel',
      dialogues: [
        { speaker: 'Guide', text: 'Nous parlons anglais et espagnol.', highlighted: ['parlons'] },
        { speaker: 'Visiteur', text: 'Parfait, vous parlez lentement, merci.', highlighted: ['parlez'] },
      ],
    },
  ],
  dire_001: [
    {
      id: 'dire_conv_01',
      verb_id: 'dire_001',
      level: 'A2',
      scene: 'News',
      dialogues: [
        { speaker: 'Journaliste', text: 'Que dites-vous de cette décision?', highlighted: ['dites'] },
        { speaker: 'Ministre', text: 'Nous disons que c’est une priorité.', highlighted: ['disons'] },
      ],
    },
    {
      id: 'dire_conv_02',
      verb_id: 'dire_001',
      level: 'A2',
      scene: 'Family',
      dialogues: [
        { speaker: 'Grand-mère', text: 'Tu dis toujours la vérité?', highlighted: ['dis'] },
        { speaker: 'Petit-fils', text: 'Oui, je dis ce que je pense.', highlighted: ['dis'] },
      ],
    },
  ],
}

function practiceForVerb(v) {
  const p = v.tenses.present
  const pc = v.tenses.passe_compose
  const idBase = v.id.replace('_001', '')
  const qs = []

  const snippets = {
    nous_pres: {
      aller_001: {
        sentence: 'Nous ____ au cinéma ce soir.',
        en: 'We are going to the cinema tonight.',
      },
      etre_001: {
        sentence: 'Nous ____ contents du résultat.',
        en: 'We are happy with the result.',
      },
      avoir_001: {
        sentence: 'Nous ____ le temps de finir.',
        en: 'We have time to finish.',
      },
      faire_001: {
        sentence: 'Nous ____ attention aux détails.',
        en: 'We pay attention to the details.',
      },
      venir_001: {
        sentence: 'Nous ____ de Lyon.',
        en: 'We come from Lyon.',
      },
      pouvoir_001: {
        sentence: 'Nous ____ rester un peu plus tard.',
        en: 'We can stay a bit later.',
      },
      vouloir_001: {
        sentence: 'Nous ____ réserver une table.',
        en: 'We want to book a table.',
      },
      devoir_001: {
        sentence: 'Nous ____ partir avant 18h.',
        en: 'We have to leave before 6 p.m.',
      },
      savoir_001: {
        sentence: 'Nous ____ la réponse.',
        en: 'We know the answer.',
      },
      prendre_001: {
        sentence: 'Nous ____ le train de 7h.',
        en: 'We take the 7 a.m. train.',
      },
      parler_001: {
        sentence: 'Nous ____ français en classe.',
        en: 'We speak French in class.',
      },
      dire_001: {
        sentence: 'Nous ____ merci souvent.',
        en: 'We say thank you often.',
      },
    },
    ils_pres: {
      etre_001: {
        sentence: 'Ils ____ très motivés.',
        en: 'They are very motivated.',
      },
      aller_001: {
        sentence: 'Ils ____ au musée samedi.',
        en: 'They are going to the museum on Saturday.',
      },
      venir_001: {
        sentence: 'Ils ____ nous voir demain.',
        en: 'They are coming to see us tomorrow.',
      },
      default: {
        sentence: 'Ils ____ très motivés.',
        en: 'They are very motivated.',
      },
      avoir_001: {
        sentence: 'Ils ____ très faim après le match.',
        en: 'They are very hungry after the match.',
      },
      faire_001: {
        sentence: 'Ils ____ du sport chaque semaine.',
        en: 'They exercise every week.',
      },
      pouvoir_001: {
        sentence: 'Ils ____ venir demain.',
        en: 'They can come tomorrow.',
      },
      vouloir_001: {
        sentence: 'Ils ____ réserver pour huit personnes.',
        en: 'They want to book for eight people.',
      },
      devoir_001: {
        sentence: 'Ils ____ rendre le dossier lundi.',
        en: 'They have to hand in the file on Monday.',
      },
      savoir_001: {
        sentence: 'Ils ____ le code par cœur.',
        en: 'They know the code by heart.',
      },
      prendre_001: {
        sentence: 'Ils ____ le taxi pour l’aéroport.',
        en: 'They take a taxi to the airport.',
      },
      parler_001: {
        sentence: 'Ils ____ espagnol et français.',
        en: 'They speak Spanish and French.',
      },
      dire_001: {
        sentence: 'Ils ____ la même chose.',
        en: 'They say the same thing.',
      },
    },
  }

  const mc1 = snippets.nous_pres[v.id] || snippets.nous_pres.aller_001
  const ilsSn = snippets.ils_pres[v.id] || snippets.ils_pres.default

  const jePres = {
    aller_001: { sentence: 'Je ____ à la plage demain.', en: 'I am going to the beach tomorrow.' },
    etre_001: { sentence: 'Je ____ prêt quand tu arrives.', en: 'I am ready when you arrive.' },
    avoir_001: { sentence: "J'____ froid dehors.", en: "I'm cold outside." },
    faire_001: { sentence: 'Je ____ mes devoirs ce soir.', en: "I'm doing my homework tonight." },
    venir_001: { sentence: 'Je ____ te voir bientôt.', en: "I'm coming to see you soon." },
    pouvoir_001: { sentence: 'Je ____ t’aider si tu veux.', en: 'I can help you if you want.' },
    vouloir_001: { sentence: 'Je ____ un café, s’il te plaît.', en: 'I want a coffee, please.' },
    devoir_001: { sentence: 'Je ____ partir tôt.', en: 'I have to leave early.' },
    savoir_001: { sentence: 'Je ____ la réponse depuis hier.', en: 'I have known the answer since yesterday.' },
    prendre_001: { sentence: 'Je ____ le bus vers 8h.', en: 'I take the bus around 8 a.m.' },
    parler_001: { sentence: 'Je ____ français avec ma famille.', en: 'I speak French with my family.' },
    dire_001: { sentence: 'Je ____ merci souvent.', en: 'I say thank you often.' },
  }
  const jeSn = jePres[v.id] || jePres.aller_001

  const tuPres = {
    aller_001: { sentence: 'Tu ____ où demain après-midi?', en: 'Where are you going tomorrow afternoon?' },
    etre_001: { sentence: 'Tu ____ content du résultat?', en: 'Are you happy with the result?' },
    avoir_001: { sentence: 'Tu ____ le temps ce soir?', en: 'Do you have time tonight?' },
    faire_001: { sentence: 'Tu ____ quoi ce weekend?', en: 'What are you doing this weekend?' },
    venir_001: { sentence: 'Tu ____ à la fête samedi?', en: 'Are you coming to the party on Saturday?' },
    pouvoir_001: { sentence: 'Tu ____ m’aider deux minutes?', en: 'Can you help me for two minutes?' },
    vouloir_001: { sentence: 'Tu ____ du dessert?', en: 'Do you want dessert?' },
    devoir_001: { sentence: 'Tu ____ finir ce soir?', en: 'Do you have to finish tonight?' },
    savoir_001: { sentence: 'Tu ____ la date du test?', en: 'Do you know the test date?' },
    prendre_001: { sentence: 'Tu ____ le train ou le bus?', en: 'Do you take the train or the bus?' },
    parler_001: { sentence: 'Tu ____ anglais couramment?', en: 'Do you speak English fluently?' },
    dire_001: { sentence: 'Tu ____ toujours la vérité?', en: 'Do you always tell the truth?' },
  }
  const tuSn = tuPres[v.id] || tuPres.aller_001

  const mc = [
    {
      pronoun: 'nous',
      tense: 'present',
      sentence: mc1.sentence,
      en: mc1.en,
      choices: [p.je, p.tu, p.il, p.nous].filter((x, i, a) => a.indexOf(x) === i),
      correct: p.nous,
      expl: `${v.infinitive}: nous → ${p.nous} (present).`,
    },
    {
      pronoun: 'tu',
      tense: 'present',
      sentence: tuSn.sentence,
      en: tuSn.en,
      choices: [p.il, p.tu, p.nous, p.ils].filter((x, i, a) => a.indexOf(x) === i),
      correct: p.tu,
      expl: `Tu → ${p.tu}.`,
    },
    {
      pronoun: 'ils',
      tense: 'present',
      sentence: ilsSn.sentence,
      en: ilsSn.en,
      choices: [p.vous, p.il, p.ils, p.nous].filter((x, i, a) => a.indexOf(x) === i),
      correct: p.ils,
      expl: `Ils → ${p.ils}.`,
    },
    {
      pronoun: 'je',
      tense: 'present',
      sentence: jeSn.sentence,
      en: jeSn.en,
      choices: [p.je, p.tu, p.il, p.nous].filter((x, i, a) => a.indexOf(x) === i),
      correct: p.je,
      expl: `Je → ${p.je}.`,
    },
  ]

  mc.forEach((m, i) => {
    let choices = [...m.choices]
    if (!choices.includes(m.correct)) choices[0] = m.correct
    const ci = choices.indexOf(m.correct)
    qs.push({
      id: `${idBase}_mc_${String(i + 1).padStart(2, '0')}`,
      verb_id: v.id,
      tense: m.tense,
      pronoun: m.pronoun,
      difficulty: i < 2 ? 'easy' : 'medium',
      type: 'multiple_choice',
      sentence: m.sentence,
      english: m.en,
      choices,
      correct_index: ci >= 0 ? ci : 0,
      explanation: m.expl,
    })
  })

  const auxNous = pc.nous.split(' ')
  const acceptedPcNous = [pc.nous, auxNous[0]]

  const text = [
    {
      pronoun: 'vous',
      tense: 'present',
      sentence: `Vous ____ en retard ce matin?`,
      en: 'Are you late this morning?',
      acc: [p.vous],
      expl: `Vous → ${p.vous}.`,
    },
    {
      pronoun: 'il',
      tense: 'present',
      sentence: `Il ____ toujours ponctuel.`,
      en: 'He is always punctual.',
      acc: [p.il],
      expl: `Il → ${p.il}.`,
    },
    {
      pronoun: 'nous',
      tense: 'passe_compose',
      sentence: `Nous ____ déjà fini le travail.`,
      en: 'We have already finished the work.',
      acc: acceptedPcNous,
      expl: `Passé composé: ${pc.nous}.`,
    },
  ]

  text.forEach((m, i) => {
    qs.push({
      id: `${idBase}_txt_${String(i + 1).padStart(2, '0')}`,
      verb_id: v.id,
      tense: m.tense,
      pronoun: m.pronoun,
      difficulty: 'medium',
      type: 'text_input',
      sentence: m.sentence,
      english: m.en,
      accepted: [...new Set(m.acc)],
      explanation: m.expl,
    })
  })

  const ctx = [
    {
      pronoun: 'je',
      tense: 'present',
      context: 'Le prof demande qui est disponible.',
      sentence: '— Moi, je ____ libre après 16h.',
      en: 'Me, I am free after 4 p.m.',
      acc: [p.je],
      expl: `Je → ${p.je}.`,
      wrong_hint: `You need the present of ${v.infinitive} for je — one word, not the infinitive.`,
      optional_hint: `Think of the je row in the present tense of ${v.infinitive}.`,
    },
    {
      pronoun: 'tu',
      tense: 'present',
      context: 'Tu parles à un ami.',
      sentence: 'Tu ____ sûr de ton choix?',
      en: 'Are you sure about your choice?',
      acc: [p.tu],
      expl: `Tu → ${p.tu}.`,
      wrong_hint: `Use the informal tu present of ${v.infinitive} (not the je or il form).`,
      optional_hint: `Tu has its own singular ending on this verb — compare je vs tu in the table.`,
    },
    {
      pronoun: 'il',
      tense: 'passe_compose',
      context: 'Hier soir, tout le monde parle du film.',
      sentence: 'Il ____ déjà vu ce film.',
      en: 'He has already seen that film.',
      acc: pc.il.split(' '),
      expl: `Passé composé: ${pc.il}.`,
      wrong_hint: `Passé composé for il: auxiliary (avoir or être) plus past participle — both parts matter.`,
      optional_hint: `Full form for il here: ${pc.il}. Say auxiliary first, then the participle.`,
    },
  ]

  ctx.forEach((m, i) => {
    qs.push({
      id: `${idBase}_ctx_${String(i + 1).padStart(2, '0')}`,
      verb_id: v.id,
      tense: m.tense,
      pronoun: m.pronoun,
      difficulty: 'hard',
      type: 'context',
      context: m.context,
      sentence: m.sentence,
      english: m.en,
      accepted: m.acc,
      explanation: m.expl,
      wrong_hint: m.wrong_hint,
      optional_hint: m.optional_hint,
    })
  })

  return qs
}

const conversations = verbs.flatMap((v) => dialoguesByVerb[v.id] || [])
const practice_questions = verbs.flatMap((v) => practiceForVerb(v))

const bundle = {
  version: 1,
  verbs,
  conversations,
  practice_questions,
}

writeFileSync(out, JSON.stringify(bundle, null, 2), 'utf8')
console.log('Wrote', out)
console.log('verbs:', verbs.length, 'conversations:', conversations.length, 'questions:', practice_questions.length)
