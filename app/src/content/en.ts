import { draft } from "./draft";

/**
 * All visible English copy. Taizo's own words (from his "Program Concept One
 * Pager" and "Capstone_project_content & vision", 13 Oct 2026) are placed
 * verbatim and marked TAIZO; spelling fixes are listed in _internal/log.md.
 * An empty TAIZO field shows the designed "Coming soon" state, never a
 * placeholder. Everything wrapped in draft() is our wording, for him to
 * approve or replace. His era paragraphs live in src/data/eras.ts.
 */
export const en = {
  siteName: "Quilted Languages",

  common: {
    /** TAIZO: his four buttons, in his order. */
    nav: [
      { to: "/", label: "Home" },
      { to: "/blog", label: "Blog" },
      { to: "/credits", label: "Credits" },
      { to: "/resources", label: "Resources" },
    ],
    footerMore: [
      { to: "/explore", label: "All words" },
      { to: "/privacy", label: "Privacy" },
    ],
    menu: "Menu",
    closeMenu: "Close",
    skipLink: "Skip to content",
    comingSoon: "Coming soon",
    opensInNewTab: "(opens in a new tab)",
    madeBy: "Made by",
    contact: "Contact",
    wiktionaryCredit: draft(
      "Some entries draw on Wiktionary, used under the Creative Commons Attribution-ShareAlike licence (CC BY-SA 4.0).",
    ),
  },

  languages: {
    ro: "Romanian",
    ja: "Japanese",
  },
  /** Where each language's words sit in the quilt. */
  panels: {
    ro: "Romania",
    ja: "Japan",
  },
  /** Taizo's era sections, in his words. */
  eras: {
    prehistory: "Pre-history",
    "500s": "500s CE",
    "1400s": "1400s CE",
    "1600s": "1600s CE",
    "1850s": "1850s CE",
    "1950s": "1950s CE",
    "2000s": "2000s CE",
  },
  contactTypes: {
    inherited: "Inherited",
    migration: "Migration",
    empire: "Empire",
    trade: "Trade",
    religion: "Religion",
    modern: "Modern contact",
  },
  confidence: {
    attested: "Attested",
    disputed: "Disputed",
  },

  /** Search titles (≤ 60 with " — Quilted Languages") and descriptions (≤ 155). */
  meta: {
    ogAlt: draft("Quilted Languages: a quilt of patches in many colours and patterns, one for each loanword in Romanian and Japanese."),
    home: {
      title: "Quilted Languages — loanwords in Romanian and Japanese",
      /** TAIZO: his "idea in 140 characters", cut to fit. */
      description:
        "A website using etymologies and loanwords in Japanese and Romanian to display the ultimately unifying aspects of languages.",
    },
    explore: {
      title: "All words",
      description: draft(
        "Search every word in Quilted Languages by language, the language it came from, era and kind of contact.",
      ),
    },
    blog: {
      title: "Blog",
      description: draft("The longer stories behind each word in Quilted Languages, era by era, for Romania and Japan, with the sources for each section."),
    },
    credits: {
      title: "Credits",
      description: draft("Who made Quilted Languages, why, and the sources for its words, maps and fonts."),
    },
    resources: {
      title: "Resources",
      description: draft("Teaching materials and further reading about loanwords in Romanian and Japanese."),
    },
    privacy: {
      title: "Privacy",
      description: draft("Quilted Languages has no forms, accounts or cookies of its own. What the site and its host collect."),
    },
    word: (w: { word: string; reading?: string; language: "ro" | "ja"; meaning: string; donor: string }) => ({
      title: `${w.word}${w.reading ? ` (${w.reading})` : ""}`,
      description: `${w.language === "ro" ? "Romanian" : "Japanese"} word meaning “${w.meaning}”, from ${w.donor}. Where it came from, when, and the sources.`,
    }),
  },

  home: {
    /** TAIZO: title and tag line, as in his design doc. */
    title: "Quilted Languages",
    tagline: "How empires shaped the words of Romania and Japan",
    /** TAIZO: "The idea in 140 characters" (one-pager), verbatim. */
    intro:
      "A website using etymologies and loanwords in Japanese and Romanian to display the ultimately unifying aspects of languages that are often used as national identifiers in opposition to neighbors or other nearby language/cultural groups.",
    scrollCue: draft("Scroll through time"),
    globeLabel: {
      world: draft("A globe turning slowly, with Romania and Japan marked."),
      ro: draft("A globe turned to Romania."),
      ja: draft("A globe turned to Japan."),
    },
    eras: {
      label: draft("Through time"),
      title: draft("Words through the eras"),
      switchTo: (country: string) => `Switch to ${country}`,
      showing: (country: string) => `Showing ${country}`,
      readMore: draft("Read more in the blog"),
      examples: draft("More words like this"),
      empty: draft("This part of the story is still being written."),
      nav: draft("Jump to an era"),
    },
    quilt: {
      title: draft("Every word, sewn together"),
      lede: draft(
        "One patch is one word. Romanian words sit on the Romania side, Japanese words on the Japan side, sewn together down the middle. The colour and the pattern both name the language a word came from.",
      ),
      empty: draft("Words are being added. Each one joins the quilt as it comes in."),
      legendTitle: "Languages the words came from",
      words: (n: number) => (n === 1 ? "1 word" : `${n} words`),
      /** Quilt panel count; "40 of 100 words" when the Home quilt is capped. */
      panelCount: (shown: number, total: number) =>
        shown === total ? (total === 1 ? "1 word" : `${total} words`) : `${shown} of ${total} words`,
      all: "Search all words",
    },
    why: {
      title: draft("Why this project"),
      /** TAIZO: "Problem" from the one-pager, verbatim. */
      problem:
        "Language as a tool of nationalism is often if not universally used in contrast or opposition to other languages and “foreign influence” but this perception of a nation’s language as a native endeavor without outside input is completely impossible and illogical even in deeply isolationist/nationalized languages like Romanian and Japanese and people aren’t aware enough of that.",
      more: draft("Who made this"),
    },
  },

  explore: {
    label: draft("The word list"),
    title: "All words",
    lede: draft(
      "Search for a word, or narrow the list by language, the language it came from, period and kind of contact.",
    ),
    empty: draft("The word list is being written. Words appear here as they are added."),
    searchLabel: "Search words",
    searchHint: draft("Romanian or Japanese, with or without accents; kana or romaji."),
    filters: "Filters",
    language: "Language",
    donor: "Came from",
    period: "Era",
    contactType: "Contact",
    any: "Any",
    sort: "Sort",
    sortOptions: {
      word: "A–Z",
      period: "By era",
      donor: "By source language",
    },
    apply: "Show words",
    clear: "Clear filters",
    count: (n: number, total: number) => (n === total ? `${total} words` : `${n} of ${total} words`),
    noResults: "No words match these filters.",
  },

  word: {
    meaning: "Meaning",
    reading: "Reading",
    from: "Came from",
    route: "Route",
    direct: "Direct",
    via: (lang: string) => `Via ${lang}`,
    period: "Era",
    contact: "Contact",
    example: "Example",
    sources: "Sources",
    sourcesPending: draft("Sources for this word are coming soon."),
    readInBlog: (era: string) => `Read the ${era} story in the blog`,
    disputed: {
      title: "Disputed origin",
      lede: draft("Scholars disagree about where this word came from. Each view is shown with its own sources."),
      view: (n: number) => `View ${n}`,
    },
    related: "Related words",
    back: "All words",
  },

  blog: {
    title: "Blog",
    lede: draft("The longer story behind each word, era by era. Sources are listed at the end of each section."),
    contents: "Contents",
    openContents: "Open contents",
    closeContents: "Close contents",
    sources: "Sources",
    sourcesPending: draft("Sources for this section are coming soon."),
    examples: draft("Other words from this time"),
    backToTimeline: draft("Back to the timeline"),
    empty: draft("The blog is being written."),
  },

  credits: {
    title: "Credits",
    lede: draft("The people behind Quilted Languages, why it exists, and where its words, maps and fonts come from."),
    people: {
      title: draft("Made by"),
      /** Name as Taizo wants it shown (confirm full name vs first name). */
      name: "Taizo Wiggins",
      role: draft("Research, writing and concept"),
      /** TAIZO: "Me!! My advisor, any people I ask to code or make art" — names to come. */
      others: [] as { name: string; role: string }[],
      othersEmpty: draft("More names, including Taizo's advisor, are coming soon."),
    },
    why: {
      title: draft("Why this project"),
      /** TAIZO: "Learning goal" from the one-pager, verbatim (2 spelling fixes). */
      goal: "I want the audience to renew their understanding of “national” languages as products of collaboration, borrowing and trade internationally as opposed to compartmentalized individualistic native inventions.",
    },
    text: {
      title: draft("Sources for the words"),
      empty: draft("Sources for the words are coming soon. Each word and blog section will list its own."),
      citedBy: (n: number) => (n === 1 ? "cited by 1 word" : `cited by ${n} words`),
    },
    visual: {
      title: draft("Maps, fonts and images"),
      items: [
        draft("Globe outlines: Natural Earth, public domain (via the world-atlas package)."),
        draft("Fonts: Source Serif 4, Source Sans 3 and Noto Sans JP, under the SIL Open Font License."),
        draft("The quilt patterns and icons were drawn for this site."),
      ],
    },
    attribution: {
      dex: draft("Romanian entries link to DEX online, the online dictionary of the Romanian language (dexonline.ro)."),
    },
  },

  resources: {
    title: "Resources",
    lede: draft("Materials for teaching and further reading."),
    empty: draft("Teaching materials and further reading are coming soon."),
    open: "Open",
    pdf: "PDF",
  },

  privacy: {
    title: "Privacy",
    lede: draft("What this site collects about you: very little."),
    sections: [
      {
        title: draft("What we collect"),
        body: draft(
          "There are no forms, sign-ups or accounts on this site. When you search the word list, your search goes into the page address so you can share it; the site doesn't save it.",
        ),
      },
      {
        title: draft("Cookies and fonts"),
        body: draft(
          "The site's own code sets no cookies and stores nothing on your device. Its fonts are served from this site, not from a font service.",
        ),
      },
      {
        title: draft("Hosting"),
        body: draft(
          "The site is hosted on GitHub Pages. Like most hosts, GitHub may record basic visit information, such as visitors' IP addresses, to keep the service secure and running.",
        ),
      },
      {
        title: draft("Links to other sites"),
        body: draft("Source links open dictionaries and other sites. Those sites have their own privacy policies."),
      },
    ],
    contact: draft("Questions about privacy:"),
  },

  error: {
    title: "Something went wrong",
    body: draft("This page didn't load. Try again, or go back to the word list."),
    retry: "Try again",
    offlineTitle: "You're offline",
    offlineBody: draft("This page needs an internet connection to load. Check your connection, then try again."),
    home: "Back to Quilted Languages",
  },

  notFound: {
    title: "Page not found",
    body: draft("This page isn't here. The word may have moved, or the link may have a typo."),
    explore: "Explore the words",
    home: "Back to Quilted Languages",
  },
};

export type Copy = typeof en;
