import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Inner-page opening: an optional small label, the H1, and one plain sentence
 * saying what the page is. A stitched rule closes it. Every inner page uses
 * this (Blog, Credits, Resources, All words, Privacy, 404, the error page),
 * so titles sit at the same place and size from page to page. Credits passes
 * align="center" for Taizo's "simple text down the middle". Pages with
 * nothing below the header (404, error) pass rule={false}: the footer's
 * lighter-blue bar follows straight after.
 */
export function PageHeader({
  label,
  title,
  lede,
  align = "start",
  rule = true,
  children,
}: {
  label?: string;
  title: ReactNode;
  lede?: string;
  align?: "start" | "center";
  rule?: boolean;
  children?: ReactNode;
}) {
  const center = align === "center";
  return (
    <header>
      <div className={cn("container-site py-10 md:py-16", center && "text-center")}>
        {label && <p className="label mb-3 text-muted">{label}</p>}
        <h1 className={cn("max-w-[20ch] text-[length:var(--text-step-4)]", center && "mx-auto")}>{title}</h1>
        {lede && (
          // Centred: a width in rem, so the line doesn't re-centre when the
          // web font replaces the fallback.
          <p className={cn("mt-5 text-[length:var(--text-step-1)] leading-snug text-muted", center ? "mx-auto max-w-[40rem]" : "max-w-[56ch]")}>{lede}</p>
        )}
        {children}
      </div>
      {rule && (
        <div className="container-site">
          <hr className="stitch" />
        </div>
      )}
    </header>
  );
}

/** Section heading block: small label + H2. */
export function SectionHead({ label, title, id }: { label?: string; title: string; id?: string }) {
  return (
    <div>
      {label && <p className="label text-muted">{label}</p>}
      <h2 id={id} className="mt-2 max-w-[24ch] text-[length:var(--text-step-3)]">
        {title}
      </h2>
    </div>
  );
}
