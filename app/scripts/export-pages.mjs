/**
 * Static build for GitHub Pages (https://t-dash.github.io/palimpsest-rom-jpn/).
 *
 *   npm run pages              build, then copy the site to the repo root (..)
 *   npm run pages -- <dir>     ...or to another folder
 *
 * GitHub Pages serves the repo's main branch from its root, so the built
 * pages live there, next to this app/ folder. Steps:
 *   1. vite build with STATIC_EXPORT=1 (every page prerendered under the
 *      /palimpsest-rom-jpn/ sub-path; vite.config.ts);
 *   2. 404.html rendered by the built server (GitHub Pages serves it for any
 *      unknown address), .nojekyll, and redirects from the old site's
 *      blog.html / credits.html / resources.html;
 *   3. the files from the previous export (listed in .pages-files) are removed
 *      and the new ones copied in. Nothing else in the target is touched.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(app, process.argv[2] ?? "..");
const client = join(app, "dist/client");
const BASE = "/palimpsest-rom-jpn";
const LIST = ".pages-files";

if (target === app) throw new Error("export-pages: the target can't be the app folder itself");

// 1. Build.
rmSync(join(app, "dist"), { recursive: true, force: true });
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npm, ["run", "build"], {
  cwd: app,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, STATIC_EXPORT: "1" },
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(join(client, "index.html"))) throw new Error("export-pages: no index.html — prerender didn't run");

// 2a. 404.html from the built server (the site's own "page not found").
const { default: server } = await import(pathToFileURL(join(app, "dist/server/server.js")).href);
const res = await server.fetch(new Request(`http://localhost${BASE}/this-page-does-not-exist`));
const html404 = await res.text();
if (res.status !== 404 || !html404.includes("<h1")) throw new Error(`export-pages: 404 page came back ${res.status}`);
writeFileSync(join(client, "404.html"), html404);

// 2b. No Jekyll: serve every file as it is.
writeFileSync(join(client, ".nojekyll"), "");

// 2c. The old site's pages and blog anchors (#romania-500s -> #ro-500s).
const redirect = (to) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Quilted Languages</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="https://t-dash.github.io${BASE}${to}">
<meta http-equiv="refresh" content="0; url=${BASE}${to}">
<script>var h=location.hash.replace(/^#romania-/,"#ro-").replace(/^#japan-/,"#ja-");location.replace("${BASE}${to}"+h);</script>
</head><body><p><a href="${BASE}${to}">Quilted Languages</a></p></body></html>
`;
for (const [file, to] of [["blog.html", "/blog/"], ["credits.html", "/credits/"], ["resources.html", "/resources/"]])
  writeFileSync(join(client, file), redirect(to));

// 3. Swap the files of the previous export for the new ones.
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(client, p).replaceAll("\\", "/"));
  }
})(client);

mkdirSync(target, { recursive: true });
const listPath = join(target, LIST);
if (existsSync(listPath)) {
  for (const f of readFileSync(listPath, "utf8").split("\n").filter(Boolean)) {
    if (f.includes("..")) continue;
    rmSync(join(target, f), { force: true });
  }
  // Empty folders left behind (old word pages, old asset folders).
  (function prune(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (name === ".git" || name === "app" || !statSync(p).isDirectory()) continue;
      prune(p);
      if (!readdirSync(p).length) rmSync(p, { recursive: true });
    }
  })(target);
}
for (const f of files) {
  if (existsSync(join(target, f)) && !existsSync(listPath))
    console.warn(`export-pages: replacing ${f} (not from an earlier export)`);
  mkdirSync(dirname(join(target, f)), { recursive: true });
  cpSync(join(client, f), join(target, f));
}
writeFileSync(listPath, files.sort().join("\n") + "\n");
console.log(`export-pages: ${files.length} files -> ${target}`);
