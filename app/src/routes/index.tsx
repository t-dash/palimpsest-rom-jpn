import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { en } from "@/content/en";
import { ComingSoon } from "@/components/ComingSoon";
import { SectionHead } from "@/components/PageHeader";
import { EraTimeline } from "@/components/EraTimeline";
import { GlobeSlot } from "@/components/GlobeSlot";
import { QuiltLegend, QuiltSlot } from "@/components/QuiltSlot";
import { SeamDivider } from "@/components/signature/quilt-kit";
import { getDonors, getEras, getWords } from "@/lib/data";
import { seo } from "@/lib/seo";

// Home, as Taizo designed it: the title under the light bar, a navy void with
// a floating, idle globe; scrolling down enters the era timeline (Romania ↔
// Japan). Below it: every word as the quilt, and why the project exists.
export const Route = createFileRoute("/")({
  head: () => seo("/", en.meta.home),
  loader: () => ({ words: getWords(), donors: getDonors(), eras: getEras() }),
  component: Home,
});

function Home() {
  const c = en.home;
  const { words, donors, eras } = Route.useLoaderData();

  return (
    <>
      {/* 1 — The navy void: title, tag line, his one-line idea, the idle globe */}
      <section className="relative overflow-hidden bg-void text-paper">
        {/* Fills the first screen under the bar; on wide screens the title and
            the globe sit in its middle instead of leaving a gap below. */}
        <div className="container-site grid min-h-[calc(100svh-var(--header-h))] content-start gap-8 pb-12 pt-10 md:pt-16 lg:grid-cols-12 lg:content-center lg:items-center lg:gap-10 lg:py-16">
          <div className="lg:col-span-7 lg:pl-[4%]">
            <h1 className="text-[length:var(--text-step-4)] leading-[1.02]">{c.title}</h1>
            <p className="mt-4 max-w-[30ch] font-display text-[length:var(--text-step-2)] italic leading-snug text-mist">{c.tagline}</p>
            <p className="mt-6 max-w-[58ch] text-paper/90">{c.intro}</p>
            <a
              href="#eras"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 rounded-[6px] border-[1.5px] border-paper px-5 font-semibold text-paper no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper hover:text-void"
            >
              {c.scrollCue}
              <ArrowDown strokeWidth={1.75} className="size-5 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
          <div className="mx-auto w-full max-w-[min(100%,32rem)] lg:col-span-5">
            <div className="globe-float">
              <GlobeSlot focus="world" idle labels={{ ro: en.panels.ro, ja: en.panels.ja }} ariaLabel={c.globeLabel.world} />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Through time: Taizo's eras, Romania ↔ Japan */}
      <EraTimeline eras={eras} />

      {/* 3 — Every word, sewn together (the quilt) */}
      <section aria-labelledby="all-words" className="bg-surface py-14 md:py-20">
        <div className="reveal container-site">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHead id="all-words" title={c.quilt.title} />
              <p className="mt-4 max-w-[52ch] text-muted">{c.quilt.lede}</p>
              <Link to="/explore" className="link mt-6 inline-flex min-h-11 items-center">
                {c.quilt.all}
              </Link>
            </div>
            <div className="lg:col-span-7">
              <QuiltSlot words={words} variant="compact" maxPerPanel={40} />
            </div>
          </div>
          {donors.length > 0 && (
            <div className="mt-10">
              <SeamDivider className="mb-8" />
              <p className="label mb-3 text-muted">{c.quilt.legendTitle}</p>
              <QuiltLegend donors={donors} />
            </div>
          )}
        </div>
      </section>

      {/* 4 — Why this project (his "Problem", verbatim) */}
      <section aria-labelledby="why" className="bg-ink py-14 text-paper md:py-20">
        <div className="container-site grid gap-6 lg:grid-cols-12">
          <h2 id="why" className="text-[length:var(--text-step-3)] lg:col-span-4">
            {c.why.title}
          </h2>
          <div className="lg:col-span-8">
            {c.why.problem ? (
              <blockquote className="max-w-[60ch] border-l-2 border-dashed border-mist pl-6 font-display text-[length:var(--text-step-1)] leading-snug">
                {c.why.problem}
              </blockquote>
            ) : (
              <ComingSoon line={c.why.more} />
            )}
            <Link
              to="/credits"
              className="mt-6 inline-flex min-h-11 items-center rounded-[6px] border-[1.5px] border-paper px-5 font-semibold text-paper no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper hover:text-ink"
            >
              {c.why.more}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
