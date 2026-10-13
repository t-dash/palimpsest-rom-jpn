import { Globe, type GlobeFocus } from "@/components/signature/globe";

/**
 * The globe on Home (hero, idle spin) and in the era timeline (turned to
 * Romania or Japan). Wraps the Codex <Globe /> (src/components/signature/globe):
 * server-rendered SVG at the right rotation, animation only after mount,
 * paused off-screen, in hidden tabs and under reduced motion.
 */
export type { GlobeFocus };

export function GlobeSlot(props: {
  focus?: GlobeFocus;
  idle?: boolean;
  labels?: { ro?: string; ja?: string };
  ariaLabel?: string;
  className?: string;
}) {
  return <Globe {...props} />;
}
