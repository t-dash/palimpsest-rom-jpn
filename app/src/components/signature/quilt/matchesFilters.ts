import type { QuiltFilters, QuiltWord } from './types'

function includes(value: string, filter?: string | string[]) {
  if (!filter || (Array.isArray(filter) && filter.length === 0)) return true
  return Array.isArray(filter) ? filter.includes(value) : value === filter
}

export function matchesFilters(word: QuiltWord, filters?: QuiltFilters) {
  if (!filters) return true
  return includes(word.language, filters.language)
    && includes(word.donor, filters.donor)
    && includes(word.period, filters.period)
    && includes(word.contactType, filters.contactType)
}
