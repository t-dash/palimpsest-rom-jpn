import type { ReactNode } from "react";

/**
 * Inner-page opening: a small label, the H1, and one plain sentence saying
 * what the page is. A stitched rule closes it.
 */
export function PageHeader({
  label,
  title,
  lede,
  children,
}: {
  label?: string;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <div className="container-site py-12 md:py-20">
        {label && <p className="label text-muted">{label}</p>}
        <h1 className="mt-3 max-w-[20ch] text-[length:var(--text-step-4)]">{title}</h1>
        {lede && <p className="mt-5 max-w-[56ch] text-[length:var(--text-step-1)] leading-snug text-muted">{lede}</p>}
        {children}
      </div>
      <div className="container-site">
        <hr className="stitch" />
      </div>
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
