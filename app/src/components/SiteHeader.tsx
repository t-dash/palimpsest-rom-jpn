import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { en } from "@/content/en";
import { Wordmark } from "./BrandMark";
import { useCurrentSection } from "@/lib/section";

/**
 * Wordmark + Taizo's four nav buttons on a lighter-blue bar from md; a Menu
 * button below md. The menu panel is rendered
 * as a sibling of <header>, not inside it, so no header style can trap a
 * fixed panel (build-lessons trap 5). Focus trap, Escape and scroll lock.
 */
export function SiteHeader() {
  const c = en.common;
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Taizo's design: four buttons resting on a lighter-blue bar across the top.
  // "Blog" opens the blog section matching the era being read on Home.
  const section = useCurrentSection();
  const navButton =
    "flex min-h-11 items-center rounded-[6px] px-4 font-semibold text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper";
  const panelLink = "flex min-h-14 items-center font-display text-2xl text-ink no-underline aria-[current=page]:text-blue";
  const hashFor = (to: string) => (to === "/blog" && section ? section : undefined);

  return (
    <>
      <header className="relative z-30 border-b border-mist bg-bar">
        <div className="container-site flex items-center justify-between gap-4 py-2">
          <Link to="/" className="flex min-h-11 items-center no-underline" aria-label={`${en.siteName}, home`}>
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {c.nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} hash={hashFor(item.to)} activeOptions={{ exact: item.to === "/", includeHash: false }} className={navButton}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-2 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X strokeWidth={1.75} aria-hidden="true" /> : <Menu strokeWidth={1.75} aria-hidden="true" />}
            <span>{open ? c.closeMenu : c.menu}</span>
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={c.menu}
          className="fixed inset-x-0 bottom-0 top-[61px] z-40 overflow-y-auto bg-paper md:hidden"
        >
          <nav aria-label="Main" className="container-site py-8">
            <ul className="divide-y divide-dashed divide-thread border-y border-dashed border-thread">
              {[...c.nav, ...c.footerMore].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} hash={hashFor(item.to)} activeOptions={{ exact: item.to === "/", includeHash: false }} className={panelLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 text-ink"
            >
              <X strokeWidth={1.75} aria-hidden="true" />
              {c.closeMenu}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
