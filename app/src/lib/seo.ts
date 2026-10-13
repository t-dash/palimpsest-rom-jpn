import { en } from "@/content/en";
import { site } from "@/data/site";
import { webPage } from "@/lib/geo";
import { pagePath, withBase } from "@/lib/base";

const ld = (o: unknown) => ({ type: "application/ld+json", children: JSON.stringify(o) });
const SUFFIX = ` — ${en.siteName}`;

/** Cut at a word so it fits, without adding an ellipsis character. */
export function fit(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const at = cut.lastIndexOf(" ");
  return (at > 0 ? cut.slice(0, at) : text.slice(0, max)).replace(/[\s,;:.—-]+$/, "");
}

/** "[Page] — Quilted Languages", ≤ 60 characters; drops the suffix if it won't fit. */
export function pageTitle(name: string) {
  if (name.includes(en.siteName)) return fit(name, 60);
  return name.length + SUFFIX.length <= 60 ? `${name}${SUFFIX}` : fit(name, 60);
}

/**
 * Per-route head: title, description, robots, Open Graph/Twitter with the
 * share image and its alt text, a WebPage-type JSON-LD node, any extra
 * JSON-LD, and — once site.siteUrl is set — canonical, og:url, absolute image
 * URLs and a BreadcrumbList for inner pages.
 */
export function seo(
  path: string,
  meta: { title: string; description: string },
  opts: {
    crumbs?: { name: string; path: string }[];
    pageType?: string;
    extra?: unknown[];
  } = {},
) {
  const base = site.siteUrl;
  const url = base ? `${base}${pagePath(path)}` : "";
  const title = pageTitle(meta.title);
  const description = fit(meta.description, 155);
  const image = base ? `${base}/og.png` : withBase("/og.png");
  const alt = en.meta.ogAlt;
  const breadcrumb =
    base && opts.crumbs?.length
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ name: en.siteName, path: "/" }, ...opts.crumbs].map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: `${base}${pagePath(c.path)}`,
          })),
        }
      : null;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: alt },
      ...(url ? [{ property: "og:url", content: url }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: alt },
    ],
    links: url ? [{ rel: "canonical", href: url }] : [],
    scripts: [
      ld(webPage(path, title, description, opts.pageType)),
      ...(breadcrumb ? [ld(breadcrumb)] : []),
      ...(opts.extra ?? []).filter(Boolean).map(ld),
    ],
  };
}
