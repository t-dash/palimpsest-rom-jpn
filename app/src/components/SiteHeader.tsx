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
 * Below md, Menu opens a navy drawer about half the screen wide that slides
 * in from the right over the dimmed page; its Close button lands where Menu
 * was. The drawer stays in the page (hidden and inert when closed) so it can
 * slide in and out. Focus trap; Escape, Close or a tap on the dimmed page
 * shuts it; scroll lock on <html> (the reserved scrollbar gutter keeps the
 * layout still); and it closes on navigation or when the window grows past
 * md. Without JavaScript the Menu control is a link to the footer's
 * navigation.
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
    // Start on the first link; Close sits above it, where Menu was.
    panel?.querySelector<HTMLElement>("nav a[href]")?.focus({ preventScroll: true });
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, background: root.style.backgroundColor };
    root.style.overflow = "hidden";
    // Desktop browsers keep the scrollbar's space (scrollbar-gutter): paint it
    // navy so it reads as part of the drawer, not a pale strip beside it.
    root.style.backgroundColor = "var(--color-ink)";
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
      root.style.overflow = prev.overflow;
      root.style.backgroundColor = prev.background;
    };
  }, [open]);

  // Taizo's design: four buttons resting on a lighter-blue bar across the top.
  // "Blog" opens the blog section matching the era being read on Home.
  const section = useCurrentSection();
  const navButton =
    "flex min-h-11 items-center rounded-[6px] px-4 font-semibold text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper";
  const hashFor = (to: string) => (to === "/blog" && section ? section : undefined);
  const toggleCls =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] px-2 text-ink no-underline transition-colors duration-[var(--dur-fast)] hover:bg-paper md:hidden";
  const closeMenu = () => {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  };

  // Drawer links: Taizo's four in the serif, then All words and Privacy
  // smaller. A small patch marks the page you're on.
  const drawerLink =
    "group flex items-center gap-3 rounded-[6px] px-2 no-underline transition-colors duration-[var(--dur-fast)] hover:bg-white/[0.07] active:bg-white/[0.12]";
  const drawerItems = [
    { items: c.nav, cls: "min-h-12 font-display text-[length:var(--text-step-2)] leading-tight text-paper" },
    { items: c.footerMore, cls: "min-h-11 text-mist hover:text-paper aria-[current=page]:text-paper" },
  ];

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
                {/* Tailwind 4 turns with `rotate`, not `transform`. */}
                <Menu strokeWidth={1.75} className={cn("absolute inset-0 transition-[opacity,rotate] duration-[var(--dur-base)] ease-[var(--ease-out)]", open && "rotate-90 opacity-0")} />
                <X strokeWidth={1.75} className={cn("absolute inset-0 transition-[opacity,rotate] duration-[var(--dur-base)] ease-[var(--ease-out)]", !open && "-rotate-90 opacity-0")} />
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

      {/* The page behind the open menu, dimmed; a tap on it closes the menu. */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={cn(
          "fixed inset-0 z-40 bg-void/60 md:hidden",
          open
            ? "visible opacity-100 transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-out)]"
            : "invisible opacity-0 transition-[opacity,visibility] duration-[var(--dur-base)] ease-[var(--ease-in)]",
        )}
      />

      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={c.menu}
        inert={!open}
        className={cn(
          // Half the screen, but never so narrow that "Resources" wraps.
          "fixed inset-y-0 right-0 z-40 flex w-[min(100%,max(50%,13.5rem))] flex-col bg-ink text-paper shadow-[-20px_0_40px_-24px_rgb(2_16_31/0.8)] md:hidden",
          // A stitched hem down the inner edge: the site's dashed thread.
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-2 before:border-l-2 before:border-dashed before:border-[color:var(--stitch)]",
          // Opening: visible straight away (focus can land in it), then slide
          // in. Closing: slide out a little faster, and only then hide.
          open
            ? "visible translate-x-0 transition-[translate] duration-[var(--dur-slow)] ease-[var(--ease-out)]"
            : "invisible translate-x-full transition-[translate,visibility] duration-[var(--dur-base)] ease-[var(--ease-in)]",
        )}
      >
        {/* Same row as the bar's (py-2 + 44px), so Close sits exactly where Menu was. */}
        <div className="flex shrink-0 items-center justify-end px-4 py-2">
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[6px] px-2 text-paper transition-colors duration-[var(--dur-fast)] hover:bg-white/10"
          >
            <X strokeWidth={1.75} className="size-6" aria-hidden="true" />
            {c.closeMenu}
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain pb-6 pl-4 pr-4 [scrollbar-color:var(--color-mist)_transparent] [scrollbar-width:thin]">
          <nav aria-label="Main">
            {drawerItems.map((group, g) => (
              <ul key={g} className={cn(g > 0 && "mt-4 border-t-2 border-dashed border-[color:var(--stitch)] pt-4")}>
                {group.items.map((item, i) => {
                  const n = g * c.nav.length + i;
                  return (
                    <li
                      key={item.to}
                      // The links settle in one after another as the drawer arrives.
                      className={cn(
                        "transition-[opacity,translate] duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-reduce:delay-0!",
                        open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                      )}
                      style={{ transitionDelay: open ? `${80 + n * 35}ms` : "0ms" }}
                    >
                      <Link
                        to={item.to}
                        hash={hashFor(item.to)}
                        activeOptions={{ exact: item.to === "/", includeHash: false }}
                        className={cn(drawerLink, group.cls)}
                        onClick={() => setOpen(false)}
                      >
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-[2px] bg-bar opacity-0 transition-opacity duration-[var(--dur-fast)] group-aria-[current=page]:opacity-100"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
          </nav>
          <p className="mt-auto pt-10 text-[length:var(--text-step--1)] text-mist">
            {c.madeBy} {en.credits.people.name}
          </p>
        </div>
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
