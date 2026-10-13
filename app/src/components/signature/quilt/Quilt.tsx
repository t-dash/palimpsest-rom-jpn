import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { donorSort } from './donors'
import { matchesFilters } from './matchesFilters'
import { PatternTile } from './PatternTile'
import type { QuiltProps, QuiltWord } from './types'

/*
 * From the Codex drop (_assets/TaizoWiggins, 7 Oct 2026). Changed when wired
 * (_internal/03, see docs/ASSETS.md):
 * - patches are links to /words/$slug (work without JavaScript; Enter follows
 *   them natively); onSelect is still called on click if given;
 * - role="grid"/"gridcell" and aria-selected removed (a grid needs rows, and
 *   aria-selected isn't allowed on a link); panels are plain lists, arrow keys
 *   still move between patches;
 * - no visible word text on patches (8–11px white text failed contrast on
 *   the lighter donor colours); the word is in each patch's accessible name
 *   and in the tooltip;
 * - columns auto-fill (≥ 44px) instead of a fixed 6, which overflowed at
 *   320px and in the compact Home quilt; Up/Down find the patch above/below
 *   by position;
 * - legend and plain list moved out (pages render their own);
 * - every visible string comes in through `labels`;
 * - `highlight` (ids that match the explorer's filters) dims the rest,
 *   alongside the original `filters` prop.
 */

function stablePanel(words: QuiltWord[], language: 'ro' | 'ja', max: number) {
  return words
    .filter((word) => word.language === language)
    .sort((a, b) => donorSort(a.donor, b.donor) || a.id.localeCompare(b.id))
    .slice(0, max)
}

type PanelProps = {
  label: string
  count: string
  language: 'ro' | 'ja'
  words: QuiltWord[]
  isMatch: (word: QuiltWord) => boolean
  activeId: string | null
  setActiveId: (id: string | null) => void
  onSelect?: (word: QuiltWord) => void
  fromLabel: string
}

const Panel = memo(function Panel({ label, count, language, words, isMatch, activeId, setActiveId, onSelect, fromLabel }: PanelProps) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setActiveId(null)
      event.currentTarget.blur()
      return
    }
    let next = -1
    if (event.key === 'ArrowLeft') next = index - 1
    else if (event.key === 'ArrowRight') next = index + 1
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') next = verticalNeighbour(index, event.key === 'ArrowDown' ? 1 : -1)
    else return
    event.preventDefault()
    refs.current[Math.max(0, Math.min(words.length - 1, next))]?.focus()
  }

  /** The patch in the next/previous row closest to this one's column. */
  function verticalNeighbour(index: number, dir: 1 | -1) {
    const here = refs.current[index]?.getBoundingClientRect()
    if (!here) return index
    const half = here.height / 2 // the focused patch is lifted a few px
    const below = refs.current
      .map((el, i) => ({ i, box: el?.getBoundingClientRect() }))
      .filter((c) => c.box && c.i !== index && (c.box.top - here.top) * dir > half)
    if (!below.length) return index
    const rowGap = Math.min(...below.map((c) => (c.box!.top - here.top) * dir))
    const row = below.filter((c) => (c.box!.top - here.top) * dir - rowGap < half)
    row.sort((x, y) => Math.abs(x.box!.left - here.left) - Math.abs(y.box!.left - here.left))
    return row[0].i
  }

  return (
    <section className="ql-panel" aria-label={label}>
      <header className="ql-panel__header">
        <span>{label}</span>
        <span>{count}</span>
      </header>
      <ul className="ql-grid">
        {words.map((word, index) => {
          const active = activeId === word.id
          const matched = isMatch(word)
          const groupStart = index === 0 || words[index - 1].donor !== word.donor
          return (
            <li className={`ql-cell${groupStart ? ' ql-cell--group-start' : ''}`} key={word.id}>
              <Link
                to="/words/$slug"
                params={{ slug: word.slug }}
                ref={(element) => {
                  refs.current[index] = element
                }}
                aria-label={`${word.word}${word.reading ? `, ${word.reading}` : ''}: ${word.meaning}. ${fromLabel} ${word.donor}, ${word.period}.`}
                className={`ql-patch${matched ? '' : ' ql-patch--muted'}${active ? ' ql-patch--active' : ''}`}
                onFocus={() => setActiveId(word.id)}
                onBlur={(event) => {
                  if (!event.currentTarget.matches(':hover')) setActiveId(null)
                }}
                onPointerEnter={() => setActiveId(word.id)}
                onPointerLeave={(event) => {
                  if (document.activeElement !== event.currentTarget) setActiveId(null)
                }}
                onClick={() => onSelect?.(word)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <PatternTile donor={word.donor} />
              </Link>
              {active && <Tooltip word={word} />}
            </li>
          )
        })}
      </ul>
    </section>
  )
})

