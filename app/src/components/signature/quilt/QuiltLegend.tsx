import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { PatternTile } from './PatternTile'
import { donorSort } from './donors'
import type { QuiltLegendProps } from './types'

/*
 * From the Codex drop. Changed when wired: `label` prop (accessible name,
 * role="group"); `linkFor` renders each item as a router link (a filter that
 * also works without JavaScript), with aria-current on the selected donor.
 * The original aria-pressed buttons (onToggleDonor) still work.
 */
export const QuiltLegend = memo(function QuiltLegend({
  words,
  label,
  selectedDonors = [],
  onToggleDonor,
  linkFor,
  className = '',
}: QuiltLegendProps) {
  const counts = useMemo(() => {
    const next = new Map<string, number>()
    for (const word of words) next.set(word.donor, (next.get(word.donor) ?? 0) + 1)
    return [...next.entries()].sort(([a], [b]) => donorSort(a, b))
  }, [words])

  return (
    <div className={`ql-legend ${className}`} role="group" aria-label={label}>
      {counts.map(([donor, count]) => {
        const pressed = selectedDonors.includes(donor)
        const body = (
          <>
            <PatternTile donor={donor} />
            <span>{donor}</span>
            <span className="ql-legend__count">{count}</span>
          </>
        )
        if (linkFor) {
          return (
            <Link
              key={donor}
              to="/explore"
              // The explorer validates these params (parseSearch), so the cast is safe.
              search={linkFor(donor, pressed) as never}
              replace
              resetScroll={false}
              activeOptions={{ includeSearch: true, explicitUndefined: true }}
              className="ql-legend__item ql-legend__item--link"
              // Our state, not the router's: its "active" check treats a link
              // with fewer search params as active and sets aria-current="page".
              activeProps={{ 'aria-current': pressed ? 'true' : undefined }}
              inactiveProps={{ 'aria-current': pressed ? 'true' : undefined }}
            >
              {body}
            </Link>
          )
        }
        return onToggleDonor ? (
          <button key={donor} type="button" className="ql-legend__item" aria-pressed={pressed} onClick={() => onToggleDonor(donor)}>
            {body}
          </button>
        ) : (
          <span key={donor} className="ql-legend__item ql-legend__item--static">
            {body}
          </span>
        )
      })}
    </div>
  )
})
