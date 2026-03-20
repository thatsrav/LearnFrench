/**
 * Offline / API-error fallbacks for daily listening — French script ~150–300 words each.
 * Keep in sync with product expectation (Reading Room length band).
 */

export type FallbackListeningQuestion = {
  questionEn: string
  options: string[]
  correctIndex: number
}

export type FallbackListeningScenario = {
  title: string
  mod: string
  script: string
  q: FallbackListeningQuestion[]
}

/** Word-count check (FR): split on whitespace */
export function countWordsFr(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const LISTENING_FALLBACK_SCENARIOS: Record<string, FallbackListeningScenario> = {
  A1: {
    title: 'Au café et dans la rue',
    mod: 'Module 01: Vie quotidienne',
    script: `A: Bonjour, bienvenue ! Vous désirez ?
B: Bonjour. Je voudrais un grand café crème et un croissant, s'il vous plaît.
A: Très bien. Pour ici ou à emporter ?
B: Pour ici, près de la fenêtre si possible. Je n'ai pas beaucoup de temps, mais j'aimerais me poser cinq minutes.
A: Pas de problème. Avec du lait dans le café ?
B: Oui, avec du lait dedans, merci. C'est combien, s'il vous plaît ?
A: Ça fait trois euros quatre-vingts. Vous payez par carte ?
B: Oui, voilà. Merci beaucoup. Au fait, le tram pour la gare passe encore devant le café à cette heure-ci ?
A: Oui, toutes les huit minutes environ jusqu'à vingt-deux heures. La station est à deux minutes à pied sur la droite.
B: Parfait, je vous remercie pour l'information. Bonne journée !
A: À vous aussi, madame.

Narrateur: La cliente s'assoit, boit son café tranquillement, puis sort en courant presque pour attraper le tram. La serveuse range les tasses et prépare la table pour le prochain client. Dans la rue, les enfants traversent avec leurs cartables pendant que les cyclistes sonnent leur cloche. La matinée parisienne continue, bruyante mais familière pour ceux qui y travaillent chaque jour.`,
    q: [
      {
        questionEn: 'What does the customer order?',
        options: ['Tea and a sandwich', 'A large coffee with milk and a croissant', 'Orange juice only', 'Nothing; she only asks for directions'],
        correctIndex: 1,
      },
      {
        questionEn: 'Why does she ask about the tram?',
        options: ['She works at the café', 'She needs to get to the station', 'She is writing a report on transport', 'She lost her phone on the tram'],
        correctIndex: 1,
      },
      {
        questionEn: 'How would you describe the server’s manner?',
        options: ['Rude and impatient', 'Helpful and professional', 'Silent and distracted', 'Angry about the payment'],
        correctIndex: 1,
      },
      {
        questionEn: 'How much does she pay?',
        options: ['Two euros fifty', 'Three euros eighty', 'Five euros', 'The price is not mentioned'],
        correctIndex: 1,
      },
    ],
  },
  A2: {
    title: 'Week-end entre amis',
    mod: 'Module 02: Récit et projets',
    script: `Lucas raconte son week-end à sa collègue Claire pendant la pause café au bureau. Il explique que samedi matin il a fait beau, alors ils sont allés au parc avec des amis de l'université. Chacun avait apporté quelque chose à manger : du fromage, des tomates, du pain et des fruits. Ils ont joué au frisbee une heure, puis ils ont discuté de leurs projets d'été. Un ami a proposé de louer une maison près de la montagne en juillet, mais les prix semblaient élevés pour tout le groupe.

Le dimanche, Lucas est resté chez lui. Il a lu un roman policier et il s'est reposé l'après-midi parce qu'il se sentait fatigué après la marche du samedi. Le soir, il a regardé un film en français avec des sous-titres pour ne pas perdre le fil du dialogue. Claire trouve que c'est une bonne idée pour progresser sans stress. Lucas ajoute qu'il ne faut pas attendre les grandes vacances pour profiter des petits plaisirs : un pique-nique simple peut suffire à changer l'humeur de la semaine.

Ils retournent au travail en souriant, mais le téléphone du bureau sonne déjà : un client attend une réponse urgente sur un dossier de livraison. La conversation personnelle se termine là, comme souvent dans une journée chargée.`,
    q: [
      {
        questionEn: 'What did the group do on Saturday?',
        options: ['They stayed indoors', 'They had a picnic in the park and played frisbee', 'They went skiing', 'They cancelled their plans'],
        correctIndex: 1,
      },
      {
        questionEn: 'What concern is raised about the summer plan?',
        options: ['The mountain is too far', 'Rental prices seem high for the group', 'Nobody has a driving licence', 'The weather will be bad'],
        correctIndex: 1,
      },
      {
        questionEn: 'How did Lucas spend Sunday?',
        options: ['At a concert', 'Resting at home, reading and watching a subtitled film', 'Moving house', 'Working overtime only'],
        correctIndex: 1,
      },
      {
        questionEn: 'What interrupts their chat at the end?',
        options: ['A fire alarm', 'An urgent client call', 'Lunch break ending', 'A power cut'],
        correctIndex: 1,
      },
    ],
  },
  B1: {
    title: 'Métro parisien un matin de semaine',
    mod: 'Module 04: Transport et imprévus',
    script: `Ce matin-là, la rame était bondée comme après un concert ou une grève surprise sur une ligne centrale. J'ai à peine trouvé une place pour mon sac entre deux valises massives qui bloquaient le couloir central. Les voyageurs poussaient doucement mais fermement, sans toujours s'excuser, comme si la politesse s'était égarée sous terre. Une voix métallique a annoncé l'attention aux pickpockets et plusieurs personnes ont vérifié leur portefeuille avec un geste nerveux.

Je me suis demandé si je devais descendre à la prochaine station pour respirer un peu d'air de rue, même pollué. Finalement, distrait par un podcast, je suis descendu deux arrêts trop tard sans m'en rendre compte tout de suite. Le quartier ne correspondait pas du tout à mon trajet habituel, mais les façades colorées valaient le détour. J'ai marché dix minutes pour rejoindre une ligne plus calme, en observant les boutiques qui levaient leurs rideaux métalliques.

Ce contretemps m'a rappelé que Paris n'est jamais tout à fait prévisible, même quand on croit connaître son itinéraire par cœur. J'ai envoyé un message à mon collègue pour prévenir du retard, puis j'ai pris une grande respiration avant de replonger dans la foule.`,
    q: [
      {
        questionEn: 'What atmosphere does the speaker describe on the train?',
        options: ['Empty and silent', 'Crowded and somewhat impersonal', 'Luxurious and calm', 'Completely unsafe with fighting'],
        correctIndex: 1,
      },
      {
        questionEn: 'Why did the speaker get off too late?',
        options: ['They fell asleep', 'They were distracted by a podcast', 'The driver announced the wrong stop', 'They helped a lost tourist'],
        correctIndex: 1,
      },
      {
        questionEn: 'What positive note do they find in the mistake?',
        options: ['They saved money', 'The neighbourhood façades were worth seeing', 'They met an old friend', 'They avoided work'],
        correctIndex: 1,
      },
      {
        questionEn: 'What practical step do they take after realising the error?',
        options: ['They take a taxi home', 'They message a colleague about being late', 'They buy a new ticket to another city', 'They complain to the mayor'],
        correctIndex: 1,
      },
    ],
  },
  B2: {
    title: 'Médias : confiance et rectifications',
    mod: 'Module 06: Discours public',
    script: `Il serait naïf de croire que l'information circule aujourd'hui sans biais, sans cadre éditorial et sans logique d'audience commerciale. Les réseaux sociaux accélèrent la diffusion des faits vérifiés comme des rumeurs, souvent au même rythme et avec des visuels comparables. Pour autant, relativiser systématiquement tout discours mène à une impasse : on finit par douter même des preuves solides.

La voie responsable consiste à croiser les sources, à identifier les conflits d'intérêts et à accepter la complexité des dossiers techniques. Les citoyens ne sont pas tenus d'être des experts, mais ils peuvent exiger des médias des méthodes de correction transparentes. Sans ce minimum d'exigence, la confiance publique continue de s'éroder, et la démocratie délibérative perd son terrain le plus précieux : le temps partagé pour comprendre.

Les rédactions qui publient des rectifications visibles regagnent lentement du crédit, même lorsque la première version avait fait du bruit. À l'inverse, effacer discrètement une erreur sans explication renforce l'idée que tout est manipulation, au détriment du débat factuel. L'enjeu n'est donc pas seulement technique, mais civique.`,
    q: [
      {
        questionEn: 'What tension does the speaker highlight?',
        options: ['Between sports and politics', 'Between naive trust and blanket scepticism', 'Between cities and countryside', 'Between French and English only'],
        correctIndex: 1,
      },
      {
        questionEn: 'What does the speaker recommend citizens demand?',
        options: ['Free subscriptions', 'Transparent correction practices from media', 'Banning social networks', 'Longer TV ads'],
        correctIndex: 1,
      },
      {
        questionEn: 'What is said about visible corrections?',
        options: ['They are useless', 'They slowly help restore credibility', 'They are illegal', 'They confuse older readers only'],
        correctIndex: 1,
      },
      {
        questionEn: 'What risk is linked to quietly deleting errors?',
        options: ['Higher paper costs', 'Reinforcing the idea that everything is manipulation', 'Better SEO rankings', 'Fewer journalists'],
        correctIndex: 1,
      },
    ],
  },
  C1: {
    title: 'Politique linguistique et transmission',
    mod: 'Module 08: Synthèse critique',
    script: `Préserver une langue ne se résume pas à en figer la grammaire dans le marbre d'un manuel scolaire figé dans le temps. C'est au contraire accepter qu'elle vive, qu'elle se métamorphose sous la pression des usages, des migrations et des innovations numériques. Les puristes redoutent souvent l'anglicisation lexicale, tandis que les linguistes descriptifs insistent sur la vitalité des emprunts maîtrisés.

La question n'est donc pas de choisir entre tradition et modernité comme entre deux camps ennemis irréconciliables. Il s'agit plutôt de débattre publiquement des normes : qui décide du bon usage, avec quels critères, et au bénéfice de quels locuteurs ? Tant que ces arbitrages restent opaques, la défense du patrimoine linguistique risque de sonner comme une gatekeeperie élitiste déconnectée des classes populaires.

Une politique linguistique crédible devrait articuler école, médias et espaces numériques sans nier les créoles, les langues régionales ni les pratiques orales minorées. En somme, la langue comme patrimoine, c'est un processus collectif de transmission critique — jamais un musée silencieux.`,
    q: [
      {
        questionEn: 'What narrow view of preservation does the speaker reject?',
        options: ['Teaching grammar in school', 'Reducing preservation to freezing grammar in manuals', 'Using dictionaries', 'Reading literature'],
        correctIndex: 1,
      },
      {
        questionEn: 'What contrast is drawn between purists and descriptive linguists?',
        options: ['They agree on everything', 'Purists fear borrowings; descriptivists stress controlled vitality of loans', 'Only purists study phonetics', 'Descriptivists reject all rules'],
        correctIndex: 1,
      },
      {
        questionEn: 'What makes heritage defence sound elitist, according to the speaker?',
        options: ['Transparent public debate about norms', 'Opaque trade-offs about who sets standards', 'Free libraries', 'Subtitled films'],
        correctIndex: 1,
      },
      {
        questionEn: 'How is language heritage summarised at the end?',
        options: ['As a silent museum', 'As collective critical transmission, not a frozen exhibit', 'As a private business', 'As a temporary trend'],
        correctIndex: 1,
      },
    ],
  },
}
