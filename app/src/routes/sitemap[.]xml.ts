import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/data/site";
import { publicRoutes } from "@/lib/geo";
import { getWords } from "@/lib/data";
import { pagePath } from "@/lib/base";

/** Last change to the site's wording or word list. Bump it when words.ts or
 *  the page text changes (words have no dates of their own). */
const LASTMOD = "2026-10-13";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = site.siteUrl || new URL(request.url).origin;
        const urls = [...publicRoutes.map((r) => r.path), ...getWords().map((w) => `/words/${w.slug}`)];
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${origin}${pagePath(u)}</loc><lastmod>${LASTMOD}</lastmod></url>`).join("\n") +
          `\n</urlset>\n`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
