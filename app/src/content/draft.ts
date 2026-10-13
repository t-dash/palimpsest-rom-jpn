/**
 * Marks wording WE wrote (page intros, empty-state lines, privacy text) so
 * Taizo can find and replace or approve it before launch:
 *   grep -rn "draft(" src/content
 * It returns the text unchanged — nothing on the site shows that a line is a
 * draft (house rule: no visible draft badges). Taizo's own words are never
 * wrapped in draft(), and we never write etymologies or his argument.
 */
export const draft = (text: string) => text;
