/**
 * The word and era data model. Taizo's site is organised by ERA (his
 * sections: Pre-history, 500s CE, 1400s CE, 1600s CE, 1850s CE, 1950s CE,
 * 2000s CE), each with a Romania side and a Japan side. Words belong to an
 * era; each era side has one lead word with his paragraph and a list of
 * further examples.
 */

export type Language = "ro" | "ja";

/** How the word is written: Latin letters (Romanian), kana, or kanji (use
 *  "kanji" whenever the written form contains any kanji). */
export type Script = "latin" | "kana" | "kanji";

/** Taizo's eras, in order. Labels live in src/content/en.ts → eras. */
export type EraId = "prehistory" | "500s" | "1400s" | "1600s" | "1850s" | "1950s" | "2000s";
export const ERA_IDS: EraId[] = ["prehistory", "500s", "1400s", "1600s", "1850s", "1950s", "2000s"];

/** The kind of contact the word came through — only when Taizo's text says
 *  so ("inherited" = kept from the mother tongue, his Pre-history section). */
export type ContactType = "inherited" | "migration" | "religion" | "empire" | "trade" | "modern";

export type Confidence = "attested" | "disputed";

export type Source = {
  /** As the source names itself, e.g. "DEX online — ceai". */
  title: string;
  /** Full https:// link to the entry. */
  url: string;
};

export type Word = {
  /** Stable id, never reused. */
  id: string;
  /** URL part for /words/$slug: lowercase ASCII and hyphens, unique.
   *  Romanian: the word without diacritics (frate → "frate"); Japanese: the
   *  romaji reading (pan → "pan"). Add "-2" if two words collide. */
  slug: string;
  /** The word as written: Romanian with comma-below ș ț (never the cedilla forms U+015F, U+0163),
   *  Japanese in kana or kanji. */
  word: string;
  script: Script;
  /** Romaji reading. Japanese words only. */
  reading?: string;
  language: Language;
  /** Short English meaning, in Taizo's words. */
  meaning: string;
  /** The language the word came from, as Taizo names it, e.g. "Ottoman Turkish". */
  donor: string;
  /** "direct", or "via" another language (name it in `via`). */
  route: "direct" | "via";
  via?: string;
  /** Which of Taizo's era sections the word belongs to. */
  era: EraId;
  /** Only when Taizo's text states it. */
  contactType?: ContactType;
  /** Optional example in the word's language, with an English translation. */
  example?: { text: string; translation?: string };
  /** Sources Taizo cites. Empty until he sends them: the word still shows,
   *  with a "Sources coming soon" note (Herdy, 13 Oct 2026). */
  sources: Source[];
  confidence: Confidence;
  /** Disputed words only: each view with its own sources (at least two). */
  views?: { view: string; sources: Source[] }[];
  /** Show on the homepage. */
  featured?: boolean;
};

/** One country's side of one era: Taizo's lead word, his paragraph(s), his
 *  further examples. Empty `body` = this side is still being written. */
export type EraSide = {
  /** Id of the lead word in words.ts (absent when the side is empty). */
  leadWordId?: string;
  /** Blog heading for this section (Taizo's example: "Romanian in the year
   *  500 - slavic migrations"). */
  blogTitle: string;
  /** Taizo's paragraphs, verbatim (spelling fixes listed in the log). */
  body: string[];
  /** Ids of the further examples he lists. */
  exampleIds: string[];
  /** Sources for this blog section (shown at the end of the section). */
  sources: Source[];
};

export type Era = {
  id: EraId;
  ro: EraSide;
  ja: EraSide;
};

export const LANGUAGES: Language[] = ["ro", "ja"];
export const CONTACT_TYPES: ContactType[] = ["inherited", "migration", "religion", "empire", "trade", "modern"];
