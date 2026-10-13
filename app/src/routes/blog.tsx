import { useEffect, useRef } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Menu } from "lucide-react";
import { en } from "@/content/en";
import { ComingSoon } from "@/components/ComingSoon";
import { Foreign } from "@/components/Words";
import { getEras, type EraSideView } from "@/lib/data";
import { seo } from "@/lib/seo";

// Taizo's blog (design doc): one long page "formulated like a google doc" —
// a hamburger on the left opens a scrollable contents list; each section has
// its citations at its own end. Sections share anchors with the home timeline
// ("ro-500s"), so the header's Blog button lands on the era being read.
export const Route = createFileRoute("/blog")({
  head: () => seo("/blog", en.meta.blog, { crumbs: [{ name: en.meta.blog.title, path: "/blog" }], pageType: "CollectionPage" }),
  loader: () => ({ eras: getEras() }),
  component: Blog,
});

function Blog() {
  const c = en.blog;
  const { eras } = Route.useLoaderData();
  const groups = eras
    .map((e) => ({ id: e.id, label: e.label, sides: [e.ro, e.ja].filter((s) => s.body.length > 0) }))
    .filter((g) => g.sides.length > 0);
  const tocRef = useRef<HTMLDetailsElement>(null);

  // The contents panel starts open (server HTML, works without JS); on
  // phones it closes after load so the text comes first.
  useEffect(() => {
    if (tocRef.current && window.matchMedia("(max-width: 1023px)").matches) tocRef.current.open = false;
  }, []);

  return (
    <div className="container-site py-10 md:py-14">
      <h1 className="text-[length:var(--text-step-4)]">{c.title}</h1>
      <p className="mt-4 max-w-[56ch] text-[length:var(--text-step-1)] leading-snug text-muted">{c.lede}</p>

      {groups.length === 0 ? (
        <ComingSoon line={c.empty} className="mt-10" />
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <details ref={tocRef} open className="group rounded-[6px] border border-mist bg-surface">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <Menu strokeWidth={1.75} className="size-5" aria-hidden="true" />
                {c.contents}
              </summary>
              <nav aria-label={c.contents} className="max-h-[70svh] overflow-y-auto border-t border-mist px-4 py-3">
                <ol className="grid gap-4">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <p className="label text-muted">{g.label}</p>
                      <ul className="mt-1 grid">
                        {g.sides.map((s) => (
                          <li key={s.anchor}>
                            <a href={`#${s.anchor}`} className="flex min-h-11 items-center leading-snug text-ink no-underline hover:underline">
                              {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          </aside>

          <div className="grid gap-16">
            {groups.flatMap((g) => g.sides.map((s) => <BlogSection key={s.anchor} side={s} />))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlogSection({ side }: { side: EraSideView }) {
  const c = en.blog;
  const lead = side.lead;
  return (
    <section id={side.anchor} aria-labelledby={`${side.anchor}-title`} className="scroll-mt-6">
      <p className="label text-muted">
        {en.panels[side.language]} · {en.eras[side.era]}
      </p>
      <h2 id={`${side.anchor}-title`} className="mt-2 text-[length:var(--text-step-3)]">
        {side.title}
      </h2>
      {lead && (
        <p className="mt-3 text-[length:var(--text-step-1)]">
          <Link to="/words/$slug" params={{ slug: lead.slug }} className="link font-display font-semibold">
            <Foreign word={lead} />
          </Link>
          {lead.reading && <span className="ml-2 text-muted">{lead.reading}</span>}
          <span className="text-muted"> — {lead.meaning}</span>
        </p>
      )}
      <div className="prose-site mt-6">
        {side.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {side.examples.length > 0 && (
        <div className="mt-8">
          <h3 className="label font-sans text-muted">{c.examples}</h3>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {side.examples.map((w) => (
              <li key={w.id}>
                <Link to="/words/$slug" params={{ slug: w.slug }} className="flex min-h-11 items-baseline gap-2 text-ink no-underline hover:underline">
                  <Foreign word={w} className="font-semibold" />
                  {w.reading && <span className="text-muted">{w.reading}</span>}
                  <span className="text-muted">— {w.meaning}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations at the end of each section (Taizo's design doc). */}
      <div className="mt-8 border-t-2 border-dashed border-mist pt-5">
        <h3 className="label font-sans text-muted">{c.sources}</h3>
        {side.sources.length ? (
          <ol className="mt-3 grid list-decimal gap-2 pl-6">
            {side.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-baseline gap-1.5">
                  {s.title}
                  <ExternalLink strokeWidth={1.75} className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                  <span className="sr-only">{en.common.opensInNewTab}</span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-muted">{c.sourcesPending}</p>
        )}
      </div>

      <Link to="/" hash={side.anchor} className="link mt-6 inline-flex min-h-11 items-center">
        {c.backToTimeline}
      </Link>
    </section>
  );
}
