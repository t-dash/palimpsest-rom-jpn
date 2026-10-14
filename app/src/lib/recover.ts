/**
 * Recovering from a stale page. Each publish gives the site's script files
 * new names and removes the old ones (scripts/export-pages.mjs). A visitor
 * who kept a page open across a publish then asks for a file that no longer
 * exists the next time they click a link. Loading the page again fetches the
 * new files, so we do that once, quietly, instead of showing an error.
 */
const KEY = "ql-reloaded-at";

/** Errors that mean "a script or style file failed to load". */
export function isLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk|ChunkLoadError/i.test(message);
}

/** Reload once. Returns false if we already reloaded a moment ago (then the
 *  error page shows, so a broken publish can never loop). */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 15_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked (private mode, site data off): reload anyway; the
    // browser's own error page is the worst case.
  }
  window.location.reload();
  return true;
}
