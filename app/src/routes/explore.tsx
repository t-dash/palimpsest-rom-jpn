import { useRef, useSyncExternalStore } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { en } from "@/content/en";
import { CONTACT_TYPES, LANGUAGES } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/ComingSoon";
import { PageHeader } from "@/components/PageHeader";
import { DonorFilter, QuiltSlot } from "@/components/QuiltSlot";
import { WordRow } from "@/components/Words";
import { eraLabel, getDonors, getWords } from "@/lib/data";
import {
  SORT_KEYS,
  erasWithWords,
  filterWords,
  isFiltered,
  parseSearch,
  type ExploreSearch,
} from "@/lib/search";
import { seo } from "@/lib/seo";
import { wordSetLd } from "@/lib/geo";
import { STATIC_EXPORT, pagePath, withBase } from "@/lib/base";

// Explorer. Search, filters and sort live in the URL (?q=&lang=&donor=…), so:
// - without JavaScript the form is a plain GET and the server renders the
//   filtered list;
// - with JavaScript every change updates the URL and the list at once.
// Both paths run the same filterWords(), so server and client always agree.
// On GitHub Pages (STATIC_EXPORT) there is no server: /explore/ is one
// prerendered file holding every word, so the URL filters are applied in the
// browser right after hydration (the first render must match that file).
export const Route = createFileRoute("/explore")({
  validateSearch: (raw: Record<string, unknown>): ExploreSearch => parseSearch(raw),
  // Re-parsed here too: unknown values (e.g. ?lang=xx) must never filter.
  loaderDeps: ({ search }) => (STATIC_EXPORT ? {} : parseSearch(search)),
  loader: ({ deps }) => {
    const all = getWords();
    return {
      total: all.length,
      all,
      words: filterWords(all, parseSearch(deps)),
      donors: getDonors().map((d) => d.donor).sort(),
      periods: erasWithWords(all),
    };
  },
  head: () =>
    seo("/explore", en.meta.explore, {
      crumbs: [{ name: en.meta.explore.title, path: "/explore" }],
      pageType: "CollectionPage",
      extra: [wordSetLd(getWords())],
    }),
  component: Explore,
});

const selectCls =
  "min-h-11 w-full rounded-[6px] border-[1.5px] border-thread bg-surface px-3 text-ink focus-visible:border-blue";

function Explore() {
  const c = en.explore;
  const loaded = Route.useLoaderData();
  const { total, all, donors, periods } = loaded;
  const hydrated = useHydrated();
  const urlSearch = parseSearch(Route.useSearch());
  const search = STATIC_EXPORT && !hydrated ? parseSearch({}) : urlSearch;
  const words = STATIC_EXPORT ? filterWords(all, search) : loaded.words;
  const navigate = useNavigate({ from: "/explore" });
  const set = (patch: Partial<ExploreSearch>) =>
    navigate({ search: (prev) => parseSearch({ ...prev, ...patch }), replace: true, resetScroll: false });
  const qRef = useRef<HTMLInputElement>(null);
  const filtered = isFiltered(search);
  const matching = new Set(words.map((w) => w.id));

  return (
    <>
      <PageHeader label={c.label} title={c.title} lede={c.lede} />
      <div className="container-site py-10 md:py-14">
        {total === 0 ? (
          <>
            <QuiltSlot words={[]} />
            <ComingSoon line={c.empty} className="mt-10" />
          </>
        ) : (
          <>
            <QuiltSlot words={all} highlight={filtered ? matching : undefined} />
            <div className="mt-4">
              <DonorFilter
                words={all}
                selected={search.donor}
                searchFor={(donor) => ({ ...parseSearch({ ...search, donor }), donor })}
              />
            </div>

            <form
              method="get"
              action={withBase(pagePath("/explore"))}
              role="search"
              className="mt-10 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                navigate({ search: parseSearch(data), replace: true, resetScroll: false });
              }}
            >
              <div>
                <label htmlFor="q" className="label text-muted">
                  {c.searchLabel}
                </label>
                <div className="relative mt-2">
                  <Search strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                  <input
                    ref={qRef}
                    id="q"
                    name="q"
                    type="search"
                    key={hydrated ? "live" : "static"}
                    defaultValue={search.q ?? ""}
                    onChange={(e) => set({ q: e.target.value })}
                    aria-describedby="q-hint"
                    autoComplete="off"
                    className="min-h-12 w-full rounded-[6px] border-[1.5px] border-thread bg-surface py-2 pl-11 pr-3 text-ink focus-visible:border-blue"
                  />
                </div>
                <p id="q-hint" className="mt-1 text-[length:var(--text-step--1)] text-muted">
                  {c.searchHint}
                </p>
              </div>

              <fieldset className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <legend className="sr-only">{c.filters}</legend>
                <Select id="lang" label={c.language} value={search.lang} onChange={(v) => set({ lang: v as ExploreSearch["lang"] })}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {en.languages[l]}
                    </option>
                  ))}
                </Select>
                <Select id="donor" label={c.donor} value={search.donor} onChange={(v) => set({ donor: v })}>
                  {donors.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select id="period" label={c.period} value={search.period} onChange={(v) => set({ period: v as ExploreSearch["period"] })}>
                  {periods.map((p) => (
                    <option key={p} value={p}>
                      {eraLabel(p)}
                    </option>
                  ))}
                </Select>
                <Select id="contact" label={c.contactType} value={search.contact} onChange={(v) => set({ contact: v as ExploreSearch["contact"] })}>
                  {CONTACT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {en.contactTypes[t]}
                    </option>
                  ))}
                </Select>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="sort" className="label text-muted">
                    {c.sort}
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    value={search.sort ?? "word"}
                    onChange={(e) => set({ sort: e.target.value as ExploreSearch["sort"] })}
                    className={`${selectCls} mt-2`}
                  >
                    {SORT_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {c.sortOptions[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" variant="secondary">
                  {c.apply}
                </Button>
                {(filtered || search.sort) && (
                  <Link
                    to="/explore"
                    search={{}}
                    replace
                    onClick={() => qRef.current && (qRef.current.value = "")}
                    className="link inline-flex min-h-11 items-center"
                  >
                    {c.clear}
                  </Link>
                )}
              </div>
            </form>

            <section aria-labelledby="word-list" className="mt-10">
              <h2 id="word-list" className="sr-only">
                {c.title}
              </h2>
              <p className="label text-muted" role="status" aria-live="polite">
                {c.count(words.length, total)}
              </p>
              {words.length === 0 ? (
                <p className="mt-4 border-t border-thread pt-4">{c.noResults}</p>
              ) : (
                <ul className="mt-3 border-t border-thread">
                  {words.map((w) => (
                    <WordRow key={w.id} word={w} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

/** A filter select: visible label, "Any" first, controlled by the URL. */
function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-muted">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={`${selectCls} mt-2`}
      >
        <option value="">{en.explore.any}</option>
        {children}
      </select>
    </div>
  );
}

const noop = () => () => {};
/** false while hydrating the prerendered HTML, true from then on. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
