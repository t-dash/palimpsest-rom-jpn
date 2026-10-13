export type SeamDividerProps = {
  variant?: 'running' | 'cross'
  className?: string
  label?: string
}

export function SeamDivider({ variant = 'running', className = '', label }: SeamDividerProps) {
  return (
    <div className={`ql-seam-divider ql-seam-divider--${variant} ${className}`} role={label ? 'separator' : 'presentation'} aria-label={label}>
      <svg viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true">
        {variant === 'running'
          ? <path d="M0 9H1200" />
          : <><path d="M0 5H1200" /><path d="M0 13H1200" /></>}
      </svg>
    </div>
  )
}
