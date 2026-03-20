export type TefSkill = 'reading' | 'writing' | 'listening' | 'speaking'

export const TEF_A1_UNIT_COUNT = 10

const base = () => import.meta.env.BASE_URL.replace(/\/$/, '')

export function tefA1JsonUrl(unit: number, skill: TefSkill): string {
  return `${base()}/TEF_Prep/A1/Unit_${unit}/${skill}.json`
}

export async function fetchTefA1Skill(unit: number, skill: TefSkill): Promise<unknown> {
  const res = await fetch(tefA1JsonUrl(unit, skill))
  if (!res.ok) throw new Error(`TEF JSON introuvable (${unit}/${skill})`)
  return res.json()
}
