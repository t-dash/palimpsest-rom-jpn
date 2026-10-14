import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { en } from "@/content/en";
import { cn } from "@/lib/utils";
import { Wordmark } from "./BrandMark";
import { useCurrentSection } from "@/lib/section";

/**
 * Taizo's top bar: the wordmark and his four nav buttons on the lighter-blue
 * bar (md and up), a Menu button below md. The bar is sticky, so the logo
 * and the menu are always in the same place, at any scroll position.
 *
 * The menu panel stays in the page (hidden and inert when closed) so it can
 * slide in and out; it sits right under the bar (--header-h, styles.css).
 * Focus trap, Escape, scroll lock on <html> (the reserved scrollbar gutter
 * keeps the layout still), and it closes on navigation or when the window
 * grows past md. Without JavaScript the Menu control is a link to the
 * footer's navigation.
 */
export function SiteHeader() {
  const c = en.common;
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const href = useRouterState({ select: (s) => s.location.href });
  const pending = usePendingNavigation();

  // Close on any navigation, including a hash change on the same page.
  useEffect(() => setOpen(false), [href]);

  // A soft shadow under the bar once the page has scrolled.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus({ preventScroll: true });
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const close = (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close(true);
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
    // The panel only exists below md: widening the window closes it, or the
    // page would stay locked with no menu on screen.
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = () => wide.matches && close(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      root.style.overflow = prevOverflow;
    };
  }, [open]);

  // Taizo's design: four buttons resting on a lighter-blue bar across the top.
  // "Blog" opens the blog section matching the era being read on Home.
  const section = useCurrentSection();
  const navButton =
    "flex min-h-11 items-center rounded-[6px] px-4 font-semibold text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper";
  const panelLink =
    "flex min-h-14 items-center justify-between rounded-[6px] px-3 font-display text-2xl text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-bar/60 aria-[current=page]:bg-ink aria-[current=page]:text-paper";
  const hashFor = (to: string) => (to === "/blog" && section ? section : undefined);
  const menuItems = [...c.nav, ...c.footerMore];
  const toggleCls =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] px-2 text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper md:hidden";

  return (
    <>
      <header
        className={cn(
          "site-header sticky top-0 z-30 border-b border-mist bg-bar transition-shadow duration-[var(--dur-base)]",
          scrolled && "shadow-[0_6px_18px_-12px_rgb(3_37_76/0.55)]",
        )}
      >
        <div className="container-site flex items-center justify-between gap-4 py-2">
          <Link to="/" className="flex min-h-11 min-w-0 items-center no-underline" aria-label={`${en.siteName}, home`}>
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

          {hydrated ? (
            <button
              ref={buttonRef}
              type="button"
              className={toggleCls}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative size-6" aria-hidden="true">
                <Menu strokeWidth={1.75} className={cn("absolute inset-0 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)]", open && "rotate-90 opacity-0")} />
                <X strokeWidth={1.75} className={cn("absolute inset-0 transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)]", !open && "-rotate-90 opacity-0")} />
              </span>
              <span>{open ? c.closeMenu : c.menu}</span>
            </button>
          ) : (
            // No JavaScript (or not loaded yet): the footer has every link.
            <a href="#footer-nav" className={toggleCls}>
              <Menu strokeWidth={1.75} aria-hidden="true" />
              <span>{c.menu}</span>
            </a>
          )}
        </div>

        {/* Navigation in progress (shown only if it takes a moment). */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-px h-0.5 overflow-hidden transition-opacity duration-[var(--dur-base)]",
            pending ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="nav-progress block h-full w-1/3 bg-blue" />
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={c.menu}
        inert={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto overscroll-contain bg-paper md:hidden",
          "duration-[var(--dur-base)] ease-[var(--ease-out)]",
          // Opening: visible straight away (focus can land in it), then fade
          // in. Closing: fade out, and only then hide.
          open
            ? "visible translate-y-0 opacity-100 transition-[opacity,transform]"
            : "invisible -translate-y-2 opacity-0 transition-[opacity,transform,visibility]",
        )}
      >
        <nav aria-label="Main" className="container-site py-6">
          <ul className="grid gap-1">
            {menuItems.map((item, i) => (
              <li
                key={item.to}
                className={cn(
                  "border-b border-dashed border-thread pb-1 transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-out)]",
                  open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                )}
                style={{ transitionDelay: open ? `${40 + i * 30}ms` : "0ms" }}
              >
                <Link
                  to={item.to}
                  hash={hashFor(item.to)}
                  activeOptions={{ exact: item.to === "/", includeHash: false }}
                  className={panelLink}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus({ preventScroll: true });
            }}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[6px] text-ink transition-colors duration-[var(--dur-fast)] hover:bg-bar/60"
          >
            <X strokeWidth={1.75} aria-hidden="true" />
            {c.closeMenu}
          </button>
        </nav>
      </div>
    </>
  );
}

const noop = () => () => {};
/** false in the server HTML and while hydrating it, true from then on. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** True while a page change is still loading, after a short grace period so
 *  fast navigations never flash the bar. */
function usePendingNavigation() {
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => setShow(true), 150);
    return () => window.clearTimeout(t);
  }, [loading]);
  return show;
}
