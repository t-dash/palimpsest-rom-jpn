# Language as Palimpsest — Project Context

## What this is
An interactive data visualization comparing the linguistic histories of Japanese and Romanian — two languages that evolved as "outliers" alongside much larger empires (China and Rome/Russia respectively). The visualization shows how each era's dominant power left a layer of loanwords in each language, like a palimpsest.

## Current state (as of Aug 2026)
- **Preliminary / in-progress** — data is sparse (many eras have no word examples yet), narrative text is rough
- Single-page HTML app (`index.html`) pulling structured data from `data.json`
- Uses a Wikimedia CC world map SVG (`world-map.svg`) with country-level path IDs for highlighting and dynamic zoom
- NYT-style scrollytelling: scroll down to move through 7 historical eras, click or arrow-key left/right to toggle between Romania (left) and Japan (right)
- Placeholder images at top (`ruxie.jpeg`) and bottom (`yippe_unicorn_rainbow.jpg`) where yon-koma manga panels will eventually go
- Kaki (persimmon) interlude section between the main viz and the postamble

## Architecture
- `data.json` — all content (eras, word examples, context text, kaki info). Designed to be updated independently from the viz code.
- `index.html` — self-contained HTML/CSS/JS. No build step, no dependencies beyond Google Fonts CDN.
- `world-map.svg` — Wikimedia low-resolution world map (public domain). Countries have human-readable IDs like `romania`, `honshu`, `france`.
- `update-data.sh` — helper script to pull CSV from a Google Sheet (source of truth for word data).
- `historical_maps/` — downloaded CC historical maps from Wikimedia (Roman Empire, Buddhist Expansion, Cold War, Iron Curtain, etc.). Not currently integrated.

## Key technical decisions
- **Dynamic map zoom**: viewBox is computed at runtime from the bounding boxes of destination + source countries. No hardcoded zoom regions.
- **Curved arrows**: arcs bow upward proportional to distance (subtle for short hops, dramatic for long ones like US→Japan).
- **US handling**: all US territories highlight (mainland, both Alaskas, Hawaii, Aleutians), but arrow draws only from mainland US. The line crosses Eurasia/Africa eastward to reach Japan.
- **SOURCE_MAP structure**: each era+side has separate `highlight` (countries to color gold) and `arrowFrom` (countries to draw arrows from) arrays, allowing decorative highlighting without forcing arrow clutter.
- **Scrollytelling**: IntersectionObserver on right-column step cards triggers era changes in the sticky left panel. Left/right switching is keyboard or click on Romania/Japan tabs.

## Data source
- Google Doc (prompt/spec): describes the project vision, factoid list, manga panel scripts
- Google Sheet (word data): structured rows with year, from-culture, to-culture, source word, borrowed word, context text
- Both are expected to be edited frequently; the viz is built to accommodate data changes without code changes.

## What's missing / planned
- Most eras have empty word example arrays — need to be populated from the Google Sheet
- Yon-koma manga panels (preamble and postamble) — currently placeholder images
- Historical map overlays were attempted and reverted — may revisit with reference images for consistent styling
- Script/writing system transitions (e.g., Hentaigana, post-communist reform of î) not yet visualized
- Mobile experience needs polish
- Historical border changes (USSR, Czechoslovakia, Yugoslavia) attempted but blocked by the low-res Wikimedia map missing small countries like Latvia. The `maps/` folder has per-era SVG copies with merged borders, and a CSS `border-erase` approach was proven to work, but both were reverted pending a higher-resolution base map. The `maps/20th-century.svg` has merged USSR/Czechoslovakia/Yugoslavia paths ready to use.
