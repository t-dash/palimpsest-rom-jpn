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

/*
 * Taizo's donor languages (src/data/words.ts), by the names the site uses.
 * Each has its own colour AND pattern. Until 14 Oct 2026 five of them fell
 * through to the three hashed fallbacks below, so Old Japanese, Middle
 * Chinese and Old Church Slavonic looked identical in the quilt and legend.
 * Listed oldest to newest within each country: the quilt and the legend use
 * this order. A donor added later without an entry here still gets a
 * fallback style; add it here to give it its own.
 */
export const NAMED_DONOR_STYLES: Record<string, DonorStyle> = {
  Latin: DONOR_STYLES.Latin,
  'South Slavic': DONOR_STYLES.Slavic,
  'Old Church Slavonic': { color: 'var(--ql-donor-church-slavonic, #8E3B78)', pattern: 'grid' },
  'Ottoman Turkish': DONOR_STYLES.Turkish,
  Hungarian: DONOR_STYLES.Hungarian,
  'Old Japanese': { color: 'var(--ql-donor-japanese, #2B7BB9)', pattern: 'crosshatch' },
  'Middle Chinese': DONOR_STYLES.Chinese,
  Portuguese: DONOR_STYLES.Portuguese,
  Dutch: DONOR_STYLES.Dutch,
}
const NAMED_ORDER = Object.keys(NAMED_DONOR_STYLES)

const fallbackStyles: DonorStyle[] = [
  { color: '#486B8F', pattern: 'diagonal' },
  { color: '#7B5D76', pattern: 'dots' },
  { color: '#43786C', pattern: 'crosshatch' },
]

export function donorStyle(donor: string): DonorStyle {
  if (donor in NAMED_DONOR_STYLES) return NAMED_DONOR_STYLES[donor]
  if (donor in DONOR_STYLES) return DONOR_STYLES[donor as Donor]
  let hash = 0
  for (const character of donor) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0
  return fallbackStyles[Math.abs(hash) % fallbackStyles.length]
}

export function donorSort(a: string, b: string) {
  const ni = NAMED_ORDER.indexOf(a)
  const nj = NAMED_ORDER.indexOf(b)
  if (ni !== -1 || nj !== -1) return (ni === -1 ? 999 : ni) - (nj === -1 ? 999 : nj)
  const ai = DONOR_ORDER.indexOf(a as Donor)
  const bi = DONOR_ORDER.indexOf(b as Donor)
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  return a.localeCompare(b)
}
