import { cn } from '@/lib/cn'

export interface MeteorsProps {
  count?: number
  className?: string
}

/**
 * 유성우. 비스듬한 빛줄기들이 서로 다른 시각·속도로 떨어진다. CSS 키프레임만.
 */
export function Meteors({ count = 16, className }: MeteorsProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="meteor"
          style={{
            left: `${(i * 61) % 100}%`,
            top: `${-10 - ((i * 37) % 40)}%`,
            animationDelay: `${(i * 0.53) % 6}s`,
            animationDuration: `${3 + ((i * 7) % 5) * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}
