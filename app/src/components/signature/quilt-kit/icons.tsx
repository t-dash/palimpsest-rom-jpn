import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
}

export function Needle(props: IconProps) {
  return <IconBase {...props}><path d="M4 20 18.5 5.5M7.5 20l-3.5-3.5M15.5 8.5l-2-2 3.8-3.8a1.7 1.7 0 0 1 2.4 2.4Z" /><circle cx="18.6" cy="4.3" r=".6" fill="currentColor" stroke="none" /></IconBase>
}

export function Thread(props: IconProps) {
  return <IconBase {...props}><path d="M8 4h8l2 4v8l-2 4H8l-2-4V8Z" /><path d="M7 8h10M6 16h12M9 8v8M15 8v8" /><path d="M18 18c2 0 3 1 3 3" /></IconBase>
}

export function Globe(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21M12 3C9.5 5.6 8.2 8.6 8.2 12S9.5 18.4 12 21" /></IconBase>
}

export function Scroll(props: IconProps) {
  return <IconBase {...props}><path d="M7 4h10v14a3 3 0 0 1-3 3H7a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3h6" /><path d="M10 8h4M10 12h4" /></IconBase>
}

export function Search(props: IconProps) {
  return <IconBase {...props}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.3 15.3 5.2 5.2" /></IconBase>
}

export function Filter(props: IconProps) {
  return <IconBase {...props}><path d="M4 6h16M7 12h10M10 18h4" /><circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" /></IconBase>
}
