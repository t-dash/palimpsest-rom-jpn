import type { Era } from "./types";

/**
 * Taizo's era sections, from "Capstone_project_content & vision.docx"
 * (13 Oct 2026). Paragraphs are his, verbatim, with only these fixes
 * (listed for him in _internal/log.md):
 *   - capitals: Romanian, Japanese, South Slavic, Balkan, Old Church Slavonic,
 *     China, Middle Chinese, Chinese, Buddhism, Persian, Hungarian,
 *     Portuguese, Dutch, Tokugawa
 *   - spelling: millienia → millennia, Hungarina → Hungarian, portugues →
 *     Portuguese, It's original → Its original, Oras → Oraș, Ciorba → Ciorbă,
 *     Musaca → Musacă, varos → város, var → vár, pao → pão, "Words" → "words"
 *   - the "Word - meaning." lead-in before each paragraph is shown as the
 *     heading instead (the word and its meaning are in words.ts).
 * Not changed (questions for Taizo, see student-email): "fratus" (Latin is
 * frater), and "nin"/"gen" no longer used outside 人間 (nin is common, e.g. 人気).
 *
 * Empty sides (1400s Japan; 1850s, 1950s, 2000s) show "Coming soon".
 * blogTitle empty = the site uses "<Country> · <era>".
 */
const empty = { blogTitle: "", body: [], exampleIds: [], sources: [] };

export const eras: Era[] = [
  {
    id: "prehistory",
    ro: {
      leadWordId: "ro-frate",
      blogTitle: "",
      body: [
        "The word frate, meaning brother, is a very clear direct descendent of the word fratus in Latin, the language which formed the base of the Romanian language. Just like in most other languages, words describing familial relations often were retained by their descendents.",
      ],
      exampleIds: ["ro-sora", "ro-tata", "ro-mama", "ro-fiu", "ro-fiica"],
      sources: [],
    },
    ja: {
      leadWordId: "ja-otouto",
      blogTitle: "",
      body: [
        "The word for little brother, “Otouto” derives from a combination of two older Japanese words, Oto and hito, meaning a young person. This word shifted in pronunciation and meaning over millennia, but is a poster child of the phenomena of familial relation words being retained from mother tongues.",
      ],
      exampleIds: ["ja-ani", "ja-imouto", "ja-ane", "ja-chichi", "ja-haha"],
      sources: [],
    },
  },
  {
    id: "500s",
    ro: {
      leadWordId: "ro-iubire",
      blogTitle: "Romanian in the year 500 - Slavic migrations",
      body: [
        "This Romanian word for love has origins in the South Slavic languages, from which Romanian borrowed extensively over the course of centuries of cross-cultural communication and experience. The South Slavs first migrated to south eastern Europe around the 6th century, and from there spread throughout the Balkan mountain range, bringing with them their unique language. Old Church Slavonic specifically served as the liturgical language in the principalities of Moldavia and Wallachia for many years and marked Romanian permanently with their influence.",
      ],
      exampleIds: ["ro-dragoste", "ro-prieten", "ro-nevasta", "ro-sfant", "ro-slava"],
      sources: [],
    },
    ja: {
      leadWordId: "ja-ai",
      blogTitle: "",
      body: [
        "The word for love most commonly used today in Japan has its origins in medieval China where the Middle Chinese word for love first made its leap onto the Japanese archipelago through the extensive literature of the Chinese intelligentsia and religions, especially Buddhism. Buddhism made its splash in Japan in the 6th century when it was endorsed by prince Shotoku Taishi. Its original usage in Buddhist texts describing attachment and desire has shifted over time.",
        "人間 (ningen) - human being. Interestingly, the readings “nin” and “gen” are no longer used for these characters outside of this context.",
      ],
      exampleIds: ["ja-ningen", "ja-aijou", "ja-yuujou"],
      sources: [],
    },
  },
  {
    id: "1400s",
    ro: {
      leadWordId: "ro-chiftea",
      blogTitle: "",
      body: [
        "This word was borrowed from Ottoman Turkish, which itself borrowed the word from Persian. It’s a pretty easy example to understand - much of modern Romanian cuisine was formed and cemented under Ottoman and Greek rule. Ciorbă, Musacă, pilaf, all common foods in Romania today continue to use the words that the Ottomans first brought to the principalities of Wallachia and Moldova. Food words are common borrowings, and often reflect the culinary neighborhoods of their countries of origin.",
      ],
      exampleIds: ["ro-pilaf", "ro-ciorba", "ro-musaca", "ro-cafea", "ro-cioban"],
      sources: [],
    },
    ja: empty,
  },
  {
    id: "1600s",
    ro: {
      leadWordId: "ro-oras",
      blogTitle: "",
      body: [
        "Romanians lived, for hundreds of years, at the crossroads of multiple empires. While Ottoman, Slavic, and Byzantine influence dominated the southern and eastern principalities of Wallachia and Moldova, the Transylvanian principality, which also had many Romanians, existed as part of a vast Hungarian Kingdom for many years, introducing many words from yet another non-romance language into Romanian. The word for city, Oraș, comes from the Hungarian város, which itself comes from vár, the Hungarian word for castle. Political, historical and linguistic relationships helped to form the diversity of the Romanian language today.",
      ],
      exampleIds: ["ro-gand", "ro-gazda", "ro-cheltui", "ro-fel"],
      sources: [],
    },
    ja: {
      leadWordId: "ja-karuta",
      blogTitle: "",
      body: [
        "By the 1600s, Japan had started opening up to the world, albeit very slowly, and only to very specific groups, and only in very specific ports. So maybe they weren’t really opening up. Nevertheless, Portuguese and Dutch made a mark on Japanese through their early loanwords in the fields of science, industry, and western imports to the medieval Tokugawa shogunate. かるた (karuta) was once the Portuguese word for cards (cartas) and now refers to one specific card game in Japan, after centuries of shifting meanings.",
        "ビー玉 (bīdama) - marble, a half-Portuguese (vidro, glass) and half Japanese 玉 (tama, ball) word that shows the way linguistic barriers are really only half as real as we make them out to be.",
      ],
      exampleIds: ["ja-pan", "ja-tabako", "ja-gomu", "ja-randoseru", "ja-bidama"],
      sources: [],
    },
  },
  { id: "1850s", ro: empty, ja: empty },
  { id: "1950s", ro: empty, ja: empty },
  { id: "2000s", ro: empty, ja: empty },
];
