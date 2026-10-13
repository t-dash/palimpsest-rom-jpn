import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { en } from "@/content/en";
import { resources } from "@/data/resources";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";
import { seo } from "@/lib/seo";

// Taizo's Resources page (design doc): "Dump of pdf materials for teaching and
// further education in a menu format with images and short descriptions
// below them." Entries live in src/data/resources.ts.
export const Route = createFileRoute("/resources")({
  head: () => seo("/resources", en.meta.resources, { crumbs: [{ name: en.meta.resources.title, path: "/resources" }], pageType: "CollectionPage" }),
  component: Resources,
});

function Resources() {
  const c = en.resources;
  return (
    <>
      <PageHeader title={c.title} lede={c.lede} />
      <div className="container-site py-10 md:py-14">
        {resources.length === 0 ? (
          <ComingSoon line={c.empty} />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <li key={r.file}>
                <a
                  href={r.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-[6px] border border-mist bg-surface text-ink no-underline hover:border-ink"
                >
                  {r.image ? (
                    <img src={r.image} alt={r.imageAlt ?? ""} width={640} height={400} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="grid aspect-[16/10] place-items-center bg-bar text-blue">
                      <FileText strokeWidth={1.25} className="size-14" />
                    </span>
                  )}
                  <span className="flex flex-1 flex-col gap-2 p-5">
                    <span className="font-display text-[length:var(--text-step-1)] font-semibold group-hover:underline">{r.title}</span>
                    <span className="text-muted">{r.description}</span>
                    <span className="label mt-auto pt-2 text-blue">
                      {c.open} · {c.pdf}
                      <span className="sr-only"> {en.common.opensInNewTab}</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
