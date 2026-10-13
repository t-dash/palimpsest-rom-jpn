/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { HeadContent, Link, Outlet, Scripts, createRootRoute, useRouter } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { en } from "@/content/en";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { buttonVariants } from "@/components/ui/button";
import { rootGraph } from "@/lib/geo";
import { withBase } from "@/lib/base";

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

/** Any route that throws lands here. Never shows error.message (house rule). */
function RootError() {
  const router = useRouter();
  const c = en.error;
  return (
    <>
      <title>{`${c.title} — ${en.siteName}`}</title>
      <meta name="robots" content="noindex" />
      <main id="main" className="container-site py-16 md:py-24">
        <p className="label text-muted">{en.siteName}</p>
        <h1 className="mt-3 text-[length:var(--text-step-4)]">{c.title}</h1>
        <p className="mt-6 max-w-[52ch] text-muted">{c.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => router.invalidate()} className={buttonVariants({ variant: "primary" })}>
            {c.retry}
          </button>
          <a href={withBase("/explore")} className="link inline-flex min-h-11 items-center">
            {en.notFound.explore}
          </a>
        </div>
      </main>
    </>
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

function RootLayout() {
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
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function NotFound() {
  const c = en.notFound;
  return (
    <>
      <title>{`${c.title} — ${en.siteName}`}</title>
      <meta name="robots" content="noindex" />
      <section className="container-site py-16 md:py-24">
        <p className="label text-muted">404</p>
        <h1 className="mt-3 text-[length:var(--text-step-4)]">{c.title}</h1>
        <p className="mt-6 max-w-[52ch] text-muted">{c.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/explore" className={buttonVariants({ variant: "primary" })}>
            {c.explore}
          </Link>
          <Link to="/" className="link inline-flex min-h-11 items-center">
            {c.home}
          </Link>
        </div>
      </section>
    </>
  );
}
