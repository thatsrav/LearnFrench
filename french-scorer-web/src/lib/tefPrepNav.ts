/** Default TEF track entry (matches hub quick links). */
export const TEF_PREP_HUB = '/tef-prep'

const DEFAULT_UNIT = '/tef-prep/a1/1'

export type TefPrepSkill = 'reading' | 'writing' | 'listening' | 'speaking'

export function tefPrepSkillPath(skill: TefPrepSkill): string {
  return `${DEFAULT_UNIT}/${skill}`
}
