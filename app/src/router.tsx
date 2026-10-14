import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { STATIC_EXPORT } from "./lib/base";

/**
 * GitHub Pages serves every page as a folder (blog/index.html at /blog/) and
 * answers /blog with a redirect. On the static copy, links are written with
 * the slash, so opening one in a new tab or from a shared link loads the page
 * straight away; inside the router the path stays /blog.
 */
const trailingSlash = {
  input: ({ url }: { url: URL }) => {
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) url.pathname = url.pathname.slice(0, -1);
    return url;
  },
  output: ({ url }: { url: URL }) => {
    if (!url.pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname += "/";
    return url;
  },
};

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // A new page starts at the top at once; smooth scrolling (styles.css) is
    // only for jumps within a page.
    scrollRestorationBehavior: "instant",
    // Pages load their code while the pointer rests on a link, so the click
    // feels instant.
    defaultPreload: "intent",
    defaultPreloadDelay: 30,
    ...(STATIC_EXPORT ? { rewrite: trailingSlash } : {}),
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
