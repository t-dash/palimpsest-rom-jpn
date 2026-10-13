import { PatternTile } from '../quilt/PatternTile'

export type PatchSwatchProps = {
  donor: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PatchSwatch({ donor, size = 'md', className = '' }: PatchSwatchProps) {
  return <span className={`ql-swatch ql-swatch--${size} ${className}`} title={donor}><PatternTile donor={donor} /></span>
}
