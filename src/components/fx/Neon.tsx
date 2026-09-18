import { cn } from '@/lib/cn'

export interface NeonProps {
  text: string
  color?: string
  className?: string
}

/**
 * 네온 사인. 켜질 때 몇 번 깜빡이다 안정되고, 이따금 한 글자가 툭 꺼졌다 켜진다. 빛은 여러 겹의 text-shadow.
 */
export function Neon({ text, color = '#ff2d95', className }: NeonProps) {
  return (
    <span className={cn('neon font-display font-bold tracking-wide', className)} style={{ '--neon': color } as never} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} aria-hidden className={cn('neon__ch inline-block whitespace-pre', i % 7 === 3 && 'neon__ch--flicker')} style={{ animationDelay: `${i * 0.07}s` }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
