/**
 * Structured data (JSON-LD) and AI-readable text for Quilted Languages.
 *
 * Built only from src/content/en.ts, src/data/words.ts and src/data/site.ts,
 * so it fills itself in as Taizo adds words. Rules (claudinary
 * references/search-and-ai.md):
 * - The word list is a DefinedTermSet; each word page is a DefinedTerm with
 *   inDefinedTermSet. Only words that pass the source rules are included.
 * - No Person node for Taizo (a student; possibly under 18). His name is on
 *   the page, not in the graph.
 * - No reviews, ratings, FAQPage or legal status.
 * - Wikipedia links in knowsAbout are for disambiguation only.
 */
import { en } from "@/content/en";
import { site } from "@/data/site";
import type { Word } from "@/data/types";
import { eraLabel, getEras, getSources, getWords } from "@/lib/data";
import { pagePath } from "@/lib/base";

export const topics = [
  { "@type": "Thing", name: "Loanword", sameAs: "https://en.wikipedia.org/wiki/Loanword" },
  { "@type": "Thing", name: "Etymology", sameAs: "https://en.wikipedia.org/wiki/Etymology" },
  { "@type": "Thing", name: "Language contact", sameAs: "https://en.wikipedia.org/wiki/Language_contact" },
  { "@type": "Language", name: "Romanian", sameAs: "https://en.wikipedia.org/wiki/Romanian_language" },
  { "@type": "Language", name: "Japanese", sameAs: "https://en.wikipedia.org/wiki/Japanese_language" },
];

export const abs = (path: string) => (site.siteUrl ? `${site.siteUrl}${pagePath(path)}` : path);
const id = (frag: string) => (site.siteUrl ? { "@id": `${site.siteUrl}/#${frag}` } : {});
const projectRef = () => (site.siteUrl ? { "@id": `${site.siteUrl}/#project` } : { "@type": "Project", name: en.siteName });
const setRef = () =>
  site.siteUrl ? { "@id": abs("/explore#words") } : { "@type": "DefinedTermSet", name: `${en.siteName} word list` };

export const audience = {
  "@type": "PeopleAudience",
  suggestedMinAge: 13,
  suggestedMaxAge: 19,
  audienceType: "Teenagers interested in languages and history",
};

/** Root graph on every page: the project and the website. */
export function rootGraph() {
  // The home page's address as its canonical link writes it (with the "/").
  const url = site.siteUrl ? abs("/") : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Project",
        ...id("project"),
        name: en.siteName,
        description: en.meta.home.description,
        ...(url ? { url, logo: `${url}/icon-512.png`, image: `${url}/og.png` } : {}),
        knowsAbout: topics,
        audience,
        ...(site.contactEmail ? { email: site.contactEmail } : {}),
      },
      {
        "@type": "WebSite",
        ...id("website"),
        name: en.siteName,
        ...(url ? { url } : {}),
        inLanguage: "en",
        publisher: projectRef(),
      },
    ],
  };
}

/** One WebPage-type node per route. */
export function webPage(path: string, name: string, description: string, type = "WebPage") {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    inLanguage: "en",
    about: topics,
    ...(site.siteUrl ? { url: abs(path), isPartOf: { "@id": `${site.siteUrl}/#website` } } : {}),
  };
}

/** The word list, on /explore. Null while there are no words. */
export function wordSetLd(words: Word[]) {
  if (!words.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    ...(site.siteUrl ? { "@id": abs("/explore#words"), url: abs("/explore") } : {}),
    name: `${en.siteName} word list`,
    description: en.meta.explore.description,
    inLanguage: ["ro", "ja"],
    publisher: projectRef(),
    hasDefinedTerm: words.map((w) => ({
      "@type": "DefinedTerm",
      name: w.word,
      inLanguage: w.language,
      ...(site.siteUrl ? { url: abs(`/words/${w.slug}`) } : {}),
    })),
  };
}

/** One word page. */
export function wordLd(w: Word) {
  const sources = [...w.sources, ...(w.views ?? []).flatMap((v) => v.sources)];
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: w.word,
    ...(w.reading ? { alternateName: w.reading } : {}),
    description: w.meaning,
    inLanguage: w.language,
    inDefinedTermSet: setRef(),
    termCode: w.slug,
    ...(site.siteUrl ? { url: abs(`/words/${w.slug}`) } : {}),
    subjectOf: sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  };
}

