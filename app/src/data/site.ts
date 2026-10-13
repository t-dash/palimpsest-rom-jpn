/**
 * Every value that can change, in one place. Empty = not supplied yet: the
 * element hides or shows its designed "Coming soon" state. Never put
 * placeholder text here.
 */
export const site = {
  /** Published address, no trailing slash (GitHub Pages: Taizo's repo t-dash/palimpsest-rom-jpn). */
  siteUrl: "https://t-dash.github.io/palimpsest-rom-jpn",
  name: "Quilted Languages",
  /**
   * "local" = everything from src/data (now). "cloud" = Lovable Cloud tables
   * (published = true), used only if the Supabase env vars also exist. Not in
   * scope (no admin); kept so the layout matches Lovable's. Switching Cloud on
   * in Lovable alone never empties the site: this must be set on purpose.
   */
  dataSource: "local" as "local" | "cloud",

  /** Taizo's public contact address. Empty = contact link hidden. */
  contactEmail: "",
  /** Link to his original prototype, if he wants it credited. */
  prototypeUrl: "",
};

export type Site = typeof site;
