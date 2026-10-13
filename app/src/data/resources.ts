/**
 * Taizo's Resources page: "Dump of pdf materials for teaching and further
 * education in a menu format with images and short descriptions below them".
 * None supplied yet — the page shows "Coming soon" until entries exist.
 *
 * Add an entry (PDF in public/resources/, cover image in public/resources/):
 *   {
 *     title: "…",
 *     description: "One or two sentences in Taizo's words.",
 *     file: "/resources/your-file.pdf",
 *     image: "/resources/your-file-cover.jpg",   // optional
 *     imageAlt: "What the cover shows",          // required with image
 *   },
 */
export type Resource = {
  title: string;
  description: string;
  /** Path under public/ (e.g. /resources/x.pdf) or a full https:// link. */
  file: string;
  image?: string;
  imageAlt?: string;
};

export const resources: Resource[] = [];
