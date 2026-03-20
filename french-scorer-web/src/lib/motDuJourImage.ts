/**
 * Thematic Unsplash images for Mot du jour (curated per headword).
 * When `imageUrl` is set on the bank entry, that wins — see MotDuJourCard.
 */

const crop = (photoPath: string) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=960&q=80`

/** Default when a new word is added to the bank before we map it */
export const MOT_DU_JOUR_DEFAULT_IMAGE = crop('photo-1502602898657-3e91760cbb34')

/**
 * Keys must match `wordFr` in `bank.json` exactly (Unicode apostrophe for s’engager).
 */
export const MOT_DU_JOUR_IMAGES: Record<string, string> = {
  // A1
  bonjour: crop('photo-1495474472287-4d71bcdd2085'),
  merci: crop('photo-1529333166437-7750a6dd5a70'),
  famille: crop('photo-1511895426328-dc753fba491b'),
  demain: crop('photo-1512485694743-9c9538b4e6e0'),
  manger: crop('photo-1546069901-ba9599a7e63c'),
  école: crop('photo-1503676260728-1c00da094a0b'),
  pluie: crop('photo-1515694346930-24475d5e85b0'),
  heureux: crop('photo-1529156069898-49953e39b3ac'),

  // A2
  voyage: crop('photo-1469854523086-cc02fe5d8800'),
  voisin: crop('photo-1560518883-ce09059eeffa'),
  cadeau: crop('photo-1549465220-1a8b9238cd48'),
  retard: crop('photo-1509048191080-d3034aacfdd3'),
  travailler: crop('photo-1497215728101-856f4ea42174'),
  acheter: crop('photo-1472851294608-062f824d29cc'),
  souvent: crop('photo-1435527173128-983b87201f4d'),
  prochain: crop('photo-1543163521-1bf5398e2e16'),

  // B1
  éphémère: crop('photo-1522383225653-ed111181a951'),
  pourtant: crop('photo-1589829549352-296191d4c5a0'),
  patrimoine: crop('photo-1555993539-0a7b0c52f34d'),
  embouteillage: crop('photo-1449965408861-eb67e835f1ed'),
  fuseau: crop('photo-1451187580459-43490279c0fa'),
  néanmoins: crop('photo-1507003211169-0a1dd7228f2d'),
  's\u2019engager': crop('photo-1521791136064-7986c2920216'),
  "s'engager": crop('photo-1521791136064-7986c2920216'),
  environ: crop('photo-1441974231531-c6227db76b6e'),

  // B2
  nuancer: crop('photo-1541961017774-22349e4a1262'),
  véhémence: crop('photo-1501594907352-04cda38ebc29'),
  recourir: crop('photo-1589829085413-e56b44be7b24'),
  ubiquité: crop('photo-1516321318423-f06f85e504b3'),
  altruisme: crop('photo-1593113598332-cd288d649433'),
  pragmatique: crop('photo-1454165804606-c3d57bc86b40'),
  déni: crop('photo-1519452635260-9f8d195110da'),
  consensus: crop('photo-1557804506-669a67965ba0'),

  // C1
  rescision: crop('photo-1450101499163-c8848c66ca85'),
  présomption: crop('photo-1589829549352-296191d4c5a0'),
  dilatoire: crop('photo-1501139083535-9657f38155d6'),
  filiation: crop('photo-1448375244086-88243db67624'),
  subsumer: crop('photo-1555949963-ff9fe0c2b4a6'),
  épistémique: crop('photo-1481627834876-b7833e8f5570'),
  déconstruction: crop('photo-1487958449943-242a9de362b7'),
  'ad hoc': crop('photo-1504328345606-18bbc8c9d7d1'),
}

export function resolveMotDuJourImage(wordFr: string, explicitUrl?: string): string {
  if (explicitUrl?.trim()) return explicitUrl.trim()
  const keys = [
    wordFr,
    wordFr.normalize('NFC'),
    wordFr.replace(/\u2019/g, "'"),
    wordFr.replace(/'/g, '\u2019'),
  ]
  for (const k of keys) {
    const url = MOT_DU_JOUR_IMAGES[k]
    if (url) return url
  }
  return MOT_DU_JOUR_DEFAULT_IMAGE
}
