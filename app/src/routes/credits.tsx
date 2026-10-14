import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { en } from "@/content/en";
import { ComingSoon } from "@/components/ComingSoon";
import { Foreign } from "@/components/Words";
import { PageHeader } from "@/components/PageHeader";
import { getSources, usesWiktionary } from "@/lib/data";
import { seo } from "@/lib/seo";

// Taizo's Credits page (design doc): "Simple text down the middle detailing
// people who worked on the projects, as well as sources for visual and
// textual materials." Text sources are generated from words.ts.
export const Route = createFileRoute("/credits")({
  head: () => seo("/credits", en.meta.credits, { crumbs: [{ name: en.meta.credits.title, path: "/credits" }], pageType: "AboutPage" }),
  loader: () => ({
    sources: getSources().map((s) => ({ ...s, words: s.words.map((w) => ({ slug: w.slug, word: w.word, language: w.language })) })),
    wiktionary: usesWiktionary(),
  }),
  component: Credits,
});

function Credits() {
  const c = en.credits;
  const { sources, wiktionary } = Route.useLoaderData();
  const dex = sources.some((s) => new URL(s.url).hostname.endsWith("dexonline.ro"));

  return (
    <>
      <PageHeader title={c.title} lede={c.lede} align="center" />
      <div className="container-site py-10 md:py-14">
        <div className="mx-auto grid max-w-[44rem] gap-14 text-center">
          <section aria-labelledby="made-by">
            <h2 id="made-by" className="text-[length:var(--text-step-2)]">
              {c.people.title}
            </h2>
            <p className="mt-4 font-display text-[length:var(--text-step-2)]">{c.people.name}</p>
            <p className="text-muted">{c.people.role}</p>
            {c.people.others.length > 0 ? (
              <ul className="mt-6 grid gap-3">
                {c.people.others.map((p) => (
                  <li key={p.name}>
                    <span className="font-semibold">{p.name}</span> <span className="text-muted">— {p.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ComingSoon line={c.people.othersEmpty} className="mx-auto mt-6 text-left" />
            )}
          </section>

          <section aria-labelledby="why-project">
            <h2 id="why-project" className="text-[length:var(--text-step-2)]">
              {c.why.title}
            </h2>
            <blockquote className="mx-auto mt-4 max-w-[38rem] font-display text-[length:var(--text-step-1)] leading-snug">
              {c.why.goal}
            </blockquote>
            <p className="mx-auto mt-6 max-w-[38rem] text-muted">{en.home.why.problem}</p>
          </section>

          <section aria-labelledby="text-sources">
            <h2 id="text-sources" className="text-[length:var(--text-step-2)]">
              {c.text.title}
            </h2>
            {sources.length === 0 ? (
              <ComingSoon line={c.text.empty} className="mx-auto mt-4 text-left" />
            ) : (
              <ul className="mt-4 grid gap-4 text-left">
                {sources.map((s) => (
                  <li key={s.url} className="border-b border-mist pb-4">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-baseline gap-1.5">
                      {s.title}
                      <ExternalLink strokeWidth={1.75} className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                      <span className="sr-only">{en.common.opensInNewTab}</span>
                    </a>
                    <p className="mt-1 text-[length:var(--text-step--1)] text-muted">
                      {c.text.citedBy(s.words.length)}:{" "}
                      {s.words.map((w, i) => (
                        <span key={w.slug}>
                          {i > 0 && ", "}
                          <Link to="/words/$slug" params={{ slug: w.slug }} className="link">
                            <Foreign word={w} />
                          </Link>
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {(dex || wiktionary) && (
              <div className="mt-6 grid gap-2 text-[length:var(--text-step--1)] text-muted">
                {dex && <p>{c.attribution.dex}</p>}
                {wiktionary && <p>{en.common.wiktionaryCredit}</p>}
              </div>
            )}
          </section>

          <section aria-labelledby="visual-sources">
            <h2 id="visual-sources" className="text-[length:var(--text-step-2)]">
              {c.visual.title}
            </h2>
            <ul className="mt-4 grid gap-2">
              {c.visual.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
