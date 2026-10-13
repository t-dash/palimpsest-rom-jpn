/**
 * The only place pages get data from.
 *
 * LOCAL (default, now): reads src/data/*.ts.
 * CLOUD (not in scope; kept to match Lovable's layout): would read Lovable
 * Cloud tables where published = true — only when site.dataSource === "cloud"
 * AND the Supabase env vars exist.
 *
 * The Supabase client is loaded lazily through import.meta.glob so that
 * (a) a project without src/integrations/supabase still builds, and (b) the
 * client isn't bundled into every page (build-lessons trap 4). Never import
 * "@/integrations/supabase/client" statically anywhere.
 *
 * Honesty rules enforced here, so no page can break them:
 * - a word without a valid source never renders;
 * - a disputed word renders only with at least two views, each sourced.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/data/site";
import { en } from "@/content/en";
import { words as allWords } from "@/data/words";
import { eras as allEras } from "@/data/eras";
import type { Era, EraId, EraSide, Language, Source, Word } from "@/data/types";

const clientModules = import.meta.glob<{ supabase: SupabaseClient | null }>(
  "../integrations/supabase/client.ts",
);

export function cloudEnabled(): boolean {
  return (
    site.dataSource === "cloud" &&
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  );
}

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!cloudEnabled()) return null;
  const load = Object.values(clientModules)[0];
  if (!load) return null;
  try {
    return (await load()).supabase;
  } catch {
    return null;
  }
}

export function getSite() {
  return site;
}

/* ---------------------------------------------------------------- words */

function validSource(s: Source): boolean {
  return Boolean(s.title?.trim()) && /^https:\/\/\S+$/.test(s.url ?? "");
}

/** Why a word can't be shown, or null if it can. Used by the site and by
 *  scripts/check-words.mjs (which lists excluded words for Taizo).
 *  A word with NO sources yet still shows, marked "Sources coming soon"
 *  (Herdy, 13 Oct 2026: Taizo's own text renders before his citations);
 *  a source that is malformed still hides the word. */
export function exclusionReason(w: Word): string | null {
  if (!(w.sources ?? []).every(validSource)) return "a source has no title or no https link";
  if (w.confidence === "disputed") {
    const views = w.views ?? [];
    if (views.length < 2) return "disputed, but fewer than two views";
    if (!views.every((v) => v.view.trim() && v.sources.length && v.sources.every(validSource)))
      return "disputed, but a view has no valid source";
  }
  if (w.route === "via" && !w.via?.trim()) return "route is via, but no via language";
  if (w.language === "ja" && !w.reading?.trim()) return "Japanese word without a romaji reading";
  return null;
}

const collator = { ro: new Intl.Collator("ro"), ja: new Intl.Collator("ja") };

function byWord(a: Word, b: Word): number {
  if (a.language !== b.language) return a.language === "ro" ? -1 : 1;
  const ka = a.language === "ja" ? (a.reading ?? a.word) : a.word;
  const kb = b.language === "ja" ? (b.reading ?? b.word) : b.word;
  return collator[a.language].compare(ka, kb);
}

const published: Word[] = allWords.filter((w) => exclusionReason(w) === null).sort(byWord);

/** Every word that may be shown, Romanian first, alphabetical. */
export function getWords(): Word[] {
  return published;
}

export function getWordsByLanguage(language: Language): Word[] {
  return published.filter((w) => w.language === language);
}

export function getWord(slug: string): Word | undefined {
  return published.find((w) => w.slug === slug);
}

/** Taizo's featured words; if he hasn't picked any yet, the first three of
 *  each language. */
export function getFeatured(): Word[] {
  const picked = published.filter((w) => w.featured);
  if (picked.length) return picked;
  return [...getWordsByLanguage("ro").slice(0, 3), ...getWordsByLanguage("ja").slice(0, 3)];
}

/** Same donor first, then same contact type in the same language. */
export function getRelated(word: Word, limit = 4): Word[] {
  const others = published.filter((w) => w.id !== word.id);
  const sameDonor = others.filter((w) => w.donor === word.donor);
  const sameContact = others.filter(
    (w) => w.donor !== word.donor && w.contactType === word.contactType && w.language === word.language,
  );
  return [...sameDonor, ...sameContact].slice(0, limit);
}

export type DonorCount = { donor: string; count: number; languages: Language[] };

/** Donor languages with how many shown words came from each. */
export function getDonors(): DonorCount[] {
  const map = new Map<string, DonorCount>();
  for (const w of published) {
    const d = map.get(w.donor) ?? { donor: w.donor, count: 0, languages: [] };
    d.count += 1;
    if (!d.languages.includes(w.language)) d.languages.push(w.language);
    map.set(w.donor, d);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.donor.localeCompare(b.donor));
}

export type SourceUse = Source & { words: Word[] };

/** Every source cited by a shown word (views included), once each. */
export function getSources(): SourceUse[] {
  const map = new Map<string, SourceUse>();
  for (const w of published) {
    const all = [...w.sources, ...(w.views ?? []).flatMap((v) => v.sources)];
    for (const s of all) {
      const entry = map.get(s.url) ?? { ...s, words: [] };
      if (!entry.words.includes(w)) entry.words.push(w);
      map.set(s.url, entry);
    }
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** True only when there are Romanian words and every one cites DEX online,
 *  so the site never claims a check it hasn't made. */
export function allRomanianCiteDex(): boolean {
  const ro = getWordsByLanguage("ro");
  return ro.length > 0 && ro.every((w) => w.sources.some((s) => /(^|\.)dexonline\.ro$/.test(new URL(s.url).hostname)));
}

/** True when any shown word cites Wiktionary (CC BY-SA attribution needed). */
export function usesWiktionary(): boolean {
  return getSources().some((s) => /(^|\.)wiktionary\.org$/.test(new URL(s.url).hostname));
}

/** True while Taizo hasn't added a source for this word yet. */
export function sourcesPending(w: Word): boolean {
  return w.sources.length === 0;
}

/* ----------------------------------------------------------------- eras */

/** "Pre-history", "500s CE", … (Taizo's section names). */
export function eraLabel(id: EraId): string {
  return en.eras[id];
}

/** Anchor id shared by the home timeline and the blog: "ro-500s". */
export function eraAnchor(language: Language, id: EraId): string {
  return `${language}-${id}`;
}

export type EraSideView = {
  era: EraId;
  language: Language;
  anchor: string;
  title: string;
  lead?: Word;
  examples: Word[];
  body: string[];
  sources: Source[];
};

function sideView(era: Era, language: Language): EraSideView {
  const side: EraSide = era[language];
  const byId = (id: string) => published.find((w) => w.id === id);
  return {
    era: era.id,
    language,
    anchor: eraAnchor(language, era.id),
    title: side.blogTitle || `${en.panels[language]} · ${eraLabel(era.id)}`,
    lead: side.leadWordId ? byId(side.leadWordId) : undefined,
    examples: side.exampleIds.map(byId).filter((x): x is Word => Boolean(x)),
    body: side.body,
    sources: side.sources.filter(validSource),
  };
}

/** Every era with both sides resolved to words (empty sides keep an empty body). */
export function getEras(): { id: EraId; label: string; ro: EraSideView; ja: EraSideView }[] {
  return allEras.map((e) => ({ id: e.id, label: eraLabel(e.id), ro: sideView(e, "ro"), ja: sideView(e, "ja") }));
}
