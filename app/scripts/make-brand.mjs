#!/usr/bin/env node
/**
 * Share image and icon set — `npm run brand` (then `python scripts/make-ico.py`).
 *
 * Renders with a local Chrome/Edge (headless, DevTools protocol), using the
 * site's own fonts and donor colours/patterns:
 *   public/og.png (1200×630), favicon.svg, favicon-32/48/96.png,
 *   apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png
 * make-ico.py then writes favicon.ico and shrinks og.png under 300 KB.
 *
 * The quilt corner in the share image is decorative: patches in the donor
 * colours and patterns, no words, no text claims. When Taizo sends a logo,
 * replace MARK and run both scripts again. The Codex og.png may replace this
 * one when the quilt is wired (_internal/03).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const INK = "#03254C";
const BLUE = "#1F4068";
const PAPER = "#E0E7FF";
const THREAD = "#A9B8E3";

/** Two patches sewn by a seam (same as src/components/BrandMark.tsx). */
const MARK = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${bg ? `<rect width="24" height="24" rx="5" fill="${PAPER}"/>` : ""}
<rect x="3" y="5" width="8.2" height="14" rx="1" fill="${INK}"/><rect x="12.8" y="5" width="8.2" height="14" rx="1" fill="${BLUE}"/>
<path d="M12 3v18" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 2"/></svg>`;

const b64 = (p) => readFileSync(p).toString("base64");
const serif = b64("node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2");
const sans = b64("node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2");
const FONT_CSS = `@font-face{font-family:QLSerif;src:url(data:font/woff2;base64,${serif}) format("woff2");font-weight:200 900}
@font-face{font-family:QLSans;src:url(data:font/woff2;base64,${sans}) format("woff2");font-weight:200 900}`;

// Donor colours + patterns, as in src/styles.css / src/lib/donors.ts.
const S = "rgb(255 255 255 / 0.42)";
const PATCHES = [
  ["#3b4a8c", `repeating-linear-gradient(0deg,${S} 0 2px,transparent 2px 7px)`],
  ["#1f7a6d", `repeating-linear-gradient(45deg,${S} 0 2px,transparent 2px 8px)`],
  ["#2b7bb9", `radial-gradient(${S} 1.6px,transparent 2px) 0 0/8px 8px`],
  ["#b5452a", `linear-gradient(135deg,${S} 25%,transparent 25%) -6px 0/12px 12px,linear-gradient(225deg,${S} 25%,transparent 25%) -6px 0/12px 12px`],
  ["#7a5c1e", `repeating-linear-gradient(45deg,${S} 0 1.5px,transparent 1.5px 8px),repeating-linear-gradient(-45deg,${S} 0 1.5px,transparent 1.5px 8px)`],
  ["#8e3b78", `repeating-linear-gradient(90deg,${S} 0 2px,transparent 2px 7px)`],
  ["#a8790e", `radial-gradient(circle at 50% 100%,transparent 3px,${S} 3px 4.4px,transparent 4.6px) 0 0/12px 7px`],
  ["#2e7d32", `linear-gradient(45deg,${S} 25%,transparent 25% 75%,${S} 75%) 0 0/12px 12px,linear-gradient(-45deg,${S} 25%,transparent 25% 75%,${S} 75%) 0 0/12px 12px`],
  ["#c4561b", `radial-gradient(circle,transparent 2px,${S} 2px 3.2px,transparent 3.4px) 0 0/11px 11px`],
  ["#5a6474", `repeating-linear-gradient(0deg,${S} 0 1.5px,transparent 1.5px 9px),repeating-linear-gradient(90deg,${S} 0 1.5px,transparent 1.5px 9px)`],
];
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const patch = (i) => {
  const [c, bg] = PATCHES[i % PATCHES.length];
  return `<i style="background:${bg},${c}"></i>`;
};
const panel = (from, n) => Array.from({ length: n }, () => patch(from[Math.floor(rnd() * from.length)])).join("");

const OG = `<!doctype html><html><head><style>${FONT_CSS}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:${PAPER};font-family:QLSans;color:${INK};overflow:hidden;position:relative}
.t{position:absolute;left:72px;top:118px;width:520px}.l{font-size:21px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:#3D5480}
h1{font-family:QLSerif;font-size:88px;font-weight:600;line-height:1;letter-spacing:-.01em;margin-top:22px}
p{font-family:QLSerif;font-size:34px;line-height:1.2;margin-top:24px;color:${INK}}
.mk{position:absolute;left:72px;bottom:64px;display:flex;gap:14px;align-items:center;font-size:22px;color:#3D5480}.mk svg{width:34px;height:34px}
.q{position:absolute;right:-30px;top:-30px;width:600px;height:700px;display:grid;grid-template-columns:1fr 14px 1fr;gap:0;transform:rotate(4deg);
border:3px dashed ${THREAD};background:#fff;padding:16px}
.p{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;align-content:start}.p i{display:block;aspect-ratio:1;border-radius:3px}
.s{border-left:3px dashed ${INK};opacity:.45;margin:0 5px}</style></head><body>
<div class="q"><div class="p">${panel([0, 1, 2, 3, 4, 5, 9], 44)}</div><div class="s"></div><div class="p">${panel([6, 7, 8, 9], 44)}</div></div>
<div class="t"><div class="l">Loanwords in Romanian and Japanese</div><h1>Quilted Languages</h1><p>How empires shaped the words of Romania and Japan</p></div>
<div class="mk">${MARK(false)}<span>Romania and Japan, era by era</span></div></body></html>`;

const ICON = (size, pad) => `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:${PAPER}}
svg{display:block;width:${size - 2 * pad}px;height:${size - 2 * pad}px;margin:${pad}px}</style></head><body>${MARK(!pad)}</body></html>`;

const exe = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  process.env.CHROME_PATH,
].find((p) => p && existsSync(p));
if (!exe) {
  console.error("make-brand: no Chrome or Edge found (set CHROME_PATH)");
  process.exit(1);
}
const port = 9500 + Math.floor(Math.random() * 300);
const chrome = spawn(exe, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "brand-"))}`, "about:blank"], { stdio: "ignore" });
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 80 && !target; i++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
  } catch {}
  if (!target) await pause(100);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1;
const pending = new Map();
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.reject(new Error(`${m.error.message}`)) : p.resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = id++;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
    setTimeout(() => pending.has(i) && (pending.delete(i), reject(new Error(`${method} timed out`))), 15000);
  });
const quit = setTimeout(() => {
  console.error("make-brand: gave up after 60 s");
  chrome.kill();
  process.exit(1);
}, 60000);
await send("Page.enable");

async function render(html, w, h, out) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  const frameId = (await send("Page.getFrameTree")).frameTree.frame.id;
  await send("Page.setDocumentContent", { frameId, html });
  await pause(500);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("wrote", out);
}

await render(OG, 1200, 630, "public/og.png");
for (const [s, f] of [[32, "favicon-32.png"], [48, "favicon-48.png"], [96, "favicon-96.png"], [180, "apple-touch-icon.png"], [192, "icon-192.png"], [512, "icon-512.png"]]) {
  await render(ICON(s, 0), s, s, `public/${f}`);
}
await render(ICON(512, 72), 512, 512, "public/icon-maskable-512.png");
writeFileSync("public/favicon.svg", MARK(true));
ws.close();
chrome.kill();
clearTimeout(quit);
