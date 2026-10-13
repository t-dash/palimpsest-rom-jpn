#!/usr/bin/env node
/**
 * Source link check — `npm run check:sources`.
 *
 * Opens every source URL in src/data/words.ts (word sources and disputed
 * views), once each, and reports anything that doesn't answer 200–399.
 * Run it after adding words and before every handover. Exits 1 if any link
 * is broken, so a broken source can't slip through unnoticed.
 *
 * Some sites refuse automated requests (403/429) though the page works in a
 * browser; those are listed as "check by hand", not as broken.
 * Needs Node ≥ 22.6 (--experimental-strip-types) or Bun, and a network.
 */
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const { words } = await import(pathToFileURL(join(root, "src/data/words.ts")).href);

const uses = new Map();
for (const w of words) {
  for (const s of [...(w.sources ?? []), ...(w.views ?? []).flatMap((v) => v.sources ?? [])]) {
    if (!uses.has(s.url)) uses.set(s.url, []);
    uses.get(s.url).push(w.word);
  }
}
if (!uses.size) {
  console.log("check:sources — no sources yet.");
  process.exit(0);
}

const UA = "Mozilla/5.0 (QuiltedLanguages source check)";
async function status(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
      if (method === "HEAD" && (res.status === 405 || res.status === 403)) continue;
      return res.status;
    } catch (e) {
      if (method === "GET") return `error: ${e.cause?.code ?? e.name}`;
    }
  }
  return "error";
}

let broken = 0;
const manual = [];
const urls = [...uses.keys()];
const results = [];
for (let i = 0; i < urls.length; i += 6) {
  const batch = urls.slice(i, i + 6);
  results.push(...(await Promise.all(batch.map(async (u) => [u, await status(u)]))));
}
for (const [url, s] of results) {
  const who = uses.get(url).join(", ");
  if (typeof s === "number" && s >= 200 && s < 400) continue;
  if (s === 403 || s === 429) {
    manual.push(`  ${s}  ${url}  (${who})`);
    continue;
  }
  broken++;
  console.error(`BROKEN ${s}  ${url}  (${who})`);
}
if (manual.length) console.log(`check by hand (site refused the robot):\n${manual.join("\n")}`);
console.log(`check:sources — ${urls.length} links, ${broken} broken, ${manual.length} to check by hand.`);
process.exit(broken ? 1 : 0);
