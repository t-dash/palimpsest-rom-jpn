/**
 * Which era section the reader is looking at on the home timeline, so the
 * header's "Blog" button can open the matching blog section (Taizo's design
 * doc: "if they were viewing the Romania 6th century section, they should be
 * forwarded to the Romania 6th century section of the blog").
 *
 * A tiny external store: the server and the first client render both read ""
 * (plain /blog), so there is no hydration mismatch; the home timeline sets it
 * as sections scroll into view.
 */
import { useSyncExternalStore } from "react";

let current = "";
const listeners = new Set<() => void>();

export function setCurrentSection(anchor: string) {
  if (anchor === current) return;
  current = anchor;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The anchor ("ro-500s") of the era section in view, or "" when none. */
export function useCurrentSection(): string {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "",
  );
}
