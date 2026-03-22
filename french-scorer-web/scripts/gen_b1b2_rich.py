#!/usr/bin/env python3
"""One-off generator for B1/B2 rich lesson JSON (run from repo: python3 french-scorer-web/scripts/gen_b1b2_rich.py)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "content" / "syllabus"
MOBILE = Path(__file__).resolve().parents[2] / "expo-mobile" / "assets" / "syllabus"


def card(word, trans, ex, ex_en, key=None):
    o = {
        "word": word,
        "translation": trans,
        "example": ex,
        "example_translation": ex_en,
    }
    if key:
        o["audio_key"] = key
    return o


def turn(sp, fr, en):
    return {"speaker": sp, "text": fr, "translation": en}


def ex(fr, en):
    return {"fr": fr, "en": en}


def wo(words, order, trans):
    return {"type": "word_order", "words": words, "correct_order": order, "translation": trans}


def seq(n: int):
    return list(range(n))


LESSONS: list[tuple[str, dict]] = []


def add(filename: str, payload: dict) -> None:
    LESSONS.append((filename, payload))


# ——— B1 travel ———
add(
    "b1_u1.json",
    {
        "id": "b1-u1",
        "level": "B1",
        "unit_index": 1,
        "theme": "Airports and Stations",
        "estimated_minutes": 20,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("l'embarquement", "boarding", "L'embarquement commence dans vingt minutes.", "Boarding starts in twenty minutes.", "embarquement"),
                    card("la porte d'embarquement", "gate", "Notre vol part de la porte C24.", "Our flight leaves from gate C24.", "porte"),
                    card("le bagage à main", "carry-on", "Un seul bagage à main est inclus.", "Only one carry-on is included.", "bagage"),
                    card("le retard", "delay", "Il y a un retard de quarante minutes à cause de la météo.", "There's a forty-minute delay because of the weather.", "retard"),
                    card("la correspondance", "connection", "J'ai une correspondance serrée à Toronto.", "I have a tight connection in Toronto.", "correspondance"),
                    card("le guichet", "ticket counter / window", "Passe au guichet pour changer ton billet.", "Go to the counter to change your ticket.", "guichet"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Aéroport Trudeau — vol vers Québec",
                "turns": [
                    turn("Agent", "Bonjour. Votre passeport et votre carte d'embarquement, s'il vous plaît.", "Hello. Your passport and boarding pass, please."),
                    turn("Alex", "Voilà. Est-ce que le vol est à l'heure? J'ai entendu parler d'un retard.", "Here you go. Is the flight on time? I heard there was a delay."),
                    turn("Agent", "Pour l'instant, vingt minutes de retard. La porte d'embarquement est la C12; surveillez les écrans.", "For now, twenty minutes late. The gate is C12; watch the screens."),
                    turn("Alex", "Merci. Et si je rate ma correspondance à Toronto?", "Thanks. And if I miss my connection in Toronto?"),
                    turn("Agent", "Allez au comptoir de la compagnie; on peut vous rebooker sur le prochain vol.", "Go to the airline counter; they can rebook you on the next flight."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Pour parler d'un vol, utilise « être en retard » (subj: le vol) ou « avoir un retard ». Au Québec on dit souvent « carte d'embarquement » comme ailleurs; « courriel » pour l'email de confirmation.",
                "examples": [
                    ex("Le vol est en retard à cause du brouillard.", "The flight is late because of fog."),
                    ex("Nous avons eu un retard de deux heures à Montréal.", "We had a two-hour delay in Montreal."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match French to English",
                        "pairs": [
                            {"left": "la correspondance", "right": "connection"},
                            {"left": "le bagage à main", "right": "carry-on"},
                            {"left": "la porte d'embarquement", "right": "gate"},
                            {"left": "le retard", "right": "delay"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Mon vol a trente minutes de ___. (delay)",
                        "answer": "retard",
                        "options": ["retard", "porte", "vol", "train"],
                        "hint": "Masculine noun",
                    },
                    {
                        "type": "mcq",
                        "question": "How do you say « boarding » (noun) in formal travel French?",
                        "options": ["l'embarquement", "l'embarcation", "l'embarquage", "l'embarcadère"],
                        "answer_index": 0,
                    },
                    wo(["Est-ce", "que", "notre", "vol", "est", "à", "l'heure", "?"], seq(8), "Is our flight on time?"),
                    {
                        "type": "mcq",
                        "question": "Best phrase for « tight connection »?",
                        "options": [
                            "une correspondance serrée",
                            "un bagage serré",
                            "une porte serrée",
                            "un guichet serré",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Écris 3 phrases : tu arrives à l'aéroport, tu demandes si le vol a du retard, tu mentionnes ta correspondance.",
            "example": "Je viens d'arriver. Est-ce que le vol pour Ottawa a du retard? J'ai une correspondance dans deux heures.",
            "skill": "writing",
        },
    },
)

# Continue with b1_u2 ... I'll add remaining lessons in compressed form in the same file
# For brevity in this script I'll use a second block

add(
    "b1_u2.json",
    {
        "id": "b1-u2",
        "level": "B1",
        "unit_index": 2,
        "theme": "Buying Tickets",
        "estimated_minutes": 18,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("l'aller simple", "one-way (ticket)", "Je prends un aller simple pour Sherbrooke.", "I'm taking a one-way to Sherbrooke.", "aller"),
                    card("l'aller-retour", "round trip", "Un aller-retour coûte moins cher le mardi.", "A round trip costs less on Tuesday.", "retour"),
                    card("le tarif réduit", "reduced fare", "Le tarif réduit s'applique aux 65 ans et plus.", "The reduced fare applies to ages 65+.", "tarif"),
                    card("réserver en ligne", "to book online", "On a réservé en ligne avec une carte de crédit.", "We booked online with a credit card.", "reserver"),
                    card("le siège côté couloir / fenêtre", "aisle / window seat", "Je préfère un siège côté fenêtre.", "I prefer a window seat.", "siege"),
                    card("non remboursable", "non-refundable", "Ce billet est non remboursable mais modifiable.", "This ticket is non-refundable but changeable.", "rembours"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Gare Centrale — guichet VIA Rail",
                "turns": [
                    turn("Clara", "Bonjour, je voudrais un aller-retour pour Toronto, départ samedi matin.", "Hi, I'd like a round trip to Toronto, leaving Saturday morning."),
                    turn("Agent", "Place affaires ou économique? Et voulez-vous un tarif réduit?", "Business or economy? And do you want a reduced fare?"),
                    turn("Clara", "Économique, tarif plein. C'est remboursable si j'annule?", "Economy, full fare. Is it refundable if I cancel?"),
                    turn("Agent", "C'est modifiable avec des frais; non remboursable. Je vous envoie le billet par courriel.", "It's changeable with a fee; non-refundable. I'll email you the ticket."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "« Vouloir » + article + noun: « je voudrais un billet » (polite). « Coûter »: « ça coûte combien? » Pour les conditions, « si j'annule » + présent ou futur selon le contexte.",
                "examples": [
                    ex("Je voudrais réserver deux places côté couloir.", "I'd like to book two aisle seats."),
                    ex("Le billet coûte quatre-vingts dollars, taxes incluses.", "The ticket costs eighty dollars, tax included."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "aller simple", "right": "one-way"},
                            {"left": "aller-retour", "right": "round trip"},
                            {"left": "tarif réduit", "right": "reduced fare"},
                            {"left": "non remboursable", "right": "non-refundable"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Nous avons acheté un ___ pour la fin de semaine. (round trip)",
                        "answer": "aller-retour",
                        "options": ["aller-retour", "aller simple", "courriel", "retard"],
                    },
                    {
                        "type": "mcq",
                        "question": "Polite way to start at the counter:",
                        "options": [
                            "Je voudrais un billet, s'il vous plaît.",
                            "Donne-moi un billet.",
                            "J'ai besoin billet maintenant.",
                            "Billet, vite.",
                        ],
                        "answer_index": 0,
                    },
                    wo(["Je", "reçois", "le", "billet", "par", "courriel."], [0, 1, 2, 3, 4, 5], "I receive the ticket by email."),
                    {
                        "type": "mcq",
                        "question": "« Siège côté fenêtre » means:",
                        "options": ["window seat", "aisle seat", "exit row", "standing room"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Rédige un mini-dialogue : tu achètes un aller simple ou aller-retour et tu poses une question sur remboursement ou modification.",
            "example": "— Je voudrais un aller simple pour Québec. — C'est modifiable? — Oui, avec des frais de quinze dollars.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u3.json",
    {
        "id": "b1-u3",
        "level": "B1",
        "unit_index": 3,
        "theme": "Asking for Directions",
        "estimated_minutes": 20,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("tout droit", "straight ahead", "Va tout droit jusqu'au feu rouge.", "Go straight until the red light.", "droit"),
                    card("tourner à gauche / à droite", "turn left / right", "Tourne à droite après la pharmacie.", "Turn right after the pharmacy.", "tourner"),
                    card("au coin de", "on the corner of", "C'est au coin de Sainte-Catherine et Peel.", "It's on the corner of Ste-Catherine and Peel.", "coin"),
                    card("la station de métro", "subway station", "La station de métro la plus proche est Place-des-Arts.", "The nearest metro station is Place-des-Arts.", "metro"),
                    card("l'autobus / le bus", "bus", "Prends l'autobus 24; il passe aux dix minutes.", "Take the 24 bus; it comes every ten minutes.", "bus"),
                    card("est-ce que c'est loin?", "is it far?", "Excusez-moi, la bibliothèque est-ce que c'est loin d'ici?", "Excuse me, is the library far from here?", "loin"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Rue Sainte-Catherine — touriste et passant",
                "turns": [
                    turn("Noah", "Excusez-moi, je cherche la station de métro Bonaventure. C'est par où?", "Excuse me, I'm looking for Bonaventure metro. Which way?"),
                    turn("Julie", "C'est simple : allez tout droit deux rues, puis tournez à gauche au grand café.", "It's simple: go straight two blocks, then turn left at the big café."),
                    turn("Noah", "Et c'est loin à pied? J'ai une valise.", "And is it far on foot? I have a suitcase."),
                    turn("Julie", "Environ dix minutes. Sinon, le bus 747 passe au coin; il descend près de la gare.", "About ten minutes. Otherwise the 747 passes on the corner; it stops near the station."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Pour demander le chemin : « Excusez-moi » + « je cherche… » / « où est…? ». « Allez » / « tournez » (vous) pour politesse. Au Québec on dit souvent « le métro » ou « la STM » à Montréal.",
                "examples": [
                    ex("Où se trouve la station de métro la plus proche?", "Where is the nearest metro station?"),
                    ex("Continuez tout droit jusqu'au parc, puis c'est à votre droite.", "Keep straight until the park, then it's on your right."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "tout droit", "right": "straight ahead"},
                            {"left": "tourner à gauche", "right": "turn left"},
                            {"left": "au coin de", "right": "on the corner of"},
                            {"left": "la station de métro", "right": "subway station"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ deux rues, puis tournez à droite. (Go straight)",
                        "answer": "Allez tout droit",
                        "options": ["Allez tout droit", "Montez", "Descendez", "Reculez"],
                    },
                    {
                        "type": "mcq",
                        "question": "Polite start when stopping someone on the street:",
                        "options": ["Excusez-moi,", "Hé toi,", "Viens ici,", "Écoute,"],
                        "answer_index": 0,
                    },
                    wo(["métro?", "la", "où", "est", "station", "de"], [2, 3, 1, 4, 5, 0], "Where is the metro station?"),
                    {
                        "type": "mcq",
                        "question": "« C'est loin » means:",
                        "options": ["It's far", "It's near", "It's closed", "It's free"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Écris les directions d'un point A à un café ou une station (4 phrases, impératif ou vous).",
            "example": "Allez tout droit jusqu'au parc. Tournez à gauche. C'est au coin, en face de la banque.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u4.json",
    {
        "id": "b1-u4",
        "level": "B1",
        "unit_index": 4,
        "theme": "Hotel Check-in",
        "estimated_minutes": 19,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("la réception", "front desk / reception", "La réception est au premier étage.", "Reception is on the first floor.", "reception"),
                    card("la clé / la carte-clé", "key / key card", "Voici votre carte-clé pour la chambre 512.", "Here's your key card for room 512.", "cle"),
                    card("la réservation", "reservation", "J'ai une réservation au nom de Nguyen.", "I have a reservation under the name Nguyen.", "reservation"),
                    card("le petit-déjeuner inclus", "breakfast included", "Le petit-déjeuner est inclus jusqu'à dix heures.", "Breakfast is included until ten.", "dejeuner"),
                    card("une chambre avec vue", "a room with a view", "Est-ce possible d'avoir une chambre avec vue sur le fleuve?", "Is it possible to have a room with a river view?", "vue"),
                    card("le problème / la réclamation", "problem / complaint", "Je voudrais faire une réclamation : la douche ne fonctionne pas.", "I'd like to make a complaint: the shower doesn't work.", "reclamation"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Hôtel centre-ville Montréal",
                "turns": [
                    turn("Réceptionniste", "Bonsoir, bienvenue. Vous avez une réservation?", "Good evening, welcome. Do you have a reservation?"),
                    turn("Mira", "Oui, deux nuits au nom de Mira Lavoie. Le courriel de confirmation est sur mon téléphone.", "Yes, two nights under Mira Lavoie. The confirmation email is on my phone."),
                    turn("Réceptionniste", "Parfait. Chambre 807, étage huit. Petit-déjeuner inclus au septième, de six heures à dix heures.", "Perfect. Room 807, eighth floor. Breakfast included on the seventh, from six to ten."),
                    turn("Mira", "Merci. La climatisation est réglable? Il fait très chaud.", "Thanks. Is the AC adjustable? It's very hot."),
                    turn("Réceptionniste", "Oui; si ça ne marche pas, composez zéro depuis la chambre.", "Yes; if it doesn't work, dial zero from the room."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "« Avoir une réservation au nom de… ». Étages : au Canada on compte souvent le « premier étage » comme le premier niveau au-dessus du rez-de-chaussée (comme en français européen). « Inclus » invariable quand adjectif après le nom.",
                "examples": [
                    ex("Nous avons réservé une chambre double avec petit-déjeuner.", "We booked a double room with breakfast."),
                    ex("Je voudrais changer de chambre : le bruit de la rue est fort.", "I'd like to change rooms: the street noise is loud."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "la réservation", "right": "reservation"},
                            {"left": "la carte-clé", "right": "key card"},
                            {"left": "petit-déjeuner inclus", "right": "breakfast included"},
                            {"left": "la réclamation", "right": "complaint"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "J'ai une ___ au nom de Dubois. (reservation)",
                        "answer": "réservation",
                        "options": ["réservation", "réclamation", "réception", "réduction"],
                    },
                    {
                        "type": "mcq",
                        "question": "You want to say the shower is broken. Best opening:",
                        "options": [
                            "Il y a un problème : la douche ne marche pas.",
                            "La douche est stupide.",
                            "Donnez-moi une autre douche maintenant.",
                            "Je déteste votre hôtel.",
                        ],
                        "answer_index": 0,
                    },
                    wo(["Voici", "la", "carte-clé", "pour", "votre", "chambre."], [0, 1, 2, 3, 4, 5], "Here is your key card for the room."),
                    {
                        "type": "mcq",
                        "question": "« Réception » in a hotel is:",
                        "options": ["front desk", "kitchen", "gym", "parking lot"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Message à la réception : tu signales un problème (bruit, température, douche) en restant poli.",
            "example": "Bonjour, je suis dans la chambre 412. La climatisation ne refroidit pas; pourriez-vous envoyer quelqu'un?",
            "skill": "writing",
        },
    },
)

add(
    "b1_u5.json",
    {
        "id": "b1-u5",
        "level": "B1",
        "unit_index": 5,
        "theme": "Transport Types",
        "estimated_minutes": 17,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("le train", "train", "Le train est souvent plus confortable pour aller à Toronto.", "The train is often more comfortable to Toronto.", "train"),
                    card("l'autocar / le car", "coach / long-distance bus", "L'autocar est moins cher mais plus long.", "The coach is cheaper but longer.", "car"),
                    card("l'avion", "plane", "L'avion est rapide pour les grandes distances.", "The plane is fast for long distances.", "avion"),
                    card("la voiture / louer une voiture", "car / rent a car", "On a loué une voiture pour visiter la Gaspésie.", "We rented a car to visit the Gaspé.", "voiture"),
                    card("plus rapide / moins cher", "faster / cheaper", "Le métro est plus rapide que l'autobus au centre-ville.", "The metro is faster than the bus downtown.", "comparatif"),
                    card("le trafic / la circulation", "traffic", "Évite l'autoroute à cinq heures : le trafic est dense.", "Avoid the highway at five: traffic is heavy.", "trafic"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Amis qui planifient un trajet Ottawa–Montréal",
                "turns": [
                    turn("Sam", "Tu préfères le train ou l'autocar pour samedi?", "Do you prefer the train or the coach for Saturday?"),
                    turn("Léa", "Le train est plus cher mais plus confortable. L'autocar est moins cher.", "The train is more expensive but more comfortable. The coach is cheaper."),
                    turn("Sam", "Et en voiture? Avec le trafic sur l'autoroute 417, parfois c'est pareil en temps.", "And by car? With traffic on highway 417, sometimes it's the same time-wise."),
                    turn("Léa", "Exact. Si on part tôt, la voiture reste flexible pour les arrêts.", "Exactly. If we leave early, the car stays flexible for stops."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Comparatifs : « plus / moins / aussi + adjectif + que ». Pour les moyens de transport : « en train », « en voiture », « à vélo », « à pied ».",
                "examples": [
                    ex("L'avion est plus rapide que l'autocar pour Vancouver.", "The plane is faster than the coach to Vancouver."),
                    ex("Je vais au travail en métro parce que c'est moins stressant qu'en voiture.", "I go to work by metro because it's less stressful than by car."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "le train", "right": "train"},
                            {"left": "l'autocar", "right": "long-distance bus"},
                            {"left": "le trafic", "right": "traffic"},
                            {"left": "louer une voiture", "right": "rent a car"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Le métro est ___ rapide ___ l'autobus ici. (more … than)",
                        "answer": "plus … que",
                        "options": ["plus … que", "moins … que", "aussi … que", "très … que"],
                    },
                    {
                        "type": "mcq",
                        "question": "« On va à Ottawa ___ train » — correct preposition:",
                        "options": ["en", "à", "du", "sur"],
                        "answer_index": 0,
                    },
                    wo(["L'autocar", "est", "moins", "cher", "que", "le", "train."], seq(7), "The coach is less expensive than the train."),
                    {
                        "type": "mcq",
                        "question": "« La circulation » often refers to:",
                        "options": ["traffic flow / traffic", "a circle", "a ticket", "a schedule"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Compare deux moyens de transport pour un trajet que tu connais (2 phrases avec plus/moins/aussi … que).",
            "example": "Le vélo est plus écologique que la voiture. L'autobus est moins rapide que le métro le matin.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u6.json",
    {
        "id": "b1-u6",
        "level": "B1",
        "unit_index": 6,
        "theme": "Travel Problems",
        "estimated_minutes": 21,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("annulé · annuler", "cancelled · to cancel", "Le vol a été annulé sans explication claire.", "The flight was cancelled without a clear explanation.", "annuler"),
                    card("le remboursement", "refund", "J'ai demandé un remboursement sur ma carte de crédit.", "I asked for a refund on my credit card.", "rembour"),
                    card("réserver / décaler", "to book / to reschedule", "On peut décaler ton billet au vol de demain matin.", "We can move your ticket to tomorrow morning's flight.", "decaler"),
                    card("le surbooking", "overbooking", "Il y a eu surbooking; ils cherchent des volontaires.", "There was overbooking; they're looking for volunteers.", "surbook"),
                    card("un avoir / un crédit", "voucher / credit", "La compagnie m'a donné un avoir pour un prochain voyage.", "The airline gave me a credit for a future trip.", "avoir"),
                    card("contacter le service client", "contact customer service", "Compose le numéro au dos de ton billet.", "Dial the number on the back of your ticket.", "service"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Comptoir aérien après une annulation",
                "turns": [
                    turn("Voyageur", "Mon vol pour Halifax est annulé. Quelles sont mes options?", "My flight to Halifax is cancelled. What are my options?"),
                    turn("Agent", "Nous pouvons vous rembourser en sept jours ou vous mettre sur le vol de 18 h avec correspondance.", "We can refund you within seven days or put you on the 6 p.m. flight with a connection."),
                    turn("Voyageur", "Le remboursement complet, sans frais?", "A full refund, without fees?"),
                    turn("Agent", "Oui, annulation imputable à la compagnie. Je vous envoie la confirmation par courriel.", "Yes, cancellation is the airline's fault. I'll email you the confirmation."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Passif / résultat : « le vol est annulé », « le billet a été modifié ». Pour exiger poliment : « je voudrais… », « est-ce possible de…? ». « Surbooking » est courant au Québec comme emprunt.",
                "examples": [
                    ex("Le train a été retardé; nous avons raté notre correspondance.", "The train was delayed; we missed our connection."),
                    ex("Pourriez-vous me décaler sur le prochain départ?", "Could you move me to the next departure?"),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "le remboursement", "right": "refund"},
                            {"left": "annulé", "right": "cancelled"},
                            {"left": "le surbooking", "right": "overbooking"},
                            {"left": "décaler", "right": "reschedule"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Le vol a été ___ à cause de la tempête. (cancelled)",
                        "answer": "annulé",
                        "options": ["annulé", "remboursé", "décalé", "réservé"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Un avoir » in customer-service French often means:",
                        "options": ["a travel credit / voucher", "a debt", "a passport", "a seat upgrade only"],
                        "answer_index": 0,
                    },
                    wo(["Quelles", "sont", "mes", "options", "?"], [0, 1, 2, 3, 4], "What are my options?"),
                    {
                        "type": "mcq",
                        "question": "Polite request for a refund:",
                        "options": [
                            "Je voudrais demander un remboursement, s'il vous plaît.",
                            "Rembourse-moi tout de suite.",
                            "Donne l'argent.",
                            "C'est illégal, rembourse.",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Courriel court à la compagnie : vol annulé, tu demandes remboursement ou nouveau billet.",
            "example": "Bonjour, mon vol AC123 a été annulé. Je souhaite un remboursement intégral sur la carte utilisée. Merci.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u7.json",
    {
        "id": "b1-u7",
        "level": "B1",
        "unit_index": 7,
        "theme": "Describing a Trip",
        "estimated_minutes": 22,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("partir · arriver", "to leave · to arrive", "Nous sommes partis tôt et arrivés à midi.", "We left early and arrived at noon.", "partir"),
                    card("visiter", "to visit (a place)", "Nous avons visité le Vieux-Québec sous la pluie.", "We visited Old Quebec in the rain.", "visiter"),
                    card("se promener", "to walk around", "Le soir, on s'est promené sur le Dufferin.", "In the evening we walked on the Dufferin Terrace.", "promener"),
                    card("c'était + adjectif", "it was + adj.", "C'était magnifique malgré le froid.", "It was magnificent despite the cold.", "cetait"),
                    card("pendant que", "while", "Pendant que je faisais la file, Léa achetait des cartes postales.", "While I was waiting in line, Léa bought postcards.", "pendant"),
                    card("soudain", "suddenly", "Soudain, le train s'est arrêté entre deux gares.", "Suddenly the train stopped between two stations.", "soudain"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Retour de weekend à Québec",
                "turns": [
                    turn("Zoé", "Alors, ton weekend? Raconte!", "So, your weekend? Tell me!"),
                    turn("Marc", "On est partis vendredi soir. On a visité le musée samedi matin; c'était super intéressant.", "We left Friday evening. We visited the museum Saturday morning; it was really interesting."),
                    turn("Zoé", "Et le temps?", "And the weather?"),
                    turn("Marc", "Il a neigé soudain dimanche, mais pendant que nous déjeunions au café, ça s'est calmé.", "It snowed suddenly Sunday, but while we were having lunch at the café, it calmed down."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Pour une action ponctuelle dans le passé récent raconté : passé composé (« on est partis », « on a visité »). « Pendant que » + imparfait si l'arrière-plan dure (« pendant que nous déjeunions »).",
                "examples": [
                    ex("J'ai pris le train et je suis arrivé à l'hôtel vers 22 h.", "I took the train and arrived at the hotel around 10 p.m."),
                    ex("Pendant qu'il pleuvait, nous avons lu près de la fenêtre.", "While it was raining, we read by the window."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "visiter", "right": "to visit (a place)"},
                            {"left": "se promener", "right": "to walk around"},
                            {"left": "pendant que", "right": "while"},
                            {"left": "soudain", "right": "suddenly"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ la pluie, nous sommes restés au musée. (While)",
                        "answer": "Pendant que",
                        "options": ["Pendant que", "Soudain", "Déjà", "Ensuite"],
                    },
                    {
                        "type": "mcq",
                        "question": "Correct past for « I arrived » (feminine speaker):",
                        "options": ["Je suis arrivée.", "J'ai arrivée.", "Je suis arrivé.", "J'ai arrivé."],
                        "answer_index": 0,
                    },
                    wo(["intéressant.", "était", "très", "Le", "musée"], [3, 1, 2, 4, 0], "The museum was very interesting."),
                    {
                        "type": "mcq",
                        "question": "« C'était » is:",
                        "options": ["impersonal + imparfait of être", "future", "subjunctive", "conditional"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Six phrases : récit d'un voyage (passé composé + au moins une phrase avec pendant que ou soudain).",
            "example": "Nous sommes partis tôt. Pendant que nous roulions, il a commencé à neiger. Soudain, le GPS a planté!",
            "skill": "writing",
        },
    },
)

add(
    "b1_u8.json",
    {
        "id": "b1-u8",
        "level": "B1",
        "unit_index": 8,
        "theme": "Future Travel Plans",
        "estimated_minutes": 18,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("aller + infinitif", "near future (going to)", "Nous allons camper en Gaspésie en juillet.", "We're going camping in the Gaspé in July.", "aller"),
                    card("prévoir", "to plan / foresee", "On prévoit trois jours de randonnée.", "We're planning three days of hiking.", "prevoir"),
                    card("la fin de semaine", "weekend (Québec)", "Pour la fin de semaine prochaine, je n'ai pas encore réservé.", "For next weekend I haven't booked yet.", "fds"),
                    card("si tout va bien", "if all goes well", "Si tout va bien, on part vendredi après-midi.", "If all goes well, we leave Friday afternoon.", "si"),
                    card("économiser / le budget", "to save / budget", "On économise pour le billet d'avion.", "We're saving for the plane ticket.", "budget"),
                    card("les vacances / congé", "vacation / time off", "Je prends une semaine de congé en août.", "I'm taking a week off in August.", "vacances"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Colocataires qui planifient l'été",
                "turns": [
                    turn("Amina", "Cet été, vous faites quoi? Nous allons louer un chalet près de Tremblant.", "This summer, what are you doing? We're going to rent a chalet near Tremblant."),
                    turn("Tom", "Cool! Nous, on va probablement visiter la famille en Ontario si le budget le permet.", "Cool! We'll probably visit family in Ontario if the budget allows."),
                    turn("Amina", "Si vous passez par Montréal, prévenez-nous : on organise un souper.", "If you pass through Montreal, let us know: we'll organize a dinner."),
                    turn("Tom", "C'est noté. On prévoit la fin de semaine du quinze août.", "Noted. We're aiming for the weekend of August 15."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Futur proche : « aller » + infinitif pour projet proche (« je vais réserver »). « Si + présent » pour condition réaliste : « si tu viens, on visite le musée ».",
                "examples": [
                    ex("Nous allons prendre le train tôt demain matin.", "We're taking the train early tomorrow morning."),
                    ex("Si le temps est beau, nous allons faire du kayak.", "If the weather is nice, we're going kayaking."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "aller + infinitif", "right": "near future"},
                            {"left": "la fin de semaine", "right": "weekend (QC)"},
                            {"left": "prévoir", "right": "to plan"},
                            {"left": "congé", "right": "time off"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Nous ___ visiter le Nouveau-Brunswick en septembre. (are going to)",
                        "answer": "allons",
                        "options": ["allons", "sommes", "avons", "faisons"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Fin de semaine » in Québec most often means:",
                        "options": ["weekend", "end of the work week only", "Friday only", "holiday Monday"],
                        "answer_index": 0,
                    },
                    wo(["Je", "vais", "réserver", "l'hôtel", "pour", "ce", "soir."], [0, 1, 2, 3, 4, 5, 6], "I'm going to book the hotel for tonight."),
                    {
                        "type": "mcq",
                        "question": "« Si tout va bien » introduces:",
                        "options": ["a realistic condition", "a past regret", "a command", "a comparison"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Écris ton programme pour la prochaine fin de semaine ou les vacances (aller + inf. + si + présent au moins une fois).",
            "example": "Je vais voir mes parents. Si le trafic est léger, j'arrive pour le souper.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u9.json",
    {
        "id": "b1-u9",
        "level": "B1",
        "unit_index": 9,
        "theme": "Sustainable Tourism",
        "estimated_minutes": 19,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("durable · l'écotourisme", "sustainable · ecotourism", "L'écotourisme mise sur des séjours plus durables.", "Ecotourism focuses on more sustainable stays.", "eco"),
                    card("réduire les déchets", "reduce waste", "On réduit les déchets en refusant les bouteilles jetables.", "We reduce waste by refusing disposable bottles.", "dechets"),
                    card("les transports en commun", "public transit", "Privilégier les transports en commun, c'est moins polluant.", "Choosing public transit is less polluting.", "tc"),
                    card("respecter la nature", "respect nature", "Il faut rester sur les sentiers pour respecter la nature.", "You should stay on the trails to respect nature.", "nature"),
                    card("selon moi / à mon avis", "in my opinion", "À mon avis, le sur-tourisme nuit aux quartiers historiques.", "In my opinion, overtourism harms historic neighbourhoods.", "avis"),
                    card("même si", "even if", "Même si c'est plus lent, le train pollue moins que l'avion court-courrier.", "Even if it's slower, the train pollutes less than short-haul flights.", "meme"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Baladodiffusion — deux voyageurs",
                "turns": [
                    turn("Hôte", "Comment voyager plus vert sans sacrifier le confort?", "How to travel greener without sacrificing comfort?"),
                    turn("Invité", "Je choisis souvent le train pour les distances moyennes, même si ça prend plus de temps.", "I often choose the train for medium distances, even if it takes longer."),
                    turn("Hôte", "Et l'hébergement?", "And lodging?"),
                    turn("Invité", "Les gîtes locaux réinvestissent dans la communauté; selon moi, c'est mieux que les grandes chaînes.", "Local B&Bs reinvest in the community; in my view that's better than big chains."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Opinion : « à mon avis », « selon moi », « je pense que » + indicatif pour un fait d'opinion. « Même si » + indicatif pour une concession.",
                "examples": [
                    ex("Je pense que le vélo partagé est une bonne idée en ville.", "I think bike sharing is a good idea in the city."),
                    ex("Même s'il pleut, nous irons à pied pour éviter la voiture.", "Even if it rains, we'll walk to avoid the car."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "durable", "right": "sustainable"},
                            {"left": "écotourisme", "right": "ecotourism"},
                            {"left": "à mon avis", "right": "in my opinion"},
                            {"left": "même si", "right": "even if"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ , le train est une option responsable pour Toronto–Montréal. (In my opinion)",
                        "answer": "À mon avis",
                        "options": ["À mon avis", "Même si", "Soudain", "Pendant que"],
                    },
                    {
                        "type": "mcq",
                        "question": "After « je pense que », the verb is usually:",
                        "options": ["indicative", "subjunctive", "infinitive only", "past participle alone"],
                        "answer_index": 0,
                    },
                    wo(["Le", "train", "prend", "plus", "de", "temps."], [0, 1, 2, 3, 4, 5], "The train takes more time."),
                    {
                        "type": "mcq",
                        "question": "« Réduire les déchets » means:",
                        "options": ["reduce waste", "increase prices", "book early", "skip meals"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Donne ton avis sur un geste écotouristique (3 phrases : à mon avis / je pense que / même si).",
            "example": "À mon avis, les bouteilles réutilisables sont essentielles. Je pense que les hôtels devraient filtrer l'eau. Même si c'est moins pratique, je refuse le plastique.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u10.json",
    {
        "id": "b1-u10",
        "level": "B1",
        "unit_index": 10,
        "theme": "Unit 5 Review & Practice",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("récapitulatif voyage", "travel recap", "Ce module couvre aéroport, billets, directions, hôtel et imprévus.", "This module covers airport, tickets, directions, hotel, and mishaps.", "recap"),
                    card("en résumé", "in summary", "En résumé : vérifie ta correspondance et garde ton courriel de billet.", "In summary: check your connection and keep your ticket email.", "resume"),
                    card("être prêt·e", "to be ready", "Sois prêt·e avec une pièce d'identité valide.", "Be ready with valid ID.", "pret"),
                    card("demander poliment", "to ask politely", "On demande poliment avant d'insister.", "We ask politely before insisting.", "poli"),
                    card("solution de rechange", "backup plan", "Aie une solution de rechange si le vol est annulé.", "Have a backup plan if the flight is cancelled.", "planb"),
                    card("bon voyage!", "have a good trip!", "Bon voyage et envoie une photo du coucher de soleil!", "Have a good trip and send a sunset photo!", "bv"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Synthèse — ami qui part demain",
                "turns": [
                    turn("Noah", "Demain tu pars tôt : tu as tout pour l'aéroport?", "You're leaving early tomorrow: do you have everything for the airport?"),
                    turn("Léa", "Oui, billet sur mon téléphone, passeport, et j'ai noté la porte d'embarquement.", "Yes, ticket on my phone, passport, and I wrote down the gate."),
                    turn("Noah", "Si le métro est en panne, prends un taxi jusqu'à la gare.", "If the metro is down, take a taxi to the station."),
                    turn("Léa", "Bonne idée. Et si l'hôtel à Toronto est complet?", "Good idea. And if the hotel in Toronto is full?"),
                    turn("Noah", "Tu appelles la réception avant; sinon, aie un deuxième hôtel en tête.", "Call the desk beforehand; otherwise have a second hotel in mind."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Révision : impératif pour conseils (« prends », « appelle », « sois »). « Si + présent » pour scénarios (« si l'hôtel est complet »). Mélange PC pour événements ponctuels et présent pour habitudes générales.",
                "examples": [
                    ex("Si tu rates le bus, prends le métro jusqu'à Bonaventure.", "If you miss the bus, take the metro to Bonaventure."),
                    ex("J'ai toujours un chargeur dans mon sac quand je voyage.", "I always have a charger in my bag when I travel."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match travel French",
                        "pairs": [
                            {"left": "correspondance", "right": "connection"},
                            {"left": "remboursement", "right": "refund"},
                            {"left": "réception", "right": "front desk"},
                            {"left": "aller-retour", "right": "round trip"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ tu arrives en retard, préviens l'hôtel par courriel. (If)",
                        "answer": "Si",
                        "options": ["Si", "Même si", "Pendant que", "Soudain"],
                    },
                    {
                        "type": "mcq",
                        "question": "At the airport, « la porte d'embarquement » is:",
                        "options": ["the gate", "the runway", "the baggage claim", "the customs hall"],
                        "answer_index": 0,
                    },
                    wo(["Allez", "tout", "droit", "jusqu'au", "parc."], [0, 1, 2, 3, 4], "Go straight to the park."),
                    {
                        "type": "mcq",
                        "question": "Best phrase for « I have a tight connection »:",
                        "options": [
                            "J'ai une correspondance serrée.",
                            "J'ai un hôtel serré.",
                            "J'ai une valise serrée.",
                            "J'ai un billet serré.",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Liste de contrôle de voyage (5 points) en français : avant l'aéroport, transport, hôtel, imprévus.",
            "example": "1) Vérifier le courriel du billet. 2) Prévoir le trajet en métro. 3) Confirmer l'hôtel. 4) Noter le numéro du service client. 5) Avoir un plan B.",
            "skill": "writing",
        },
    },
)


# ——— B1 past tense ———
add(
    "b1_u11.json",
    {
        "id": "b1-u11",
        "level": "B1",
        "unit_index": 11,
        "theme": "Passé Composé Formation",
        "estimated_minutes": 23,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("avoir + participe passé", "most verbs use avoir", "J'ai mangé, tu as fini, elle a attendu.", "I ate, you finished, she waited.", "avoir"),
                    card("être + participe (accord)", "movement & DR MRS VANDERTRAMP style", "Elle est partie tôt; ils sont revenus tard.", "She left early; they came back late.", "etre"),
                    card("le participe passé", "past participle", "Parler → parlé; finir → fini; vendre → vendu.", "Speak → spoken; finish → finished; sell → sold.", "pp"),
                    card("ne … pas (passé composé)", "negation wraps around auxiliary", "Je n'ai pas vu le message hier soir.", "I didn't see the message last night.", "neg"),
                    card("déjà / pas encore", "already / not yet", "Tu as déjà réservé? — Non, pas encore.", "Have you already booked? — Not yet.", "deja"),
                    card("hier / la semaine dernière", "yesterday / last week", "Nous sommes arrivés hier soir.", "We arrived yesterday evening.", "hier"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Colocataires — qui a fait les courses?",
                "turns": [
                    turn("Kim", "Tu as acheté le lait? Je n'ai rien trouvé dans le frigo.", "Did you buy the milk? I found nothing in the fridge."),
                    turn("Ray", "J'ai oublié, désolé. Mais j'ai payé l'électricité ce matin.", "I forgot, sorry. But I paid the electricity bill this morning."),
                    turn("Kim", "OK. Moi, je suis passée au dépanneur; j'ai pris du pain.", "OK. I stopped at the convenience store; I got some bread."),
                    turn("Ray", "Parfait. Demain j'achète le lait avant huit heures.", "Perfect. Tomorrow I'll buy the milk before eight."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Passé composé = auxiliaire (avoir ou être) + participe passé. Avec être, accord du participe avec le sujet (« elle est partie »). Négation : « ne » avant l'auxiliaire + « pas » après.",
                "examples": [
                    ex("Nous avons étudié trois heures puis nous sommes sortis.", "We studied three hours then we went out."),
                    ex("Il n'est pas venu à la réunion; il a téléphoné.", "He didn't come to the meeting; he called."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "j'ai fini", "right": "I finished"},
                            {"left": "elle est allée", "right": "she went (f.)"},
                            {"left": "participe passé", "right": "past participle"},
                            {"left": "pas encore", "right": "not yet"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Elle ___ partie avant minuit. (is / went — être)",
                        "answer": "est",
                        "options": ["est", "a", "était", "sera"],
                    },
                    {
                        "type": "mcq",
                        "question": "Negative of « j'ai vu »:",
                        "options": ["Je n'ai pas vu.", "Je pas n'ai vu.", "Je n'ai vu pas.", "Je ne pas ai vu."],
                        "answer_index": 0,
                    },
                    wo(["J'", "ai", "acheté", "les", "billets", "hier."], seq(6), "I bought the tickets yesterday."),
                    {
                        "type": "mcq",
                        "question": "Which verb typically takes être in PC for movement?",
                        "options": ["aller", "manger", "parler", "travailler"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Cinq phrases au passé composé sur ta journée d'hier (mélange avoir et un verbe avec être si possible).",
            "example": "Je me suis levée tôt. J'ai pris le café. Je suis allée au travail. J'ai déjeuné vite. Je suis rentrée tard.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u12.json",
    {
        "id": "b1-u12",
        "level": "B1",
        "unit_index": 12,
        "theme": "Common Irregular Participles",
        "estimated_minutes": 21,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("faire → fait", "to do → done", "J'ai fait mes devoirs avant le film.", "I did my homework before the movie.", "fait"),
                    card("voir → vu", "to see → seen", "As-tu vu le nouveau reportage?", "Did you see the new report?", "vu"),
                    card("prendre → pris", "to take → taken", "Nous avons pris le métro à l'heure de pointe.", "We took the metro at rush hour.", "pris"),
                    card("écrire → écrit", "to write → written", "Il a écrit un courriel très clair.", "He wrote a very clear email.", "ecrit"),
                    card("mettre → mis", "to put → put", "J'ai mis les clés sur la table.", "I put the keys on the table.", "mis"),
                    card("ouvrir → ouvert", "to open → opened", "Elle a ouvert la fenêtre; il faisait chaud.", "She opened the window; it was hot.", "ouvert"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Bureau — retour de congé",
                "turns": [
                    turn("Pat", "Tu as vu les chiffres du trimestre? J'ai fait un résumé rapide.", "Did you see the quarter numbers? I made a quick summary."),
                    turn("Inès", "Pas encore. J'ai écrit au client pendant que tu étais en réunion.", "Not yet. I wrote to the client while you were in a meeting."),
                    turn("Pat", "Super. J'ai mis les documents sur le serveur partagé.", "Great. I put the documents on the shared drive."),
                    turn("Inès", "Parfait. On a pris de l'avance pour une fois!", "Perfect. We got ahead for once!"),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Participes irréguliers fréquents : voir/vu, faire/fait, prendre/pris, dire/dit, écrire/écrit, mettre/mis. Ils s'emploient avec avoir sauf cas pronominaux ou être (aller/allé).",
                "examples": [
                    ex("Qu'est-ce que tu as dit au directeur?", "What did you say to the director?"),
                    ex("Ils ont dit oui, puis ils ont tout changé.", "They said yes, then they changed everything."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match infinitive → participe",
                        "pairs": [
                            {"left": "voir", "right": "vu"},
                            {"left": "faire", "right": "fait"},
                            {"left": "prendre", "right": "pris"},
                            {"left": "écrire", "right": "écrit"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Nous avons ___ le train de six heures. (taken)",
                        "answer": "pris",
                        "options": ["pris", "prises", "prendre", "prirent"],
                    },
                    {
                        "type": "mcq",
                        "question": "Past participle of « mettre »:",
                        "options": ["mis", "mettu", "metté", "mettant"],
                        "answer_index": 0,
                    },
                    wo(["Tu", "as", "vu", "le", "nouveau", "horaire", "?"], seq(7), "Did you see the new schedule?"),
                    {
                        "type": "mcq",
                        "question": "« Elle a ___ un roman » (write):",
                        "options": ["écrit", "écrivé", "écrite", "écrivit"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Six phrases avec des participes irréguliers (faire, voir, prendre, dire, écrire, mettre).",
            "example": "J'ai fait une liste. J'ai vu ton message. J'ai pris un café. Tu as dit quoi? J'ai écrit à la banque. J'ai mis le dossier ici.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u13.json",
    {
        "id": "b1-u13",
        "level": "B1",
        "unit_index": 13,
        "theme": "Imparfait Introduction",
        "estimated_minutes": 21,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("l'imparfait", "imperfect tense", "Je parlais, nous finissions, ils vendaient.", "I was speaking, we were finishing, they were selling.", "imp"),
                    card("nous + -ions / vous + -iez", "typical endings", "Quand j'étais petit, nous habitions en banlieue.", "When I was little, we lived in the suburbs.", "ions"),
                    card("c'était", "it was (description)", "C'était calme le dimanche matin.", "It was calm Sunday morning.", "cetait"),
                    card("toujours / souvent", "always / often", "Il jouait toujours dehors après l'école.", "He always played outside after school.", "souvent"),
                    card("quand j'étais enfant", "when I was a child", "Quand j'étais enfant, je lisais beaucoup.", "When I was a child, I read a lot.", "enfant"),
                    card("pendant ce temps", "meanwhile", "Pendant ce temps, la pluie tombait sans arrêt.", "Meanwhile the rain kept falling.", "pendant"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Souvenirs d'école secondaire",
                "turns": [
                    turn("Éloïse", "Tu te souviens du vieux gymnase? Il sentait toujours le bois mouillé.", "Do you remember the old gym? It always smelled of wet wood."),
                    turn("Marc", "Oui! On s'entraînait trois fois par semaine. L'entraîneur était strict mais juste.", "Yes! We trained three times a week. The coach was strict but fair."),
                    turn("Éloïse", "Moi, j'étais réservée; je parlais peu avec les autres équipes.", "I was shy; I spoke little with the other teams."),
                    turn("Marc", "Pourtant tu jouais très bien au service.", "Yet you served really well."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Imparfait : radical (souvent la 1re personne du pluriel du présent sans -ons) + terminaisons -ais, -ais, -ait, -ions, -iez, -aient. Sert à l'habitude, la description, le fond du récit.",
                "examples": [
                    ex("Il faisait froid et les rues étaient vides.", "It was cold and the streets were empty."),
                    ex("Chaque été, nous allions au camping près du lac.", "Every summer we used to go camping near the lake."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "imparfait", "right": "imperfect (habit/description)"},
                            {"left": "je finissais", "right": "I was finishing / used to finish"},
                            {"left": "c'était", "right": "it was"},
                            {"left": "souvent", "right": "often"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Quand j'étais petit, je ___ au parc tous les samedis. (aller — imparfait)",
                        "answer": "allais",
                        "options": ["allais", "suis allé", "vais", "irai"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Nous ___ contents » (we were happy) — imparfait:",
                        "options": ["étions", "sommes", "avons été", "serons"],
                        "answer_index": 0,
                    },
                    wo(["Il", "pleuvait", "toute", "la", "journée."], seq(5), "It was raining all day."),
                    {
                        "type": "mcq",
                        "question": "Imparfait often describes:",
                        "options": ["ongoing past situations or habits", "single completed events only", "future plans", "commands"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Décris une habitude d'enfance (4–5 phrases à l'imparfait).",
            "example": "Quand j'avais dix ans, j'habitais près d'un parc. Je jouais au soccer tous les mercredis. Il y avait souvent du vent.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u14.json",
    {
        "id": "b1-u14",
        "level": "B1",
        "unit_index": 14,
        "theme": "PC vs Imparfait",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("action ponctuelle", "one-time completed action", "Soudain, le téléphone a sonné.", "Suddenly the phone rang.", "ponctuel"),
                    card("fond / contexte", "background / setting", "Il pleuvait quand je suis sorti.", "It was raining when I went out.", "fond"),
                    card("habitude vs événement", "habit vs event", "Je lisais le journal; puis j'ai vu la nouvelle.", "I was reading the paper; then I saw the news.", "habitude"),
                    card("pendant que + imparfait", "while X was …", "Pendant qu'il cuisinait, elle a mis la table.", "While he was cooking, she set the table.", "pq"),
                    card("déjà / enfin", "already / finally", "J'attendais depuis vingt minutes; enfin le bus est arrivé.", "I'd been waiting twenty minutes; finally the bus arrived.", "enfin"),
                    card("tout à coup", "all of a sudden", "Tout à coup, la lumière s'est éteinte.", "All of a sudden the light went out.", "coup"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Soirée qui tourne mal",
                "turns": [
                    turn("Sarah", "Tu te souviens? Il neigeait; nous écoutions de la musique tranquille.", "Remember? It was snowing; we were listening to calm music."),
                    turn("Leo", "Oui, et tout à coup l'électricité a sauté dans tout l'immeuble.", "Yes, and suddenly the power went out in the whole building."),
                    turn("Sarah", "J'allumais des chandelles pendant que tu cherchais des piles.", "I was lighting candles while you looked for batteries."),
                    turn("Leo", "Finalement le courant est revenu après une heure.", "Finally the power came back after an hour."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "PC = événement ponctuel, changement, suite d'actions. Imparfait = cadre, temps, habitude, action en cours quand autre chose arrive (« pendant que je lisais, il est entré »).",
                "examples": [
                    ex("Je me promenais quand j'ai rencontré un ancien ami.", "I was walking when I ran into an old friend."),
                    ex("D'habitude je prenais le bus, mais ce jour-là j'ai pris un taxi.", "I usually took the bus, but that day I took a taxi."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match concept to tense family",
                        "pairs": [
                            {"left": "background weather", "right": "often imparfait"},
                            {"left": "sudden interruption", "right": "often passé composé"},
                            {"left": "used to (habit)", "right": "imparfait"},
                            {"left": "completed sequence", "right": "passé composé"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Il ___ (faire) froid quand nous ___ (partir).",
                        "answer": "faisait … sommes partis",
                        "options": ["faisait … sommes partis", "a fait … partions", "faisait … partions", "a fait … sommes partis"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Pendant qu'elle dormait, le chat ___ sur la table » (jumped — one action):",
                        "options": ["a sauté", "sautait", "saute", "sautera"],
                        "answer_index": 0,
                    },
                    wo(["J'", "lisais", "quand", "tu", "as", "téléphoné."], seq(6), "I was reading when you called."),
                    {
                        "type": "mcq",
                        "question": "For repeated past habits, prefer:",
                        "options": ["imparfait", "passé composé", "future", "present"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Raconte une soirée ou un trajet : 6 phrases en mélangeant imparfait (cadre) et passé composé (événements).",
            "example": "Il ventait. Nous attendions le train. Soudain, ils ont annoncé un retard. J'ai acheté un café. Le train est enfin arrivé.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u15.json",
    {
        "id": "b1-u15",
        "level": "B1",
        "unit_index": 15,
        "theme": "Telling a Story",
        "estimated_minutes": 23,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("d'abord · ensuite · puis · enfin", "first · then · then · finally", "D'abord le calme, puis le bruit, enfin le silence.", "First calm, then noise, finally silence.", "ensuite"),
                    card("soudain · tout à coup", "suddenly", "Soudain, la porte s'est ouverte sans bruit.", "Suddenly the door opened quietly.", "soudain2"),
                    card("alors que", "while / whereas", "Alors que je payais, quelqu'un a pris mon sac.", "While I was paying, someone took my bag.", "alors"),
                    card("finalement / au final", "in the end", "Au final, tout s'est bien passé.", "In the end everything went fine.", "final"),
                    card("le dénouement", "resolution (of a story)", "Le dénouement, c'est quand on comprend le mystère.", "The resolution is when we understand the mystery.", "denoue"),
                    card("raconter une histoire", "to tell a story", "Il raconte toujours ses histoires avec humour.", "He always tells his stories with humor.", "raconter"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Autour d'un feu — histoire courte",
                "turns": [
                    turn("Grand-père", "D'abord, il faisait noir dans le bois. On entendait juste le vent.", "First it was dark in the woods. We only heard the wind."),
                    turn("Petit-fils", "Et alors?", "And then?"),
                    turn("Grand-père", "Ensuite, un bruit étrange nous a fait sursauter. Puis un coyote est apparu, puis il est reparti.", "Then a strange noise made us jump. Then a coyote appeared, then it left."),
                    turn("Petit-fils", "Enfin tu plaisantes!", "You're kidding in the end!"),
                    turn("Grand-père", "Un peu. Mais j'ai vraiment eu peur ce soir-là!", "A little. But I was really scared that evening!"),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Connecteurs de récit : enchaîne PC pour actions successives (« il est entré, il a parlé, il est parti ») et imparfait pour ambiance (« il pleuvait », « les enfants dormaient »).",
                "examples": [
                    ex("Puis elle a ouvert la lettre et elle a souri.", "Then she opened the letter and she smiled."),
                    ex("Pendant ce temps, les invités attendaient dans le salon.", "Meanwhile the guests were waiting in the living room."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "d'abord", "right": "first"},
                            {"left": "ensuite", "right": "then / next"},
                            {"left": "soudain", "right": "suddenly"},
                            {"left": "enfin", "right": "finally"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ , nous avons cherché nos gants; ___ nous sommes sortis. (First … then)",
                        "answer": "D'abord … puis",
                        "options": ["D'abord … puis", "Puis … d'abord", "Soudain … enfin", "Enfin … pendant"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Alors que » can introduce:",
                        "options": ["contrast or simultaneous background", "only future time", "only commands", "only negation"],
                        "answer_index": 0,
                    },
                    wo(["Puis", "elle", "a", "raconté", "toute", "l'histoire."], seq(6), "Then she told the whole story."),
                    {
                        "type": "mcq",
                        "question": "For a sequence of completed story beats, prefer:",
                        "options": ["passé composé", "only imparfait", "only infinitives", "subjunctive"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Mini-récit (8 phrases) avec connecteurs et mélange PC / imparfait.",
            "example": "C'était un mardi. Il pleuvait. D'abord j'ai raté le bus. Ensuite j'ai marché vite. Soudain, j'ai vu un ami. Enfin je suis arrivé à l'heure.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u16.json",
    {
        "id": "b1-u16",
        "level": "B1",
        "unit_index": 16,
        "theme": "Childhood Memories",
        "estimated_minutes": 21,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("se souvenir de", "to remember", "Je me souviens du camping au bord du lac.", "I remember the camping by the lake.", "souvenir"),
                    card("avoir l'habitude de", "used to (have the habit)", "J'avais l'habitude de lire sous les couvertures.", "I used to read under the covers.", "habitude"),
                    card("mon frère / ma sœur aînée", "my brother / older sister", "Ma sœur aînée m'emmenait au parc.", "My older sister used to take me to the park.", "frere"),
                    card("les grands-parents", "grandparents", "Chez mes grands-parents, il y avait toujours des biscuits.", "At my grandparents' there were always cookies.", "gp"),
                    card("l'école primaire", "elementary school", "À l'école primaire, j'étais timide.", "In elementary school I was shy.", "ecole"),
                    card("on jouait ensemble", "we used to play together", "Après l'école, on jouait ensemble dans la cour.", "After school we used to play together in the yard.", "jouer"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Deux amis — souvenirs d'enfance à Gatineau",
                "turns": [
                    turn("Anaïs", "Quand j'étais petite, on habitait près du parc de la Gatineau. Je faisais du vélo tous les soirs.", "When I was little we lived near Gatineau Park. I biked every evening."),
                    turn("Tom", "Moi, je passais les étés chez mes grands-parents à Rimouski. On pêchait sur le quai.", "I spent summers at my grandparents' in Rimouski. We fished on the pier."),
                    turn("Anaïs", "C'était quoi ton plat préféré chez eux?", "What was your favorite dish there?"),
                    turn("Tom", "Ma grand-mère préparait une tourtière incroyable. Je m'en souviens encore!", "My grandmother made an incredible tourtière. I still remember it!"),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Souvenirs : imparfait pour états et habitudes (« j'étais », « on jouait »). Passé composé pour un souvenir ponctuel marquant (« un jour j'ai gagné un prix »).",
                "examples": [
                    ex("Nous vivions en appartement avant d'emménager en maison.", "We lived in an apartment before moving to a house."),
                    ex("Un été, j'ai appris à nager dans ce lac-là.", "One summer I learned to swim in that lake."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "se souvenir de", "right": "to remember"},
                            {"left": "j'avais l'habitude de", "right": "I used to"},
                            {"left": "les grands-parents", "right": "grandparents"},
                            {"left": "l'école primaire", "right": "elementary school"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Quand nous ___ petits, nous ___ au même club de soccer. (be / play — imparfait)",
                        "answer": "étions … jouions",
                        "options": ["étions … jouions", "avons été … avons joué", "sommes … jouons", "serons … jouerons"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Je me souviens ___ ce jour-là » — correct preposition:",
                        "options": ["de", "à", "pour", "chez"],
                        "answer_index": 0,
                    },
                    wo(["Je", "me", "souviens", "de", "cette", "maison."], seq(6), "I remember that house."),
                    {
                        "type": "mcq",
                        "question": "Background in childhood stories is usually:",
                        "options": ["imparfait", "passé simple", "future", "imperative"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Paragraphe bref : un souvenir précis d'enfance (imparfait + au moins un passé composé).",
            "example": "J'avais huit ans. Nous passions Noël chez mes oncles. Un soir, il a neigé toute la nuit et le lendemain j'ai fait un bonhomme énorme.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u17.json",
    {
        "id": "b1-u17",
        "level": "B1",
        "unit_index": 17,
        "theme": "News and Past Events",
        "estimated_minutes": 21,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("selon les autorités", "according to authorities", "Selon les autorités, personne n'a été blessé.", "According to authorities, no one was hurt.", "autorites"),
                    card("un incendie · une inondation", "fire · flood", "Une inondation a forcé l'évacuation de deux rues.", "A flood forced the evacuation of two streets.", "incendie"),
                    card("le maire · la mairesse", "mayor (m./f.)", "La mairesse a tenu une conférence de presse.", "The mayor held a press conference.", "maire"),
                    card("enquêter / l'enquête", "to investigate / investigation", "La police enquête sur les causes de l'accident.", "Police are investigating the causes of the accident.", "enquete"),
                    card("hier soir / ce matin", "last night / this morning", "Hier soir, les vents ont dépassé cent kilomètres/heure.", "Last night winds exceeded 100 km/h.", "hier"),
                    card("pour l'instant", "for now", "Pour l'instant, la route reste fermée.", "For now the road remains closed.", "instant"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Collation du midi — fil d'actualité",
                "turns": [
                    turn("Journaliste (radio)", "Une tempête a frappé la côte hier soir; des milliers de foyers sont sans électricité.", "A storm hit the coast last night; thousands of homes are without power."),
                    turn("Amir", "J'ai vu ça sur les manchettes : selon Hydro-Québec, les équipes travaillent depuis l'aube.", "I saw it in the headlines: according to Hydro-Québec crews have been working since dawn."),
                    turn("Claire", "Ma sœur habitait dans la zone; elle a dû aller chez des amis.", "My sister lived in the zone; she had to go to friends'."),
                    turn("Amir", "Pour l'instant pas de blessés graves, c'est déjà ça.", "For now no serious injuries — that's something."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Faits divers : PC pour événements datés (« hier, une tempête a frappé »). Présent pour la situation actuelle (« la route est fermée »). « Selon » + source + indicatif.",
                "examples": [
                    ex("Les pompiers sont intervenus vers deux heures du matin.", "Firefighters intervened around two in the morning."),
                    ex("Selon les témoins, le suspect portait un manteau noir.", "According to witnesses, the suspect wore a black coat."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "selon", "right": "according to"},
                            {"left": "une inondation", "right": "flood"},
                            {"left": "enquêter", "right": "to investigate"},
                            {"left": "pour l'instant", "right": "for now"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ la police, l'incendie ___ accidentel. (According to … was)",
                        "answer": "Selon … était",
                        "options": ["Selon … était", "Malgré … était", "Bien que … soit", "Afin que … soit"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Personne n'a été blessé » — voice/style:",
                        "options": ["passive / past event reporting", "a command", "a wish", "a habit"],
                        "answer_index": 0,
                    },
                    wo(["Hier", "soir,", "un", "accident", "a", "eu", "lieu."], seq(7), "Last night an accident took place."),
                    {
                        "type": "mcq",
                        "question": "« La mairesse a tenu une conférence » — « tenir » here means:",
                        "options": ["to hold (an event)", "to keep (physically)", "to be stubborn", "to pull"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Rédige quatre phrases style nouvelle : qui, quoi, quand, selon qui.",
            "example": "Hier après-midi, un incendie a éclaté dans un entrepôt. Selon les pompiers, le feu était maîtrisé vers dix-huit heures.",
            "skill": "writing",
        },
    },
)

add(
    "b1_u18.json",
    {
        "id": "b1-u18",
        "level": "B1",
        "unit_index": 18,
        "theme": "Written Narratives",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("dans un premier temps", "first / initially", "Dans un premier temps, décris le lieu et l'heure.", "First, describe the place and time.", "premier"),
                    card("ensuite / par la suite", "then / subsequently", "Par la suite, explique le problème principal.", "Then explain the main problem.", "suite"),
                    card("en conclusion", "in conclusion", "En conclusion, dis ce que tu as appris.", "In conclusion, say what you learned.", "conclu"),
                    card("utiliser des temps du passé", "use past tenses", "Varie passé composé et imparfait pour nuancer.", "Vary passé composé and imparfait for nuance.", "temps"),
                    card("relecture", "proofreading", "Fais une relecture des accords et des prépositions.", "Proofread agreements and prepositions.", "relecture"),
                    card("structurer le texte", "structure the text", "Un bon texte a introduction, développement, conclusion.", "A good text has intro, body, conclusion.", "struct"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Atelier d'écriture — prof et étudiant",
                "turns": [
                    turn("Prof", "Ton récit manque de cadre temporel. Dans un premier temps, situe-nous : quand et où?", "Your narrative lacks a time frame. First situate us: when and where?"),
                    turn("Étudiant", "OK. C'était un mercredi d'octobre; j'étais seul dans la bibliothèque.", "OK. It was a Wednesday in October; I was alone in the library."),
                    turn("Prof", "Bien. Ensuite, l'événement déclencheur au passé composé.", "Good. Then the triggering event in passé composé."),
                    turn("Étudiant", "Soudain, l'alarme a sonné; tout le monde est sorti calmement.", "Suddenly the alarm rang; everyone left calmly."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Récit écrit : paragraphes courts, temps cohérents, connecteurs logiques (d'abord, ensuite, finalement, cependant). Vérifie accords des participes passés avec être et avec COD avant le verbe.",
                "examples": [
                    ex("Finalement, j'ai compris que j'avais tort.", "Finally I understood I was wrong."),
                    ex("Les livres que j'avais empruntés étaient encore sur la table.", "The books I had borrowed were still on the table."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "introduction", "right": "opening / setup"},
                            {"left": "en conclusion", "right": "in conclusion"},
                            {"left": "relecture", "right": "proofreading"},
                            {"left": "développement", "right": "main body"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ , résume les faits principaux en deux phrases.",
                        "answer": "En conclusion",
                        "options": ["En conclusion", "Dans un premier temps", "Soudain", "Pendant que"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Les lettres qu'elle a ___ » (write — f. plural agreement):",
                        "options": ["écrites", "écrit", "écrits", "écrivant"],
                        "answer_index": 0,
                    },
                    wo(["D'abord,", "décris", "le", "cadre", "du", "récit."], seq(6), "First, describe the setting of the story."),
                    {
                        "type": "mcq",
                        "question": "Good narrative pacing often uses:",
                        "options": ["mix of imparfait (background) and passé composé (events)", "only present tense", "only future", "only infinitives"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Écris un récit de 120–150 mots : introduction, au moins deux événements au PC, cadre à l'imparfait, conclusion.",
            "example": "(Modèle) C'était en 2019. Je préparais un examen quand j'ai reçu un message inattendu…",
            "skill": "writing",
        },
    },
)

add(
    "b1_u19.json",
    {
        "id": "b1-u19",
        "level": "B1",
        "unit_index": 19,
        "theme": "Unit 6 Review & Practice",
        "estimated_minutes": 26,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("révision des temps du passé", "review of past tenses", "Passe composé, imparfait, et leurs emplois.", "Passé composé, imparfait, and their uses.", "rev"),
                    card("accords du participe", "past participle agreement", "Elle est arrivée; les clés qu'elle a perdues.", "She arrived; the keys she lost (f. pl.).", "accord"),
                    card("connecteurs de narration", "narrative connectors", "Puis, alors, pendant que, soudain.", "Then, so, while, suddenly.", "conn"),
                    card("faits divers et souvenirs", "news and memories", "Les deux utilisent le passé mais pas pareil.", "Both use the past but not the same way.", "faits"),
                    card("phrase complexe", "complex sentence", "Bien structurer subordonnées et principales.", "Structure subordinate and main clauses well.", "complexe"),
                    card("objectif 80 %", "aim for 80%+", "Relis chaque phrase avant de passer à la suite.", "Reread each sentence before moving on.", "obj"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Tutorat — avant un petit examen",
                "turns": [
                    turn("Tuteur", "Donne-moi une phrase à l'imparfait pour une habitude, puis une au PC pour une action unique.", "Give me an imparfait sentence for a habit, then one in PC for a single action."),
                    turn("Élève", "D'habitude je lisais le journal le matin. Ce matin-là, j'ai vu une nouvelle surprenante.", "I usually read the paper in the morning. That morning I saw surprising news."),
                    turn("Tuteur", "Parfait. Et si tu racontes les deux en une phrase avec « pendant que »?", "Perfect. And if you tell both in one sentence with « pendant que »?"),
                    turn("Élève", "Pendant que je lisais, mon téléphone a vibré.", "While I was reading, my phone buzzed."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Synthèse B1 passé : imparfait = durée, habitude, description; PC = changement, liste d'actions, événement daté. Vérifie auxiliaire (être vs avoir) et accords avec être.",
                "examples": [
                    ex("Il était huit heures; les enfants dormaient encore.", "It was eight; the children were still sleeping."),
                    ex("À huit heures pile, le réveil a sonné.", "At eight sharp the alarm rang."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match tense to use",
                        "pairs": [
                            {"left": "habit in the past", "right": "imparfait"},
                            {"left": "single completed event", "right": "passé composé"},
                            {"left": "ongoing background when something happens", "right": "imparfait + PC"},
                            {"left": "agreement with être subject", "right": "participe agrees"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Quand j'étais ado, je ___ (jouer) au hockey; l'an dernier, j'ai ___ (arrêter).",
                        "answer": "jouais … arrêté",
                        "options": ["jouais … arrêté", "ai joué … arrêtais", "joue … arrête", "jouerai … arrêterai"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Elles sont ___ à Montréal en 2020 » (arrive — f. plural):",
                        "options": ["arrivées", "arrivés", "arrivé", "arriver"],
                        "answer_index": 0,
                    },
                    wo(["Pendant", "que", "nous", "discutions,", "il", "a", "neigé."], seq(7), "While we were talking, it snowed."),
                    {
                        "type": "mcq",
                        "question": "Which is better for « every Tuesday last year »?",
                        "options": ["Le mardi, je prenais le train.", "Un mardi, j'ai pris le train.", "Je prendrai le train.", "Je prends le train."],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Synthèse : 10 phrases qui mélangent souvenirs d'enfance, un fait divers inventé, et une courte conclusion.",
            "example": "Quand j'avais six ans, nous habitions à Halifax… (suite libre)",
            "skill": "writing",
        },
    },
)

# ——— B2 ———
add(
    "b2_u1.json",
    {
        "id": "b2-u1",
        "level": "B2",
        "unit_index": 1,
        "theme": "Reading Headlines",
        "estimated_minutes": 22,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("la manchette", "headline", "La manchette résume l'article en quelques mots percutants.", "The headline sums up the article in a few punchy words.", "manchette"),
                    card("le chapeau", "lead / deck (under headline)", "Le chapeau précise le contexte en une phrase.", "The lead clarifies the context in one sentence.", "chapeau"),
                    card("selon une source anonyme", "according to an anonymous source", "Selon une source anonyme, les négociations avancent.", "According to an anonymous source, talks are moving forward.", "anonyme"),
                    card("hausse · baisse", "rise · fall", "Hausse des taux : les emprunteurs s'inquiètent.", "Rate hike: borrowers worry.", "hausse"),
                    card("le gouvernement fédéral", "federal government", "Le gouvernement fédéral annonce de nouvelles mesures.", "The federal government announces new measures.", "fed"),
                    card("tension / pourparlers", "tension / talks", "Les pourparlers se poursuivent malgré les tensions.", "Talks continue despite tensions.", "tension"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Kiosque à journaux — deux collègues",
                "turns": [
                    turn("Inès", "Tu as vu la manchette? « Hausse des loyers : la Ville réagit » — c'est vague.", "Did you see the headline? 'Rent hike: the City reacts' — it's vague."),
                    turn("Omar", "Oui, le chapeau explique que c'est une hausse moyenne de trois pour cent.", "Yes, the lead explains it's an average three percent increase."),
                    turn("Inès", "Il faut lire l'article : souvent le titre exagère pour cliquer.", "You have to read the article: often the title exaggerates for clicks."),
                    turn("Omar", "Exact. Je note aussi la source : agence officielle ou blog d'opinion?", "Exactly. I also note the source: official agency or opinion blog?"),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Manchettes : noms sans article, infinitifs, deux-points. « Hausse des prix » = nominalisation (nom dérivé du verbe hausser). Lis le corps de l'article avant de conclure.",
                "examples": [
                    ex("Grève dans les écoles : négociations en cours.", "Strike in schools: negotiations underway."),
                    ex("Nouvelle loi sur l'environnement adoptée hier soir.", "New environmental law adopted last night."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "manchette", "right": "headline"},
                            {"left": "chapeau", "right": "lead line"},
                            {"left": "hausse", "right": "rise / increase"},
                            {"left": "pourparlers", "right": "talks / negotiations"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "La ___ annonce l'article; le ___ donne le contexte immédiat.",
                        "answer": "manchette … chapeau",
                        "options": ["manchette … chapeau", "chapeau … manchette", "commentaire … titre", "éditorial … photo"],
                    },
                    {
                        "type": "mcq",
                        "question": "Headlines often omit articles to:",
                        "options": ["save space and increase impact", "show subjunctive", "indicate past tense", "replace verbs"],
                        "answer_index": 0,
                    },
                    wo(["Les", "négociations", "ont", "repris", "ce", "matin."], seq(6), "Negotiations resumed this morning."),
                    {
                        "type": "mcq",
                        "question": "« Selon une source anonyme » signals:",
                        "options": ["unverified / unnamed sourcing", "a legal verdict", "a weather forecast", "a recipe"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Invente trois manchettes courtes sur des sujets canadiens (économie, climat, sport) + une phrase de chapeau pour l'une d'elles.",
            "example": "Transport : « Projet de REM : retards annoncés » — Chapeau : « Les travailleurs dénoncent la surcharge des horaires. »",
            "skill": "writing",
        },
    },
)

add(
    "b2_u2.json",
    {
        "id": "b2-u2",
        "level": "B2",
        "unit_index": 2,
        "theme": "Giving Your Opinion",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("à mon sens", "in my view", "À mon sens, la mesure est nécessaire mais mal communiquée.", "In my view the measure is necessary but poorly communicated.", "sens"),
                    card("il me semble que", "it seems to me that", "Il me semble que les citoyens veulent plus de transparence.", "It seems to me citizens want more transparency.", "semble"),
                    card("je ne suis pas convaincu·e que", "I'm not convinced that", "Je ne suis pas convaincue que ce soit la meilleure option.", "I'm not convinced it's the best option.", "convaincu"),
                    card("d'un côté … de l'autre", "on one hand … on the other", "D'un côté ça crée des emplois; de l'autre, ça augmente le trafic.", "On one hand it creates jobs; on the other it increases traffic.", "cote"),
                    card("renforcer l'argument", "strengthen the argument", "Pour renforcer l'argument, cite une étude récente.", "To strengthen the argument, cite a recent study.", "arg"),
                    card("nuancer", "to nuance", "Il faut nuancer : les effets varient selon les régions.", "We should nuance: effects vary by region.", "nuance"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Débat radio — télétravail",
                "turns": [
                    turn("Animateur", "Est-ce que le télétravail doit rester la norme?", "Should remote work remain the norm?"),
                    turn("Invitée", "À mon sens, un modèle hybride est plus réaliste que le tout-à-distance.", "In my view a hybrid model is more realistic than all-remote."),
                    turn("Invité", "D'accord partiellement. De l'autre côté, certaines équipes ont gagné en productivité.", "Partly agree. On the other hand some teams gained productivity."),
                    turn("Invitée", "Il me semble qu'il faut nuancer selon les secteurs : la santé n'a pas ce luxe.", "It seems to me we should nuance by sector: health care doesn't have that luxury."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "« Je ne suis pas convaincu que » déclenche souvent le subjonctif (« que ce soit »). « Il me semble que » + indicatif quand tu exprimes une impression factuelle.",
                "examples": [
                    ex("Je doute que la réforme suffise sans financement.", "I doubt the reform will be enough without funding."),
                    ex("Il me semble que les sondages sont partagés.", "It seems to me the polls are split."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "à mon sens", "right": "in my view"},
                            {"left": "nuancer", "right": "to add nuance"},
                            {"left": "d'un côté", "right": "on one hand"},
                            {"left": "renforcer", "right": "to strengthen"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Je ne suis pas convaincu qu'il ___ (être) la seule solution.",
                        "answer": "soit",
                        "options": ["soit", "est", "sera", "était"],
                    },
                    {
                        "type": "mcq",
                        "question": "After « il me semble que » for a personal impression, mood is usually:",
                        "options": ["indicative", "subjunctive", "infinitive only", "imperative"],
                        "answer_index": 0,
                    },
                    wo(["À", "mon", "avis,", "la", "mesure", "est", "juste."], seq(7), "In my opinion the measure is fair."),
                    {
                        "type": "mcq",
                        "question": "« D'un côté … de l'autre » structures:",
                        "options": ["balanced argument", "only commands", "only past narrative", "only questions"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Paragraphe d'opinion (120 mots) sur un sujet d'actualité : à mon sens, d'un côté / de l'autre, il me semble que.",
            "example": "À mon sens, investir dans le transport en commun est urgent. D'un côté, ça coûte cher; de l'autre, le coût de l'inaction est plus élevé…",
            "skill": "writing",
        },
    },
)

add(
    "b2_u3.json",
    {
        "id": "b2-u3",
        "level": "B2",
        "unit_index": 3,
        "theme": "Bien que / quoique + subjunctive",
        "estimated_minutes": 26,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("bien que + subjonctif", "although + subjunctive", "Bien qu'il pleuve, la manifestation aura lieu.", "Although it's raining, the demonstration will take place.", "bienque"),
                    card("quoique", "although (syn.)", "Quoique le débat soit vif, le ton est resté correct.", "Although the debate was lively, the tone stayed appropriate.", "quoique"),
                    card("malgré le fait que", "despite the fact that (+ subj.)", "Malgré le fait que les preuves manquent, l'enquête continue.", "Despite the lack of evidence, the investigation continues.", "malgre"),
                    card("concéder", "to concede", "Je concède que le texte est complexe.", "I concede the text is complex.", "conceder"),
                    card("une concession", "a concession (argument)", "Introduis une concession avant de réfuter.", "Introduce a concession before rebutting.", "concession"),
                    card("néanmoins / toutefois", "nevertheless", "Le projet est risqué; néanmoins il mérite l'essai.", "The project is risky; nevertheless it deserves a try.", "neanmoins"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Réunion municipale — amendement",
                "turns": [
                    turn("Conseiller A", "Bien que nous soyons pressés, je demande un débat sur le budget vert.", "Although we're pressed for time, I'm asking for a debate on the green budget."),
                    turn("Conseiller B", "Quoique je partage l'urgence climatique, les chiffres ne sont pas clairs.", "Although I share the climate urgency, the numbers aren't clear."),
                    turn("Modératrice", "Malgré le fait qu'il soit tard, une motion courte est possible.", "Despite the fact it's late, a short motion is possible."),
                    turn("Conseiller A", "Merci. Néanmoins, reporter le vote nuirait à la confiance.", "Thanks. Still, postponing the vote would harm trust."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Après bien que, quoique, pour que, sans que, avant que… → subjonctif. « Bien qu'il fasse froid » (not *fait). Quoique peut introduire un adjectif invariable parfois (« quoique compréhensible ») en style journalistique.",
                "examples": [
                    ex("Bien qu'elle soit fatiguée, elle a terminé son rapport.", "Although she was tired, she finished her report."),
                    ex("Quoique la route soit glissante, ils ont roulé prudemment.", "Although the road was slippery, they drove carefully."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "bien que", "right": "although (+ subj.)"},
                            {"left": "quoique", "right": "although (+ subj.)"},
                            {"left": "néanmoins", "right": "nevertheless"},
                            {"left": "malgré le fait que", "right": "despite the fact that"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Bien qu'il ___ (faire) nuit, les équipes continuaient.",
                        "answer": "fasse",
                        "options": ["fasse", "fait", "faisait", "fera"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Bien que je ___ d'accord » — correct form:",
                        "options": ["sois", "suis", "serais", "serai"],
                        "answer_index": 0,
                    },
                    wo(["Quoique", "le", "risque", "soit", "réel,", "agissons."], seq(6), "Although the risk is real, let's act."),
                    {
                        "type": "mcq",
                        "question": "Subjunctive after bien que expresses:",
                        "options": ["a concession not yet presented as certain fact", "a completed past only", "a future perfect", "a passive command"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Quatre phrases avec bien que ou quoique + subjonctif sur l'environnement ou la politique locale.",
            "example": "Bien que les coûts augmentent, la ville investit dans les pistes cyclables. Quoique le débat soit tendu, un compromis est possible.",
            "skill": "writing",
        },
    },
)

add(
    "b2_u4.json",
    {
        "id": "b2-u4",
        "level": "B2",
        "unit_index": 4,
        "theme": "Summarizing and Paraphrasing",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("en résumé / pour résumer", "in summary", "Pour résumer, trois points clés ressortent du rapport.", "In summary, three key points stand out from the report.", "resume"),
                    card("autrement dit", "in other words", "Autrement dit, la croissance ralentit sans s'arrêter.", "In other words growth is slowing without stopping.", "autrement"),
                    card("l'essentiel est que", "the essential thing is that", "L'essentiel est que les citoyens comprennent les étapes.", "The essential thing is that citizens understand the steps.", "essentiel"),
                    card("paraphraser", "to paraphrase", "Paraphrase l'auteur sans copier ses tournures.", "Paraphrase the author without copying their phrasing.", "para"),
                    card("synthétiser", "to synthesize", "Synthétise deux articles opposés en un paragraphe.", "Synthesize two opposing articles in one paragraph.", "synth"),
                    card("ne pas trahir le sens", "not to distort meaning", "Attention à ne pas trahir le sens des statistiques.", "Be careful not to distort the meaning of the statistics.", "trahir"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Équipe rédactionnelle — revue de texte",
                "turns": [
                    turn("Rédactrice", "Ton résumé est fidèle, mais « exploser les coûts » est trop fort pour les données.", "Your summary is faithful but 'exploding costs' is too strong for the data."),
                    turn("Stagiaire", "Autrement dit, je devrais dire « hausse modérée »?", "In other words I should say 'moderate increase'?"),
                    turn("Rédactrice", "Oui. Pour résumer : hausse modérée, surtout dans l'énergie.", "Yes. In summary: moderate increase, especially in energy."),
                    turn("Stagiaire", "Je paraphrase la citation du ministre sans les mots polémiques.", "I'll paraphrase the minister's quote without the polemical words."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Synthèse : présent de vérité générale ou passé si l'article est daté. Connecteurs « en bref », « dans l'ensemble », « cela dit » pour marquer la teneur globale.",
                "examples": [
                    ex("Dans l'ensemble, les experts s'accordent sur la tendance.", "Overall experts agree on the trend."),
                    ex("Cela dit, plusieurs nuances méritent attention.", "That said, several nuances deserve attention."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "autrement dit", "right": "in other words"},
                            {"left": "synthétiser", "right": "to synthesize"},
                            {"left": "paraphraser", "right": "to paraphrase"},
                            {"left": "en résumé", "right": "in summary"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ , l'article plaide pour plus de transparence.",
                        "answer": "En résumé",
                        "options": ["En résumé", "Bien que", "Afin que", "Pourvu que"],
                    },
                    {
                        "type": "mcq",
                        "question": "Good paraphrase should:",
                        "options": ["keep the same meaning with new wording", "add your own opinions as facts", "shorten by deleting all numbers", "copy two sentences verbatim"],
                        "answer_index": 0,
                    },
                    wo(["L'", "essentiel", "est", "que", "nous", "restions", "prudents."], seq(7), "The essential thing is that we stay cautious."),
                    {
                        "type": "mcq",
                        "question": "« Ne pas trahir le sens » warns against:",
                        "options": ["distorting the original meaning", "using synonyms", "citing sources", "writing a title"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Résume en 4 phrases un article imaginaire sur l'éducation au Canada (pour résumer, autrement dit, l'essentiel est que).",
            "example": "Pour résumer, le texte compare deux provinces. Autrement dit, les financements diffèrent. L'essentiel est que l'équité reste le débat central.",
            "skill": "writing",
        },
    },
)

add(
    "b2_u5.json",
    {
        "id": "b2-u5",
        "level": "B2",
        "unit_index": 5,
        "theme": "Polite Disagreement",
        "estimated_minutes": 22,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("je vois les choses autrement", "I see things differently", "Je vois les choses autrement sur la priorité des dépenses.", "I see things differently on spending priorities.", "autrement2"),
                    card("je ne suis pas sûr·e de partager", "I'm not sure I share (that view)", "Je ne suis pas sûre de partager ton analyse sur les chiffres.", "I'm not sure I share your analysis of the figures.", "partager"),
                    card("pourrait-on envisager …?", "could we consider …?", "Pourrait-on envisager une phase pilote avant le déploiement?", "Could we consider a pilot phase before rollout?", "envisager"),
                    card("hors de question", "out of the question (strong)", "Couper le financement est hors de question pour moi.", "Cutting funding is out of the question for me.", "hors"),
                    card("respectueusement", "respectfully", "Respectueusement, je crois que cette analogie est trompeuse.", "Respectfully I think that analogy is misleading.", "respect"),
                    card("trouver un terrain d'entente", "find common ground", "Cherchons un terrain d'entente sur les délais.", "Let's find common ground on timelines.", "terrain"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Comité de quartier — projet immobilier",
                "turns": [
                    turn("Voisine", "Ce projet augmentera le trafic; c'est évident.", "This project will increase traffic; it's obvious."),
                    turn("Promoteur", "Je vois les choses autrement : l'étude prévoit une gestion des accès.", "I see things differently: the study plans access management."),
                    turn("Voisine", "Respectueusement, les études sous-estiment souvent l'affluence.", "Respectfully studies often underestimate crowds."),
                    turn("Modérateur", "Pourrait-on envisager une rencontre avec les ingénieurs municipaux?", "Could we consider a meeting with municipal engineers?"),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Désaccord poli : conditionnel de politesse (« pourrait-on »), adverbes (« respectueusement »), atténuation (« je ne suis pas certain que » + subj.). Évite l'impératif direct quand tu contredis.",
                "examples": [
                    ex("Je comprends votre point, toutefois les données suggèrent autre chose.", "I understand your point; however the data suggest something else."),
                    ex("Il me semblerait plus juste d'attendre l'avis du comité.", "It would seem fairer to wait for the committee's opinion."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "respectueusement", "right": "respectfully"},
                            {"left": "pourrait-on", "right": "could we (polite)"},
                            {"left": "terrain d'entente", "right": "common ground"},
                            {"left": "hors de question", "right": "out of the question"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ , votre comparaison mérite discussion.",
                        "answer": "Respectueusement",
                        "options": ["Respectueusement", "Brutalement", "Silencieusement", "Évidemment"],
                    },
                    {
                        "type": "mcq",
                        "question": "Soft disagreement starter:",
                        "options": [
                            "Je ne suis pas sûr de partager cette conclusion.",
                            "Tu te trompes complètement.",
                            "Tais-toi.",
                            "C'est faux, point.",
                        ],
                        "answer_index": 0,
                    },
                    wo(["Pourrait-on", "reporter", "la", "décision", "d'", "une", "semaine", "?"], seq(8), "Could we postpone the decision by one week?"),
                    {
                        "type": "mcq",
                        "question": "« Trouver un terrain d'entente » means:",
                        "options": ["find shared acceptable ground", "buy land", "end the meeting", "reject all proposals"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Écris un échange de 6 répliques : désaccord poli sur les logements étudiants (respectueusement, pourrait-on, je vois les choses autrement).",
            "example": "— Il faut interdire les tours. — Je vois les choses autrement : la densité peut financer des parcs…",
            "skill": "writing",
        },
    },
)

add(
    "b2_u6.json",
    {
        "id": "b2-u6",
        "level": "B2",
        "unit_index": 6,
        "theme": "Travel & Media Capstone",
        "estimated_minutes": 28,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("croiser les sources", "cross-check sources", "Il faut croiser les sources avant de partager une manchette.", "Cross-check sources before sharing a headline.", "croiser"),
                    card("désinformation", "disinformation", "La désinformation voyage vite sur les réseaux.", "Disinformation travels fast on social networks.", "desinfo"),
                    card("itinéraire responsable", "responsible itinerary", "Un itinéraire responsable limite les allers-retours en avion.", "A responsible itinerary limits short flights back and forth.", "itin"),
                    card("couverture médiatique", "media coverage", "La couverture médiatique a influencé les réservations.", "Media coverage influenced bookings.", "couv"),
                    card("enjeu local", "local issue/stake", "Les enjeux locaux diffèrent entre Montréal et Calgary.", "Local stakes differ between Montreal and Calgary.", "enjeu"),
                    card("formuler une prise de position", "state a position", "Formule clairement ta prise de position en deux phrases.", "State your position clearly in two sentences.", "prise"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Balado — voyage et actualité",
                "turns": [
                    turn("Hôte", "Comment relier écotourisme et lecture critique des médias?", "How connect ecotourism and critical media reading?"),
                    turn("Invitée", "Avant de réserver, je croise les sources : blogs, journaux, avis vérifiés.", "Before booking I cross-check sources: blogs, papers, verified reviews."),
                    turn("Hôte", "Et si une manchette alarmiste casse une destination?", "And if an alarmist headline breaks a destination?"),
                    turn("Invitée", "Je paraphrase l'article principal, je cherche des données officielles; bien que l'émotion vende, les faits comptent.", "I paraphrase the main article, I look for official data; although emotion sells, facts count."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Synthèse B2 médias + voyage : mélange indicatif (faits vérifiés), conditionnel (prudence), subjonctif après bien que / pour que. Varie les connecteurs logiques.",
                "examples": [
                    ex("Pour que le voyage soit durable, il faut accepter des compromis.", "For the trip to be sustainable you have to accept trade-offs."),
                    ex("Selon plusieurs experts, la fréquentation devrait être encadrée.", "According to several experts attendance should be regulated."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "croiser les sources", "right": "cross-check"},
                            {"left": "désinformation", "right": "disinformation"},
                            {"left": "couverture médiatique", "right": "media coverage"},
                            {"left": "prise de position", "right": "stated position"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Bien que la ___ soit séduisante, vérifie les faits.",
                        "answer": "manchette",
                        "options": ["manchette", "valise", "gare", "recette"],
                    },
                    {
                        "type": "mcq",
                        "question": "Responsible travel + media literacy together emphasize:",
                        "options": ["verified information and lower-impact choices", "only viral photos", "ignoring local news", "booking first, reading later"],
                        "answer_index": 0,
                    },
                    wo(["Je", "synthétise", "deux", "points", "de", "vue", "opposés."], seq(7), "I summarize two opposing viewpoints."),
                    {
                        "type": "mcq",
                        "question": "« Enjeu local » refers to:",
                        "options": ["what's at stake for a community", "a train schedule", "a grammar rule", "a hotel star rating"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Texte de 150 mots : tu planifies un voyage au Canada en réagissant à une manchette (bien que, selon, pour résumer).",
            "example": "J'ai lu une manchette sur les feux de forêt… Pour résumer… Bien que le titre soit alarmiste…",
            "skill": "writing",
        },
    },
)

add(
    "b2_u7.json",
    {
        "id": "b2-u7",
        "level": "B2",
        "unit_index": 7,
        "theme": "Job Interview Basics",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("l'entretien d'embauche", "job interview", "L'entretien d'embauche dure souvent quarante-cinq minutes.", "The hiring interview often lasts forty-five minutes.", "entretien"),
                    card("les forces et axes d'amélioration", "strengths and areas for improvement", "Prépare des exemples concrets pour tes forces.", "Prepare concrete examples for your strengths.", "forces"),
                    card("le poste à pourvoir", "position to be filled", "Le poste à pourvoir exige bilinguisme oral.", "The position requires oral bilingualism.", "poste"),
                    card("pourquoi devrions-nous vous embaucher?", "why should we hire you?", "Réponds en liant profil et besoins de l'équipe.", "Answer by linking profile and team needs.", "embaucher"),
                    card("une question piège", "trick question", "Reste calme face à une question piège.", "Stay calm facing a trick question.", "piege"),
                    card("suivi / remerciement", "follow-up / thanks", "Un courriel de remerciement le lendemain est apprécié.", "A thank-you email the next day is appreciated.", "suivi"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Entretien — startup montréalaise",
                "turns": [
                    turn("Recruteur", "Parlez-moi d'un projet où vous avez dû convaincre des parties prenantes.", "Tell me about a project where you had to convince stakeholders."),
                    turn("Candidate", "J'ai piloté une refonte du site : j'ai synthétisé les retours utilisateurs et fixé des priorités réalistes.", "I led a website overhaul: I synthesized user feedback and set realistic priorities."),
                    turn("Recruteur", "Pourquoi devrions-nous vous embaucher plutôt qu'un autre candidat?", "Why should we hire you rather than another candidate?"),
                    turn("Candidate", "Mon profil combine analyse de données et communication claire, ce dont votre équipe marketing a besoin.", "My profile combines data analysis and clear communication, which your marketing team needs."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Registre soutenu à l'oral : « je souhaiterais », « j'ai eu l'occasion de », « il m'a été demandé de ». Évite le tutoiement si l'interviewer vouvoie.",
                "examples": [
                    ex("J'aurais aimé creuser davantage la gouvernance des données.", "I would have liked to explore data governance further."),
                    ex("Permettez-moi de préciser mon expérience en gestion d'équipe.", "Allow me to clarify my experience in team management."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "entretien d'embauche", "right": "job interview"},
                            {"left": "poste à pourvoir", "right": "open position"},
                            {"left": "question piège", "right": "trick question"},
                            {"left": "remerciement", "right": "thanks / thank-you note"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___-moi de vous expliquer ma motivation en deux phrases.",
                        "answer": "Permettez",
                        "options": ["Permettez", "Écoutez", "Regardez", "Oubliez"],
                    },
                    {
                        "type": "mcq",
                        "question": "STAR method (situation, task, action, result) helps with:",
                        "options": ["behavioral interview answers", "spelling only", "salary negotiation only", "visa forms"],
                        "answer_index": 0,
                    },
                    wo(["Je", "souhaiterais", "contribuer", "à", "votre", "équipe."], seq(6), "I would like to contribute to your team."),
                    {
                        "type": "mcq",
                        "question": "After an interview in formal Québec/workplace French, sending:",
                        "options": [
                            "a short professional thank-you email",
                            "a meme",
                            "nothing for two weeks",
                            "a text full of slang",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Réponses écrites (120 mots) : « Parlez-moi de vous » + « Où vous voyez-vous dans cinq ans? » — ton professionnel.",
            "example": "Je suis analyste avec quatre ans d'expérience… Dans cinq ans, je vois un rôle hybride data–stratégie…",
            "skill": "writing",
        },
    },
)

add(
    "b2_u8.json",
    {
        "id": "b2-u8",
        "level": "B2",
        "unit_index": 8,
        "theme": "Professional Email",
        "estimated_minutes": 22,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("Objet :", "Subject:", "Objet : Demande de congé — semaine du 12 août", "Subject: Leave request — week of August 12", "objet"),
                    card("Madame, Monsieur,", "Dear Sir/Madam,", "Madame, Monsieur, j'ai l'honneur de vous adresser…", "Dear Sir/Madam, I am writing to…", "madame"),
                    card("dans l'attente de votre retour", "looking forward to your reply", "Dans l'attente de votre retour, veuillez agréer…", "Looking forward to your reply, please accept…", "attente"),
                    card("veuillez trouver ci-joint", "please find attached", "Veuillez trouver ci-joint le rapport consolidé.", "Please find attached the consolidated report.", "joint"),
                    card("suite à notre échange", "following our conversation", "Suite à notre échange téléphonique de mardi…", "Following our phone call Tuesday…", "suite"),
                    card("cordialement / Bien à vous", "regards / best regards", "Cordialement, puis signature complète.", "Regards, then full signature.", "cordial"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Rédaction collaborative — courriel au ministère",
                "turns": [
                    turn("A", "On commence par « Objet : » clair, puis formule d'appel polie.", "We start with a clear 'Subject:' then a polite salutation."),
                    turn("B", "Suite à notre réunion, nous demandons une clarification sur l'échéance.", "Following our meeting we're asking for clarification on the deadline."),
                    turn("A", "Veuillez trouver ci-joint le formulaire signé.", "Please find attached the signed form."),
                    turn("B", "On ferme par « Dans l'attente de votre retour, cordialement ».", "We close with 'Looking forward to your reply, best regards'."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Courriel pro : phrases complètes, évite les abréviations texto. « Je vous prie de » + infinitif ou « veuillez » + infinitif. Indicatif pour faits, conditionnel pour demande polie (« pourriez-vous »).",
                "examples": [
                    ex("Pourriez-vous confirmer la réception de ce dossier?", "Could you confirm receipt of this file?"),
                    ex("Je vous informe que la réunion est reportée à jeudi.", "I'm informing you the meeting is moved to Thursday."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "Objet :", "right": "email subject line"},
                            {"left": "ci-joint", "right": "attached"},
                            {"left": "suite à", "right": "following"},
                            {"left": "cordialement", "right": "professional closing"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "___ trouver ci-joint la facture numéro 2044.",
                        "answer": "Veuillez",
                        "options": ["Veuillez", "Tu peux", "J'espère", "Oubliez de"],
                    },
                    {
                        "type": "mcq",
                        "question": "Polite request to a manager:",
                        "options": [
                            "Pourriez-vous valider cette version avant vendredi?",
                            "Valide ça vite.",
                            "Fais-moi signe.",
                            "Signe maintenant.",
                        ],
                        "answer_index": 0,
                    },
                    wo(["Dans", "l'attente", "de", "votre", "retour,", "cordialement."], seq(6), "Looking forward to your reply, best regards."),
                    {
                        "type": "mcq",
                        "question": "« Suite à notre échange » introduces:",
                        "options": ["reference to a prior interaction", "a joke", "a salary demand only", "an automatic out-of-office"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Rédige un courriel complet (objet, salutation, corps, formule de politesse) pour demander un rendez-vous avec un service municipal.",
            "example": "Objet : Demande de rendez-vous — permis de rénovation\nMadame, Monsieur,\nSuite à…\nCordialement,\n[Nom]",
            "skill": "writing",
        },
    },
)

add(
    "b2_u9.json",
    {
        "id": "b2-u9",
        "level": "B2",
        "unit_index": 9,
        "theme": "Si + imparfait (hypotheses)",
        "estimated_minutes": 26,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("si + imparfait", "if + imperfect (hypothesis)", "Si j'avais plus de temps, j'apprendrais l'italien.", "If I had more time I'd learn Italian.", "siimp"),
                    card("conditionnel présent", "conditional (then-clause)", "Nous voyagerions autrement si les billets étaient moins chers.", "We'd travel differently if tickets were cheaper.", "cond"),
                    card("à ta / votre place", "in your place", "À votre place, je négocierais une clause de télétravail.", "In your place I'd negotiate a remote-work clause.", "place"),
                    card("en théorie / en pratique", "in theory / in practice", "En théorie c'est simple; en pratique il y a des contraintes.", "In theory it's simple; in practice there are constraints.", "theorie"),
                    card("hypothèse irréelle", "counterfactual hypothesis", "C'est une hypothèse irréelle sur le passé.", "It's a counterfactual about the past.", "hypo"),
                    card("sinon", "otherwise", "Il faut signer avant lundi, sinon l'offre expire.", "You must sign before Monday, otherwise the offer expires.", "sinon"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Conseil de carrière — mentor et mentore",
                "turns": [
                    turn("Mentor", "Si tu avais le choix entre deux villes, laquelle privilégierais-tu?", "If you had the choice between two cities, which would you favor?"),
                    turn("Inès", "Si les salaires étaient équivalents, je choisirais Montréal pour le réseau culturel.", "If salaries were equivalent I'd choose Montreal for the cultural network."),
                    turn("Mentor", "À ta place, je demanderais une entrevue informelle avant d'accepter.", "In your place I'd ask for an informal interview before accepting."),
                    turn("Inès", "Oui. Et si l'entreprise refusait la flexibilité, je négocierais au moins les horaires.", "Yes. And if the company refused flexibility, I'd at least negotiate hours."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Hypothèse présente irréelle : si + imparfait, résultat au conditionnel (« si j'étais riche, j'achèterais… »). Pour le passé : si + plus-que-parfait + conditionnel passé (niveau C1 parfois). Ne dis pas *si j'aurais.",
                "examples": [
                    ex("Si nous partions plus tôt, nous éviterions le trafic.", "If we left earlier we'd avoid traffic."),
                    ex("Que ferais-tu si on te proposait un transfert à Vancouver?", "What would you do if you were offered a transfer to Vancouver?"),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "si + imparfait", "right": "hypothetical if-clause"},
                            {"left": "conditionnel", "right": "would … (then clause)"},
                            {"left": "hypothèse irréelle", "right": "counterfactual"},
                            {"left": "sinon", "right": "otherwise"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Si j'___ (être) toi, je ___ (accepter) l'offre.",
                        "answer": "étais … accepterais",
                        "options": ["étais … accepterais", "serais … accepte", "suis … accepterai", "avais été … accepte"],
                    },
                    {
                        "type": "mcq",
                        "question": "Non-standard but common spoken error to avoid in writing:",
                        "options": ["si j'aurais (instead of si j'avais)", "si j'avais", "j'aurais", "nous aurions"],
                        "answer_index": 0,
                    },
                    wo(["Avec", "un", "budget", "plus", "large,", "nous", "agirions", "vite."], seq(8), "With a larger budget we would act quickly."),
                    {
                        "type": "mcq",
                        "question": "« À votre place, je … » typically continues with:",
                        "options": ["conditional", "imperative only", "subjunctive", "infinitive alone"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Cinq phrases hypothétiques sur ta carrière ou tes études (si + imparfait + conditionnel).",
            "example": "Si je parlais mieux l'espagnol, je postulerais à l'étranger. Si les cours étaient le soir, j'assisterais plus souvent.",
            "skill": "writing",
        },
    },
)

add(
    "b2_u10.json",
    {
        "id": "b2-u10",
        "level": "B2",
        "unit_index": 10,
        "theme": "Forms and Procedures",
        "estimated_minutes": 22,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("remplir un formulaire", "fill out a form", "Remplis chaque case du formulaire en lettres majuscules.", "Fill each box of the form in capitals.", "form"),
                    card("une pièce justificative", "supporting document", "Joindre une pièce justificative : permis, facture, etc.", "Attach a supporting document: license, invoice, etc.", "piece"),
                    card("faire une demande", "submit an application", "Nous faisons une demande de subvention avant le trente.", "We're submitting a grant application before the 30th.", "demande"),
                    card("le délai de traitement", "processing time", "Le délai de traitement est de dix jours ouvrables.", "Processing time is ten business days.", "delai"),
                    card("en ligne / sur place", "online / in person", "Tu peux déposer en ligne ou sur place avec rendez-vous.", "You can file online or in person with an appointment.", "ligne"),
                    card("numéro de dossier", "file number", "Note ton numéro de dossier pour tout suivi.", "Note your file number for any follow-up.", "dossier"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Comptoir Service Canada — citoyenne",
                "turns": [
                    turn("Agent", "Bonjour. Vous avez rempli le formulaire en ligne?", "Hello. Did you fill out the form online?"),
                    turn("Citoyenne", "Oui, mais le site a rejeté ma pièce justificative : le fichier était trop lourd.", "Yes, but the site rejected my supporting document: the file was too large."),
                    turn("Agent", "Pas de problème : nous pouvons scanner une version papier ici. Votre délai de traitement commence aujourd'hui.", "No problem: we can scan a paper version here. Your processing time starts today."),
                    turn("Citoyenne", "Parfait. Où trouver mon numéro de dossier?", "Perfect. Where do I find my file number?"),
                    turn("Agent", "Sur le récépissé que je vous remets; conservez-le.", "On the receipt I'm giving you; keep it."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Procédures : impératif poli (« veuillez joindre »), infinitif d'instruction (« cocher la case »), présent pour décrire le processus (« le délai est de… »).",
                "examples": [
                    ex("Après avoir signé, déposez le formulaire au guichet trois.", "After signing, drop the form off at counter three."),
                    ex("Si une case ne s'applique pas, écrivez « sans objet ».", "If a box doesn't apply, write 'N/A'."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "pièce justificative", "right": "supporting document"},
                            {"left": "délai de traitement", "right": "processing time"},
                            {"left": "numéro de dossier", "right": "file number"},
                            {"left": "sur place", "right": "in person"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Veuillez ___ ce formulaire avant la date limite.",
                        "answer": "remplir",
                        "options": ["remplir", "oublier", "déchirer", "perdre"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Jours ouvrables » usually excludes:",
                        "options": ["weekends and public holidays", "Mondays", "afternoons", "email"],
                        "answer_index": 0,
                    },
                    wo(["Le", "délai", "de", "traitement", "est", "de", "dix", "jours."], seq(8), "The processing time is ten days."),
                    {
                        "type": "mcq",
                        "question": "« Faire une demande » means:",
                        "options": ["to apply / submit a request", "to delete a file", "to pay a fine only", "to cancel an appointment"],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Courriel court à un service : tu demandes le statut de ton dossier (numéro, date de dépôt, politesse).",
            "example": "Objet : Suivi dossier 2025-884\nMadame, Monsieur,\nJe fais suite à ma demande déposée le 3 mars…\nCordialement,",
            "skill": "writing",
        },
    },
)

add(
    "b2_u11.json",
    {
        "id": "b2-u11",
        "level": "B2",
        "unit_index": 11,
        "theme": "Running a Meeting",
        "estimated_minutes": 24,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("l'ordre du jour", "agenda", "Passons au troisième point de l'ordre du jour.", "Let's move to the third item on the agenda.", "ordre"),
                    card("donner la parole à", "to give the floor to", "Je donne la parole à Maya pour la mise à jour technique.", "I'm giving the floor to Maya for the technical update.", "parole"),
                    card("reporter un point", "to table / postpone an item", "Nous devrons reporter ce point faute de données.", "We'll have to postpone this item for lack of data.", "reporter"),
                    card("les actions à suivre", "action items", "Quelles sont les actions à suivre d'ici vendredi?", "What are the action items before Friday?", "actions"),
                    card("le compte-rendu", "minutes / summary", "Le compte-rendu sera envoyé dans les vingt-quatre heures.", "The minutes will be sent within twenty-four hours.", "cr"),
                    card("atteindre le quorum", "reach quorum", "Nous n'atteignons pas le quorum; la séance est levée.", "We don't reach quorum; the meeting is adjourned.", "quorum"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Visioconférence — équipe produit",
                "turns": [
                    turn("Animatrice", "Bienvenue à tous. L'ordre du jour : budget, feuille de route, questions diverses.", "Welcome everyone. Agenda: budget, roadmap, miscellaneous."),
                    turn("Dev", "Pour le budget, nous avons besoin d'une décision sur l'outil d'analytics.", "For the budget we need a decision on the analytics tool."),
                    turn("Animatrice", "Je propose de reporter la décision finale à mercredi si les chiffres arrivent demain.", "I propose postponing the final decision to Wednesday if numbers arrive tomorrow."),
                    turn("PM", "D'accord. Actions : Léo contacte les fournisseurs; Sara met à jour le tableau des coûts.", "OK. Action items: Léo contacts vendors; Sara updates the cost sheet."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Animer : « je propose que » + subjonctif souvent (« je propose que nous passions »). Formulations neutres : « il semble que », « nous convenons de ».",
                "examples": [
                    ex("Je suggère que chaque équipe envoie un résumé d'une page.", "I suggest each team send a one-page summary."),
                    ex("Faut-il fixer une date limite pour les commentaires?", "Should we set a deadline for comments?"),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "ordre du jour", "right": "agenda"},
                            {"left": "donner la parole", "right": "give the floor"},
                            {"left": "compte-rendu", "right": "minutes"},
                            {"left": "quorum", "right": "minimum attendance"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Je propose que nous ___ au vote suivant. (subjunctive of passer)",
                        "answer": "passions",
                        "options": ["passions", "passons", "passerons", "passassez"],
                    },
                    {
                        "type": "mcq",
                        "question": "« Reporter un point » in a meeting usually means:",
                        "options": ["postpone the item", "delete the agenda", "speak louder", "end the company"],
                        "answer_index": 0,
                    },
                    wo(["Je", "donne", "la", "parole", "à", "Léa."], seq(6), "I'm giving the floor to Léa."),
                    {
                        "type": "mcq",
                        "question": "Good closing action for a meeting:",
                        "options": [
                            "Summarize action items and next deadlines",
                            "Leave without saying goodbye",
                            "Delete all documents",
                            "Assign blame publicly",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Rédige l'ordre du jour d'une réunion de 45 min (4 points) + deux actions à suivre typiques.",
            "example": "1) Mise à jour projet 2) Risques 3) Décisions 4) Questions — Actions : Jean envoie le budget; Marie contacte le client.",
            "skill": "writing",
        },
    },
)

add(
    "b2_u12.json",
    {
        "id": "b2-u12",
        "level": "B2",
        "unit_index": 12,
        "theme": "Workplace Capstone",
        "estimated_minutes": 28,
        "steps": [
            {
                "type": "vocab_intro",
                "cards": [
                    card("vision d'ensemble", "big picture", "Garde une vision d'ensemble avant de trancher.", "Keep the big picture before deciding.", "vision"),
                    card("alignement des équipes", "team alignment", "L'alignement des équipes passe par une communication claire.", "Team alignment comes from clear communication.", "align"),
                    card("cadre légal / conformité", "legal framework / compliance", "Vérifie le cadre légal avant de publier.", "Check the legal framework before publishing.", "conform"),
                    card("retour d'expérience", "lessons learned / feedback", "Le retour d'expérience enrichit la prochaine itération.", "Lessons learned enrich the next iteration.", "rex"),
                    card("prioriser", "to prioritize", "Il faut prioriser les risques réels, pas les bruits.", "Prioritize real risks, not noise.", "prio"),
                    card("clôture professionnelle", "professional closing", "Une clôture professionnelle fixe les suites.", "A professional closing sets next steps.", "cloture"),
                ],
            },
            {
                "type": "dialogue",
                "scene": "Revue trimestrielle — direction",
                "turns": [
                    turn("DG", "Pour clôturer, je veux une vision d'ensemble : où en sommes-nous sur la conformité?", "To close I want a big picture: where are we on compliance?"),
                    turn("Juriste", "Les équipes sont alignées sur le nouveau guide; le retour d'expérience des pilotes est positif.", "Teams are aligned on the new guide; pilot feedback is positive."),
                    turn("DG", "Bien. Priorisons trois chantiers pour le trimestre prochain.", "Good. Let's prioritize three workstreams for next quarter."),
                    turn("COO", "Je propose courriel de synthèse demain matin avec actions nominales.", "I propose a summary email tomorrow morning with named actions."),
                ],
            },
            {
                "type": "grammar_tip",
                "rule": "Synthèse B2 travail : vouvoiement, conditionnel de politesse, subjonctif après il faut que / je propose que, indicatif pour faits auditables. Relie les sections avec « quant à », « en ce qui concerne », « sur le plan juridique ».",
                "examples": [
                    ex("Il faut que chaque manager valide les délais d'ici vendredi.", "Each manager must confirm deadlines by Friday."),
                    ex("En ce qui concerne les contrats, nous recommandons une relecture externe.", "Regarding contracts we recommend an external review."),
                ],
            },
            {
                "type": "practice",
                "exercises": [
                    {
                        "type": "match_pairs",
                        "instruction": "Match",
                        "pairs": [
                            {"left": "vision d'ensemble", "right": "big picture"},
                            {"left": "retour d'expérience", "right": "lessons learned"},
                            {"left": "conformité", "right": "compliance"},
                            {"left": "prioriser", "right": "to prioritize"},
                        ],
                    },
                    {
                        "type": "fill_blank",
                        "sentence": "Il faut que nous ___ (être) transparents sur les retards.",
                        "answer": "soyons",
                        "options": ["soyons", "sommes", "serons", "étions"],
                    },
                    {
                        "type": "mcq",
                        "question": "« En ce qui concerne » introduces:",
                        "options": ["a specific topic focus", "a joke", "a recipe", "a sports score"],
                        "answer_index": 0,
                    },
                    wo(["Je", "propose", "une", "synthèse", "pour", "lundi", "matin."], seq(7), "I propose a summary for Monday morning."),
                    {
                        "type": "mcq",
                        "question": "Workplace capstone skills in this module combine:",
                        "options": [
                            "meetings, email, admin, and hypothetical reasoning",
                            "only spelling",
                            "only slang",
                            "only handwriting",
                        ],
                        "answer_index": 0,
                    },
                ],
            },
        ],
        "production_task": {
            "prompt": "Mémo interne (180 mots) : bilan trimestriel + 3 priorités + appel à l'alignement (il faut que, je propose que, en conclusion).",
            "example": "Objet : Bilan T1 — priorités\nÉquipe,\nEn conclusion de ce trimestre… Il faut que nous finalisions… Je propose que…",
            "skill": "writing",
        },
    },
)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    MOBILE.mkdir(parents=True, exist_ok=True)
    expected = {f"b1_u{i}.json" for i in range(1, 20)} | {f"b2_u{i}.json" for i in range(1, 13)}
    written = {name for name, _ in LESSONS}
    missing = sorted(expected - written)
    extra = sorted(written - expected)
    if missing or extra:
        raise SystemExit(f"Lesson set mismatch. Missing: {missing!r} Extra: {extra!r}")
    for name, data in LESSONS:
        text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        (ROOT / name).write_text(text, encoding="utf-8")
        (MOBILE / name).write_text(text, encoding="utf-8")
    print(f"Wrote {len(LESSONS)} lessons to {ROOT} and {MOBILE}")


if __name__ == "__main__":
    main()
