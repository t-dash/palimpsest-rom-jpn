export type QuiltLanguage = 'ro' | 'ja'

export type Donor =
  | 'Latin' | 'Slavic' | 'Greek' | 'Turkish' | 'Hungarian' | 'French'
  | 'Chinese' | 'Portuguese' | 'Dutch' | 'English'

export type QuiltWord = {
  id: string
  slug: string
  word: string
  reading?: string
  language: QuiltLanguage
  meaning: string
  donor: Donor | string
  period: string
  contactType: string
}

export type QuiltFilters = {
  language?: QuiltLanguage | QuiltLanguage[]
  donor?: string | string[]
  period?: string | string[]
  contactType?: string | string[]
}

export type QuiltLabels = {
  /** Panel headings, e.g. "Romania", "Japan" (site copy: en.panels). */
  ro: string
  ja: string
  /** Count under each heading. `shown` is lower than `total` when
   *  maxPerPanel caps the panel, e.g. (40, 100) => "40 of 100 words". */
  count: (shown: number, total: number) => string
  /** Word before the donor in each patch's accessible name, e.g. "Came from". */
  from: string
}

export type QuiltProps = {
  words: QuiltWord[]
  filters?: QuiltFilters
  /** Ids that match the explorer's filters; the rest are dimmed in place. */
  highlight?: Set<string>
  onSelect?: (word: QuiltWord) => void
  maxPerPanel?: number
  labels: QuiltLabels
  className?: string
}

export type QuiltLegendProps = {
  words: QuiltWord[]
  /** Accessible name of the legend group. */
  label: string
  selectedDonors?: string[]
  onToggleDonor?: (donor: string) => void
  /** Render items as links to /explore with these search params (wins over onToggleDonor). */
  linkFor?: (donor: string, selected: boolean) => Record<string, unknown>
  className?: string
}
