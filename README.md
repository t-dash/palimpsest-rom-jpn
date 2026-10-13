# Quilted Languages

How empires shaped the words of Romania and Japan — by Taizo Wiggins.
Live at https://t-dash.github.io/palimpsest-rom-jpn/

## How this repo is laid out

GitHub Pages serves this repo's `main` branch from the root folder (Settings →
Pages: "Deploy from a branch", `main`, `/ (root)`). So:

| Where | What |
|---|---|
| `app/` | The source: a React + TanStack Start app. **Edit things here.** |
| everything else at the root | The built site that GitHub Pages serves. **Don't edit by hand** — it's rebuilt by `npm run pages`. `.pages-files` lists every built file. |
| `design_doc.pdf` | Taizo's design doc (kept as is). |

## Change the content

All the content lives in four files in `app/` — you don't need to touch the code:

| What | File |
|---|---|
| Words (meaning, where it came from, era, sources) | `app/src/data/words.ts` |
| Era sections (the text on Home and in the Blog, and their sources) | `app/src/data/eras.ts` |
| Teaching materials (Resources page) | `app/src/data/resources.ts` (PDFs go in `app/public/resources/`) |
| Page text (title, tag line, Credits, "Why this project") | `app/src/content/en.ts` |

Rules: Romanian ș and ț with a comma below (never ş ţ — the build stops if
one slips in); a source needs a title and a full `https://` link; a word or
section without a source shows "Sources coming soon". More detail and
examples: `app/docs/HOW-TO-UPDATE.md`.

## Publish a change

Needs Node 22 or newer.

```
cd app
npm ci            # first time only
npm run dev       # preview at http://127.0.0.1:8095 while you edit
npm run pages     # build the site into the repo root
cd ..
git add -A
git commit -m "Describe the change"
git push          # GitHub Pages updates in a minute or two
```

`npm run pages` checks the words, builds every page as plain HTML under
`/palimpsest-rom-jpn/`, writes `404.html`, and swaps the old built files for the new
ones. Always run it before committing a content change, or the live site
won't change.

## Old addresses

`blog.html`, `credits.html` and `resources.html` (the first version of the
site) redirect to the new pages, including old blog links such as
`blog.html#romania-500s`. The first version is in the git history (commit
285e527).
