/**
 * The site's sub-path: "/" for the normal server build, "/palimpsest-rom-jpn/"
 * for the static GitHub Pages copy (vite.config.ts, STATIC_EXPORT=1).
 * <Link> adds it by itself; plain <a href>, <form action> and head links
 * need withBase().
 */
export const BASE: string = import.meta.env.BASE_URL;

/** True in the static GitHub Pages build: pages are prerendered HTML files. */
export const STATIC_EXPORT = BASE !== "/";

/** "/explore" -> "/palimpsest-rom-jpn/explore" on GitHub Pages. */
export const withBase = (path: string) => BASE.replace(/\/$/, "") + path;

/**
 * Public URL path of a page. On GitHub Pages each page is a folder
 * (blog/index.html), served at "/blog/" — the form canonical links and the
 * sitemap must use, or every link is a redirect.
 */
export function pagePath(path: string) {
  if (!STATIC_EXPORT) return path;
  const m = /^([^?#]*)(.*)$/.exec(path)!;
  const [p, rest] = [m[1], m[2]];
  if (p.endsWith("/") || /\.[a-z0-9]+$/i.test(p)) return path;
  return `${p}/${rest}`;
}
