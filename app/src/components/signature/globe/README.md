# Globe

Portable orthographic SVG for Quilted Languages. The component, its exports, and
generated land data belong in this folder; no playground CSS is required by the
component. **This checkout is currently incomplete:** dependency installation was
denied, so `land-110m.json` has not been generated and the component cannot build
yet. Do not copy this incomplete folder into the site.

## API

```tsx
import { Globe, type GlobeFocus, type GlobeProps } from './signature/globe'

<Globe focus="world" idle />
<Globe focus="ro" labels={{ ro: 'Romania', ja: 'Japan' }} />
<Globe focus="ja" ariaLabel="Japan" className="era-globe" />
```

- `focus?: 'world' | 'ro' | 'ja'`: default `world`. Geographic centres are
  longitude/latitude 80/25, 25/46, and 138/36 respectively.
- `idle?: boolean`: default `false`; rotates at 5°/s only with world focus.
- `labels?: { ro?: string; ja?: string }`: optional caller-owned marker text.
  Omitted labels draw no text. Markers on the back hemisphere are hidden.
- `ariaLabel?: string`: when supplied, one `role="img"` with that label;
  otherwise decorative `aria-hidden="true"`. No SVG child is focusable.
- `className?: string`: applied to the root SVG.

The SVG is 100% of its parent's width with aspect ratio 1 and no fixed pixel
dimensions. Its 1000-unit viewBox is a projection coordinate system. Give the
parent a width; avoid constraining its height to a different aspect ratio.

Focus transitions last 800 ms, use smoothstep easing and the shortest longitude
delta. Retargeting starts from the current rotation. Idle pauses during a focus
transition. IntersectionObserver and page visibility suspend the animation
clock; hidden time is not added when resuming. Reduced motion disables idle and
sets the requested focus immediately. No animation frame is scheduled at rest.
Browsers without IntersectionObserver use page visibility and reduced motion
but cannot detect off-screen suspension.

Browser globals are accessed only in the component effect. Initial state comes
only from `focus`, so server and first client renders produce the same SVG.
JavaScript-disabled users retain the SVG when the host server renders it. The
Vite playground itself is a client-only application and does not provide a
JavaScript-disabled page; that check must use server-rendered markup.

## Palette

Override inherited CSS variables on the parent or `className`:

| Variable | Default |
| --- | --- |
| `--globe-ocean` | `#03254c` |
| `--globe-land` | `#1f4068` |
| `--globe-grid` | `rgb(224 231 255 / 0.12)` |
| `--globe-rim` | `rgb(224 231 255 / 0.35)` |
| `--globe-marker` | `#e0e7ff` |
| `--globe-label` | `#e0e7ff` |

The SVG's background is `#02101f`. Palette overrides should retain at least
1.4:1 land/ocean and 3:1 marker/ocean contrast.

## Data and dependencies

Runtime: `d3-geo@3.1.1`; React is provided by the host. D3's normal transitive
dependencies are included in bundle measurements. Dev only:
`world-atlas@2.0.2`, `topojson-client@3.1.0`, `@types/d3-geo@3.1.0`.
All added direct versions are exact in package.json. No TopoJSON conversion
runs in the browser.

From this checkout, after dependency access is restored:

```sh
npm install
npm run globe:land
npm run build && npm run lint
npm run globe:proof
npm run globe:shots
npm run globe:size
```

`npm install` must update package-lock.json; the denied installation did not
update it. The lockfile currently does not describe the new dependencies.

`npm run globe:land` runs `node scripts/build-globe-land.mjs`. It converts
world-atlas's merged Natural Earth 110m land geometry to a compact MultiPolygon,
strips metadata, simplifies closed rings with Douglas–Peucker, and rounds
coordinates to three decimal places. It selects the first tolerance in
0.05–0.3° that fits 60,000 bytes, logs the selected tolerance, and fails if the
budget cannot be met. Small rings that would collapse are retained. No countries,
borders, names, flags, or emblems are generated.

[Natural Earth data is public domain](https://www.naturalearthdata.com/about/terms-of-use/).
[world-atlas redistributes its land outlines](https://github.com/topojson/world-atlas).
[d3-geo's license is ISC, with the bundled GeographicLib notice](https://github.com/d3/d3-geo/blob/v3.1.1/LICENSE);
retain the installed dependency's notices in the site's normal license process.

## Playground and checks

Use `npm run dev`, then open `/?view=globe` or `/dev/globe`.
The featured globe switches world/Romania/Japan without remounting. Idle and
labels can be toggled. Static-focus examples and actual 320, 768 and 1440 px
containers follow; larger containers scroll horizontally on smaller screens.
Use the OS reduced-motion preference or browser DevTools emulation. The control
copy is development UI; marker text comes from the labels prop.

`globe:proof` checks static SSR and browser focus, reduced motion, interruption,
idle, rest, off-screen pause, and container sizing. It does not certify hydration,
tab-hidden behaviour, JavaScript-disabled rendering, or 60 fps; check those after
wiring. `globe:shots` captures 375 and 1440 px viewports at world/ro/ja in
`docs/shots/globe-{focus}-{width}.png`, using reduced motion for repeatability.

`globe:size` builds a minified production ESM with React external, includes
d3-geo, its transitive dependencies and land, and measures level-9 gzip bytes.
It also reports raw/gzip source and land sizes separately. These separate sizes
are diagnostic, not additions to the already-complete bundle total.

| Artifact | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Globe.tsx source | 5,902 | 2,263 |
| Generated land | unavailable | unavailable |
| Component + d3-geo + land bundle | unavailable | unavailable |

The 60 KB raw land and 45 KB gzip bundle budgets remain **unverified**. Browser
behaviour, screenshots, hydration and 60 fps also remain unverified because
dependency installation and dev-server startup were blocked. See
`docs/globe-proof.txt` for actual outputs.

## TanStack Start integration

After all local checks pass, copy this entire folder into the site's
`src/signature/globe/` and add exact `d3-geo@3.1.1` as a runtime dependency and
`@types/d3-geo@3.1.0` as a dev dependency there. Import from the local folder's
index, not the playground. Keep it in the normal SSR route tree, not a
client-only boundary. Pass identical initial focus, labels, and ariaLabel from
server and client; change focus through the site's country-selection state.

```tsx
// Home: parent width controls the size.
<div style={{ width: '100%', maxWidth: '48rem' }}>
  <Globe focus="world" idle />
</div>

// Era section: preserve this component instance across country switches.
<div className={country === 'ro' ? 'era-left' : 'era-right'}>
  <Globe focus={country} labels={markerLabels} />
</div>
```

The site controls left/right placement; no scroll zoom is implemented.

After wiring, verify initial server SVG for each focus with JavaScript off,
hydrate each with no recoverable errors or rotation jump, switch rapidly between
countries, check no RAF work at rest, scroll off-screen, hide/show the tab, and
change reduced motion while spinning and mid-transition. Inspect 320/768/1440
parents and 375/1440 viewports for clipping. Profile a single rotating globe at
an actual 1440 px container for frame times near 16.7 ms; do not treat a passing
build as proof of smoothness. Check palette contrast after theme overrides and
confirm the default globe is decorative or announced as one named image.
