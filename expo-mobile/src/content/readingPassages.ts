/** CEFR reading drills — aligned with web `ReadingRoomPage`. */

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type ReadingLevel = (typeof LEVEL_ORDER)[number]

export type ReadingPassage = {
  title: string
  text: string
  question: string
  answer: string
}

export const PASSAGES: Record<ReadingLevel, ReadingPassage[]> = {
  A1: [
    {
      title: 'Au café',
      text: "Je vais au café avec mon ami. Nous commandons un café et un croissant. Il fait beau aujourd'hui.",
      question: 'What do they order?',
      answer: 'Un café et un croissant.',
    },
  ],
  A2: [
    {
      title: 'Une journée de travail',
      text: 'Le matin, Marie prend le métro pour aller au bureau. Elle commence à neuf heures et déjeune avec ses collègues.',
      question: 'How does Marie go to work?',
      answer: 'Elle prend le métro.',
    },
  ],
  B1: [
    {
      title: "Projet d'équipe",
      text: "L'équipe prépare une présentation. Chacun partage ses idées, puis ils choisissent les meilleures solutions.",
      question: 'What does the team do after sharing ideas?',
      answer: 'Ils choisissent les meilleures solutions.',
    },
  ],
  B2: [
    {
      title: 'Habitudes numériques',
      text: 'Beaucoup de personnes consultent leur téléphone dès le réveil, ce qui influence leur concentration pendant la journée.',
      question: 'What is affected during the day?',
      answer: 'La concentration.',
    },
  ],
  C1: [
    {
      title: 'Débat public',
      text: 'Le débat met en lumière la complexité du sujet : chaque argument semble pertinent, mais ses conséquences divergent.',
      question: 'How are the consequences described?',
      answer: 'Elles divergent.',
    },
  ],
}
