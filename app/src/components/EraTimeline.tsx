import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Language } from "@/data/types";
import { en } from "@/content/en";
import type { EraSideView } from "@/lib/data";
import { setCurrentSection } from "@/lib/section";
import { cn } from "@/lib/utils";
import { ComingSoon } from "./ComingSoon";
import { Foreign } from "./Words";
import { GlobeSlot } from "./GlobeSlot";

type EraRow = { id: string; label: string; ro: EraSideView; ja: EraSideView };

/**
 * Taizo's era timeline (design doc, 13 Oct 2026): one country at a time —
 * Romania with the globe on the LEFT and text boxes on the right, Japan with
 * the globe on the RIGHT and text boxes on the left ("east vs west") — and a
 * triangular button to slide between them.
 *
 * Without JavaScript both countries render, one after the other, so every
 * word and paragraph is in the server HTML. With JavaScript, the first client
 * render is identical (side = "both"), then an effect switches to Romania.
 */
export function EraTimeline({ eras }: { eras: EraRow[] }) {
  const c = en.home.eras;
  const [side, setSide] = useState<Language | "both">("both");
  const [entering, setEntering] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => setSide("ro"), []);

  // Tell the header which era section is in view (Blog deep link).
  useEffect(() => {
    if (side === "both" || !rootRef.current) return;
    const blocks = [...rootRef.current.querySelectorAll<HTMLElement>(`[data-era-side="${side}"]`)];
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set((e.target as HTMLElement).id, e.isIntersecting ? e.intersectionRatio : 0);
        const best = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
        setCurrentSection(best && best[1] > 0 ? best[0] : "");
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    blocks.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      setCurrentSection("");
    };
  }, [side]);

  const switchTo = (next: Language) => {
    // The triangle that was pressed unmounts (each side has its own), so a
    // keyboard user would be dropped at the top of the page: move focus to
    // the new triangle instead.
    const fromTriangle = document.activeElement?.hasAttribute("data-triangle") ?? false;
    setSide(next);
    if (fromTriangle) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[data-triangle]")?.focus({ preventScroll: true }));
    setEntering(true);
    window.setTimeout(() => setEntering(false), 400);
    // Deep in one country's list? Start the other one from its first era.
    const start = rootRef.current?.querySelector<HTMLElement>("#era-switch-start");
    if (start && start.getBoundingClientRect().top < 0) start.scrollIntoView({ block: "start", behavior: "instant" });
  };

  return (
    <section ref={rootRef} id="eras" aria-labelledby="eras-title" className="bg-paper py-14 md:py-20">
      <div className="container-site">
        <p className="label text-muted">{c.label}</p>
        <h2 id="eras-title" className="mt-2 text-[length:var(--text-step-3)]">
          {c.title}
        </h2>
      </div>

      {/* Country switch: tabs + Taizo's triangle button, stuck under the top
          bar while the eras scroll by. Hidden until JS runs (without JS both
          countries are already on the page). */}
      <div id="era-switch-start" aria-hidden="true" />
      <div
        id="era-switch"
        className={cn(
          "sticky top-[var(--header-h)] z-20 mt-8 border-y border-mist bg-paper/95 backdrop-blur-sm",
          side === "both" && "hidden",
        )}
      >
        <div className="container-site flex min-h-14 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-1.5 sm:gap-x-4">
          {side === "ja" ? <Triangle dir="left" label={c.switchTo(en.panels.ro)} onClick={() => switchTo("ro")} /> : <span />}
          <div role="group" aria-label={c.nav} className="flex flex-wrap items-center justify-center gap-1">
            {(["ro", "ja"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={side === l}
                onClick={() => side !== l && switchTo(l)}
                className="min-h-11 whitespace-nowrap rounded-[6px] px-3 font-semibold uppercase tracking-[0.08em] text-ink transition-colors duration-[var(--dur-fast)] hover:bg-bar/70 aria-pressed:bg-ink aria-pressed:text-paper sm:px-4"
              >
                {en.panels[l]}
              </button>
            ))}
          </div>
          {side === "ro" ? <Triangle dir="right" label={c.switchTo(en.panels.ja)} onClick={() => switchTo("ja")} /> : <span />}
        </div>
      </div>

      {(["ro", "ja"] as const).map((lang) => (
        <div
          key={lang}
          hidden={side !== "both" && side !== lang}
          className={cn("container-site mt-10", entering && side === lang && (lang === "ro" ? "era-enter-left" : "era-enter-right"))}
        >
          {side === "both" && (
            <p className="mb-6 font-sans text-[length:var(--text-step-1)] font-semibold uppercase tracking-[0.08em] text-muted">
              {en.panels[lang]}
            </p>
          )}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Globe: left for Romania, right for Japan. */}
            <div className={cn("lg:col-span-5", lang === "ja" && "lg:order-2")}>
              {/* Smaller on phones so the first era is in view sooner; sticky
                  under the bar and the switch on wide screens. */}
              <div className="mx-auto max-w-[min(72%,18rem)] rounded-full bg-void p-3 sm:max-w-[min(100%,22rem)] lg:sticky lg:top-[calc(var(--header-h)+5rem)] lg:max-w-[min(100%,26rem)]">
                <GlobeSlot focus={lang} labels={{ ro: en.panels.ro, ja: en.panels.ja }} ariaLabel={en.home.globeLabel[lang]} />
              </div>
            </div>
            <ol className="grid gap-8 lg:col-span-7">
              {eras.map((era) => (
                <EraBlock key={era.id} label={era.label} view={era[lang]} />
              ))}
            </ol>
          </div>
        </div>
      ))}
    </section>
  );
}