/* ------------------------------------------------------------------ */
/* Routes, llms.txt and llms-full.txt                                  */
/* ------------------------------------------------------------------ */

export const publicRoutes: { path: string; name: string; description: string }[] = [
  { path: "/", name: en.siteName, description: en.meta.home.description },
  { path: "/blog", name: en.meta.blog.title, description: en.meta.blog.description },
  { path: "/credits", name: en.meta.credits.title, description: en.meta.credits.description },
  { path: "/resources", name: en.meta.resources.title, description: en.meta.resources.description },
  { path: "/explore", name: en.meta.explore.title, description: en.meta.explore.description },
  { path: "/privacy", name: en.meta.privacy.title, description: en.meta.privacy.description },
];

export function llmsTxt(origin: string) {
  const base = site.siteUrl || origin;
  const words = getWords();
  const lines = [
    `# ${en.siteName}`,
    "",
    `> ${en.meta.home.description}`,
    "",
    en.home.intro,
    "",
    `- Made by ${en.credits.people.name}, a student project.`,
    "- Organised by era (Pre-history to the 2000s), with a Romania side and a Japan side; the blog has the longer story for each.",
    "- Each word and blog section lists the sources it cites; some sources are still being added.",
    "- Disputed etymologies are marked disputed and show each view with its own sources.",
    "- The site collects nothing from visitors: no forms, accounts or cookies of its own.",
    "",
    "## Pages",
    ...publicRoutes.map((r) => `- [${r.name}](${base}${pagePath(r.path)}): ${r.description}`),
  ];
  if (words.length) {
    lines.push("", `## Words (${words.length})`);
    for (const w of words)
      lines.push(
        `- [${w.word}${w.reading ? ` (${w.reading})` : ""}](${base}${pagePath(`/words/${w.slug}`)}): ${en.languages[w.language]}, “${w.meaning}”, from ${w.donor}, ${eraLabel(w.era)}${w.confidence === "disputed" ? " (disputed)" : ""}`,
      );
    lines.push("", `Every word with its sources: ${base}/llms-full.txt`);
  }
  lines.push("");
  return lines.join("\n");
}

export function llmsFullTxt(origin: string) {
  const base = site.siteUrl || origin;
  const out = [llmsTxt(origin)];
  for (const w of getWords()) {
    const facts = [
      `Language: ${en.languages[w.language]}`,
      ...(w.reading ? [`Reading: ${w.reading}`] : []),
      `Meaning: ${w.meaning}`,
      `Came from: ${w.donor}`,
      `Route: ${w.route === "via" && w.via ? `via ${w.via}` : "direct"}`,
      `Era: ${eraLabel(w.era)}`,
      ...(w.contactType ? [`Contact: ${en.contactTypes[w.contactType]}`] : []),
      `Confidence: ${en.confidence[w.confidence]}`,
    ];
    const views = (w.views ?? []).map(
      (v, i) => `View ${i + 1}: ${v.view}\n${v.sources.map((s) => `  - ${s.title} ${s.url}`).join("\n")}`,
    );
    out.push(
      `\n---\n\n# ${w.word}\n\nURL: ${base}${pagePath(`/words/${w.slug}`)}\n${facts.join("\n")}\n${views.length ? `\n${views.join("\n")}\n` : ""}\nSources:\n${w.sources.map((s, i) => `${i + 1}. ${s.title} ${s.url}`).join("\n")}`,
    );
  }
  for (const era of getEras()) {
    for (const side of [era.ro, era.ja]) {
      if (!side.body.length) continue;
      const cites = side.sources.map((s, i) => `${i + 1}. ${s.title} ${s.url}`).join("\n");
      out.push(
        [
          "\n---\n",
          `# ${side.title}\n`,
          `${en.panels[side.language]} · ${era.label}`,
          `URL: ${base}${pagePath(`/blog#${side.anchor}`)}\n`,
          side.body.join("\n\n"),
          ...(cites ? [`\nSources:\n${cites}`] : []),
        ].join("\n"),
      );
    }
  }
  const all = getSources();
  if (all.length) out.push(`\n---\n\n# All sources\n\n${all.map((s) => `- ${s.title} ${s.url}`).join("\n")}`);
  return out.join("\n") + "\n";
}
