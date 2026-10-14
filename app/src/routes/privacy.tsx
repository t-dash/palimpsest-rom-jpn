import { createFileRoute } from "@tanstack/react-router";
import { en } from "@/content/en";
import { site } from "@/data/site";
import { PageHeader } from "@/components/PageHeader";
import { seo } from "@/lib/seo";

// Must match what the PUBLISHED site loads: after the first Publish, check for
// /~flock.js and cookies and update the Hosting section (house rules).
export const Route = createFileRoute("/privacy")({
  head: () => seo("/privacy", en.meta.privacy, { crumbs: [{ name: en.meta.privacy.title, path: "/privacy" }] }),
  component: Privacy,
});

function Privacy() {
  const c = en.privacy;
  return (
    <>
      <PageHeader title={c.title} lede={c.lede} />
      <div className="container-site py-10 md:py-14">
        <div className="prose-site">
          {c.sections.map((s) => (
            <section key={s.title} className="pb-6">
              <h2 className="text-[length:var(--text-step-2)]">{s.title}</h2>
              <p className="mt-3">{s.body}</p>
            </section>
          ))}
          {site.contactEmail && (
            <p>
              {c.contact}{" "}
              <a href={`mailto:${site.contactEmail}`} className="link break-all">
                {site.contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
