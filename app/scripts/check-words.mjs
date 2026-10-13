#!/usr/bin/env node
/**
 * Data check, run before every build (`npm run build` and `npm run check:words`).
 *
 * FAILS the build when:
 *   - any file under src/ contains a cedilla ş Ş ţ Ţ (U+015F U+015E U+0163
 *     U+0162). Romanian uses comma-below ș Ș ț Ț (U+0219 U+0218 U+021B U+021A).
 *   - two words share an id or a slug, or a slug isn't lowercase ASCII + hyphens.
 * Also FAILS when a word's era isn't one of Taizo's eras, or when
 * src/data/eras.ts points at a word id that isn't in words.ts.
 * LISTS (does not fail) words hidden for a malformed source, and words shown
 * with "Sources coming soon" because they have no source yet.
 *
 * The cedilla scan is plain text and always runs. The word checks import
 * src/data/words.ts, which needs a runtime that strips TypeScript types
 * (Node ≥ 22.6 with --experimental-strip-types, or Bun); otherwise they are
 * skipped with a note and the site's own rules still apply.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const CEDILLA = /[ŞşŢţ]/g;
const FIX = { "Ş": "Ș", "ş": "ș", "Ţ": "Ț", "ţ": "ț" };
let failed = false;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|css|md|json|txt)$/.test(name)) scan(p);
  }
}
function scan(file) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const m of line.matchAll(CEDILLA)) {
        failed = true;
        console.error(`FAIL cedilla ${m[0]} in ${relative(root, file)}:${i + 1} → use ${FIX[m[0]]}`);
      }
    });
}
walk(join(root, "src"));

let words = null;
try {
  ({ words } = await import(pathToFileURL(join(root, "src/data/words.ts")).href));
} catch {
  console.log("note: word checks skipped (this runtime can't import .ts); cedilla scan done.");
}

if (words) {
  const seen = { id: new Map(), slug: new Map() };
  const valid = (s) => s?.title?.trim() && /^https:\/\/\S+$/.test(s?.url ?? "");
  const excluded = [];
  const pending = [];
  for (const w of words) {
    for (const key of ["id", "slug"]) {
      if (seen[key].has(w[key])) {
        failed = true;
        console.error(`FAIL duplicate ${key} "${w[key]}"`);
      }
      seen[key].set(w[key], true);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(w.slug ?? "")) {
      failed = true;
      console.error(`FAIL slug "${w.slug}" (${w.word}): lowercase ASCII letters, digits and hyphens only`);
    }
    if (!/^(prehistory|500s|1400s|1600s|1850s|1950s|2000s)$/.test(w.era ?? "")) {
      failed = true;
      console.error(`FAIL era "${w.era}" (${w.word}): must be one of Taizo's eras (src/data/types.ts ERA_IDS)`);
    }
    if (!w.sources?.length) pending.push(`${w.word} (${w.language})`);
    let reason = null;
    if (!(w.sources ?? []).every(valid)) reason = "a source has no title or no https link";
    else if (w.confidence === "disputed" && !((w.views ?? []).length >= 2 && w.views.every((v) => v.view?.trim() && v.sources?.length && v.sources.every(valid))))
      reason = "disputed, but not two sourced views";
    else if (w.route === "via" && !w.via?.trim()) reason = "route is via, but no via language";
    else if (w.language === "ja" && !w.reading?.trim()) reason = "Japanese word without a romaji reading";
    if (reason) excluded.push(`${w.word} (${w.language}): ${reason}`);
  }
  console.log(`words: ${words.length} in the file, ${words.length - excluded.length} shown, ${excluded.length} hidden`);
  for (const e of excluded) console.log(`  hidden — ${e}`);
  if (pending.length) console.log(`  ${pending.length} shown with "Sources coming soon" (no source yet): ${pending.join(", ")}`);

  // Every word an era points at must exist, or it silently drops off the page.
  try {
    const { eras } = await import(pathToFileURL(join(root, "src/data/eras.ts")).href);
    const ids = new Set(words.map((w) => w.id));
    for (const era of eras) {
      for (const lang of ["ro", "ja"]) {
        const side = era[lang];
        for (const id of [side.leadWordId, ...side.exampleIds].filter(Boolean)) {
          if (!ids.has(id)) {
            failed = true;
            console.error(`FAIL eras.ts ${era.id}/${lang} points at word id "${id}", which is not in words.ts`);
          }
        }
      }
    }
  } catch {
    console.log("note: era checks skipped (this runtime can't import .ts).");
  }
}

if (failed) {
  console.error("check-words: FAILED");
  process.exit(1);
}
console.log("check-words: OK");
