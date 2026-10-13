/**
 * Wordmark: two small patches sewn by a seam, then the name in the display
 * serif. The mark is ours (proposed) until Taizo sends a logo.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={className}>
      <rect x="2" y="5" width="9" height="14" rx="1" fill="#03254C" />
      <rect x="13" y="5" width="9" height="14" rx="1" fill="#1F4068" />
      <path d="M12 3v18" stroke="#03254C" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark className="size-6 shrink-0" />
      <span className="font-display text-[1.25rem] font-semibold leading-none tracking-[-0.01em] text-ink">
        Quilted Languages
      </span>
    </span>
  );
}