function EraBlock({ label, view }: { label: string; view: EraSideView }) {
  const c = en.home.eras;
  const lead = view.lead;
  const first = firstSentence(view.body[0] ?? "");
  return (
    // Anchor jumps clear the top bar (html scroll-padding) and the switch.
    // The reveal motion is on the inner block: an anchor target that moves
    // while the browser scrolls to it would land in the wrong place.
    <li id={view.anchor} data-era-side={view.language} className="scroll-mt-[4.5rem]">
      <div className="reveal">
        <h3 className="label font-sans text-muted">{label}</h3>
        {lead ? (
          <article className="mt-3 rounded-[6px] bg-ink p-5 text-paper md:p-6">
            <p className="font-display text-[length:var(--text-step-3)] font-semibold leading-tight">
              <Link to="/words/$slug" params={{ slug: lead.slug }} className="text-paper no-underline hover:underline">
                <Foreign word={lead} />
              </Link>
              {lead.reading && <span className="ml-3 font-sans text-[length:var(--text-step-0)] font-normal text-mist">{lead.reading}</span>}
            </p>
            <p className="mt-1 text-mist">
              {lead.meaning} · {en.word.from} {lead.donor}
            </p>
            {first && <p className="mt-4 max-w-[60ch]">{first}</p>}
            {view.examples.length > 0 && (
              <div className="mt-5">
                <p className="label text-mist">{c.examples}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {view.examples.map((w) => (
                    <li key={w.id}>
                      <Link
                        to="/words/$slug"
                        params={{ slug: w.slug }}
                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-mist/40 px-3 text-paper no-underline transition-colors duration-[var(--dur-fast)] hover:border-paper hover:bg-paper/10"
                      >
                        <Foreign word={w} className="font-semibold" />
                        <span className="text-mist">{w.meaning}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              to="/blog"
              hash={view.anchor}
              className="group mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-paper underline underline-offset-4"
            >
              {c.readMore}
              <ArrowRight strokeWidth={1.75} className="size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </article>
        ) : (
          <ComingSoon line={c.empty} className="mt-3" />
        )}
      </div>
    </li>
  );
}

/** First sentence of Taizo's paragraph (verbatim) for the short text box;
 *  the full paragraph is in the blog. */
function firstSentence(text: string): string {
  const m = text.match(/^.{40,}?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}

/** Taizo's "little triangular button" between the two countries. */
function Triangle({ dir, label, onClick }: { dir: "left" | "right"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      data-triangle=""
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] px-2 font-semibold text-ink transition-colors duration-[var(--dur-fast)] hover:bg-bar",
        dir === "left" && "flex-row-reverse",
      )}
    >
      {/* The words show from sm up; on phones the tabs already say where it goes. */}
      <span aria-hidden="true" className="hidden whitespace-nowrap sm:inline">
        {label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "block size-5 bg-blue transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          dir === "right" ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5",
        )}
        style={{ clipPath: dir === "right" ? "polygon(0 0, 100% 50%, 0 100%)" : "polygon(100% 0, 0 50%, 100% 100%)" }}
      />
    </button>
  );
}
