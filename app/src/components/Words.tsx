import { Link } from "@tanstack/react-router";
import type { Word } from "@/data/types";
import { en } from "@/content/en";
import { eraLabel } from "@/lib/data";
import { donorStyle } from "@/components/signature/quilt";
import { PatchSwatch } from "@/components/signature/quilt-kit";
import { cn } from "@/lib/utils";

/**
 * A foreign word, always with its lang attribute so screen readers switch
 * voice (and Japanese gets Noto Sans JP).
 */
export function Foreign({ word, className }: { word: Pick<Word, "word" | "language">; className?: string }) {
  return (
    <span lang={word.language} className={className}>
      {word.word}
    </span>
  );
}

/** Small square in the donor's colour + pattern (Codex PatchSwatch).
 *  Decorative: the donor name is always written next to it. */
export function Swatch({ donor, size = "sm", className }: { donor: string; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex", className)}>
      <PatchSwatch donor={donor} size={size} />
    </span>
  );
}

/**
 * One line of the word list: word (+ reading), meaning, donor, period.
 * The columns have fixed widths from md up, so every row lines up with the
 * next (they used to size themselves row by row and zig-zag). On phones:
 * word and era on the first line, then the meaning, then the donor.
 */
export function WordRow({ word }: { word: Word }) {
  return (
    <li className="border-b border-thread">
      <Link
        to="/words/$slug"
        params={{ slug: word.slug }}
        className="group -mx-2 grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-[6px] px-2 py-4 text-ink no-underline transition-colors duration-[var(--dur-fast)] [overflow-wrap:normal] hover:bg-surface/70 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,12rem)_7rem] md:gap-x-6"
      >
        <span className="order-1 min-w-0 font-display text-[length:var(--text-step-1)] font-semibold md:order-none">
          <Foreign word={word} className="group-hover:underline group-focus-visible:underline" />
          {word.reading && <span className="ml-2 whitespace-nowrap font-sans text-base font-normal text-muted">{word.reading}</span>}
        </span>
        <span className="order-3 col-span-2 text-muted md:order-none md:col-span-1">{word.meaning}</span>
        <span className="order-4 col-span-2 flex items-center gap-2 text-[length:var(--text-step--1)] md:order-none md:col-span-1">
          <Swatch donor={word.donor} />
          {word.donor}
        </span>
        <span className="order-2 whitespace-nowrap text-right text-[length:var(--text-step--1)] text-muted md:order-none">{eraLabel(word.era)}</span>
      </Link>
    </li>
  );
}

/** Featured word: a white card with a patch strip on the left edge. */
export function WordCard({ word }: { word: Word }) {
  const color = donorStyle(word.donor).color;
  return (
    <li>
      <Link
        to="/words/$slug"
        params={{ slug: word.slug }}
        className="group flex h-full min-h-28 overflow-hidden rounded-[6px] border border-thread bg-surface text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:border-ink"
      >
        <span aria-hidden="true" className="w-2 shrink-0" style={{ background: color }} />
        <span className="flex flex-1 flex-col gap-1 p-4">
          <span className="font-display text-[length:var(--text-step-2)] font-semibold leading-tight group-hover:underline">
            <Foreign word={word} />
          </span>
          {word.reading && <span className="text-muted">{word.reading}</span>}
          <span>{word.meaning}</span>
          <span className="mt-auto pt-2 text-[length:var(--text-step--1)] text-muted">
            {en.word.from} {word.donor} · {eraLabel(word.era)}
          </span>
        </span>
      </Link>
    </li>
  );
}
