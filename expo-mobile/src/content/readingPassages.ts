/** CEFR reading drills — paragraphs with FR/EN pairs (Canadian / Québec-friendly register). */

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type ReadingLevel = (typeof LEVEL_ORDER)[number]

export type ReadingParagraph = {
  /** French paragraph — several sentences, natural spoken style. */
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
          fr: "Avec mon ami Marc, j'entre dans un petit café du Plateau Mont-Royal. L'odeur du café fraîchement moulu nous accueille tout de suite. La serveuse nous dit bonjour avec le sourire et nous propose une table près de la fenêtre, où on voit les passants sur l'avenue. Nous nous installons et on regarde rapidement la carte : il y a des sandwichs, des pâtisseries et plusieurs sortes de boissons chaudes.",
          en: 'With my friend Marc, I walk into a little café in the Plateau Mont-Royal. The smell of freshly ground coffee greets us right away. The server says hello with a smile and offers us a table near the window, where we can watch people walking along the avenue. We sit down and glance at the menu: there are sandwiches, pastries, and several kinds of hot drinks.',
        },
        {
          fr: "Je commande un café au lait et un croissant beurré. Marc choisit un thé aux épices et une part de quiche aux légumes. Quand l'addition arrive, je paie avec ma carte bancaire et je laisse un petit pourboire dans le plat, comme beaucoup de gens le font ici. Avant de partir, on remercie la serveuse et on décide de refaire ça la semaine prochaine.",
          en: 'I order a coffee with milk and a buttered croissant. Marc chooses a spiced tea and a slice of vegetable quiche. When the bill comes, I pay with my bank card and I leave a small tip in the dish, as many people do here. Before leaving, we thank the server and decide to do this again next week.',
        },
      ],
      question: 'Comment est-ce que la personne paie ?',
      answer: 'Avec sa carte bancaire.',
    },
    {
      title: "À l'école",
      paragraphs: [
        {
          fr: "Ce matin, j'arrive à l'école à huit heures et quart, juste avant la cloche. Le couloir est déjà animé : des élèves parlent fort, d'autres finissent un devoir sur un banc. Je range mon manteau et mes bottes dans le casier du rez-de-chaussée, puis je vérifie que j'ai bien mon dictionnaire de français pour le cours de littérature.",
          en: 'This morning I get to school at a quarter past eight, just before the bell. The hallway is already busy: some students are talking loudly, others are finishing homework on a bench. I put my coat and boots away in the locker on the ground floor, then I check that I have my French dictionary for literature class.',
        },
        {
          fr: "En classe, je retrouve Sofia et Thomas, qui sont assis au deuxième rang. On discute du texte qu'on doit lire pour vendredi et on compare nos notes. La professeure arrive avec une pile de photocopies, nous saluons ensemble, et la leçon sur les consignes de l'examen commence presque tout de suite. Je me concentre : je veux bien comprendre ce qu'elle attend pour la rédaction.",
          en: 'In class I meet Sofia and Thomas, who are sitting in the second row. We talk about the text we have to read for Friday and we compare our notes. The teacher arrives with a stack of photocopies, we greet her together, and the lesson on the exam instructions starts almost right away. I focus: I want to understand clearly what she expects for the writing section.',
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
          fr: "Le lundi, je me lève vers six heures et demie pour éviter l'heure de pointe sur l'autoroute. Je prends un café rapide, je vérifie mes courriels sur le téléphone, puis je pars en voiture jusqu'au centre-ville de Québec. Mon équipe travaille en mode hybride depuis l'automne : deux jours au bureau pour les réunions importantes, trois jours à la maison pour se concentrer sur les dossiers.",
          en: 'On Mondays I get up around six thirty to avoid rush hour on the highway. I have a quick coffee, I check my email on my phone, then I drive downtown to Québec City. My team has been working in a hybrid setup since fall: two days in the office for important meetings, three days at home to focus on files.',
        },
        {
          fr: "Vers neuf heures, je retrouve mes collègues autour d'une grande table pour faire le point sur la semaine. L'après-midi, nous avons une visioconférence avec un client de Toronto : chacun présente son avancement, puis nous fixons les livrables pour vendredi. À dix-sept heures, je quitte le bureau les épaules un peu tendues, mais satisfaite d'avoir débloqué plusieurs questions techniques.",
          en: 'Around nine I meet my colleagues around a big table to review the week. In the afternoon we have a video call with a client from Toronto: everyone presents their progress, then we set deliverables for Friday. At five p.m. I leave the office with my shoulders a bit tight, but glad we cleared several technical issues.',
        },
      ],
      question: 'Comment la personne se rend-elle au travail le matin ?',
      answer: 'En voiture (jusqu’au centre-ville de Québec).',
    },
    {
      title: 'Le weekend',
      paragraphs: [
        {
          fr: "Samedi matin, nous emmenons les enfants au marché Jean-Talon. Les allées sentent bon les herbes fraîches, le fromage du Québec et le pain qui sort du four. Nous discutons avec une productrice de Lanaudière qui explique comment elle cultive ses tomates sans pesticides, et les enfants goûtent une pomme Cortland encore croquante.",
          en: 'Saturday morning we take the kids to Jean-Talon Market. The aisles smell of fresh herbs, Québec cheese, and bread coming out of the oven. We chat with a grower from Lanaudière who explains how she grows her tomatoes without pesticides, and the kids taste a Cortland apple that is still crisp.',
        },
        {
          fr: "L'après-midi, la pluie fine nous oblige à rentrer plus tôt que prévu. À la maison, je feuillette un recueil de nouvelles québécoises pendant que les enfants dessinent au salon. Le dimanche midi, nous rejoignons mes parents en banlieue : ma mère prépare une tourtière, on raconte nos semaines respectives, et le temps passe vite autour de la table.",
          en: 'In the afternoon, light rain makes us head home earlier than planned. At home I flip through a collection of Québec short stories while the kids draw in the living room. On Sunday at noon we join my parents in the suburbs: my mother makes a tourtière, we tell each other about our weeks, and time flies around the table.',
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
          fr: "Notre équipe doit présenter une maquette fonctionnelle à un client institutionnel dans moins d'un mois. Lors du premier atelier, nous avons convenu d'une règle simple : chaque idée est notée au tableau avant d'être discutée, sans jugement immédiat. Cette méthode a permis de faire émerger des propositions qu'on n'aurait peut-être pas osé dire à voix haute autrement.",
          en: 'Our team has to deliver a working prototype to an institutional client in less than a month. At the first workshop we agreed on a simple rule: every idea is written on the board before it is discussed, without instant judgment. That approach brought out suggestions we might not have dared say out loud otherwise.',
        },
        {
          fr: "La semaine suivante, nous avons regroupé les idées par thèmes — budget, délais, communication externe — puis nous avons voté pour deux pistes réalistes. Les rôles se sont répartis naturellement : je coordonne le calendrier, deux collègues s'occupent des maquettes, et une personne rédige les comptes rendus hebdomadaires pour le client.",
          en: 'The following week we grouped ideas by theme—budget, timelines, external communication—then we voted for two realistic options. Roles fell into place naturally: I coordinate the schedule, two colleagues handle mockups, and one person writes the weekly summaries for the client.',
        },
        {
          fr: "Quand un désaccord est apparu sur les priorités, nous avons pris dix minutes pour relire ensemble le cahier des charges. Cette pause a suffi à rappeler que nos objectifs étaient alignés, même si nos tactiques différaient. Depuis, nous répétons ce petit rituel dès que la discussion devient trop émotionnelle.",
          en: 'When a disagreement came up about priorities, we took ten minutes to reread the terms of reference together. That pause was enough to remind us our goals were aligned, even if our tactics differed. Since then we repeat that small ritual whenever discussion gets too emotional.',
        },
      ],
      question: 'Comment l’équipe gère-t-elle les désaccords sur les priorités ?',
      answer: 'Elle prend dix minutes pour relire le cahier des charges (clarifier les objectifs).',
    },
    {
      title: 'Première neige à Montréal',
      paragraphs: [
        {
          fr: "Dès que les premiers flocons se posent sur les toits du Plateau, l'ambiance de la rue change du tout au tout. Les piétons sortent leurs bottes et leurs tuques, même si la météo annonce souvent une fonte rapide le lendemain. J'aime ce moment suspendu où l'automne laisse place à un paysage plus doux, presque silencieux, sous la lumière grise de novembre.",
          en: 'As soon as the first flakes settle on the roofs of the Plateau, the feel of the street changes completely. Pedestrians pull out boots and tuques, even though the forecast often calls for a quick melt the next day. I like that suspended moment when autumn gives way to a softer, almost silent landscape under November’s gray light.',
        },
        {
          fr: "Ce week-end, nous avons décidé d'aller patiner au parc sans dépenser une fortune : nous avons apporté un thermos de chocolat chaud maison et des biscuits aux brisures de chocolat. Les enfants ont glissé en riant sur la glace un peu inégale, et pendant une heure nous avons presque oublié le vent froid sur les joues.",
          en: 'This weekend we decided to go skating in the park without spending a fortune: we brought a thermos of homemade hot chocolate and chocolate-chip cookies. The kids slid around laughing on the slightly uneven ice, and for almost an hour we almost forgot the cold wind on our cheeks.',
        },
        {
          fr: "En rentrant, nous avons croisé des voisins qui saluaient de la main en déneigeant l'entrée. C'est un de ces petits rituels d'hiver qu'on apprend quand on vit ici : partager un peu d'effort, un peu de conversation, avant de refermer la porte derrière soi.",
          en: 'On the way home we ran into neighbors waving as they cleared snow from their steps. It is one of those small winter rituals you learn when you live here: sharing a bit of effort, a bit of conversation, before closing the door behind you.',
        },
      ],
      question: 'Qu’est-ce qu’ils apportent au parc pour se réchauffer ?',
      answer: 'Un thermos de chocolat chaud (et des biscuits).',
    },
  ],
  B2: [
    {
      title: 'Habitudes numériques',
      paragraphs: [
        {
          fr: "Une proportion croissante de personnes consulte leur téléphone intelligent dès le réveil, parfois avant même de mettre les pieds par terre. Ce réflexe, banal en apparence, modifie pourtant la manière dont le cerveau amorce la journée : les notifications remplacent peu à peu un moment de calme, une douche sans écran ou un échange bref avec quelqu'un d'autre dans la cuisine.",
          en: 'A growing share of people check their smartphone as soon as they wake, sometimes before they even put their feet on the floor. That reflex, seemingly trivial, nonetheless changes how the brain starts the day: notifications gradually replace a quiet moment, a shower without a screen, or a brief exchange with someone else in the kitchen.',
        },
        {
          fr: "Les recherches récentes suggèrent que cette habitude peut nuire à la concentration sur le long terme, surtout lorsque l'écran supprime le trajet actif vers le travail ou la préparation mentale avant la première réunion. Il ne s'agit pas de diaboliser la technologie elle-même, mais de choisir consciemment le premier stimulus auquel on expose son attention.",
          en: 'Recent research suggests this habit can harm concentration over the long term, especially when the screen eliminates active commuting or mental prep before the first meeting. The point is not to demonize technology itself, but to consciously choose the first stimulus to which we expose our attention.',
        },
        {
          fr: "Au Québec comme dans d'autres sociétés nord-américaines, certaines écoles secondaires et plusieurs entreprises expérimentent des plages « sans écran » pour favoriser l'attention profonde. L'enjeu dépasse l'individu : il touche aux rituels collectifs — comment une classe ou une équipe négocie ensemble la présence du numérique dans l'espace partagé.",
          en: 'In Québec as in other North American societies, some high schools and many companies are trying screen-free periods to encourage deep focus. The issue goes beyond the individual: it touches collective rituals—how a class or a team negotiates together the presence of digital life in shared space.',
        },
      ],
      question: 'Selon le texte, que peuvent expérimenter certaines écoles et entreprises ?',
      answer: 'Des plages sans écran pour favoriser l’attention profonde.',
    },
    {
      title: 'La langue au quotidien',
      paragraphs: [
        {
          fr: "Vivre en français au quotidien ne se résume pas aux leçons structurées : il faut aussi accepter de se tromper devant un caissier, un médecin ou un conseiller à la banque. Commander au restaurant, demander son chemin dans un quartier inconnu ou téléphoner à la garderie exige une forme de courage modeste mais bien réelle, surtout lorsqu'on entend un accent qui n'est pas le sien.",
          en: 'Living in French day to day is not limited to structured lessons: you also have to accept making mistakes in front of a cashier, a doctor, or a bank advisor. Ordering at a restaurant, asking for directions in an unfamiliar neighborhood, or calling daycare takes a modest but real kind of courage, especially when you hear an accent that is not your own.',
        },
        {
          fr: "Les communautés d'apprenants en ligne peuvent rassurer, offrir des ressources et normaliser les difficultés. Elles ne remplacent toutefois pas l'écoute des accents locaux ni les tournures qu'on n'enseigne pas toujours dans les manuels standardisés. C'est souvent dans la file d'attente du métro ou dans la salle d'urgence qu'on intègre le français tel qu'on le parle ici.",
          en: 'Online learner communities can reassure, offer resources, and normalize struggle. They do not replace hearing local accents or turns of phrase you do not always find in standardized textbooks. It is often in the metro queue or the ER waiting room that you absorb French as it is spoken here.',
        },
        {
          fr: "Pour qui déménage au Canada francophone, la patience envers soi-même devient une compétence au même titre que la grammaire : progresser, ce n'est pas seulement accumuler du vocabulaire, c'est aussi apprivoiser la fatigue sociale liée à la langue seconde.",
          en: 'For someone who moves to Francophone Canada, patience with oneself becomes a skill on a par with grammar: to progress is not only to accumulate vocabulary, it is also to tame the social fatigue that comes with a second language.',
        },
      ],
      question: 'Où intègre-t-on souvent le « français d’ici », selon le texte ?',
      answer: 'Dans la vie quotidienne / les échanges informels (file d’attente, urgences, etc.).',
    },
  ],
  C1: [
    {
      title: 'Débat public',
      paragraphs: [
        {
          fr: "Le débat public met rarement en scène une vérité simple et définitive : chaque position mobilise des valeurs différentes, parfois incompatibles sur le papier mais cohabitables dans la pratique démocratique. Reconnaître cette complexité évite de réduire l'adversaire à une caricature et permet de distinguer désaccord légitime et instrumentalisation de la colère collective.",
          en: 'Public debate rarely presents a single definitive truth: each stance draws on different values, sometimes incompatible on paper yet able to coexist in democratic practice. Acknowledging that complexity keeps us from reducing the other side to a caricature and helps tell legitimate disagreement apart from the weaponization of collective anger.',
        },
        {
          fr: "Les médias sociaux accélèrent la polarisation parce que leurs algorithmes récompensent souvent les formulations tranchées et émotionnellement chargées. Pourtant, dans les commissions parlementaires fédérales ou provinciales, ainsi que lors d'audiences publiques municipales, on observe fréquemment des nuances et des compromis que les manchettes réductrices effacent volontiers.",
          en: 'Social media speeds polarization because their algorithms often reward blunt, emotionally charged statements. Yet in federal or provincial parliamentary committees, as well as at municipal public hearings, you regularly see nuances and trade-offs that reductive headlines willingly erase.',
        },
        {
          fr: "Pour le citoyen ou la citoyenne informée, l'enjeu consiste à distinguer l'émotion politique légitime du rejet systématique de toute concession. La démocratie représentative exige parfois des compromis impopulaires à court terme mais soutenables à long terme — une réalité que les slogans de campagne rendent difficile à formuler sans être accusé de trahison.",
          en: 'For an informed citizen, the challenge is to tell legitimate political emotion apart from a blanket refusal of any compromise. Representative democracy sometimes requires unpopular short-term trade-offs that remain sustainable over the long term—a reality campaign slogans make hard to state without being accused of betrayal.',
        },
      ],
      question: 'Pourquoi les médias sociaux accélèrent-ils la polarisation, selon le texte ?',
      answer: 'Parce que leurs algorithmes récompensent souvent les formulations tranchées et émotionnellement chargées.',
    },
    {
      title: 'Transition énergétique et territoires',
      paragraphs: [
        {
          fr: "La transition énergétique ne se limite pas à substituer une technologie par une autre : elle redistribue emplois, revenus et risques environnementaux entre régions et entre generations. Au Canada, certaines provinces demeurent fortement dépendantes des hydrocarbures, ce qui tend à tendre les échéanciers fédéraux et à polariser les élections provinciales autour de promesses difficiles à concilier.",
          en: 'The energy transition is not limited to swapping one technology for another: it redistributes jobs, income, and environmental risks across regions and generations. In Canada, some provinces remain heavily dependent on hydrocarbons, which tends to strain federal timelines and to polarize provincial elections around promises that are hard to reconcile.',
        },
        {
          fr: "Les décideurs municipaux et régionaux doivent concilier investissements verts, acceptabilité sociale et financement des services essentiels hérités de l'ancienne économie. Sans dialogue prolongé avec les communautés touchées — travailleurs, Premières Nations, municipalités riveraines — les projets risquent d'échouer même lorsqu'ils sont techniquement irréprochables sur le papier.",
          en: 'Municipal and regional decision-makers must balance green investment, social acceptability, and funding for essential services inherited from the old economy. Without sustained dialogue with affected communities—workers, First Nations, shoreline municipalities—projects can fail even when they are technically flawless on paper.',
        },
        {
          fr: "Pour l'apprenant ou l'apprenante avancé·e qui suit l'actualité canadienne, maîtriser le vocabulaire des infrastructures, des subventions fédérales-provinciales et des ententes intergouvernementales devient indispensable. Ce lexique permet de lire entre les lignes des communiqués officiels et de repérer ce qui relève du positionnement politique plutôt que de la donnée technique.",
          en: 'For advanced learners who follow Canadian news, mastering vocabulary around infrastructure, federal-provincial subsidies, and intergovernmental agreements becomes essential. That lexicon lets you read between the lines of official statements and spot what is political positioning rather than technical fact.',
        },
      ],
      question: 'Que risquent les projets sans dialogue prolongé avec les communautés touchées ?',
      answer: 'D’échouer même s’ils sont techniquement irréprochables.',
    },
  ],
}

/** Full French text of one passage for TTS (paragraphs joined with spaces). */
export function passageFrenchForTts(passage: ReadingPassage): string {
  return passage.paragraphs.map((p) => p.fr.trim()).filter(Boolean).join(' ')
}

/** All French text for every passage at a level (header Listen). */
export function levelFrenchForTts(passages: ReadingPassage[]): string {
  return passages
    .flatMap((passage) => passage.paragraphs.map((p) => p.fr.trim()))
    .filter(Boolean)
    .join(' ')
}