/** Visual only: the same facts are in the patch's accessible name. */
function Tooltip({ word }: { word: QuiltWord }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Keep the tooltip inside the viewport: patches at the panel edges used to
  // push it 30+px off-screen (bug hunt 10 Oct). Client-only (the tooltip
  // only renders on hover/focus), so no hydration concern. On phones it is a
  // fixed bottom sheet and needs no shift.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || getComputedStyle(el).position === 'fixed') return
    el.style.setProperty('--ql-shift', '0px')
    const box = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const pad = 8
    const shift = box.left < pad ? pad - box.left : box.right > vw - pad ? vw - pad - box.right : 0
    el.style.setProperty('--ql-shift', `${Math.round(shift)}px`)
  }, [word.id])
  return (
    <span ref={ref} className="ql-tooltip" aria-hidden="true">
      <strong lang={word.language}>{word.word}</strong>
      {word.reading && <span>{word.reading}</span>}
      <span>{word.meaning}</span>
      <small>
        {word.donor} · {word.period} · {word.contactType}
      </small>
    </span>
  )
}

export const Quilt = memo(function Quilt({
  words,
  filters,
  highlight,
  onSelect,
  maxPerPanel = Number.POSITIVE_INFINITY,
  labels,
  className = '',
}: QuiltProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const panels = useMemo(
    () => ({
      ro: stablePanel(words, 'ro', maxPerPanel),
      ja: stablePanel(words, 'ja', maxPerPanel),
    }),
    [words, maxPerPanel],
  )
  // Totals before the maxPerPanel cap, so a capped panel never under-reports.
  const totals = {
    ro: words.filter((w) => w.language === 'ro').length,
    ja: words.filter((w) => w.language === 'ja').length,
  }
  const isMatch = (word: QuiltWord) => (highlight ? highlight.has(word.id) : true) && matchesFilters(word, filters)

  // A patch focused before hydration fired its focus event with no handler
  // attached, so its tooltip never showed (bug hunt 10 Oct). Once mounted,
  // pick up whichever patch already has focus.
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLAnchorElement) || !rootRef.current?.contains(el)) return
    const slug = el.getAttribute('href')?.split('/').pop()
    const hit = [...panels.ro, ...panels.ja].find((w) => w.slug === slug)
    if (hit) setActiveId(hit.id)
    // Mount only: later focus changes go through the patches' own handlers.
  }, [])

  return (
    <div ref={rootRef} className={`ql-quilt ${className}`}>
      <div className="ql-quilt__panels">
        <Panel
          label={labels.ro}
          count={labels.count(panels.ro.length, totals.ro)}
          language="ro"
          words={panels.ro}
          isMatch={isMatch}
          activeId={activeId}
          setActiveId={setActiveId}
          onSelect={onSelect}
          fromLabel={labels.from}
        />
        <div className="ql-quilt__seam" aria-hidden="true">
          <span />
        </div>
        <Panel
          label={labels.ja}
          count={labels.count(panels.ja.length, totals.ja)}
          language="ja"
          words={panels.ja}
          isMatch={isMatch}
          activeId={activeId}
          setActiveId={setActiveId}
          onSelect={onSelect}
          fromLabel={labels.from}
        />
      </div>
    </div>
  )
})
