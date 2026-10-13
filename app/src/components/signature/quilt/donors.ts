import type { Donor } from './types'

export type PatternName = 'diagonal' | 'dots' | 'crosshatch' | 'chevron' | 'waves' | 'grid' | 'bricks' | 'rings' | 'steps' | 'plus'

export type DonorStyle = { color: string; pattern: PatternName }

export const DONOR_ORDER: Donor[] = [
  'Latin', 'Slavic', 'Greek', 'Turkish', 'Hungarian', 'French',
  'Chinese', 'Portuguese', 'Dutch', 'English',
]

export const DONOR_STYLES: Record<Donor, DonorStyle> = {
  Latin: { color: 'var(--ql-donor-latin, #2F5D9E)', pattern: 'diagonal' },
  Slavic: { color: 'var(--ql-donor-slavic, #876D9A)', pattern: 'dots' },
  Greek: { color: 'var(--ql-donor-greek, #087E8B)', pattern: 'crosshatch' },
  Turkish: { color: 'var(--ql-donor-turkish, #B9573D)', pattern: 'chevron' },
  Hungarian: { color: 'var(--ql-donor-hungarian, #6B7D3C)', pattern: 'waves' },
  French: { color: 'var(--ql-donor-french, #8E4C72)', pattern: 'grid' },
  Chinese: { color: 'var(--ql-donor-chinese, #A45A1C)', pattern: 'bricks' },
  Portuguese: { color: 'var(--ql-donor-portuguese, #367A68)', pattern: 'rings' },
  Dutch: { color: 'var(--ql-donor-dutch, #536DA4)', pattern: 'steps' },
  English: { color: 'var(--ql-donor-english, #6F6672)', pattern: 'plus' },
}

const fallbackStyles: DonorStyle[] = [
  { color: '#486B8F', pattern: 'diagonal' },
  { color: '#7B5D76', pattern: 'dots' },
  { color: '#43786C', pattern: 'crosshatch' },
]

export function donorStyle(donor: string): DonorStyle {
  if (donor in DONOR_STYLES) return DONOR_STYLES[donor as Donor]
  let hash = 0
  for (const character of donor) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0
  return fallbackStyles[Math.abs(hash) % fallbackStyles.length]
}

export function donorSort(a: string, b: string) {
  const ai = DONOR_ORDER.indexOf(a as Donor)
  const bi = DONOR_ORDER.indexOf(b as Donor)
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  return a.localeCompare(b)
}
