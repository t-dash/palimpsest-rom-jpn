import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/data/site";

// Search and AI-answer crawlers are allowed explicitly so Quilted Languages
// can be found and cited. Nothing on the site is private (no /admin).
const AI_BOTS = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = site.siteUrl || new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, "Allow: /", ""]),
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
