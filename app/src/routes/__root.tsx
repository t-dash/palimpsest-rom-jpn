/// <reference types="vite/client" />
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { HeadContent, Link, Outlet, Scripts, createRootRoute, useRouter, useRouterState, type ErrorComponentProps } from "@tanstack/react-router";
import appCss from "../styles.css?url";
// The body font (Latin letters, 29 KB) is fetched alongside the CSS instead
// of after it, so the text doesn't shift when it arrives. The heading font is
// not preloaded: at 122 KB it would slow the first paint on phone networks
// (measured 14 Oct 2026 on throttled 4G).
import sansLatin from "@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2?url";
import { en } from "@/content/en";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { rootGraph } from "@/lib/geo";
import { withBase } from "@/lib/base";
import { isLoadError, reloadOnce } from "@/lib/recover";
import { PageHeader } from "@/components/PageHeader";
import { getWords } from "@/lib/data";

// Site head lives here, as in Lovable's template. None of the template's
// defaults (title, author, twitter handle, default share image). No default
// <title>: every route sets its own via src/lib/seo.ts. Site-wide JSON-LD: src/lib/geo.ts.
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#C3CFF2" },
      { name: "color-scheme", content: "light" },
      { property: "og:site_name", content: en.siteName },
      { property: "og:locale", content: "en" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(rootGraph()) }],
    links: [
      { rel: "preload", href: sansLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: withBase("/favicon.ico"), sizes: "48x48" },
      { rel: "icon", href: withBase("/favicon.svg"), type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png") },
      { rel: "manifest", href: withBase("/site.webmanifest") },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

/**
 * Any route that throws lands here, inside the normal header and footer so
 * the logo and the menu stay where they always are. Never shows
 * error.message (house rule). A script file missing after a new publish
 * reloads the page once by itself (src/lib/recover.ts); offline visitors are
 * told so.
 */
function RootError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const c = en.error;
  const offline = useOffline();
  const loadError = isLoadError(error);

  useEffect(() => {
    if (loadError && !offline) reloadOnce();
  }, [loadError, offline]);

  return (
    <Frame>
      <title>{`${offline ? c.offlineTitle : c.title} — ${en.siteName}`}</title>
      <meta name="robots" content="noindex" />
      <PageHeader label={en.siteName} title={offline ? c.offlineTitle : c.title} lede={offline ? c.offlineBody : c.body} rule={false}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => (offline || loadError ? window.location.reload() : router.invalidate())}
            className={buttonVariants({ variant: "primary" })}
          >
            {c.retry}
          </button>
          {/* Plain links: they work even if the page's own scripts failed. */}
          <a href={withBase("/explore/")} className="link inline-flex min-h-11 items-center">
            {en.notFound.explore}
          </a>
          <a href={withBase("/")} className="link inline-flex min-h-11 items-center">
            {c.home}
          </a>
        </div>
      </PageHeader>
    </Frame>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Skip link, top bar, the page, footer: the same frame on every page,
 *  including the error page. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-[6px] bg-ink px-4 py-3 font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {en.common.skipLink}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function RootLayout() {
  const router = useRouter();
  // The page actually on screen (updates once the new page has rendered).
  const pathname = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).pathname });
  const first = useRef(true);

  // Once the first page has settled, fetch the code of every other page in
  // the background (about 13 KB compressed: the words and text are already
  // here). Every click after that is instant, and moving between pages keeps
  // working if the connection drops. Skipped when the reader asked their
  // browser to save data.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? "")) return;
    const run = () => {
      for (const to of ["/", "/blog", "/credits", "/resources", "/explore", "/privacy"] as const)
        router.preloadRoute({ to }).catch(() => {});
      const slug = getWords()[0]?.slug;
      if (slug) router.preloadRoute({ to: "/words/$slug", params: { slug } }).catch(() => {});
    };
    // Safari has no requestIdleCallback: wait a couple of seconds instead.
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 2000);
    return () => (idle ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, [router]);

  // After a page change (not the first load, not filter or #anchor changes):
  // - the new page fades up from 40% (opacity only, so #anchor jumps land
  //   right; off under reduced motion);
  // - keyboard and screen-reader users start at the new page's content, as
  //   after a full page load, not on the link they used.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById("main");
    if (!main) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      main.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 220, easing: "cubic-bezier(0.05, 0.7, 0.1, 1)" });
    if (!window.location.hash) main.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <Frame>
      <Outlet />
    </Frame>
  );
}

function NotFound() {
  const c = en.notFound;
  return (
    <>
      <title>{`${c.title} — ${en.siteName}`}</title>
      <meta name="robots" content="noindex" />
      <PageHeader label="404" title={c.title} lede={c.body} rule={false}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/explore" className={buttonVariants({ variant: "primary" })}>
            {c.explore}
          </Link>
          <Link to="/" className="link inline-flex min-h-11 items-center">
            {c.home}
          </Link>
        </div>
      </PageHeader>
    </>
  );
}

const subscribeOnline = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};
/** True when the browser reports no connection (never during server render). */
function useOffline() {
  return useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false);
}
