/** CEFR reading drills — paragraphs with FR/EN pairs (aligned with web Reading Room UX goals). */

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type ReadingLevel = (typeof LEVEL_ORDER)[number]

export type ReadingParagraph = {
  /** French paragraph (2–4 sentences). */
  fr: string
  /** English translation of that paragraph. */
  en: string
}

export type ReadingPassage = {
  title: string
  paragraphs: ReadingParagraph[]
  question: string
  answer: string
}

export const PASSAGES: Record<ReadingLevel, ReadingPassage[]> = {
  A1: [
    {
      title: 'Au café',
      paragraphs: [
        {
          fr: "Avec mon ami Marc, j'entre dans un petit café sur la rue Saint-Denis. L'odeur du café frais nous accueille. La serveuse sourit et nous dit bonjour. Nous choisissons une table près de la fenêtre.",
          en: "With my friend Marc, I walk into a little café on Saint-Denis Street. The smell of fresh coffee greets us. The server smiles and says hello. We choose a table near the window.",
        },
        {
          fr: "Je commande un café au lait et un croissant. Marc prend un thé et une part de quiche. Je paie avec ma carte, puis nous restons un peu pour discuter du beau temps dehors.",
          en: 'I order a coffee with milk and a croissant. Marc has tea and a slice of quiche. I pay with my card, then we stay a while to chat about the nice weather outside.',
        },
      ],
      question: 'Comment est-ce que la personne paie ?',
      answer: 'Avec sa carte (bancaire).',
    },
    {
      title: "À l'école",
      paragraphs: [
        {
          fr: "Ce matin, j'arrive à l'école à huit heures et quart. Le couloir est déjà plein d'élèves. Je range mon manteau dans mon casier et je prépare mes cahiers pour le cours de français.",
          en: "This morning I get to school at a quarter past eight. The hallway is already full of students. I put my coat in my locker and I get my notebooks ready for French class.",
        },
        {
          fr: "En classe, je retrouve Sofia et Thomas. Nous parlons de nos devoirs et du film qu'on a vu hier. La professeure arrive, nous saluons et la leçon commence tout de suite.",
          en: 'In class I meet up with Sofia and Thomas. We talk about our homework and the film we saw yesterday. The teacher arrives, we greet her, and the lesson starts right away.',
        },
      ],
      question: 'Avec qui la narratrice ou le narrateur parle-t-il·elle en classe ?',
      answer: 'Avec Sofia et Thomas.',
    },
  ],
  A2: [
    {
      title: 'Une journée de travail',
      paragraphs: [
        {
          fr: "Le lundi, je me lève tôt pour éviter l'heure de pointe. Je prends le métro jusqu'au centre-ville et j'arrive au bureau vers huit heures et demie. Mon équipe travaille en mode hybride : deux jours au bureau, trois jours à la maison.",
          en: "On Mondays I get up early to avoid rush hour. I take the metro downtown and I get to the office around half past eight. My team works in a hybrid way: two days in the office, three days at home.",
        },
        {
          fr: "L'après-midi, nous avons une réunion sur un nouveau projet. Chacun présente ses idées, puis nous décidons des prochaines étapes. À dix-sept heures, je quitte le bureau fatigué mais content d'avoir avancé.",
          en: 'In the afternoon we have a meeting about a new project. Everyone presents their ideas, then we decide on the next steps. At five p.m. I leave the office tired but glad we made progress.',
        },
      ],
      question: 'Comment la personne va-t-elle au travail le matin ?',
      answer: 'Elle prend le métro (jusqu’au centre-ville).',
    },
    {
      title: 'Le weekend',
      paragraphs: [
        {
          fr: "Samedi matin, nous allons au marché Jean-Talon avec les enfants. Nous achetons des légumes québécois, du fromage et du pain artisanal. Les vendeurs sont sympathiques et expliquent d'où viennent les produits.",
          en: 'Saturday morning we go to Jean-Talon Market with the kids. We buy Québec vegetables, cheese, and artisan bread. The vendors are friendly and explain where the products come from.',
        },
        {
          fr: "L'après-midi, il pleut un peu, alors nous restons à la maison. Je lis un roman québécois pendant que les enfants dessinent. Le dimanche, nous visitons mes parents en banlieue pour un souper familial.",
          en: "In the afternoon it rains a little, so we stay home. I read a Québec novel while the kids draw. On Sunday we visit my parents in the suburbs for a family dinner.",
        },
      ],
      question: 'Où vont-ils le samedi matin ?',
      answer: 'Au marché Jean-Talon.',
    },
  ],
  B1: [
    {
      title: "Projet d'équipe",
      paragraphs: [
        {
          fr: "Notre équipe doit livrer une présentation client dans trois semaines. Au premier atelier, chacun propose une idée sans la juger tout de suite. Nous notons tout au tableau, puis nous regroupons les idées par thèmes : budget, délais et communication.",
          en: 'Our team has to deliver a client presentation in three weeks. At the first workshop, everyone suggests an idea without judging it right away. We write everything on the board, then we group ideas by theme: budget, timelines, and communication.',
        },
        {
          fr: "La semaine suivante, nous choisissons deux pistes réalistes. Nous répartissons les tâches selon les forces de chacun. Moi, je coordonne le calendrier ; deux collègues préparent les visuels. Nous convenons d'un point d'étape chaque vendredi.",
          en: 'The following week we choose two realistic options. We divide tasks according to each person’s strengths. I coordinate the schedule; two colleagues prepare the visuals. We agree on a check-in every Friday.',
        },
        {
          fr: "Quand un désaccord apparaît sur les priorités, nous prenons dix minutes pour clarifier les objectifs du client. Cette habitude nous évite les malentendus et nous fait gagner du temps plus tard.",
          en: 'When a disagreement comes up about priorities, we take ten minutes to clarify the client’s goals. That habit saves us misunderstandings and time later on.',
        },
      ],
      question: 'Comment l’équipe gère-t-elle les désaccords sur les priorités ?',
      answer: 'Elle prend dix minutes pour clarifier les objectifs du client.',
    },
    {
      title: 'Première neige à Montréal',
      paragraphs: [
        {
          fr: "Quand les premiers flocons tombent sur le Plateau, les trottoirs deviennent plus silencieux. Les Montréalais sortent bottes et tuques, même si la neige fond souvent le lendemain. J'aime cette transition : l'automne laisse place à un paysage plus doux sous la lumière grise.",
          en: 'When the first flakes fall on the Plateau, the sidewalks grow quieter. Montrealers pull out boots and tuques, even if the snow often melts the next day. I like that transition: autumn gives way to a softer landscape under the gray light.',
        },
        {
          fr: "Ce week-end, nous avons décidé de patiner au parc sans dépenser trop. Nous avons apporté un thermos de chocolat chaud et nous avons partagé des biscuits maison. Les enfants ont ri en glissant, et nous avons oublié le froid pendant une heure.",
          en: 'This weekend we decided to go skating in the park without spending much. We brought a thermos of hot chocolate and shared homemade cookies. The kids laughed as they slid around, and we forgot about the cold for an hour.',
        },
      ],
      question: 'Qu’est-ce qu’ils apportent au parc pour se réchauffer ?',
      answer: 'Un thermos de chocolat chaud (et des biscuits maison).',
    },
  ],
  B2: [
    {
      title: 'Habitudes numériques',
      paragraphs: [
        {
          fr: "De nombreuses personnes consultent leur téléphone dès le réveil, parfois avant même de se lever. Ce réflexe modifie la façon dont le cerveau amorce la journée : les notifications remplacent progressivement un moment de calme ou une conversation familiale.",
          en: 'Many people check their phones as soon as they wake up, sometimes before they even get out of bed. That reflex changes how the brain starts the day: notifications gradually replace a quiet moment or a conversation with family.',
        },
        {
          fr: "Les études suggèrent que cette habitude peut nuire à la concentration sur le long terme, surtout si l'écran remplace le déplacement actif ou la préparation mentale avant le travail. Il ne s'agit pas de diaboliser la technologie, mais de choisir consciemment le premier stimulus de la matinée.",
          en: 'Studies suggest this habit can harm concentration in the long run, especially if the screen replaces active commuting or mental preparation before work. The point is not to demonize technology, but to consciously choose the first stimulus of the morning.',
        },
        {
          fr: "Au Québec comme ailleurs, certaines écoles et entreprises expérimentent des plages sans écran pour favoriser l'attention profonde. L'enjeu est culturel autant qu'individuel : repenser les rituels collectifs autour du numérique.",
          en: 'In Québec as elsewhere, some schools and companies are trying screen-free periods to encourage deep focus. The issue is cultural as much as individual: rethinking collective rituals around digital life.',
        },
      ],
      question: 'Selon le texte, que peuvent expérimenter certaines écoles et entreprises ?',
      answer: 'Des plages sans écran pour favoriser l’attention profonde.',
    },
    {
      title: 'La langue au quotidien',
      paragraphs: [
        {
          fr: "Vivre en français au quotidien ne signifie pas seulement suivre des cours : il faut aussi accepter de se tromper dans la vraie vie. Commander au restaurant, demander son chemin ou téléphoner à la garderie demande une forme de courage modeste mais réel.",
          en: 'Living in French day to day doesn’t only mean taking classes: you also have to accept making mistakes in real life. Ordering at a restaurant, asking for directions, or calling daycare takes a modest but real kind of courage.',
        },
        {
          fr: "Les communautés d'apprenants en ligne peuvent rassurer, mais elles ne remplacent pas l'écoute des accents locaux ni les expressions qu'on n'enseigne pas toujours dans les manuels. C'est souvent dans les échanges informels qu'on intègre le français d'ici.",
          en: 'Online learner communities can be reassuring, but they don’t replace hearing local accents or expressions you don’t always find in textbooks. It’s often in informal exchanges that you absorb French as it’s spoken here.',
        },
      ],
      question: 'Où intègre-t-on souvent le « français d’ici », selon le texte ?',
      answer: 'Dans les échanges informels.',
    },
  ],
  C1: [
    {
      title: 'Débat public',
      paragraphs: [
        {
          fr: "Le débat public met rarement en scène une vérité simple : chaque position mobilise des valeurs différentes, parfois incompatibles sur le papier mais cohabitables dans la pratique démocratique. Reconnaître cette complexité évite de réduire l'adversaire à un caricature.",
          en: 'Public debate rarely presents a simple truth: each stance draws on different values, sometimes incompatible on paper yet able to coexist in democratic practice. Acknowledging that complexity keeps us from reducing the other side to a caricature.',
        },
        {
          fr: "Les médias sociaux accélèrent la polarisation parce qu'ils récompensent les formulations tranchées. Pourtant, dans les commissions parlementaires ou les audiences publiques, on observe souvent des nuances que les manchettes effacent.",
          en: 'Social media speeds up polarization because it rewards blunt statements. Yet in parliamentary committees or public hearings, you often see nuances that headlines erase.',
        },
        {
          fr: "Pour le citoyen informé, l'enjeu consiste à distinguer l'émotion légitime du rejet systématique de toute concession. La démocratie exige parfois des compromis impopulaires à court terme mais soutenables à long terme.",
          en: 'For an informed citizen, the challenge is to tell legitimate emotion apart from a blanket refusal of any compromise. Democracy sometimes requires unpopular short-term trade-offs that remain sustainable over the long term.',
        },
      ],
      question: 'Pourquoi les médias sociaux accélèrent-ils la polarisation, selon le texte ?',
      answer: 'Parce qu’ils récompensent les formulations tranchées.',
    },
    {
      title: 'Transition énergétique et territoires',
      paragraphs: [
        {
          fr: "La transition énergétique ne se résume pas à remplacer une technologie par une autre : elle redistribue emplois, revenus et risques entre régions. Au Canada, certaines provinces dépendent encore fortement des hydrocarbures, ce qui rend les échéanciers fédéraux sujets à tension politique.",
          en: 'The energy transition isn’t just swapping one technology for another: it redistributes jobs, income, and risks across regions. In Canada, some provinces still depend heavily on hydrocarbons, which makes federal timelines politically tense.',
        },
        {
          fr: "Les décideurs locaux doivent concilier investissements verts, acceptabilité sociale et services essentiels financés par l'ancienne économie. Sans dialogue prolongé avec les communautés touchées, les projets risquent d'échouer même techniquement.",
          en: 'Local decision-makers must balance green investment, social acceptability, and essential services funded by the old economy. Without sustained dialogue with affected communities, projects can fail even when they are technically sound.',
        },
        {
          fr: "Pour les apprenants avancés qui suivent l'actualité, il devient crucial de maîtriser le vocabulaire des infrastructures, des subventions et des accords intergouvernementaux — autant de clés pour lire entre les lignes des communiqués officiels.",
          en: 'For advanced learners who follow the news, mastering vocabulary around infrastructure, subsidies, and intergovernmental agreements becomes essential—keys to reading between the lines of official statements.',
        },
      ],
      question: 'Que risquent les projets sans dialogue prolongé avec les communautés touchées ?',
      answer: 'D’échouer même techniquement.',
    },
  ],
}

/** Full French text of a passage (for TTS). */
export function passageFrenchForTts(passage: ReadingPassage): string {
  return passage.paragraphs.map((p) => p.fr.trim()).join('\n\n')
}
