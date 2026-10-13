import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Source, Word } from "@/data/types";
import { en } from "@/content/en";
import { Foreign, Swatch, WordRow } from "@/components/Words";
import { ComingSoon } from "@/components/ComingSoon";
import { eraAnchor, eraLabel, getRelated, getWord } from "@/lib/data";
import { PatternTile } from "@/components/signature/quilt";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import { wordLd } from "@/lib/geo";

// One word. Only words that pass the source rules exist here (src/lib/data.ts);
// any other slug is a real 404.
export const Route = createFileRoute("/words/$slug")({
  loader: ({ params }) => {
    const word = getWord(params.slug);
    if (!word) throw notFound();
    return { word, related: getRelated(word) };
  },
  head: ({ loaderData }) => {
    const w = loaderData?.word;
    if (!w) return {};
    return seo(`/words/${w.slug}`, en.meta.word(w), {
      crumbs: [
        { name: en.meta.explore.title, path: "/explore" },
        { name: w.word, path: `/words/${w.slug}` },
      ],
      extra: [wordLd(w)],
    });
  },
  component: WordPage,
});

function WordPage() {
  const { word: w, related } = Route.useLoaderData();
  const c = en.word;

  return (
    <article>
      <header className="container-site py-10 md:py-16">
        <Link to="/explore" className="link inline-flex min-h-11 items-center gap-2">
          <ArrowLeft strokeWidth={1.75} className="size-5" aria-hidden="true" />
          {c.back}
        </Link>
        <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <PatternTile donor={w.donor} className="block size-24 md:size-32" />
          <div>
            <p className="label text-muted">
              {en.languages[w.language]} · {en.confidence[w.confidence]}
            </p>
            <h1 className="mt-2 text-[length:var(--text-step-4)]">
              <Foreign word={w} />
            </h1>
            {w.reading && (
              <p className="mt-2 text-[length:var(--text-step-1)] text-muted">
                <span className="sr-only">{c.reading}: </span>
                {w.reading}
              </p>
            )}
            <p className="mt-4 max-w-[48ch] text-[length:var(--text-step-1)]">{w.meaning}</p>
          </div>
        </div>
      </header>

      <div className="container-site">
        <hr className="stitch" />
      </div>

      <div className="container-site grid gap-12 py-10 md:py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Fact label={c.from}>
              <span className="inline-flex items-center gap-2">
                <Swatch donor={w.donor} />
                {w.donor}
              </span>
            </Fact>
            <Fact label={c.route}>{w.route === "via" && w.via ? c.via(w.via) : c.direct}</Fact>
            <Fact label={c.period}>{eraLabel(w.era)}</Fact>
            {w.contactType && <Fact label={c.contact}>{en.contactTypes[w.contactType]}</Fact>}
          </dl>

          {w.example && (
            <section aria-labelledby="example" className="mt-10">
              <h2 id="example" className="label text-muted">
                {c.example}
              </h2>
              <blockquote className="mt-3 border-l-2 border-dashed border-blue pl-5">
                <p lang={w.language} className="font-display text-[length:var(--text-step-1)]">
                  {w.example.text}
                </p>
                {w.example.translation && <p className="mt-2 text-muted">{w.example.translation}</p>}
              </blockquote>
            </section>
          )}

          {w.confidence === "disputed" && w.views && (
            <section aria-labelledby="disputed" className="mt-10 rounded-[6px] border border-thread bg-surface p-5 md:p-6">
              <h2 id="disputed" className="text-[length:var(--text-step-2)]">
                {c.disputed.title}
              </h2>
              <p className="mt-2 text-muted">{c.disputed.lede}</p>
              <ol className="mt-6 grid gap-6 md:grid-cols-2">
                {w.views.map((v, i) => (
                  <li key={i} className="border-t-2 border-dashed border-thread pt-4">
                    <p className="label text-muted">{c.disputed.view(i + 1)}</p>
                    <p className="mt-2">{v.view}</p>
                    <SourceList sources={v.sources} className="mt-3" />
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside aria-labelledby="sources" className="lg:col-span-5">
          <h2 id="sources" className="text-[length:var(--text-step-2)]">
            {c.sources}
          </h2>
          {w.sources.length ? (
            <SourceList sources={w.sources} className="mt-4" numbered />
          ) : (
            <ComingSoon line={c.sourcesPending} className="mt-4" />
          )}
          <Link to="/blog" hash={eraAnchor(w.language, w.era)} className="link mt-6 inline-flex min-h-11 items-center">
            {c.readInBlog(eraLabel(w.era))}
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="container-site py-10 md:py-14">
          <h2 id="related" className="text-[length:var(--text-step-2)]">
            {c.related}
          </h2>
          <ul className="mt-4 border-t border-thread">
            {related.map((r: Word) => (
              <WordRow key={r.id} word={r} />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label text-muted">{label}</dt>
      <dd className="mt-1 text-[length:var(--text-step-1)]">{children}</dd>
    </div>
  );
}

function SourceList({ sources, className, numbered }: { sources: Source[]; className?: string; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className={cn("grid gap-2", numbered && "list-decimal pl-6", className)}>
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-6 items-baseline gap-1.5 break-words">
            {s.title}
            <ExternalLink strokeWidth={1.75} className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
            <span className="sr-only">{en.common.opensInNewTab}</span>
          </a>
        </li>
      ))}
    </List>
  );
}
