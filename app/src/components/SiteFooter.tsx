import { Link } from "@tanstack/react-router";
import { en } from "@/content/en";
import { site } from "@/data/site";
import { usesWiktionary } from "@/lib/data";
import { Wordmark } from "./BrandMark";

/**
 * A slim lighter-blue bar that mirrors the top bar: the wordmark and every
 * page (also the no-JavaScript menu, #footer-nav), then one quiet line with
 * the year and Taizo's name. Pages bring their own space above it.
 */
export function SiteFooter() {
  const c = en.common;
  const linkCls =
    "inline-flex min-h-11 items-center text-ink no-underline decoration-1 underline-offset-4 hover:underline aria-[current=page]:font-semibold";
  return (
    <footer className="border-t border-mist bg-bar">
      <div className="container-site py-6 md:py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-8">
          <Link to="/" className="inline-flex min-h-11 items-center self-start no-underline md:self-auto">
            <Wordmark />
          </Link>
          <nav id="footer-nav" aria-label="Footer">
            <ul className="grid grid-cols-3 gap-x-4 md:flex md:flex-wrap md:justify-end md:gap-x-7">
              {[...c.nav, ...c.footerMore].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} activeOptions={{ exact: item.to === "/" }} className={linkCls}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-dashed border-muted/35 pt-4 text-[length:var(--text-step--1)] text-muted md:mt-5">
          <p>
            {/* The year is worked out when the page loads, so a page built in one
                year and read in the next doesn't trip React's hydration check. */}
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {en.siteName}
          </p>
          {site.contactEmail && (
            <p>
              {c.contact}{" "}
              <a href={`mailto:${site.contactEmail}`} className="link break-all">
                {site.contactEmail}
              </a>
            </p>
          )}
          <p>
            {c.madeBy} <span className="font-semibold text-ink">{en.credits.people.name}</span>
          </p>
        </div>
        {usesWiktionary() && <p className="mt-2 max-w-[70ch] text-[length:var(--text-step--1)] text-muted">{c.wiktionaryCredit}</p>}
      </div>
    </footer>
  );
}
