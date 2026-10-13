import type { Word } from "./types";

/**
 * Taizo's words, from "Capstone_project_content & vision.docx" (received
 * 13 Oct 2026). Every word, meaning and donor is his; we never add
 * etymologies. Glosses are his, except where marked `// gloss: ours`.
 *
 * Sources: none supplied yet. Words show with "Sources coming soon" until he
 * adds them (Herdy, 13 Oct 2026). When a source arrives, add it to the word:
 *   sources: [{ title: "DEX online — frate", url: "https://dexonline.ro/definitie/frate" }]
 *
 * Fields (src/data/types.ts has the rules): id, slug, word, script,
 * reading (Japanese), language, meaning, donor, route (+ via), era,
 * contactType (only when his text says), example?, sources[], confidence,
 * views[] (disputed only), featured?
 *
 * Romanian: ș ț with comma below only. `npm run build` fails on the cedilla forms (U+015F, U+0163).
 */

type WordInput = Omit<Word, "route" | "sources" | "confidence"> & Partial<Pick<Word, "route" | "sources" | "confidence">>;
const w = (x: WordInput): Word => ({ route: "direct", sources: [], confidence: "attested", ...x });

export const words: Word[] = [
  // ---- Pre-history · Romania (kept from Latin) ----
  w({ id: "ro-frate", slug: "frate", word: "frate", script: "latin", language: "ro", meaning: "brother", donor: "Latin", era: "prehistory", contactType: "inherited", featured: true }),
  w({ id: "ro-sora", slug: "sora", word: "soră", script: "latin", language: "ro", meaning: "sister", donor: "Latin", era: "prehistory", contactType: "inherited" }),
  w({ id: "ro-tata", slug: "tata", word: "tată", script: "latin", language: "ro", meaning: "father", donor: "Latin", era: "prehistory", contactType: "inherited" }),
  w({ id: "ro-mama", slug: "mama", word: "mamă", script: "latin", language: "ro", meaning: "mother", donor: "Latin", era: "prehistory", contactType: "inherited" }),
  w({ id: "ro-fiu", slug: "fiu", word: "fiu", script: "latin", language: "ro", meaning: "son", donor: "Latin", era: "prehistory", contactType: "inherited" }),
  w({ id: "ro-fiica", slug: "fiica", word: "fiică", script: "latin", language: "ro", meaning: "daughter", donor: "Latin", era: "prehistory", contactType: "inherited" }),

  // ---- Pre-history · Japan (kept from older Japanese) ----
  w({ id: "ja-otouto", slug: "otouto", word: "弟", script: "kanji", reading: "otouto", language: "ja", meaning: "little brother", donor: "Old Japanese", era: "prehistory", contactType: "inherited", featured: true }),
  w({ id: "ja-ani", slug: "ani", word: "兄", script: "kanji", reading: "ani", language: "ja", meaning: "older brother", donor: "Old Japanese", era: "prehistory", contactType: "inherited" }),
  w({ id: "ja-imouto", slug: "imouto", word: "妹", script: "kanji", reading: "imouto", language: "ja", meaning: "little sister", donor: "Old Japanese", era: "prehistory", contactType: "inherited" }),
  w({ id: "ja-ane", slug: "ane", word: "姉", script: "kanji", reading: "ane", language: "ja", meaning: "older sister", donor: "Old Japanese", era: "prehistory", contactType: "inherited" }),
  w({ id: "ja-chichi", slug: "chichi", word: "父", script: "kanji", reading: "chichi", language: "ja", meaning: "father", donor: "Old Japanese", era: "prehistory", contactType: "inherited" }),
  w({ id: "ja-haha", slug: "haha", word: "母", script: "kanji", reading: "haha", language: "ja", meaning: "mother", donor: "Old Japanese", era: "prehistory", contactType: "inherited" }),

  // ---- 500s CE · Romania (South Slavic / Old Church Slavonic) ----
  w({ id: "ro-iubire", slug: "iubire", word: "iubire", script: "latin", language: "ro", meaning: "love", donor: "South Slavic", era: "500s", contactType: "migration", featured: true }),
  w({ id: "ro-dragoste", slug: "dragoste", word: "dragoste", script: "latin", language: "ro", meaning: "love, endearment", donor: "Old Church Slavonic", era: "500s", contactType: "religion" }),
  w({ id: "ro-prieten", slug: "prieten", word: "prieten", script: "latin", language: "ro", meaning: "friend", donor: "Old Church Slavonic", era: "500s", contactType: "religion" }),
  w({ id: "ro-nevasta", slug: "nevasta", word: "nevastă", script: "latin", language: "ro", meaning: "wife", donor: "Old Church Slavonic", era: "500s", contactType: "religion" }),
  w({ id: "ro-sfant", slug: "sfant", word: "sfânt", script: "latin", language: "ro", meaning: "saint", donor: "Old Church Slavonic", era: "500s", contactType: "religion" }),
  w({ id: "ro-slava", slug: "slava", word: "slavă", script: "latin", language: "ro", meaning: "glory, hail", donor: "Old Church Slavonic", era: "500s", contactType: "religion" }),

  // ---- 500s CE · Japan (Middle Chinese, through Buddhism) ----
  w({ id: "ja-ai", slug: "ai", word: "愛", script: "kanji", reading: "ai", language: "ja", meaning: "love", donor: "Middle Chinese", era: "500s", contactType: "religion", featured: true }),
  w({ id: "ja-ningen", slug: "ningen", word: "人間", script: "kanji", reading: "ningen", language: "ja", meaning: "human being", donor: "Middle Chinese", era: "500s", contactType: "religion" }),
  w({ id: "ja-aijou", slug: "aijou", word: "愛情", script: "kanji", reading: "aijou", language: "ja", meaning: "love", donor: "Middle Chinese", era: "500s", contactType: "religion" }),
  w({ id: "ja-yuujou", slug: "yuujou", word: "友情", script: "kanji", reading: "yuujou", language: "ja", meaning: "friendship", donor: "Middle Chinese", era: "500s", contactType: "religion" }),

  // ---- 1400s CE · Romania (Ottoman Turkish) ----
  w({ id: "ro-chiftea", slug: "chiftea", word: "chiftea", script: "latin", language: "ro", meaning: "meatball", donor: "Ottoman Turkish", era: "1400s", contactType: "empire", featured: true }),
  w({ id: "ro-pilaf", slug: "pilaf", word: "pilaf", script: "latin", language: "ro", meaning: "pilaf", donor: "Ottoman Turkish", era: "1400s", contactType: "empire" }),
  w({ id: "ro-ciorba", slug: "ciorba", word: "ciorbă", script: "latin", language: "ro", meaning: "soup", donor: "Ottoman Turkish", era: "1400s", contactType: "empire" }),
  w({ id: "ro-musaca", slug: "musaca", word: "musacă", script: "latin", language: "ro", meaning: "moussaka", donor: "Ottoman Turkish", era: "1400s", contactType: "empire" }),
  w({ id: "ro-cafea", slug: "cafea", word: "cafea", script: "latin", language: "ro", meaning: "coffee", donor: "Ottoman Turkish", era: "1400s", contactType: "empire" }),
  w({ id: "ro-cioban", slug: "cioban", word: "cioban", script: "latin", language: "ro", meaning: "shepherd", donor: "Ottoman Turkish", era: "1400s", contactType: "empire" }),

  // ---- 1600s CE · Romania (Hungarian) ----
  w({ id: "ro-oras", slug: "oras", word: "oraș", script: "latin", language: "ro", meaning: "city", donor: "Hungarian", era: "1600s", contactType: "empire", featured: true }),
  w({ id: "ro-gand", slug: "gand", word: "gând", script: "latin", language: "ro", meaning: "thought", donor: "Hungarian", era: "1600s", contactType: "empire" }),
  w({ id: "ro-gazda", slug: "gazda", word: "gazdă", script: "latin", language: "ro", meaning: "host", donor: "Hungarian", era: "1600s", contactType: "empire" }),
  w({ id: "ro-cheltui", slug: "cheltui", word: "cheltui", script: "latin", language: "ro", meaning: "to spend (money)", donor: "Hungarian", era: "1600s", contactType: "empire" }),
  w({ id: "ro-fel", slug: "fel", word: "fel", script: "latin", language: "ro", meaning: "type, sort", donor: "Hungarian", era: "1600s", contactType: "empire" }),

  // ---- 1600s CE · Japan (Portuguese and Dutch, through trade) ----
  // gloss: ours (his text: "now refers to one specific card game in Japan")
  w({ id: "ja-karuta", slug: "karuta", word: "かるた", script: "kana", reading: "karuta", language: "ja", meaning: "a card game", donor: "Portuguese", era: "1600s", contactType: "trade", featured: true }),
  w({ id: "ja-pan", slug: "pan", word: "パン", script: "kana", reading: "pan", language: "ja", meaning: "bread", donor: "Portuguese", era: "1600s", contactType: "trade" }),
  w({ id: "ja-tabako", slug: "tabako", word: "タバコ", script: "kana", reading: "tabako", language: "ja", meaning: "cigarettes", donor: "Portuguese", era: "1600s", contactType: "trade" }),
  w({ id: "ja-gomu", slug: "gomu", word: "ゴム", script: "kana", reading: "gomu", language: "ja", meaning: "rubber", donor: "Dutch", era: "1600s", contactType: "trade" }),
  w({ id: "ja-randoseru", slug: "randoseru", word: "ランドセル", script: "kana", reading: "randoseru", language: "ja", meaning: "a traditional Japanese hard backpack", donor: "Dutch", era: "1600s", contactType: "trade" }),
  w({ id: "ja-bidama", slug: "bidama", word: "ビー玉", script: "kanji", reading: "bīdama", language: "ja", meaning: "marble", donor: "Portuguese", era: "1600s", contactType: "trade" }),
];
