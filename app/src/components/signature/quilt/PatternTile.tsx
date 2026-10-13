import { useId } from 'react'
import { donorStyle, type PatternName } from './donors'

type PatternTileProps = {
  donor: string
  title?: string
  className?: string
}

function Pattern({ id, name }: { id: string; name: PatternName }) {
  const common = { stroke: 'rgba(255,255,255,.68)', strokeWidth: 1.35, fill: 'none' }
  if (name === 'dots') return <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.35" fill="rgba(255,255,255,.72)" /></pattern>
  if (name === 'crosshatch') return <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 9L9 0M7 11L11 7M7-2L11 2M0 0L9 9M-2 7L2 11" {...common} /></pattern>
  if (name === 'chevron') return <pattern id={id} width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0 1l6 5 6-5" {...common} /></pattern>
  if (name === 'waves') return <pattern id={id} width="14" height="8" patternUnits="userSpaceOnUse"><path d="M-4 4Q0 0 4 4t8 0 8 0" {...common} /></pattern>
  if (name === 'grid') return <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 .7h9M.7 0v9" {...common} /></pattern>
  if (name === 'bricks') return <pattern id={id} width="14" height="10" patternUnits="userSpaceOnUse"><path d="M0 .7h14M0 5.7h14M3.5 0v5M10.5 5v5" {...common} /></pattern>
  if (name === 'rings') return <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3.2" {...common} /></pattern>
  if (name === 'steps') return <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 9h3V6h3V3h3V0M6 12V9h3V6h3" {...common} /></pattern>
  if (name === 'plus') return <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M5 2v6M2 5h6" {...common} /></pattern>
  return <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" {...common} strokeWidth="2" /></pattern>
}

export function PatternTile({ donor, title, className }: PatternTileProps) {
  const rawId = useId().replace(/:/g, '')
  const patternId = `ql-pattern-${rawId}`
  const style = donorStyle(donor)
  return (
    <svg viewBox="0 0 100 100" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} className={className}>
      {title && <title>{title}</title>}
      <defs><Pattern id={patternId} name={style.pattern} /></defs>
      <rect width="100" height="100" rx="8" fill={style.color} />
      <rect width="100" height="100" rx="8" fill={`url(#${patternId})`} />
      <path d="M3 9Q25 5 49 9T97 9M3 91Q28 95 52 91T97 91" stroke="rgba(20,33,61,.22)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
    </svg>
  )
}
