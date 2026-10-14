# Signature assets — Quilted Languages

## The quilt (`src/components/signature/`)
Built in a separate Codex run (7 Oct 2026, `~/Crimson/_assets/TaizoWiggins/`),
audited and wired here. Codex's own notes: `quilt/README.md` (its props table
predates the changes below).

| Component | Where it's used | Props |
|---|---|---|
| `Quilt` | Home (compact, ≤ 40 per side) and /explore (all), through `src/components/QuiltSlot.tsx` | `words` (QuiltWord[]), `labels` ({ ro, ja, count, from }), `highlight?` (Set of matching ids), `filters?`, `maxPerPanel?`, `onSelect?`, `className?` |
| `QuiltLegend` | /explore donor filter (`DonorFilter` in QuiltSlot.tsx) | `words`, `label`, `selectedDonors?`, `linkFor?` (links to /explore), `onToggleDonor?` (buttons), `className?` |
| `PatternTile` | every patch and swatch; the big patch on word pages | `donor`, `title?`, `className?` |
| `PatchSwatch` (kit) | word rows, word pages, Home legend (via `Swatch` in Words.tsx) | `donor`, `size?` (sm / md / lg) |
| `SeamDivider` (kit) | Home, between the hero and "How to read the quilt" | `variant?` (running / cross), `label?` |
| icons (kit) | not used yet (Needle, Thread, Globe, Scroll, Search, Filter; Lucide-compatible 1.75 stroke) | SVG props |

`QuiltSlot` maps the site's `Word` to the quilt's shape (`toQuiltWord`) and
shows the empty stitched frame + "Coming soon" line while there are no
sourced words.

### Changed when wiring (all marked in the files)
- Patches are **links** to `/words/$slug` (were buttons with a callback), so
  the quilt works without JavaScript; Enter follows the link.
- Removed `role="grid"`/`gridcell` (no rows, invalid ARIA) and
  `aria-selected`; arrow keys still move between patches. Columns auto-fill
  at ≥ 44px (a fixed 6 overflowed at 320px and in the compact Home quilt);
  Up/Down find the patch above/below by position.
- No visible word text on patches (8–11px white text failed contrast on the
  lighter donor colours). Each patch's accessible name carries word, reading,
  meaning, donor and period; the tooltip shows them visually.
- Removed the wrong `lang="ro"` on the English panel label; all strings come
  from `src/content/en.ts` through `labels`.
- Legend and plain word list taken out of `<Quilt>` (pages have their own);
  `StaticWordList` deleted. Legend can render links (`linkFor`) with
  `aria-current`, so the donor filter works without JavaScript.
- Styles: `.ql-*` rules in `src/styles.css`, restyled to the site (dashed
  thread border, 6px radius, no shadows, site fonts). One mapping block sets
  `--ql-*` from the site tokens; Codex's colours remain only as fallbacks in
  `quilt/donors.ts`.
- Bug hunt fixes (10 Oct 2026): the tooltip keeps itself inside the
  viewport (`--ql-shift`); a patch focused before hydration still gets its
  tooltip; panel counts show "40 of 100 words" when `maxPerPanel` caps them
  (`labels.count(shown, total)`).
- Not copied: the playground, /dev pages, `sample-data.ts`, docs/shots,
  Codex's package.json, its Inter / Noto Sans JP font packages, `og.png`
  (the site keeps its own 85 KB one) and `quilt-static.webp`.

### Patterns per donor (from Codex `donors.ts`)
Latin diagonal · Slavic dots · Greek crosshatch · Turkish chevron ·
Hungarian waves · French grid · Chinese bricks · Portuguese rings ·
Dutch steps · English plus. Unknown donors get a stable fallback colour and
pattern. To add a donor: add it to `DONOR_ORDER` and `DONOR_STYLES` in
`quilt/donors.ts`, and a `--donor-<name>` colour in `src/styles.css` measured
≥ 3:1 on paper.

### Taizo's donor names (14 Oct 2026)
`NAMED_DONOR_STYLES` in `quilt/donors.ts` gives each donor name used in
`src/data/words.ts` its own colour and pattern, in era order (the quilt and
both legends follow it): Latin diagonal · South Slavic dots · Old Church
Slavonic grid (`--donor-church-slavonic` #8e3b78, 5.59:1) · Ottoman Turkish
chevron · Hungarian waves · Old Japanese crosshatch (`--donor-japanese`
#2b7bb9, 3.68:1) · Middle Chinese bricks · Portuguese rings · Dutch steps.
Before this, five of these names fell through to the three hashed fallback
styles, so Old Japanese, Middle Chinese and Old Church Slavonic looked
identical. A new donor name in words.ts needs an entry here too.

### Updating with a Lovable prompt
```
In src/components/signature/quilt/donors.ts, add the donor language
"[name]" to DONOR_ORDER and DONOR_STYLES with the colour
var(--ql-donor-[name], [hex]) and an unused pattern name. In
src/styles.css add --donor-[name]: [hex]; and --ql-donor-[name]:
var(--donor-[name]); next to the others. Change nothing else.
```

## The globe (`src/components/signature/globe/`)
Built by Codex on 13 Oct 2026 (`~/Crimson/_assets/TaizoWiggins`, work order
`_internal/codex-globe-spec.md`, run with the claudex runner). Codex's
sandbox could not install npm packages, so Claude ran `npm install` and
`npm run globe:land` there (land data: Natural Earth 110m, public domain,
59 KB) and inspected the code before copying it.

| Component | Where | Props |
|---|---|---|
| `Globe` | Home hero (idle spin) and the era timeline (turned to Romania or Japan), through `src/components/GlobeSlot.tsx` | `focus` ('world' / 'ro' / 'ja'), `idle`, `labels`, `ariaLabel`, `className` |

- Orthographic projection (d3-geo 3.1.1, the one runtime dependency).
  Server-rendered at the right rotation; animation only after mount; paused
  off-screen, in hidden tabs and under reduced motion.
- Changed when wired: transparent background (`--globe-space`) instead of a
  hard-coded square; marker labels 2.3× larger and in the site font.
- Measured 13 Oct (production preview): home chunk with globe + land
  37 KB gz; 60+ fps while spinning; no long tasks; CLS 0.
- Colours: `--globe-ocean`, `--globe-land`, `--globe-grid`, `--globe-rim`,
  `--globe-marker`, `--globe-label` (defaults = Taizo's palette).

## Share image and icons
`public/og.png` (1200×630, 85 KB) and the icon set come from
`scripts/make-brand.mjs` + `scripts/make-ico.py` (`npm run brand`).
