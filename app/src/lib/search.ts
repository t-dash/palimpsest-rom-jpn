/**
 * Explorer search, filters and sort. Pure functions over the shown words, so
 * the server (for the JS-off form) and the browser (live filtering) produce
 * exactly the same list from the same URL parameters.
 *
 * Search is accent-insensitive (ș = s, ă = a, é = e; the cedilla forms U+015F, U+0163 also match)
 * and kana-insensitive (katakana = hiragana), and also matches the romaji
 * reading, the English meaning and the donor language.
 */
import type { ContactType, EraId, Language, Word } from "@/data/types";
import { CONTACT_TYPES, ERA_IDS, LANGUAGES } from "@/data/types";

export type SortKey = "word" | "period" | "donor";
export const SORT_KEYS: SortKey[] = ["word", "period", "donor"];

export type ExploreSearch = {
  q?: string;
  lang?: Language;
  donor?: string;
  /** One of Taizo's eras (URL keeps the name "period"). */
  period?: EraId;
  contact?: ContactType;
  sort?: SortKey;
};

/** Parse URL search params into a clean, typed object (unknown values dropped). */
export function parseSearch(raw: Record<string, unknown>): ExploreSearch {
  const s: ExploreSearch = {};
  const str = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v).trim() : "");
  const q = str(raw.q).slice(0, 80);
  if (q) s.q = q;
  const lang = str(raw.lang);
  if ((LANGUAGES as string[]).includes(lang)) s.lang = lang as Language;
  const donor = str(raw.donor).slice(0, 40);
  if (donor) s.donor = donor;
  const period = str(raw.period);
  if ((ERA_IDS as string[]).includes(period)) s.period = period as EraId;
  const contact = str(raw.contact);
  if ((CONTACT_TYPES as string[]).includes(contact)) s.contact = contact as ContactType;
  const sort = str(raw.sort);
  if ((SORT_KEYS as string[]).includes(sort) && sort !== "word") s.sort = sort as SortKey;
  return s;
}

/** Lowercase, strip accents, fold cedilla/comma forms, katakana → hiragana. */
export function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function haystack(w: Word): string {
  return fold([w.word, w.reading ?? "", w.meaning, w.donor, w.via ?? ""].join(" "));
}

const CJK = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/;

/** Latin query parts match the start of a word ("ni" ≠ "meaNINg");
 *  Japanese parts match anywhere (no spaces between Japanese words). */
function matches(hay: string, part: string): boolean {
  if (CJK.test(part)) return hay.includes(part);
  return hay.split(/[\s\-–(),.;:/]+/).some((t) => t.startsWith(part));
}

const eraIndex = (w: Word) => ERA_IDS.indexOf(w.era);

export function filterWords(words: Word[], s: ExploreSearch): Word[] {
  const q = s.q ? fold(s.q) : "";
  const list = words.filter(
    (w) =>
      (!s.lang || w.language === s.lang) &&
      (!s.donor || w.donor === s.donor) &&
      (!s.contact || w.contactType === s.contact) &&
      (s.period === undefined || w.era === s.period) &&
      (!q || q.split(" ").every((part) => matches(haystack(w), part))),
  );
  if (s.sort === "period") return [...list].sort((a, b) => eraIndex(a) - eraIndex(b));
  if (s.sort === "donor") return [...list].sort((a, b) => a.donor.localeCompare(b.donor));
  return list; // getWords() is already alphabetical, Romanian first
}

/** Taizo's eras that have at least one shown word, in order. */
export function erasWithWords(words: Word[]): EraId[] {
  return ERA_IDS.filter((id) => words.some((w) => w.era === id));
}

export function isFiltered(s: ExploreSearch): boolean {
  return Boolean(s.q || s.lang || s.donor || s.period !== undefined || s.contact);
}
