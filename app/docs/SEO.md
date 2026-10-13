# Search and AI answers — Quilted Languages

How the site gets found on Google and Bing and quoted by AI assistants
(ChatGPT, Claude, Perplexity, Gemini, Copilot).

## What's set up

| Piece | Where | Notes |
|---|---|---|
| Site address | `siteUrl` in `src/data/site.ts` | **Empty until the first Publish.** Then set it to the exact published address (no trailing slash). It drives canonicals, the sitemap, robots and structured data. |
| Page titles and descriptions | `src/content/en.ts` → `meta` | One per page; every word page gets its own ("[word] (reading) — Quilted Languages"). |
| Head tags | `src/lib/seo.ts` | Title, description, robots, Open Graph / Twitter, share image + alt text, canonical, breadcrumbs. |
| Structured data | `src/lib/geo.ts` | Project + WebSite on every page; the word list is a `DefinedTermSet` on /explore; every word page is a `DefinedTerm` linked to it, with its sources. No Person node for Taizo, no reviews, no FAQ. |
| `/robots.txt` | `src/routes/robots[.]txt.ts` | Allows everyone, including AI search crawlers by name. |
| `/sitemap.xml` | `src/routes/sitemap[.]xml.ts` | Every page and every word page. Bump `LASTMOD` when words change. |
| `/llms.txt`, `/llms-full.txt` | `src/routes/llms*.ts` | Plain-text summary for AI tools; the full file lists every word with its sources. Built from words.ts. |
| Share image | `public/og.png` | 1200×630, 85 KB. `npm run brand` rebuilds it and the icons. |
| Icons | `public/favicon*`, `icon-*.png`, `site.webmanifest` | From the two-patch mark. |
| 404 | root `notFoundComponent` | Real 404 status, `noindex`. Words without a source are 404s too. |

## After the first Publish (Herdy)
1. Set `siteUrl` to the real address, publish again.
2. Open `/robots.txt`, `/sitemap.xml`, `/llms.txt` on the live site.
3. Run Lovable's SEO review; fix or list what it finds.
4. Run `node tools/verify_site.mjs <live URL>` (claudinary) — 0 FAIL.
5. Paste the live link into WhatsApp once to check the share preview.

## Search Console and Bing (Taizo, after handover)
1. Google Search Console → add the site (URL prefix) → verify with the HTML
   file method: download the `google….html` file and ask Lovable to put it in
   `public/` unchanged. **Never delete or rename that file.**
2. Sitemaps → submit `sitemap.xml`.
3. URL inspection → request indexing for the home page, /explore and two word
   pages.
4. Bing Webmaster Tools → "Import from Google Search Console" (one click).
   Bing's AI Performance report shows when Copilot cites the site.

## If the address changes (custom domain)
- Set `siteUrl` to the new address and publish.
- In Search Console add the new address, verify, submit the sitemap again.
- Keep the old address published if you can; links in the wild still point
  there.

## Where visitors will really come from
- A new site ranks for its own name first: "Quilted Languages", "Quilted
  Languages Romanian Japanese". Bare phrases like "loanwords" are unrealistic.
- Word pages can rank for specific searches ("[word] etymology Romanian")
  once Google has indexed them — this takes weeks.
- Early visitors come from links: your school, teachers, class chats, your
  social bio, your application. Put the link in every one.
- AI assistants cite pages that are indexed and specific. Sourced word pages
  are exactly that; there's no switch to flip.
