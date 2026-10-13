import type { Word } from "@/data/types";
import { en } from "@/content/en";
import { eraLabel, type DonorCount } from "@/lib/data";
import { cn } from "@/lib/utils";
import { withBase } from "@/lib/base";
import { Quilt, QuiltLegend as CodexLegend, type QuiltWord } from "@/components/signature/quilt";
import { Swatch } from "./Words";
import { ComingSoon } from "./ComingSoon";

/**
 * The quilt on Home and /explore. With words it renders the Codex <Quilt />
 * (src/components/signature/quilt): server-rendered, every patch a link to
 * /words/$slug, so it works with JavaScript off. With no sourced words yet it
 * shows the empty stitched frame + one honest line — never sample patches.
 */
export function QuiltSlot({
  words,
  variant = "full",
  maxPerPanel,
  highlight,
  className,
}: {
  words: Word[];
  variant?: "compact" | "full";
  maxPerPanel?: number;
  /** Explorer filters: ids that match. Others are dimmed in place (no reflow). */
  highlight?: Set<string>;
  className?: string;
}) {
  if (words.length === 0) return <EmptyQuilt variant={variant} className={className} />;
  return (
    <Quilt
      words={words.map(toQuiltWord)}
      highlight={highlight}
      maxPerPanel={maxPerPanel}
      labels={{ ro: en.panels.ro, ja: en.panels.ja, count: en.home.quilt.panelCount, from: en.word.from }}
      className={className}
    />
  );
}

/** Our Word → the Codex quilt's word shape (labels already in English). */
export function toQuiltWord(w: Word): QuiltWord {
  return {
    id: w.id,
    slug: w.slug,
    word: w.word,
    reading: w.reading,
    language: w.language,
    meaning: w.meaning,
    donor: w.donor,
    period: eraLabel(w.era),
    contactType: w.contactType ? en.contactTypes[w.contactType] : "",
  };
}

function EmptyQuilt({ variant, className }: { variant: "compact" | "full"; className?: string }) {
  return (
    <figure className={cn("rounded-[6px] border-2 border-dashed border-thread bg-surface p-3 md:p-5", className)}>
      <div className="grid md:grid-cols-[1fr_28px_1fr]">
        {(["ro", "ja"] as const).map((language, i) => (
          <div key={language} className="contents">
            {i === 1 && (
              <div aria-hidden="true" className="my-3 border-t-2 border-dashed border-blue/50 md:mx-2 md:my-0 md:border-l-2 md:border-t-0" />
            )}
            <section aria-label={en.panels[language]}>
              <p className="label mb-3 border-b border-thread pb-2 text-muted">{en.panels[language]}</p>
              <div aria-hidden="true" className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-[5px]">
                {Array.from({ length: variant === "compact" ? 18 : 24 }, (_, k) => (
                  <span key={k} className="block aspect-square rounded-[4px] border border-dashed border-thread" />
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>
      <figcaption className="pt-5">
        <ComingSoon line={en.home.quilt.empty} />
      </figcaption>
    </figure>
  );
}

/** Home legend: swatch (colour + pattern) · donor · count, each a link to the
 *  explorer filtered by that donor. */
export function QuiltLegend({ donors, className }: { donors: DonorCount[]; className?: string }) {
  if (!donors.length) return null;
  return (
    // auto-fill: as many ~14rem columns as fit, so long donor names never
    // push the row past its column (was 3 fixed columns, 3px overflow @1024).
    <ul className={cn("grid grid-cols-[repeat(auto-fill,minmax(min(14rem,100%),1fr))] gap-x-6 gap-y-1", className)}>
      {donors.map((d) => (
        <li key={d.donor} className="min-w-0">
          <a
            href={withBase(`/explore?donor=${encodeURIComponent(d.donor)}`)}
            className="flex min-h-11 items-center gap-3 text-ink no-underline hover:underline"
          >
            <Swatch donor={d.donor} size="md" />
            <span className="min-w-0 font-semibold">{d.donor}</span>
            <span className="whitespace-nowrap text-muted">{en.home.quilt.words(d.count)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Explorer donor filter: the Codex legend, each donor a link that toggles
 *  ?donor= (works with JavaScript off; aria-current marks the active one). */
export function DonorFilter({
  words,
  selected,
  searchFor,
}: {
  words: Word[];
  selected?: string;
  /** The explorer's current search with the donor set (or cleared). */
  searchFor: (donor: string | undefined) => Record<string, unknown>;
}) {
  return (
    <CodexLegend
      words={words.map(toQuiltWord)}
      label={en.home.quilt.legendTitle}
      selectedDonors={selected ? [selected] : []}
      linkFor={(donor, isSelected) => searchFor(isSelected ? undefined : donor)}
    />
  );
}
