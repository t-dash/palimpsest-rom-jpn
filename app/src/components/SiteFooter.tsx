import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { en } from "@/content/en";
import { site } from "@/data/site";
import { usesWiktionary } from "@/lib/data";
import { Wordmark } from "./BrandMark";

export function SiteFooter() {
  const c = en.common;
  const linkCls = "inline-flex min-h-11 items-center text-ink no-underline underline-offset-4 hover:underline";
  return (
    <footer className="mt-16 bg-surface">
      <div className="container-site">
        <hr className="stitch" />
      </div>
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <Link to="/" className="inline-flex min-h-11 items-center no-underline">
            <Wordmark />
          </Link>
          <p className="mt-4 max-w-[42ch] text-[length:var(--text-step--1)] text-muted">{c.footerNote}</p>
          <p className="mt-3 text-[length:var(--text-step--1)] text-muted">
            {c.madeBy} {en.credits.people.name}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul>
            {[...c.nav, ...c.footerMore].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {site.contactEmail && (
            <>
              <p className="label text-muted">{c.contact}</p>
              <a href={`mailto:${site.contactEmail}`} className="link mt-2 inline-flex min-h-11 items-center gap-2 break-all">
                <Mail strokeWidth={1.75} className="size-5 shrink-0" aria-hidden="true" />
                {site.contactEmail}
              </a>
            </>
          )}
          {usesWiktionary() && <p className="mt-4 text-[length:var(--text-step--1)] text-muted">{c.wiktionaryCredit}</p>}
        </div>
      </div>
      <div className="border-t border-thread">
        <p className="container-site py-5 text-[length:var(--text-step--1)] text-muted">
          © {new Date().getFullYear()} {en.siteName}
        </p>
      </div>
    </footer>
  );
}
