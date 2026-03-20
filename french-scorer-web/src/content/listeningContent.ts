/**
 * Multi-level TEF-style listening catalog (transcripts + MCQ).
 * Compatible with `TefListeningJson` from `tefPrepA1.ts` for activity UI / future locking.
 *
 * Accent mix: 60 % France / 40 % Quebec — 3 France + 2 Quebec units per level (×5 levels).
 */

import type { TefListeningJson } from './tefPrepTypes'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

/** Regional target for recording / TTS (`fr-FR` vs `fr-CA`). */
export type ListeningAccent = 'france' | 'quebec'

/**
 * Extends the bundled JSON shape used by `TefPrepActivityScreen` listening mode.
 */
export type ListeningContent = TefListeningJson & {
  level: CefrLevel
  /** 1–5 slot within the CEFR band */
  level_unit_index: number
  /** Playback speed multiplier (difficulty gradient) */
  playback_speed: number
  accent: ListeningAccent
}

/** Stable global order 1…25; use with `listeningContent[globalIndex - 1]`. */
export const LISTENING_CONTENT_UNIT_COUNT = 25

type LInput = Omit<
  ListeningContent,
  'skill' | 'audio_uri' | 'unit_index'
> & { global_unit_index: number }

function L(base: LInput): ListeningContent {
  const { global_unit_index, ...rest } = base
  return {
    ...rest,
    skill: 'listening',
    audio_uri: null,
    unit_index: global_unit_index,
  }
}

/**
 * All listening units, ordered A1→C1 (five per level), France-first then Quebec within each level.
 */
