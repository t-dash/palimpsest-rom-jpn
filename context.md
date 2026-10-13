# Quilted Languages — Project Context

> **For Claude instances**: read this first. `design_doc.pdf` is the source of truth for design intent.

## What this is
Interactive site comparing loanword histories of **Romanian** and **Japanese**. Thesis: both languages grew up beside empires, and each era's dominant power left a layer of borrowed words. Formerly "Language as Palimpsest" — that prototype lives in `legacy/` (open `legacy/index.html` via the server).

## Run it
`./serve.sh` then open http://localhost:8000 (needs a server; pages `fetch()` JSON). No build step, no framework. d3, topojson-client and Natural Earth 50m data are vendored in `vendor/` so it runs offline (Google Fonts falls back gracefully).

## File map

| Path | What |
|---|---|
| `index.html`, `css/story.css`, `js/story.js` | Home (title + idle globe in navy void) and the scrolling story: sticky globe + era cards, Romania/Japan side switch |
| `js/globe.js` | `Globe` class: canvas orthographic globe. `setScene({focus, fills, arrows, labels})` rotates/zooms to fit `focus`, fills countries, draws animated great-circle arrows. Zoom past the frame renders as a circular lens. `ANCHORS` overrides centroids (France, USA, Russia...). Country names are Natural Earth names (`United States of America`, `Bosnia and Herz.`). |
| `js/nav.js`, `css/style.css` | Shared top bar + palette tokens. `window.setBlogTarget(id)` makes the Blog button deep-link. |
| `blog.html`, `js/blog.js`, `css/blog.css` | Blog generated from `eras.json`; left hamburger outline; citations per section; section ids `{side}-{eraId}` (e.g. `romania-500s`). |
| `credits.html`, `resources.html`, `css/pages.css` | Credits (placeholder names) and PDF resource grid from `data/resources.json`. |
| `data/eras.json` | All content. Per era per side: `layer`, `headword`, `summary` (card), `examples`, `sources` (arrows), optional `highlight` (gold fills, defaults to sources), `blogTitle`, `blog[]`, `citations[]`, `draft`. `groups` defines merged shapes (e.g. `USSR`) built with `topojson.merge`. |
| `resources/` | Placeholder PDFs + SVG thumbnails. |
| `legacy/` | Old prototype, its maps, `ideal_prompt.txt`, `update-data.sh`. |

## Design decisions
- Palette from design doc: `#021011` void, `#03254c` / `#1f4068` navy, `#e0e7ff` pale. Romania `#6fa8dc` (text: `#2f6fa8`), Japan `#c23b22`, sources gold `#f0c040`.
- Romania = globe left / cards right; Japan = mirrored. Switch slides both panels past each other (triangle button or arrow keys). On <820px the globe sits on top and cards scroll over it.
- Timeline under the globe runs left (old) to right (new); clickable.

## Open / TODO
- Content marked `"draft": true` (Japan 1400s; both sides 1850s, 1950s, 2000s) needs real writing from the team. All `citations` are empty.
- Credits names and resource PDFs are placeholders.
- Yon-koma manga panels from the old prototype were dropped from the home screen; re-add if wanted.
- Not done: historical borders beyond the USSR merge, script-reform visuals (Cyrillic to Latin, hentaigana).
