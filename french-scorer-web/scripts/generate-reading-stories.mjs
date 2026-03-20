/**
 * Regenerates Reading Room story JSON with ~150–300 French words each + timings.
 * Run from repo root: node french-scorer-web/scripts/generate-reading-stories.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const storiesDir = join(__dirname, '../public/assets/stories')

function buildSentences(pairs, secPerWord = 0.48) {
  let t = 0
  return pairs.map(({ fr, en }) => {
    const w = fr.trim().split(/\s+/).filter(Boolean).length
    const dur = Math.max(2.3, w * secPerWord)
    const start = t
    t += dur
    return {
      fr,
      en,
      start: Math.round(start * 10) / 10,
      end: Math.round(t * 10) / 10,
    }
  })
}

function countWords(pairs) {
  return pairs.map((p) => p.fr).join(' ').trim().split(/\s+/).filter(Boolean).length
}

function writeStory(filename, payload) {
  const path = join(storiesDir, filename)
  writeFileSync(path, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  const w = countWords(
    payload.sentences.map((s) => ({ fr: s.fr, en: s.en })),
  )
  console.log(filename, '→', w, 'FR words,', payload.sentences.at(-1)?.end, 's mock duration')
}

// --- A1 Au café ---
const a1CafePairs = [
  {
    fr: "Léa habite dans une rue calme près d'une petite place où il y a des arbres et un banc public.",
    en: 'Léa lives on a quiet street near a small square where there are trees and a public bench.',
  },
  {
    fr: "Ce matin, elle décide de prendre son petit-déjeuner au café du coin, comme elle le fait souvent le mardi.",
    en: 'This morning, she decides to have breakfast at the corner café, as she often does on Tuesdays.',
  },
  {
    fr: "Elle pousse la porte en verre et dit « Bonjour » à la serveuse qui range des tasses près de la machine à café.",
    en: 'She pushes the glass door and says “Hello” to the waitress who is putting cups away near the coffee machine.',
  },
  {
    fr: "La serveuse répond avec le sourire et lui propose une table libre près de la fenêtre, en face de la rue.",
    en: 'The waitress answers with a smile and offers her a free table near the window, facing the street.',
  },
  {
    fr: "Léa s'assoit et lit rapidement le menu écrit à la craie sur le tableau noir au-dessus du comptoir.",
    en: 'Léa sits down and quickly reads the menu written in chalk on the blackboard above the counter.',
  },
  {
    fr: "La serveuse arrive avec un petit carnet et demande poliment : « Vous désirez ? »",
    en: 'The waitress arrives with a small notepad and asks politely: “What would you like?”',
  },
  {
    fr: "Léa répond : « Je voudrais un grand café crème, s'il vous plaît », parce que cette formule est plus polie que « je veux ».",
    en: 'Léa answers: “I would like a large coffee with milk, please,” because that wording is more polite than “I want.”',
  },
  {
    fr: "Elle ajoute : « Et un croissant, s'il vous plaît », puis elle range son téléphone dans son sac.",
    en: 'She adds: “And a croissant, please,” then she puts her phone away in her bag.',
  },
  {
    fr: "« Avec du lait dedans, merci », répond Léa en regardant les passants qui marchent vite sur le trottoir.",
    en: '“With milk inside, thanks,” Léa replies, watching passers-by walking quickly on the sidewalk.',
  },
  {
    fr: "Le serveur apporte une tasse blanche fumante et une assiette avec le croissant doré et croustillant.",
    en: 'The waiter brings a steaming white cup and a plate with a golden, crispy croissant.',
  },
  {
    fr: "« C'est trois euros quatre-vingts », répond le serveur gentiment, puis il retourne vers la cuisine.",
    en: '“It’s three euros eighty,” the waiter answers kindly, then he goes back toward the kitchen.',
  },
  {
    fr: "Léa paie avec sa carte bancaire et dit « Merci beaucoup » parce qu'elle est contente du service.",
    en: 'Léa pays with her bank card and says “Thank you very much” because she is happy with the service.',
  },
  {
    fr: "Elle mange lentement, dit « Au revoir » à la serveuse, puis sort alors que la ville s'anime avec les bus et les vélos.",
    en: 'She eats slowly, says “Goodbye” to the waitress, then leaves as the city comes alive with buses and bicycles.',
  },
]

writeStory('a1-cafe.json', {
  id: 'a1-cafe',
  level: 'A1',
  title: 'Au café',
  chapter: 'Mission quotidienne',
  audioUrl: null,
  sentences: buildSentences(a1CafePairs),
  grammarMarkers: [
    {
      id: 'cond-politesse',
      sentenceIndex: 6,
      label: 'Conditionnel de politesse',
      explanation: "« Je voudrais » est plus poli que « je veux » dans un café ou un restaurant.",
    },
    {
      id: 'svp',
      sentenceIndex: 7,
      label: 'Formule fixe',
      explanation: "« S'il vous plaît » accompagne une demande courtoise.",
    },
    {
      id: 'combien',
      sentenceIndex: 10,
      label: 'Le prix',
      explanation: "On associe souvent « combien ? » à ce type de réponse (« trois euros quatre-vingts »).",
    },
  ],
  vocabulary: [
    { fr: 'un café', en: 'a coffee / a café' },
    { fr: 'du lait', en: 'milk' },
    { fr: 'un croissant', en: 'a croissant' },
    { fr: 's’il vous plaît', en: 'please (formal)' },
    { fr: 'merci', en: 'thank you' },
    { fr: 'combien', en: 'how much' },
    { fr: 'le trottoir', en: 'the sidewalk' },
    { fr: 'payer', en: 'to pay' },
  ],
})

// --- A1 Ma famille ---
const a1FamillePairs = [
  {
    fr: "Je m'appelle Léa et j'ai vingt ans ; je suis étudiante en lettres dans une grande ville de France.",
    en: 'My name is Léa and I am twenty; I am a literature student in a large city in France.',
  },
  {
    fr: "J'habite à Lyon avec mes parents, dans un appartement lumineux au troisième étage sans ascenseur bruyant.",
    en: 'I live in Lyon with my parents, in a bright apartment on the third floor without a noisy lift.',
  },
  {
    fr: "Mon père travaille dans un bureau près de la gare ; il prend souvent le tram pour éviter les embouteillages du matin.",
    en: 'My father works in an office near the station; he often takes the tram to avoid morning traffic jams.',
  },
  {
    fr: "Ma mère est infirmière dans un petit hôpital ; ses horaires changent chaque semaine selon les équipes de nuit.",
    en: 'My mother is a nurse in a small hospital; her hours change every week depending on the night teams.',
  },
  {
    fr: "Mon frère s'appelle Tom ; il est plus jeune que moi et il prépare un diplôme en informatique à l'université.",
    en: 'My brother is called Tom; he is younger than me and he is working toward a degree in computer science at university.',
  },
  {
    fr: "Tom est sympa mais un peu distrait : il oublie parfois ses clés sur la table de la cuisine.",
    en: 'Tom is nice but a little absent-minded: he sometimes forgets his keys on the kitchen table.',
  },
  {
    fr: "Le week-end, nous essayons de déjeuner ensemble le dimanche après une matinée calme avec du pain frais.",
    en: 'At the weekend, we try to have lunch together on Sunday after a quiet morning with fresh bread.',
  },
  {
    fr: "Ma grand-mère habite encore dans le village où ma mère a grandi, à environ deux heures en train de Lyon.",
    en: 'My grandmother still lives in the village where my mother grew up, about two hours by train from Lyon.',
  },
  {
    fr: "Nous lui téléphonons chaque mercredi pour prendre des nouvelles et raconter nos petites victoires du jour.",
    en: 'We phone her every Wednesday to catch up and tell her about our small successes of the day.',
  },
  {
    fr: "J'ai aussi une cousine qui vit au Canada ; nous envoyons des messages vocaux pour pratiquer notre accent.",
    en: 'I also have a cousin who lives in Canada; we send voice messages to practise our accent.',
  },
  {
    fr: "Dans ma famille, on se parle franchement mais avec respect quand nous ne sommes pas d'accord sur un sujet.",
    en: 'In my family, we speak frankly but with respect when we disagree about something.',
  },
  {
    fr: "Mes parents disent que l'école est importante, mais qu'il faut aussi dormir assez et faire du sport dehors.",
    en: 'My parents say school is important, but that you also have to sleep enough and do sport outside.',
  },
  {
    fr: "L'été dernier, nous sommes allés tous les cinq au bord de la mer en Normandie pour une semaine de vacances simples.",
    en: 'Last summer, all five of us went to the seaside in Normandy for a week of simple holidays.',
  },
  {
    fr: "Nous avons marché sur la plage, mangé des glaces et ri quand le vent a renversé notre parasol sur le sable.",
    en: 'We walked on the beach, ate ice creams and laughed when the wind blew our parasol over on the sand.',
  },
  {
    fr: "Pour moi, la famille ce n'est pas seulement le sang : ce sont les personnes qui vous écoutent vraiment quand vous avez peur.",
    en: 'For me, family isn’t only blood: it’s the people who really listen to you when you are afraid.',
  },
]

writeStory('a1-famille.json', {
  id: 'a1-famille',
  level: 'A1',
  title: 'Ma famille',
  chapter: 'Mission quotidienne',
  audioUrl: null,
  sentences: buildSentences(a1FamillePairs),
  grammarMarkers: [
    {
      id: 'avoir-age',
      sentenceIndex: 0,
      label: 'Avoir + âge',
      explanation: "En français on dit « j'ai vingt ans », pas « je suis vingt ».",
    },
    {
      id: 'habiter',
      sentenceIndex: 1,
      label: 'Habiter à + ville',
      explanation: "« J'habite à Lyon » : la préposition « à » devant le nom de la ville.",
    },
    {
      id: 'aller-etre',
      sentenceIndex: 12,
      label: 'Passé composé (être) — aller',
      explanation: "« Nous sommes allés » : accord du participe avec le sujet « nous ».",
    },
  ],
  vocabulary: [
    { fr: 'les parents', en: 'parents' },
    { fr: 'le frère', en: 'brother' },
    { fr: 'la grand-mère', en: 'grandmother' },
    { fr: 'un cousin / une cousine', en: 'cousin' },
    { fr: 'habiter', en: 'to live (reside)' },
    { fr: 'être fière', en: 'to be proud (f.)' },
  ],
})

// --- A2 Week-end ---
const a2Pairs = [
  {
    fr: "Le week-end dernier, le temps était enfin agréable après plusieurs jours de pluie froide et de vent désagréable.",
    en: 'Last weekend, the weather was finally pleasant after several days of cold rain and unpleasant wind.',
  },
  {
    fr: "Samedi matin, il a fait beau ; le ciel était bleu et les oiseaux chantaient dans les arbres du jardin public.",
    en: 'On Saturday morning, the weather was nice; the sky was blue and birds were singing in the trees of the public garden.',
  },
  {
    fr: "Nous sommes allés au parc avec des amis de l'université pour organiser un pique-nique simple sur l'herbe.",
    en: 'We went to the park with friends from university to organise a simple picnic on the grass.',
  },
  {
    fr: "Chacun avait apporté quelque chose : du fromage, des tomates, du pain complet et une bouteille d'eau gazeuse.",
    en: 'Everyone had brought something: cheese, tomatoes, wholemeal bread and a bottle of sparkling water.',
  },
  {
    fr: "Nous avons joué au frisbee pendant une heure, puis nous nous sommes assis pour discuter de nos projets d'été.",
    en: 'We played frisbee for an hour, then we sat down to talk about our summer plans.',
  },
  {
    fr: "Un ami a proposé de louer une maison près de la montagne en juillet, mais les prix semblaient un peu élevés pour nous.",
    en: 'A friend suggested renting a house near the mountains in July, but the prices seemed a little high for us.',
  },
  {
    fr: "Le dimanche, je me suis reposé chez moi : j'ai lu un roman policier et j'ai fait une longue sieste l'après-midi.",
    en: 'On Sunday, I rested at home: I read a detective novel and I took a long nap in the afternoon.',
  },
  {
    fr: "Le soir, nous avons regardé un film en version française avec des sous-titres pour ne pas perdre une seule réplique.",
    en: 'In the evening, we watched a film in French with subtitles so as not to miss a single line.',
  },
  {
    fr: "Ce week-end m'a rappelé qu'il ne faut pas attendre les grandes vacances pour profiter des petits plaisirs du quotidien.",
    en: 'That weekend reminded me that you shouldn’t wait for the big holidays to enjoy the small pleasures of daily life.',
  },
]

writeStory('a2-weekend.json', {
  id: 'a2-weekend',
  level: 'A2',
  title: 'Le week-end dernier',
  chapter: 'Récit court',
  audioUrl: null,
  sentences: buildSentences(a2Pairs),
  grammarMarkers: [
    {
      id: 'il-fait',
      sentenceIndex: 1,
      label: 'Il fait + adjectif (météo)',
      explanation: "« Il a fait beau » au passé pour décrire la météo du week-end.",
    },
    {
      id: 'aller-etre',
      sentenceIndex: 2,
      label: 'Passé composé (être) — aller',
      explanation: "« Nous sommes allés » : accord du participe avec le sujet.",
    },
    {
      id: 'se-reposer',
      sentenceIndex: 6,
      label: 'Pronominal — se reposer',
      explanation: "« Je me suis reposé » : verbe pronominal au passé composé avec être.",
    },
  ],
  vocabulary: [
    { fr: 'le parc', en: 'park' },
    { fr: 'un pique-nique', en: 'picnic' },
    { fr: 'se reposer', en: 'to rest' },
    { fr: 'un roman', en: 'a novel' },
    { fr: 'les sous-titres', en: 'subtitles' },
  ],
})

// --- B1 Métro (expanded) ---
const b1MetroPairs = [
  {
    fr: "Ce matin-là, la rame de métro était bondée comme après un concert ou une grève surprise sur la ligne quatre.",
    en: 'That morning, the metro train was as packed as after a concert or a surprise strike on line four.',
  },
  {
    fr: "J'ai à peine trouvé une place pour mon sac entre deux valises massives qui bloquaient le couloir central.",
    en: 'I barely found a spot for my bag between two massive suitcases that blocked the central aisle.',
  },
  {
    fr: "Les voyageurs poussaient doucement mais fermement, sans vraiment s'excuser, comme si la politesse avait disparu sous terre.",
    en: 'Passengers pushed gently but firmly, without really apologising, as if politeness had disappeared underground.',
  },
  {
    fr: "Une voix métallique a annoncé : « Attention aux pickpockets : gardez vos affaires près de vous. »",
    en: 'A metallic voice announced: “Watch out for pickpockets: keep your belongings close to you.”',
  },
  {
    fr: "Plusieurs personnes ont vérifié leur portefeuille avec un geste nerveux, puis ont baissé les yeux sur leur téléphone.",
    en: 'Several people checked their wallet with a nervous gesture, then looked down at their phone.',
  },
  {
    fr: "Je me suis demandé si je devais descendre à la prochaine station pour respirer un peu d'air, même pollué, de la rue.",
    en: 'I wondered whether I should get off at the next station to breathe a little street air, even if it was polluted.',
  },
  {
    fr: "Finalement, distrait par un podcast, je suis descendu deux arrêts trop tard sans m'en rendre compte tout de suite.",
    en: 'In the end, distracted by a podcast, I got off two stops too late without realising it straight away.',
  },
  {
    fr: "Le quartier ne correspondait pas du tout à mon plan habituel, mais les façades colorées valaient largement le détour.",
    en: 'The neighbourhood didn’t match my usual route at all, but the colourful façades were well worth the detour.',
  },
  {
    fr: "J'ai marché dix minutes pour rejoindre une ligne plus calme, en observant les boutiques qui ouvraient leurs rideaux métalliques.",
    en: 'I walked ten minutes to reach a calmer line, watching shops open their metal shutters.',
  },
  {
    fr: "Ce contretemps m'a rappelé que Paris n'est jamais tout à fait prévisible, même quand on croit connaître son trajet par cœur.",
    en: 'That mishap reminded me that Paris is never quite predictable, even when you think you know your route by heart.',
  },
]

writeStory('b1-metro.json', {
  id: 'b1-metro',
  level: 'B1',
  title: 'Dans le métro',
  chapter: 'Paris',
  audioUrl: null,
  sentences: buildSentences(b1MetroPairs),
  grammarMarkers: [
    {
      id: 'imparfait-ete',
      sentenceIndex: 0,
      label: 'Imparfait / passé composé',
      explanation: "« Était bondée » décrit l'état ; les actions ponctuelles utilisent le passé composé.",
    },
    {
      id: 'subjonctif-ou',
      sentenceIndex: 5,
      label: 'Se demander si + indicatif',
      explanation: "Après « se demander si », l'indicatif exprime une interrogation réelle au passé.",
    },
  ],
  vocabulary: [
    { fr: 'bondé(e)', en: 'packed / crowded' },
    { fr: 'à peine', en: 'barely' },
    { fr: 'un arrêt', en: 'a stop (transit)' },
    { fr: 'valoir le détour', en: 'to be worth the detour' },
    { fr: 'un pickpocket', en: 'pickpocket' },
  ],
})

// --- B1 narrative (replaces short Petit Prince excerpt with original long text; same file name in manifest) ---
const b1NarrativePairs = [
  {
    fr: "Quand j'étais enfant, j'adorais observer les adultes sans qu'ils s'en aperçoivent, surtout dans les files d'attente interminables.",
    en: 'When I was a child, I loved watching adults without their noticing, especially in endless queues.',
  },
  {
    fr: "Je trouvais leurs conversations répétitives : toujours la météo, le travail, le prix de l'essence ou les impôts locaux.",
    en: 'I found their conversations repetitive: always the weather, work, the price of petrol or local taxes.',
  },
  {
    fr: "Un jour, mon oncle m'a expliqué que les grandes personnes oublient souvent d'où vient leur propre curiosité d'autrefois.",
    en: 'One day, my uncle explained to me that grown-ups often forget where their own curiosity of long ago came from.',
  },
  {
    fr: "J'ai donc décidé de noter dans un carnet les phrases bizarres que j'entendais, comme un petit ethnologue du quotidien.",
    en: 'So I decided to jot down in a notebook the odd phrases I heard, like a little ethnographer of everyday life.',
  },
  {
    fr: "Plus tard, ce carnet m'a servi quand j'ai choisi d'apprendre à piloter des avions légers au club de ma région.",
    en: 'Later, that notebook was useful when I chose to learn to fly light aircraft at the club in my area.',
  },
  {
    fr: "J'ai volé un peu partout dans le monde, mais la géographie ne m'a jamais semblée aussi vivante que vue du hublot.",
    en: 'I have flown a little everywhere in the world, but geography never seemed as alive as seen from the porthole.',
  },
  {
    fr: "Du ciel, une forêt ne ressemble pas à une carte ; une ville industrielle ne ressemble pas à un simple point rouge.",
    en: 'From the sky, a forest doesn’t look like a map; an industrial city doesn’t look like a simple red dot.',
  },
  {
    fr: "Et c'est vrai que la géographie m'a servi, mais surtout pour comprendre que les frontières sont aussi des histoires humaines.",
    en: 'And it is true that geography was useful to me, but mainly to understand that borders are also human stories.',
  },
  {
    fr: "Je savais reconnaître, du premier coup d'œil, la différence entre une plaine enneigée et un désert minéral sous le soleil blanc.",
    en: 'I could tell at first glance the difference between a snowy plain and a mineral desert under the white sun.',
  },
  {
    fr: "Aujourd'hui, je ne pilote plus chaque semaine, mais je garde cette habitude : regarder le monde avec des yeux d'enfant quand je peux.",
    en: 'Today, I no longer fly every week, but I keep this habit: looking at the world with a child’s eyes when I can.',
  },
]

writeStory('b1-petit-prince-ch2.json', {
  id: 'b1-petit-prince-ch2',
  level: 'B1',
  title: 'Regarder le monde',
  chapter: 'Récit personnel',
  audioUrl: null,
  sentences: buildSentences(b1NarrativePairs),
  grammarMarkers: [
    {
      id: 'imparfait',
      sentenceIndex: 0,
      label: 'Imparfait (histoire)',
      explanation: "« Quand j'étais enfant », « je trouvais » : fond du récit au passé.",
    },
    {
      id: 'pc-choisir',
      sentenceIndex: 3,
      label: 'Passé composé enchaîné',
      explanation: "« J'ai décidé », « j'ai noté » : suite d'actions accomplies.",
    },
    {
      id: 'savoir-inf',
      sentenceIndex: 8,
      label: 'Savoir + infinitif',
      explanation: "« Je savais reconnaître » : capacité au passé.",
    },
  ],
  vocabulary: [
    { fr: 'une curiosité', en: 'curiosity' },
    { fr: 'un carnet', en: 'notebook' },
    { fr: 'piloter', en: 'to pilot / fly' },
    { fr: 'un hublot', en: 'porthole / small window (plane)' },
    { fr: 'du premier coup d’œil', en: 'at first glance' },
  ],
})

// --- B2 opinion ---
const b2Pairs = [
  {
    fr: "Il serait naïf de croire que l'information circule aujourd'hui sans biais, sans cadre éditorial et sans logique d'audience commerciale.",
    en: 'It would be naive to believe that information today circulates without bias, editorial framing or commercial audience logic.',
  },
  {
    fr: "Les réseaux sociaux accélèrent la diffusion des faits vérifiés comme des rumeurs, au même rythme et parfois avec la même apparence visuelle.",
    en: 'Social networks speed up the spread of verified facts like rumours, at the same pace and sometimes with the same visual appearance.',
  },
  {
    fr: "Pour autant, relativiser systématiquement tout discours mène à une impasse : on finit par douter même des preuves solides.",
    en: 'Even so, systematically relativising every discourse leads to a dead end: you end up doubting even solid evidence.',
  },
  {
    fr: "La voie responsable consiste à croiser les sources, à identifier les conflits d'intérêts et à accepter la complexité des dossiers techniques.",
    en: 'The responsible path is to cross-check sources, identify conflicts of interest and accept the complexity of technical issues.',
  },
  {
    fr: "Les citoyens ne sont pas tenus d'être des experts, mais ils peuvent exiger des médias des méthodes de correction transparentes.",
    en: 'Citizens are not required to be experts, but they can demand transparent correction methods from the media.',
  },
  {
    fr: "Sans ce minimum d'exigence, la confiance publique continue de s'éroder, et la démocratie délibérative perd son terrain le plus précieux : le temps partagé.",
    en: 'Without this minimum requirement, public trust keeps eroding, and deliberative democracy loses its most precious ground: shared time.',
  },
  {
    fr: "Les rédactions qui publient des rectifications visibles regagnent lentement du crédit, même lorsque la première version avait fait du bruit.",
    en: 'Newsrooms that publish visible corrections slowly regain credibility, even when the first version had caused a stir.',
  },
  {
    fr: "À l'inverse, effacer discrètement une erreur sans explication renforce l'idée que « tout est manipulation », au détriment du débat factuel.",
    en: 'Conversely, quietly erasing a mistake without explanation reinforces the idea that “everything is manipulation,” to the detriment of factual debate.',
  },
]

writeStory('b2-opinion.json', {
  id: 'b2-opinion',
  level: 'B2',
  title: 'Médias et attention',
  chapter: 'Point de vue',
  audioUrl: null,
  sentences: buildSentences(b2Pairs),
  grammarMarkers: [
    {
      id: 'cond-necessite',
      sentenceIndex: 0,
      label: "Conditionnel d'évaluation",
      explanation: "« Il serait naïf de + infinitif » : jugement impersonnel nuancé.",
    },
    {
      id: 'subjonctif-apres-exiger',
      sentenceIndex: 4,
      label: 'Exiger que — subjonctif',
      explanation: "« Exiger des médias des méthodes » : construction infinitive ici ; variante « exiger que + subjonctif » fréquente.",
    },
  ],
  vocabulary: [
    { fr: 'un biais', en: 'bias' },
    { fr: 'relativiser', en: 'to relativize' },
    { fr: 'une impasse', en: 'dead end' },
    { fr: 'croiser les sources', en: 'to cross-check sources' },
    { fr: 'la confiance publique', en: 'public trust' },
  ],
})

// --- C1 essay ---
const c1Pairs = [
  {
    fr: "Préserver une langue ne se résume pas à en figer la grammaire dans le marbre d'un manuel scolaire figé dans le temps.",
    en: 'Preserving a language is not reducible to freezing its grammar in the marble of a school manual stuck in time.',
  },
  {
    fr: "C'est au contraire accepter qu'elle vive, qu'elle se métamorphose sous la pression des usages, des migrations et des innovations numériques.",
    en: 'It is, on the contrary, to accept that it lives, that it metamorphoses under the pressure of usage, migration and digital innovations.',
  },
  {
    fr: "Les puristes redoutent souvent l'anglicisation lexicale, tandis que les linguistes descriptifs insistent sur la vitalité des emprunts maîtrisés.",
    en: 'Purists often dread lexical Anglicisation, while descriptive linguists insist on the vitality of controlled borrowings.',
  },
  {
    fr: "La question n'est donc pas de choisir entre tradition et modernité comme entre deux camps ennemis irréconciliables.",
    en: 'The question, then, is not to choose between tradition and modernity as between two irreconcilable enemy camps.',
  },
  {
    fr: "Il s'agit plutôt de débattre publiquement des normes : qui décide du « bon » usage, avec quels critères, et au bénéfice de quels locuteurs ?",
    en: 'It is rather to debate norms publicly: who decides “good” usage, with what criteria, and for the benefit of which speakers?',
  },
  {
    fr: "Tant que ces arbitrages restent opaques, la défense du patrimoine linguistique risque de sonner comme une gatekeeperie élitiste déconnectée des classes populaires.",
    en: 'As long as these trade-offs remain opaque, defending linguistic heritage risks sounding like elitist gatekeeping disconnected from working-class communities.',
  },
  {
    fr: "Une politique linguistique crédible devrait articuler école, médias et espaces numériques sans nier les créoles, les langues régionales ni les pratiques orales minorées.",
    en: 'A credible language policy should articulate school, media and digital spaces without denying creoles, regional languages or minoritised oral practices.',
  },
  {
    fr: "En somme, la langue comme patrimoine, c'est un processus collectif de transmission critique — jamais un musée silencieux.",
    en: 'In short, language as heritage is a collective process of critical transmission — never a silent museum.',
  },
]

writeStory('c1-essay.json', {
  id: 'c1-essay',
  level: 'C1',
  title: 'La langue comme patrimoine',
  chapter: 'Essai bref',
  audioUrl: null,
  sentences: buildSentences(c1Pairs),
  grammarMarkers: [
    {
      id: 'ne-pas-reduire',
      sentenceIndex: 0,
      label: 'Ne pas se réduire à',
      explanation: "Structure pour nuancer : l'acte dépasse la définition étroite.",
    },
    {
      id: 'tant-que',
      sentenceIndex: 5,
      label: 'Tant que + indicatif',
      explanation: "Condition temporelle ou causale : tant que l'opacité dure, le risque persiste.",
    },
  ],
  vocabulary: [
    { fr: 'figer', en: 'to freeze / fix' },
    { fr: 'un emprunt', en: 'loanword / borrowing' },
    { fr: 'une gatekeeperie', en: 'gatekeeping (anglicism in text — discuss register)' },
    { fr: 'minoré', en: 'minoritised / downplayed' },
    { fr: 'en somme', en: 'in short / to sum up' },
  ],
})

console.log('\nDone. Target band: 150–300 French words per story.')
