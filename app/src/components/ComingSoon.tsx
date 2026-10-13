import { en } from "@/content/en";
import { cn } from "@/lib/utils";

/**
 * The site's one empty state: a stitched rule, a small label, one honest
 * line. It disappears by itself when the data it stands in for exists.
 * Never a badge, never bracketed text, never a grey box.
 */
export function ComingSoon({
  line,
  label = en.common.comingSoon,
  className,
}: {
  line: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[60ch] border-l-2 border-dashed border-blue py-1 pl-4", className)}>
      <p className="label text-muted">{label}</p>
      <p className="mt-1">{line}</p>
    </div>
  );
}
