import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import land from './land-110m.json'

/*
 * From the Codex drop (_assets/TaizoWiggins, 13 Oct 2026; Codex could not
 * install packages in its sandbox, so Claude ran npm install and
 * scripts/build-globe-land.mjs there). Changed when wired (docs/ASSETS.md):
 * - no hard-coded square #02101f background (dark corners on the lavender
 *   page): `--globe-space`, transparent by default;
 * - marker labels 2.3× larger (were ~8px on a 400px globe) and in the
 *   site font.
 */

export type GlobeFocus = 'world' | 'ro' | 'ja'
export type GlobeProps = {
  focus?: GlobeFocus
  idle?: boolean
  labels?: { ro?: string; ja?: string }
  ariaLabel?: string
  className?: string
}

type Centre = [longitude: number, latitude: number]
const centres: Record<GlobeFocus, Centre> = { world: [80, 25], ro: [25, 46], ja: [138, 36] }
const graticule = geoGraticule10()
const wrap = (angle: number) => ((angle + 180) % 360 + 360) % 360 - 180
const duration = 800

/** Browser access and animation begin only after the initial SVG has mounted. */
export function Globe({ focus = 'world', idle = false, labels, ariaLabel, className }: GlobeProps) {
  const [centre, setCentre] = useState<Centre>(() => [...centres[focus]])
  const currentCentre = useRef(centre)
  const svg = useRef<SVGSVGElement>(null)
  const haloId = `globe-halo-${useId().replace(/:/g, '')}`

  useEffect(() => {
    const element = svg.current
    if (!element) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = media.matches
    let visible = typeof IntersectionObserver === 'undefined'
    let frame: number | null = null
    let previousTime: number | null = null
    let elapsed = 0
    const from: Centre = [...currentCentre.current]
    const target: Centre = [from[0] + wrap(centres[focus][0] - from[0]), centres[focus][1]]
    let moving = Math.abs(target[0] - from[0]) + Math.abs(target[1] - from[1]) > 0.00001
    const spinning = focus === 'world' && idle

    function draw(next: Centre) {
      currentCentre.current = next
      setCentre(next)
    }

    function stop() {
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      previousTime = null
    }

    function tick(time: number) {
      frame = null
      const delta = previousTime === null ? 0 : time - previousTime
      previousTime = time
      if (moving) {
        elapsed = Math.min(duration, elapsed + delta)
        const t = elapsed / duration
        const eased = t * t * (3 - 2 * t)
        draw([wrap(from[0] + (target[0] - from[0]) * eased), from[1] + (target[1] - from[1]) * eased])
        moving = elapsed < duration
      } else if (spinning) {
        draw([wrap(currentCentre.current[0] + delta * 0.005), currentCentre.current[1]])
      }
      if (moving || spinning) frame = window.requestAnimationFrame(tick)
      else previousTime = null
    }

    function reconcile() {
      stop()
      if (reduced) {
        moving = false
        const next: Centre = [...centres[focus]]
        if (currentCentre.current[0] !== next[0] || currentCentre.current[1] !== next[1]) draw(next)
      } else if (visible && !document.hidden && (moving || spinning)) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    function motionChanged() {
      reduced = media.matches
      reconcile()
    }

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting)
      reconcile()
    })
    observer?.observe(element)
    media.addEventListener('change', motionChanged)
    document.addEventListener('visibilitychange', reconcile)
    reconcile()
    return () => {
      stop()
      observer?.disconnect()
      media.removeEventListener('change', motionChanged)
      document.removeEventListener('visibilitychange', reconcile)
    }
  }, [focus, idle])

  const geometry = useMemo(() => {
    const projection = geoOrthographic().translate([500, 500]).scale(488)
      .rotate([-centre[0], -centre[1]]).precision(0.5)
    const path = geoPath(projection).digits(2)
    return {
      land: path(land as GeoPermissibleObjects) ?? '',
      grid: path(graticule) ?? '',
      markers: (['ro', 'ja'] as const).map((country) => {
        const position = projection(centres[country]) ?? [500, 500]
        return { country, x: position[0], y: position[1], visible: geoDistance(centre, centres[country]) < Math.PI / 2 }
      }),
    }
  }, [centre])

  return (
    <svg ref={svg} className={className} viewBox="0 0 1000 1000"
      style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '1', background: 'var(--globe-space, transparent)' }}
      role={ariaLabel !== undefined ? 'img' : undefined}
      aria-label={ariaLabel} aria-hidden={ariaLabel === undefined ? true : undefined} focusable="false">
      <defs>
        <radialGradient id={haloId}>
          <stop stopColor="var(--globe-marker, #e0e7ff)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--globe-marker, #e0e7ff)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="500" cy="500" r="488" fill="var(--globe-ocean, #03254c)" />
      <path data-globe-land="" d={geometry.land} fill="var(--globe-land, #1f4068)" />
      <path d={geometry.grid} fill="none" stroke="var(--globe-grid, rgb(224 231 255 / 0.12))" strokeWidth="0.8" />
      <circle cx="500" cy="500" r="488" fill="none" stroke="var(--globe-rim, rgb(224 231 255 / 0.35))" strokeWidth="1.2" />
      {geometry.markers.map(({ country, x, y, visible }) => (
        <g key={country} data-globe-marker={country}
          transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`} visibility={visible ? 'visible' : 'hidden'}>
          <circle r={focus === country ? 30 : 23} fill={`url(#${haloId})`} />
          <circle r={focus === country ? 6 : 4} fill="var(--globe-marker, #e0e7ff)" />
          {labels?.[country] && <text x={x > 500 ? -30 : 30} y="-24" textAnchor={x > 500 ? 'end' : 'start'}
            fill="var(--globe-label, #e0e7ff)" fontFamily="inherit" fontWeight="600" fontSize="46">{labels[country]}</text>}
        </g>
      ))}
    </svg>
  )
}