export const listeningContent: ListeningContent[] = [
  // ——— A1 · 15–30 s · 0.8× · concrete info ———
  L({
    tef_task_id: 'TEF-CA-A1-U01-LISTEN',
    clb_target: 2,
    strictness_level: 'low',
    lexical_density: 1.1,
    global_unit_index: 1,
    level: 'A1',
    level_unit_index: 1,
    playback_speed: 0.8,
    accent: 'france',
    duration_seconds_approx: 22,
    scenario: 'annonce_gare',
    transcript_fr:
      'Annonce : le train pour Lyon part du quai numéro trois à quatorze heures dix. Attention : retard de cinq minutes. Merci de patienter derrière la ligne jaune.',
    gloss_en: 'Lyon train from platform 3 at 14:10; 5-minute delay; stand behind yellow line.',
    questions: [
      {
        question_fr: 'Pour quelle destination annonce-t-on le train ?',
        options: ['Pour Bordeaux', 'Pour Lyon', 'Pour Marseille', 'Pour Lille'],
        answer_index: 1,
      },
      {
        question_fr: 'À quelle heure était prévu le départ ?',
        options: ['À 14 h 05', 'À 14 h 10', 'À 14 h 15', 'À 15 h 10'],
        answer_index: 1,
      },
      {
        question_fr: 'De quel quai part le train ?',
        options: ['Quai 1', 'Quai 2', 'Quai 3', 'Quai 4'],
        answer_index: 2,
      },
      {
        question_fr: "Qu'est-ce que les voyageurs doivent faire ?",
        options: [
          'Monter tout de suite',
          'Patienter derrière la ligne jaune',
          'Quitter la gare',
          'Appeler le guichet',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A1-U02-LISTEN',
    clb_target: 2,
    strictness_level: 'low',
    lexical_density: 1.0,
    global_unit_index: 2,
    level: 'A1',
    level_unit_index: 2,
    playback_speed: 0.8,
    accent: 'france',
    duration_seconds_approx: 18,
    scenario: 'metro_fermeture',
    transcript_fr:
      "Message automatique : la station République fermera dans cinq minutes pour cause de maintenance. Les voyageurs sont invités à emprunter la ligne B. Merci de votre compréhension.",
    gloss_en: 'République station closes in 5 minutes; take line B.',
    questions: [
      {
        question_fr: 'Pourquoi la station ferme-t-elle ?',
        options: ['Grève', 'Maintenance', 'Manifestation', 'Intempéries'],
        answer_index: 1,
      },
      {
        question_fr: 'Combien de minutes avant la fermeture ?',
        options: ['Deux minutes', 'Cinq minutes', 'Dix minutes', 'Quinze minutes'],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle ligne est proposée ?',
        options: ['La ligne A', 'La ligne B', 'La ligne C', 'Le bus'],
        answer_index: 1,
      },
      {
        question_fr: 'Quel est le nom de la station ?',
        options: ['Nation', 'République', 'Opéra', 'Bastille'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A1-U03-LISTEN',
    clb_target: 3,
    strictness_level: 'low',
    lexical_density: 1.2,
    global_unit_index: 3,
    level: 'A1',
    level_unit_index: 3,
    playback_speed: 0.8,
    accent: 'france',
    duration_seconds_approx: 26,
    scenario: 'meteo_radio',
    transcript_fr:
      "Bulletin météo : aujourd'hui, ciel couvert avec pluies faibles l'après-midi. Température maximale douze degrés. Vent modéré. Demain, éclaircies et temps plus sec.",
    gloss_en: 'Cloudy, light afternoon rain, high 12°C; tomorrow clearer and drier.',
    questions: [
      {
        question_fr: 'Quel temps fait-il cet après-midi ?',
        options: ['Grand soleil', 'Pluies faibles', 'Neige forte', 'Orages'],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle est la température maximale ?',
        options: ['8 °C', '10 °C', '12 °C', '18 °C'],
        answer_index: 2,
      },
      {
        question_fr: 'À quoi ressemblera le temps demain ?',
        options: ['Plus humide', 'Plus sec et ensoleillé', 'Tempête', 'Brouillard'],
        answer_index: 1,
      },
      {
        question_fr: "Comment est le vent aujourd'hui ?",
        options: ['Très fort', 'Modéré', 'Absent', 'Violent'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A1-U04-LISTEN',
    clb_target: 3,
    strictness_level: 'low',
    lexical_density: 1.15,
    global_unit_index: 4,
    level: 'A1',
    level_unit_index: 4,
    playback_speed: 0.8,
    accent: 'quebec',
    duration_seconds_approx: 20,
    scenario: 'depanneur_horaire',
    transcript_fr:
      "Bonjour chers clients, le dépanneur Chez Marcel est ouvert aujourd'hui de huit heures à vingt-deux heures. La loterie ferme à vingt et une heures trente. Bonne journée !",
    gloss_en: 'Convenience store 8:00–22:00; lottery closes 21:30.',
    questions: [
      {
        question_fr: "À quelle heure le magasin ferme-t-il ?",
        options: ['20 h', '21 h', '22 h', '23 h'],
        answer_index: 2,
      },
      {
        question_fr: 'À quelle heure ferme la loterie ?',
        options: ['20 h 30', '21 h', '21 h 30', '22 h'],
        answer_index: 2,
      },
      {
        question_fr: 'Comment s’appelle le commerce ?',
        options: ['Chez Marcel', 'Chez Paul', 'Marché Express', 'Couche-Tard'],
        answer_index: 0,
      },
      {
        question_fr: 'À quelle heure ouvre-t-on le matin ?',
        options: ['6 h', '7 h', '8 h', '9 h'],
        answer_index: 2,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A1-U05-LISTEN',
    clb_target: 4,
    strictness_level: 'low',
    lexical_density: 1.2,
    global_unit_index: 5,
    level: 'A1',
    level_unit_index: 5,
    playback_speed: 0.8,
    accent: 'quebec',
    duration_seconds_approx: 28,
    scenario: 'stm_message',
    transcript_fr:
      "Votre autobus soixante-dix-huit arrive dans deux minutes au terminus Mont-Royal. Attention : détour par le boulevard Saint-Laurent ce soir. Merci de votre patience.",
    gloss_en: 'Bus 78 in 2 min at Mont-Royal terminus; detour via St-Laurent tonight.',
    questions: [
      {
        question_fr: 'Quel autobus est annoncé ?',
        options: ['Le 38', 'Le 55', 'Le 78', 'Le 80'],
        answer_index: 2,
      },
      {
        question_fr: "Dans combien de minutes l'autobus arrive-t-il ?",
        options: ['Une minute', 'Deux minutes', 'Cinq minutes', 'Dix minutes'],
        answer_index: 1,
      },
      {
        question_fr: 'Où se trouve le terminus ?',
        options: ['Jean-Talon', 'Mont-Royal', 'Berri', 'Square-Victoria'],
        answer_index: 1,
      },
      {
        question_fr: 'Pourquoi y a-t-il un détour ?',
        options: ['Neige', 'Travaux (détour indiqué)', 'Grève', 'Manifestation'],
        answer_index: 1,
      },
    ],
  }),

  // ——— A2 · 30–60 s · 0.9× · social / descriptions ———
  L({
    tef_task_id: 'TEF-CA-A2-U01-LISTEN',
    clb_target: 4,
    strictness_level: 'low',
    lexical_density: 1.6,
    global_unit_index: 6,
    level: 'A2',
    level_unit_index: 1,
    playback_speed: 0.9,
    accent: 'france',
    duration_seconds_approx: 42,
    scenario: 'pharmacie',
    transcript_fr:
      "— Bonjour madame, j'ai besoin d'un sirop pour la toux, mais sans sucre si possible.\n— Nous avons celui-ci, à prendre trois fois par jour après les repas. Évitez l'alcool pendant le traitement.\n— D'accord. Et c'est remboursé ?\n— Oui, avec ordonnance. Sinon le prix est neuf euros quatre-vingts.",
    gloss_en: 'Sugar-free cough syrup; 3× daily after meals; no alcohol; reimbursed with prescription.',
    questions: [
      {
        question_fr: 'Que cherche le client au début ?',
        options: ['Des antibiotiques', 'Un sirop pour la toux', 'Des vitamines', 'Un pansement'],
        answer_index: 1,
      },
      {
        question_fr: 'Combien de fois par jour prendre le sirop ?',
        options: ['Une fois', 'Deux fois', 'Trois fois', 'Quatre fois'],
        answer_index: 2,
      },
      {
        question_fr: 'Que doit-on éviter pendant le traitement ?',
        options: ['Le café', "L'alcool", 'Le sport', 'Le lait'],
        answer_index: 1,
      },
      {
        question_fr: 'Quel est le prix sans ordonnance ?',
        options: ['6,20 €', '9,80 €', '12,50 €', '15,00 €'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A2-U02-LISTEN',
    clb_target: 5,
    strictness_level: 'low',
    lexical_density: 1.7,
    global_unit_index: 7,
    level: 'A2',
    level_unit_index: 2,
    playback_speed: 0.9,
    accent: 'france',
    duration_seconds_approx: 48,
    scenario: 'invitation_pique-nique',
    transcript_fr:
      "Salut Clara ! Tu es libre samedi après-midi ? On organise un pique-nique au parc de la Tête d'Or. Thomas ramène des sandwichs, Léa des fruits, et moi des boissons. On se retrouve vers quinze heures près de la grande fontaine. Préviens-moi si tu viens avec un ami.",
    gloss_en: 'Saturday picnic at Tête d’Or park ~15:00 by big fountain; bring friends if you want.',
    questions: [
      {
        question_fr: 'Quel jour est prévu le pique-nique ?',
        options: ['Vendredi', 'Samedi', 'Dimanche', 'Lundi'],
        answer_index: 1,
      },
      {
        question_fr: 'Que ramène Léa ?',
        options: ['Des sandwichs', 'Des fruits', 'Des boissons', 'Un gâteau'],
        answer_index: 1,
      },
      {
        question_fr: 'Où se retrouvent-ils ?',
        options: ['À la gare', 'Près de la grande fontaine', 'Au musée', 'Au café'],
        answer_index: 1,
      },
      {
        question_fr: 'À peu près à quelle heure ?',
        options: ['13 h', '14 h', '15 h', '17 h'],
        answer_index: 2,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A2-U03-LISTEN',
    clb_target: 5,
    strictness_level: 'medium',
    lexical_density: 1.8,
    global_unit_index: 8,
    level: 'A2',
    level_unit_index: 3,
    playback_speed: 0.9,
    accent: 'france',
    duration_seconds_approx: 52,
    scenario: 'bureau_portefeuille',
    transcript_fr:
      "Excusez-moi, j'ai perdu mon portefeuille ce matin dans la salle de réunion B. Il est marron avec une carte bancaire et ma carte de transport. Si quelqu'un l'a trouvé, pourriez-vous me contacter au poste deux cent douze ? Je peux passer le récupérer avant dix-huit heures.",
    gloss_en: 'Lost brown wallet in meeting room B; contact ext. 212; pick up before 18:00.',
    questions: [
      {
        question_fr: 'Où la personne pense-t-elle avoir perdu le portefeuille ?',
        options: ['À la cantine', 'Dans la salle de réunion B', 'Dans le hall', 'Dans le parking'],
        answer_index: 1,
      },
      {
        question_fr: 'De quelle couleur est le portefeuille ?',
        options: ['Noir', 'Marron', 'Bleu', 'Rouge'],
        answer_index: 1,
      },
      {
        question_fr: 'Quel numéro de poste faut-il appeler ?',
        options: ['102', '112', '212', '312'],
        answer_index: 2,
      },
      {
        question_fr: "Jusqu'à quelle heure peut-elle le récupérer ?",
        options: ['16 h', '17 h', '18 h', '19 h'],
        answer_index: 2,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A2-U04-LISTEN',
    clb_target: 6,
    strictness_level: 'medium',
    lexical_density: 1.75,
    global_unit_index: 9,
    level: 'A2',
    level_unit_index: 4,
    playback_speed: 0.9,
    accent: 'quebec',
    duration_seconds_approx: 45,
    scenario: 'restaurant_commande',
    transcript_fr:
      "— Bonsoir ! Vous avez choisi ?\n— Oui, je voudrais la poutine classique, mais avec sauce végétarienne, s'il vous plaît. Et une limonade maison.\n— Parfait. Ce sera prêt dans dix minutes. Vous mangez ici ?\n— Oui, à une table près de la fenêtre, merci.",
    gloss_en: 'Classic poutine with veggie gravy + house lemonade; ready in 10 min; eat in by window.',
    questions: [
      {
        question_fr: 'Que commande le client comme plat principal ?',
        options: ['Une salade', 'Une poutine classique', 'Un burger', 'Une pizza'],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle sauce demande-t-il ?',
        options: ['Épicée', 'Végétarienne', 'Poivrée', 'BBQ'],
        answer_index: 1,
      },
      {
        question_fr: 'Que prend-il à boire ?',
        options: ['Eau', 'Bière', 'Limonade maison', 'Café'],
        answer_index: 2,
      },
      {
        question_fr: 'Combien de temps pour la préparation ?',
        options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-A2-U05-LISTEN',
    clb_target: 6,
    strictness_level: 'medium',
    lexical_density: 1.85,
    global_unit_index: 10,
    level: 'A2',
    level_unit_index: 5,
    playback_speed: 0.9,
    accent: 'quebec',
    duration_seconds_approx: 55,
    scenario: 'voisinage_bruit',
    transcript_fr:
      "Allô Karim ? C'est ta voisine du trois. Écoute, hier soir la musique est allée assez tard — j'ai un examen demain matin. Est-ce que tu pourrais baisser le volume après vingt-deux heures cette semaine ? Merci beaucoup, j'apprécie.",
    gloss_en: 'Neighbor asks to lower music after 22:00 due to morning exam.',
    questions: [
      {
        question_fr: 'Pourquoi la voisine appelle-t-elle ?',
        options: ['Pour une fête', 'À cause du bruit tard le soir', 'Pour emprunter du sucre', 'Pour un colis'],
        answer_index: 1,
      },
      {
        question_fr: 'À partir de quelle heure veut-elle moins de bruit ?',
        options: ['20 h', '21 h', '22 h', '23 h'],
        answer_index: 2,
      },
      {
        question_fr: "Qu'est-ce qu'elle a demain matin ?",
        options: ['Un voyage', 'Un examen', 'Un entretien', 'Un rendez-vous médical'],
        answer_index: 1,
      },
      {
        question_fr: 'Qui appelle ?',
        options: ['Le propriétaire', 'La voisine du trois', 'Un collègue', 'La police'],
        answer_index: 1,
      },
    ],
  }),

  // ——— B1 · 1–2 min · 1.0× · opinions / workplace ———
  L({
    tef_task_id: 'TEF-CA-B1-U01-LISTEN',
    clb_target: 7,
    strictness_level: 'medium',
    lexical_density: 2.4,
    global_unit_index: 11,
    level: 'B1',
    level_unit_index: 1,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 75,
    scenario: 'radio_debat_pollution',
    transcript_fr:
      "Animateur : Notre invitée, Marie Lenoir, défend des mesures plus strictes sur la circulation en centre-ville. Marie, votre argument principal ?\nMarie : Il faut réduire les émissions là où les gens respirent le plus : les zones denses. Je propose un stationnement dégressif et plus de pistes cyclables sécurisées, pas seulement des bandes peintes.\nAnimateur : Et le coût pour les commerçants ?\nMarie : On peut étaler la mise en œuvre et offrir des aides ciblées aux petites entreprises pendant deux ans.",
    gloss_en: 'City traffic limits, secure bike lanes, phased rollout + 2-year aid for small shops.',
    questions: [
      {
        question_fr: 'Que propose Marie pour réduire les émissions ?',
        options: [
          'Fermer les écoles',
          'Limiter la circulation dense + pistes cyclables sécurisées',
          'Interdire les vélos',
          'Augmenter les autoroutes',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que pense-t-elle des simples bandes cyclables ?',
        options: ["C'est suffisant", "Ce n'est pas assez sans sécurité", 'Il faut les supprimer', 'Sans opinion'],
        answer_index: 1,
      },
      {
        question_fr: 'Comment répond-elle sur le coût pour les commerçants ?',
        options: [
          'Pas de compensation',
          'Mise en œuvre étalée + aides ciblées deux ans',
          'Taxe unique immédiate',
          'Fermeture des rues',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Qui est interviewée ?',
        options: ['Un maire', 'Marie Lenoir', 'Un cycliste', 'Un ingénieur'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B1-U02-LISTEN',
    clb_target: 7,
    strictness_level: 'medium',
    lexical_density: 2.5,
    global_unit_index: 12,
    level: 'B1',
    level_unit_index: 2,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 82,
    scenario: 'bureau_retard_projet',
    transcript_fr:
      "Réunion rapide : le module paiements glisse d'une semaine — l'équipe QA a trouvé trois bugs bloquants. On ne livre pas vendredi, mais mercredi prochain si les correctifs passent. Sarah, tu peux prévenir le client que c'est un report contrôlé, pas une annulation ? Pierre, priorisez les tickets P1 et tenez-moi au courant chaque midi. Si besoin, on coupe la fonctionnalité « virement instantané » pour la version 1.2.",
    gloss_en: 'Payments module delayed 1 week; 3 blocking bugs; ship next Wed; comms to client; P1 priority; may drop instant transfer in v1.2.',
    questions: [
      {
        question_fr: 'Pourquoi le projet est-il en retard ?',
        options: ['Manque de budget', 'Bugs bloquants en QA', 'Grève', 'Congés'],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle est la nouvelle date cible ?',
        options: ['Vendredi', 'Lundi', 'Mercredi suivant', 'Dans un mois'],
        answer_index: 2,
      },
      {
        question_fr: 'Que doit faire Sarah ?',
        options: [
          'Coder les bugs',
          'Informer le client du report contrôlé',
          'Licencier un fournisseur',
          'Annuler le projet',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle fonctionnalité peut être retirée si nécessaire ?',
        options: ['Connexion', 'Virement instantané', 'Factures', 'Export PDF'],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B1-U03-LISTEN',
    clb_target: 8,
    strictness_level: 'medium',
    lexical_density: 2.45,
    global_unit_index: 13,
    level: 'B1',
    level_unit_index: 3,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 88,
    scenario: 'message_logement',
    transcript_fr:
      "Bonjour M. Duval, agence Lumière. Suite à votre visite du deux-pièces rue des Lilas : le propriétaire accepte une entrée le premier du mois prochain. Loyer neuf cent cinquante charges comprises, caution deux mois. Merci de confirmer par courriel avant vendredi midi si vous souhaitez réserver — deux autres dossiers sont en attente. Cordialement, Hélène.",
    gloss_en: 'Landlord OK for 1st next month; €950 incl. charges; 2-month deposit; confirm by Fri noon.',
    questions: [
      {
        question_fr: 'Quand peut-on emménager ?',
        options: ['Immédiatement', 'Le 1er du mois prochain', 'Dans six mois', 'Non précisé'],
        answer_index: 1,
      },
      {
        question_fr: 'Quel est le loyer annoncé ?',
        options: ['850 €', '900 €', '950 € charges comprises', '1100 €'],
        answer_index: 2,
      },
      {
        question_fr: 'Combien vaut la caution ?',
        options: ['Un mois', 'Deux mois', 'Trois mois', 'Aucune'],
        answer_index: 1,
      },
      {
        question_fr: 'Que doit faire M. Duval ?',
        options: [
          'Téléphoner samedi',
          'Confirmer par courriel avant vendredi midi',
          'Payer en espèces',
          'Annuler la visite',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B1-U04-LISTEN',
    clb_target: 8,
    strictness_level: 'medium',
    lexical_density: 2.5,
    global_unit_index: 14,
    level: 'B1',
    level_unit_index: 4,
    playback_speed: 1.0,
    accent: 'quebec',
    duration_seconds_approx: 78,
    scenario: 'avis_conseil_quartier',
    transcript_fr:
      "Conseil de quartier : la piste cyclable sur l'avenue Papineau sera élargie au printemps. On ajoute trois bancs et des bacs à composte communautaire. Inquiétudes sur la perte de places de stationnement : la ville propose un stationnement incitatif à deux rues. La consultation en ligne reste ouverte jusqu'au quinze du mois.",
    gloss_en: 'Wider bike lane in spring; benches + community compost; parking concerns; off-site parking 2 streets away; online consultation until 15th.',
    questions: [
      {
        question_fr: 'Quel changement est prévu sur l’avenue Papineau ?',
        options: ['Fermeture totale', 'Élargissement de la piste cyclable', 'Sens unique', 'Nouveau pont'],
        answer_index: 1,
      },
      {
        question_fr: 'Que sera ajouté ?',
        options: ['Un stade', 'Bancs et bacs à composte', 'Un mall', 'Un hôpital'],
        answer_index: 1,
      },
      {
        question_fr: 'Comment la ville répond-elle sur le stationnement ?',
        options: [
          'Aucune mesure',
          'Stationnement incitatif à deux rues',
          'Interdiction totale',
          'Prix doublés',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Jusqu’à quand la consultation reste-t-elle ouverte ?',
        options: ['Jusqu’au 5', 'Jusqu’au 10', 'Jusqu’au 15 du mois', 'Indéfiniment'],
        answer_index: 2,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B1-U05-LISTEN',
    clb_target: 8,
    strictness_level: 'medium',
    lexical_density: 2.55,
    global_unit_index: 15,
    level: 'B1',
    level_unit_index: 5,
    playback_speed: 1.0,
    accent: 'quebec',
    duration_seconds_approx: 95,
    scenario: 'politique_teletravail',
    transcript_fr:
      "Note RH : à compter du premier avril, le télétravail hybride passe à trois jours sur site pour les équipes support client. Objectif : réduire les files d'attente en fin de mois. Les exceptions médicales restent possibles avec un formulaire signé. Les managers valideront les plages communes dès la semaine prochaine. Merci de lire la FAQ mise à jour sur l'intranet.",
    gloss_en: 'From Apr 1: hybrid = 3 days on-site for customer support; medical exceptions with form; managers set common slots; FAQ on intranet.',
    questions: [
      {
        question_fr: 'Combien de jours sur site pour le support client ?',
        options: ['Un jour', 'Deux jours', 'Trois jours', 'Cinq jours'],
        answer_index: 2,
      },
      {
        question_fr: 'Quel est le principal objectif annoncé ?',
        options: [
          'Réduire les loyers',
          'Réduire les files d’attente en fin de mois',
          'Augmenter les ventes',
          'Fermer les bureaux',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que dit-on des exceptions ?',
        options: [
          'Interdites',
          'Possibles avec formulaire médical signé',
          'Automatiques',
          'Payantes',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Où trouver la FAQ ?',
        options: ['Sur Facebook', "Sur l'intranet", 'Au café', 'Par courrier'],
        answer_index: 1,
      },
    ],
  }),

  // ——— B2 · 2–3 min · 1.0× · complex arguments ———
  L({
    tef_task_id: 'TEF-CA-B2-U01-LISTEN',
    clb_target: 9,
    strictness_level: 'high',
    lexical_density: 3.1,
    global_unit_index: 16,
    level: 'B2',
    level_unit_index: 1,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 140,
    scenario: 'podcast_immigration',
    transcript_fr:
      "Extrait podcast Société : Aujourd'hui, deux angles sur l'intégration professionnelle. Driss soutient des quotas sectoriels temporaires pour équilibrer les bassins d'emploi ; Élise rétorque que les quotas figent les parcours individuels et découragent les PME. Driss insiste : sans signal clair, certaines régions restent sous-dotées en main-d'œuvre qualifiée. Élise propose plutôt des incitations fiscales ciblées et une reconnaissance accélérée des diplômes étrangers, tout en gardant un contrôle qualité strict. Toutes deux conviennent qu'il faut évaluer les résultats tous les dix-huit mois plutôt que d'attendre un mandat complet.",
    gloss_en: 'Debate: sector quotas vs fiscal incentives + faster credential recognition; review every 18 months.',
    questions: [
      {
        question_fr: 'Que propose Driss ?',
        options: [
          'Fermer les frontières',
          'Quotas sectoriels temporaires',
          'Supprimer les diplômes',
          'Interdire les PME',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle est la principale critique d’Élise sur les quotas ?',
        options: [
          'Ils coûtent trop cher',
          'Ils rigidifient les parcours et pénalisent les PME',
          'Ils sont illégaux',
          'Ils favorisent trop les régions',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que suggère Élise à la place ?',
        options: [
          'Rien',
          'Incitations fiscales + reconnaissance accélérée des diplômes avec contrôle qualité',
          'Supprimer l’impôt',
          'Nationaliser les entreprises',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Sur quoi sont-elles d’accord ?',
        options: [
          'Évaluer les résultats tous les dix-huit mois',
          'Ne jamais réévaluer',
          'Supprimer les études',
          'Augmenter les quotas chaque mois',
        ],
        answer_index: 0,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B2-U02-LISTEN',
    clb_target: 9,
    strictness_level: 'high',
    lexical_density: 3.2,
    global_unit_index: 17,
    level: 'B2',
    level_unit_index: 2,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 155,
    scenario: 'conference_climat',
    transcript_fr:
      "Conférence — adaptation côtière : le professeur rappelle que la montée du niveau marin n'est pas linéaire à l'échelle locale : les marées de tempête amplifient les risques même si la moyenne semble modeste. Il critique les digues « trop hautes trop tard » qui déplacent le problème en aval. Sa recommandation : combiner zones tampons renaturées, normes d'urbanisation plus strictes sur les littoraux sensibles, et mécanismes d'assurance paramétrique pour les collectivités. Il conclut que la gouvernance doit impliquer pêcheurs, urbanistes et assurances dès la phase de planification.",
    gloss_en: 'Non-linear sea rise; storm surges; avoid only tall dikes; buffer zones, stricter coastal zoning, parametric insurance; multi-stakeholder governance.',
    questions: [
      {
        question_fr: 'Pourquoi le risque peut-il être sous-estimé localement ?',
        options: [
          'Parce qu’il ne pleut jamais',
          'Les marées de tempête amplifient les effets malgré une moyenne modeste',
          'Les océans baissent',
          'Les digues suffisent toujours',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que critique-t-il concernant certaines digues ?',
        options: [
          'Elles sont trop basses',
          'Elles déplacent le problème en aval si mal planifiées',
          'Elles sont interdites',
          'Elles coûtent trop peu',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quel mécanisme financier mentionne-t-il ?',
        options: ['Cryptomonnaies', 'Assurance paramétrique', 'Dividendes', 'Taux fixes uniquement'],
        answer_index: 1,
      },
      {
        question_fr: 'Qui doit être impliqué tôt selon lui ?',
        options: [
          'Uniquement les banques',
          'Pêcheurs, urbanistes et assurances',
          'Seulement les touristes',
          'Personne',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B2-U03-LISTEN',
    clb_target: 10,
    strictness_level: 'high',
    lexical_density: 3.15,
    global_unit_index: 18,
    level: 'B2',
    level_unit_index: 3,
    playback_speed: 1.0,
    accent: 'france',
    duration_seconds_approx: 148,
    scenario: 'rapport_sante',
    transcript_fr:
      "Synthèse auditive — rapport sur les déserts médicaux : l'auteur distingue manque de médecins et déséquilibre entre ville et campagne. Elle note que les incitations financières seules ont un effet limité si l'accueil des familles et la continuité de soins restent fragiles. Elle préconise des maisons de santé pluriprofessionnelles mieux financées, la télémédecine comme complément — pas substitut — et la formation locale d'infirmiers avancés. Elle met en garde contre les promesses de résolution rapide : les délais de recrutement dépassent souvent deux cycles électoraux.",
    gloss_en: 'Medical deserts: $ incentives not enough; multidisciplinary health houses; telemedicine as complement; train nurse practitioners; recruitment >2 election cycles.',
    questions: [
      {
        question_fr: 'Que distingue l’auteure ?',
        options: [
          'Ville et campagne',
          'Manque de médecins vs déséquilibre territorial',
          'Public et privé seulement',
          'Adultes et enfants uniquement',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que dit-elle des incitations financières seules ?',
        options: [
          'Elles suffisent toujours',
          'Effet limité sans accueil des familles et continuité des soins',
          'Elles sont inutiles',
          'Elles remplacent la télémédecine',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Comment voit-elle la télémédecine ?',
        options: ['Substitut total', 'Complément, pas substitut', 'Interdite', 'Réservée aux urgences'],
        answer_index: 1,
      },
      {
        question_fr: 'Quel avertissement final ?',
        options: [
          'Tout sera réglé en six mois',
          'Les recrutements dépassent souvent deux cycles électoraux',
          'Il n’y a pas de problème',
          'Les infirmiers ne servent à rien',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B2-U04-LISTEN',
    clb_target: 10,
    strictness_level: 'high',
    lexical_density: 3.05,
    global_unit_index: 19,
    level: 'B2',
    level_unit_index: 4,
    playback_speed: 1.0,
    accent: 'quebec',
    duration_seconds_approx: 135,
    scenario: 'conseil_municipal',
    transcript_fr:
      "Séance — budget participatif : l'échevin défend d'allouer dix pour cent des projets verts aux écoles, mais des citoyens contestent la transparence du vote en ligne. Une motion demande un audit indépendant et une période de correction des bugs avant le prochain cycle. Le maire propose un compromis : audit trimestriel public et pilote papier dans deux districts. La séance est ajournée sans vote final.",
    gloss_en: 'Participatory budget: 10% green projects for schools; online vote questioned; motion for audit + bug fixes; mayor: quarterly public audit + paper pilot in 2 districts; adjourned.',
    questions: [
      {
        question_fr: 'Que défend l’échevin ?',
        options: [
          'Supprimer les écoles',
          'Allouer 10 % des projets verts aux écoles',
          'Annuler le budget',
          'Fermer le parc',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle est la principale préoccupation des citoyens ?',
        options: [
          'Le prix du pain',
          'La transparence du vote en ligne',
          'Les routes',
          'Les bibliothèques',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que propose le maire ?',
        options: [
          'Ignorer la motion',
          'Audit trimestriel public + pilote papier dans deux districts',
          'Supprimer le vote',
          'Tout reporter d’un an sans action',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Comment se termine la séance ?',
        options: [
          'Vote final adopté',
          'Ajournée sans vote final',
          'Émeute',
          'Contrat signé',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-B2-U05-LISTEN',
    clb_target: 10,
    strictness_level: 'high',
    lexical_density: 3.1,
    global_unit_index: 20,
    level: 'B2',
    level_unit_index: 5,
    playback_speed: 1.0,
    accent: 'quebec',
    duration_seconds_approx: 150,
    scenario: 'syndicat_negociation',
    transcript_fr:
      "Point de presse syndical : la porte-parole affirme que l'employeur a reculé sur les heures supplémentaires obligatoires, mais que la hausse salariale reste inférieure à l'inflation sur trois ans. Elle annonce une grève de vingt-quatre heures si la table ne reprend pas d'ici jeudi minuit. Elle souligne que la sécurité en entrepôt — quarts de nuit sous-staffés — demeure sa priorité négociable, au-delà des pourcentages.",
    gloss_en: 'Union: employer backed off mandatory OT; raise below inflation over 3 years; 24h strike if no return to table by Thu midnight; night-shift warehouse safety is top priority.',
    questions: [
      {
        question_fr: 'Sur quoi l’employeur a-t-il reculé selon elle ?',
        options: [
          'Les vacances',
          'Les heures supplémentaires obligatoires',
          'Les syndicats',
          'Les pensions',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que dit-elle de la hausse salariale ?',
        options: [
          'Elle dépasse l’inflation',
          'Elle reste inférieure à l’inflation sur trois ans',
          'Elle est nulle',
          'Elle est secrète',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que menace-t-elle si la table ne reprend pas ?',
        options: [
          'Une fête',
          'Une grève de 24 heures',
          'Une promotion',
          'Une fusion',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle est sa priorité au-delà des pourcentages ?',
        options: [
          'Le stationnement',
          'La sécurité en entrepôt, quarts de nuit sous-staffés',
          'Les uniformes',
          'La cafétéria',
        ],
        answer_index: 1,
      },
    ],
  }),

  // ——— C1 · 3+ min · 1.1× · abstract / nuanced ———
  L({
    tef_task_id: 'TEF-CA-C1-U01-LISTEN',
    clb_target: 11,
    strictness_level: 'high',
    lexical_density: 3.8,
    global_unit_index: 21,
    level: 'C1',
    level_unit_index: 1,
    playback_speed: 1.1,
    accent: 'france',
    duration_seconds_approx: 200,
    scenario: 'table_ronde_philosophie',
    transcript_fr:
      "Extrait — éthique et algorithmes : le philosophe argue que la transparence technique brute ne suffit pas à produire un consentement éclairé lorsque les modèles évoluent en continu. Il distingue légitimité procédurale et légitimité cognitive : un usager peut approuver une politique sans en saisir les effets différés. L'intervenante en droit numérique rétorque qu'exiger une compréhension complète est irréaliste et propose plutôt des garde-fous institutionnels — audits adversariaux et droit à l'human review — comme substituts démocratiques plausibles. Le philosophe concède l'efficacité partielle mais insiste : sans pédagogie des risques, on déplace la responsabilité sur l'individu. Ils convergent sur la nécessité d'indicateurs publics de dérive du modèle, même si la métrique reste contestée.",
    gloss_en: 'AI ethics: transparency ≠ informed consent; procedural vs cognitive legitimacy; adversarial audits + human review as democratic substitutes; risk education; public drift metrics.',
    questions: [
      {
        question_fr: 'Quelle distinction le philosophe fait-il ?',
        options: [
          'Public et privé',
          'Légitimité procédurale vs légitimité cognitive',
          'Loi et morale seulement',
          'État et marché uniquement',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que propose la juriste comme substitut plausible ?',
        options: [
          'Supprimer les lois',
          'Audits adversariaux et droit à l’examen humain',
          'Interdire l’IA',
          'Ignorer les usagers',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quel risque soulève-t-il si la pédagogie manque ?',
        options: [
          'Trop de données',
          'Déplacement de la responsabilité sur l’individu',
          'Baisse des salaires',
          'Panne d’électricité',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Sur quoi convergent-ils malgré tout ?',
        options: [
          'Supprimer les indicateurs',
          'Indicateurs publics de dérive du modèle',
          'Interdire la recherche',
          'Nationaliser les clouds',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-C1-U02-LISTEN',
    clb_target: 11,
    strictness_level: 'high',
    lexical_density: 3.85,
    global_unit_index: 22,
    level: 'C1',
    level_unit_index: 2,
    playback_speed: 1.1,
    accent: 'france',
    duration_seconds_approx: 210,
    scenario: 'podcast_economie',
    transcript_fr:
      "Analyse — politique monétaire : l'économiste conteste la lecture linéaire entre hausse des taux et baisse durable de l'inflation importée. Elle souligne des délais variables de pass-through et des effets asymétriques sur les ménages très endettés à taux variable. Elle plaide pour une communication centrale bank plus explicite sur les trade-offs intergénérationnels — retraités créditeurs vs jeunes emprunteurs — plutôt que des messages univoques 'anti-inflation'. Son co-animateur objecte que trop de nuance affaiblit l'ancrage des anticipations. Compromis suggéré : cibles moyennes flexibles encadrées par des bandes de tolérance publiques, révisées annuellement avec compte rendu argumenté.",
    gloss_en: 'Rates vs imported inflation nonlinear; variable-rate debt hurts; CB should state intergenerational trade-offs; too much nuance may weaken expectations; flexible average targets with public tolerance bands.',
    questions: [
      {
        question_fr: 'Que conteste-t-elle sur la hausse des taux ?',
        options: [
          'Qu’elle existe',
          'La lecture linéaire avec baisse durable de l’inflation importée',
          'Les banques',
          'Les changes',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quel effet asymétrique mentionne-t-elle ?',
        options: [
          'Sur les exportateurs seulement',
          'Sur les ménages très endettés à taux variable',
          'Sur les enfants uniquement',
          'Aucun',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que plaide-t-elle côté communication ?',
        options: [
          'Moins de transparence',
          'Expliciter les arbitrages intergénérationnels',
          'Supprimer les taux',
          'Interdire les emprunts',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quel compromis est suggéré à la fin ?',
        options: [
          'Retour à l’étalon-or',
          'Cibles moyennes flexibles avec bandes de tolérance publiques révisées annuellement',
          'Indexation automatique totale',
          'Suppression de la banque centrale',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-C1-U03-LISTEN',
    clb_target: 12,
    strictness_level: 'high',
    lexical_density: 3.9,
    global_unit_index: 23,
    level: 'C1',
    level_unit_index: 3,
    playback_speed: 1.1,
    accent: 'france',
    duration_seconds_approx: 195,
    scenario: 'chronique_litteraire',
    transcript_fr:
      "Chronique : le critique lit le dernier roman comme une méditation sur la mémoire sélective des familles — ce qu'on raconte pour apaiser plutôt que pour éclairer. Il loue la prose précise mais reproche une métaphore récurrente du miroir qui, selon lui, alourdit la seconde moitié. Il compare l'ouvrage à une tradition autofictionnelle sans en faire le réduit : l'enjeu serait moins l'authentique que le pacte de lecture implicite avec le lecteur complice. Il conclut que le livre réussit lorsqu'il fracture ce pacte au dernier chapitre — ce qui divisera, prévient-il, le public festival.",
    gloss_en: 'Novel as selective family memory; mirror metaphor heavy in 2nd half; autofiction tradition; implicit complicit reader pact; final chapter breaks pact — divisive at festivals.',
    questions: [
      {
        question_fr: 'Comment qualifie-t-il la mémoire familiale dans le roman ?',
        options: ['Objective', 'Sélective pour apaiser', 'Inexistante', 'Scientifique'],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle critique sur la métaphore du miroir ?',
        options: [
          'Elle manque',
          'Elle alourdit la seconde moitié',
          'Elle est parfaite',
          'Elle est comique',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quel serait l’enjeu selon lui ?',
        options: [
          'Le prix du livre',
          'Le pacte de lecture implicite avec le lecteur complice',
          'La traduction',
          'La couverture',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que prévoit-il pour le public festival ?',
        options: [
          'Unanimité',
          'Une division du public',
          'Interdiction',
          'Prix automatique',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-C1-U04-LISTEN',
    clb_target: 12,
    strictness_level: 'high',
    lexical_density: 3.75,
    global_unit_index: 24,
    level: 'C1',
    level_unit_index: 4,
    playback_speed: 1.1,
    accent: 'quebec',
    duration_seconds_approx: 205,
    scenario: 'debat_juridique',
    transcript_fr:
      "Panel — compétences et droits historiques : l'avocate plaide pour une interprétation évolutive des traités fondée sur les pratiques postérieures, tout en reconnaissant le risque d'instabilité juridique. Le professeur de droit constitutionnel répond que la légitimité démocratique exige des amendements explicites plutôt que des inférences jurisprudentielles trop audacieuses. La modératrice synthétise : la doctrine québécoise oscille entre fidélité textuelle et contextualisme, surtout lorsque les preuves orales autochtones entrent en tension avec les archives coloniales. Aucune ligne claire n'émerge, mais tous conviennent qu'une motivation écrite détaillée des tribunaux est indispensable pour la prévisibilité.",
    gloss_en: 'Treaty evolution vs democratic amendment; QC doctrine between textual fidelity and contextualism; oral Indigenous evidence vs colonial archives; need detailed judicial reasons for predictability.',
    questions: [
      {
        question_fr: 'Que plaide l’avocate ?',
        options: [
          'Ignorer les traités',
          'Interprétation évolutive fondée sur pratiques postérieures, avec risque d’instabilité',
          'Supprimer les tribunaux',
          'Interdire les archives',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que répond le constitutionnaliste ?',
        options: [
          'Rien',
          'Légitimité démocratique = amendements explicites plutôt qu’inférences trop audacieuses',
          'Plus de juges non formés',
          'Abolir la constitution',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle tension la modératrice soulève-t-elle ?',
        options: [
          'Sport et musique',
          'Preuves orales autochtones vs archives coloniales',
          'Langues étrangères',
          'Impôts et météo',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Sur quoi tous s’accordent-ils ?',
        options: [
          'Supprimer les motivations écrites',
          'Motivation écrite détaillée indispensable pour la prévisibilité',
          'Interdire les audiences',
          'Décisions orales seulement',
        ],
        answer_index: 1,
      },
    ],
  }),
  L({
    tef_task_id: 'TEF-CA-C1-U05-LISTEN',
    clb_target: 12,
    strictness_level: 'high',
    lexical_density: 3.9,
    global_unit_index: 25,
    level: 'C1',
    level_unit_index: 5,
    playback_speed: 1.1,
    accent: 'quebec',
    duration_seconds_approx: 220,
    scenario: 'forum_reconciliation',
    transcript_fr:
      "Forum — réconciliation : l'oratrice autochtone insiste sur l'autonomie des processus de vérité localement conçus, plutôt que des cadres nationaux uniformes qui, dit-elle, lissent les responsabilités spécifiques. Un élu municipal reconnaît les retards d'infrastructure mais alerte sur les budgets limités ; il propose des partenariats tripartites avec le secteur privé, tout en admettant les risques de captation. Une étudiante demande comment éviter la tokenisation symbolique sans transfert de pouvoir réel. La facilitatrice clos en rappelant que la mesure du progrès ne saurait être uniquement quantitative — indicateurs culturellement situés sont nécessaires, même s'ils compliquent les tableaux de bord politiques.",
    gloss_en: 'Indigenous speaker: local truth processes not one national frame; mayor: tripartite + private sector, capture risks; student: avoid tokenism without real power shift; facilitator: progress not only quantitative — situated indicators.',
    questions: [
      {
        question_fr: 'Que privilégie l’oratrice autochtone ?',
        options: [
          'Un cadre national unique',
          'Des processus de vérité locaux plutôt qu’uniformes',
          'Aucun processus',
          'Une commission étrangère seule',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Que propose l’élu malgré les budgets ?',
        options: [
          'Rien',
          'Partenariats tripartites incluant le privé, avec risques de captation',
          'Supprimer les municipalités',
          'Nationaliser tout',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Quelle question pose l’étudiante ?',
        options: [
          'Les sports',
          'Éviter la tokenisation sans transfert de pouvoir réel',
          'Les examens',
          'La météo',
        ],
        answer_index: 1,
      },
      {
        question_fr: 'Comment la facilitatrice conclut-elle sur les indicateurs ?',
        options: [
          'Seuls les chiffres comptent',
          'Indicateurs culturellement situés nécessaires, même s’ils compliquent les tableaux de bord',
          'Aucun suivi',
          'Supprimer les données',
        ],
        answer_index: 1,
      },
    ],
  }),
]

/** Helpers for future progress / routing */
export function getListeningContentByGlobalIndex(index1Based: number): ListeningContent | null {
  if (index1Based < 1 || index1Based > LISTENING_CONTENT_UNIT_COUNT) return null
  return listeningContent[index1Based - 1] ?? null
}

/** TEF Prep hub unit 1…N → same index in the global listening catalog (first units = A1, then A2, …). */
export function getListeningContentForTefUnit(tefUnit1Based: number): ListeningContent | null {
  if (tefUnit1Based < 1) return null
  const idx = Math.min(tefUnit1Based, LISTENING_CONTENT_UNIT_COUNT)
  return getListeningContentByGlobalIndex(idx)
}

export function getListeningContentByLevelAndUnit(level: CefrLevel, levelUnit1Based: number): ListeningContent | null {
  if (levelUnit1Based < 1 || levelUnit1Based > 5) return null
  return listeningContent.find((u) => u.level === level && u.level_unit_index === levelUnit1Based) ?? null
}

export function getListeningContentForLevel(level: CefrLevel): ListeningContent[] {
  return listeningContent.filter((u) => u.level === level)
}

/** Strip extended fields → pass-through to screens expecting `TefListeningJson`. */
export function toTefListeningJson(item: ListeningContent): TefListeningJson {
  const { level: _l, level_unit_index: _u, playback_speed: _p, accent: _a, ...rest } = item
  return rest
}
