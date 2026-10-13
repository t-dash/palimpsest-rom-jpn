import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// STATIC_EXPORT=1 builds a static copy for GitHub Pages
// (https://t-dash.github.io/palimpsest-rom-jpn/): every page is prerendered
// to HTML under the repo's sub-path. Without it, the build is the normal
// server-rendered one (Lovable / `npm run start`).
const staticExport = process.env.STATIC_EXPORT === "1";
const base = staticExport ? "/palimpsest-rom-jpn/" : "/";

export default defineConfig({
  base,
  server: { port: 8080, host: "::" },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(
      staticExport
        ? {
            prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: true, failOnError: true },
            pages: [
              { path: "/robots.txt" },
              { path: "/sitemap.xml" },
              { path: "/llms.txt" },
              { path: "/llms-full.txt" },
            ],
          }
        : {},
    ),
    viteReact(),
  ],
});
