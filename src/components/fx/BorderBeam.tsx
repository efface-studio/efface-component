import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface BorderBeamProps {
  children: ReactNode
  className?: string
  /** 한 바퀴(초) */
  duration?: number
}

/**
 * 테두리를 따라 빛줄기가 끝없이 돈다 — conic-gradient 를 회전시키고 안쪽을 마스크로 비운다.
 * 호버하면 두 배로 빨라진다.
 */
export function BorderBeam({ children, className, duration = 4 }: BorderBeamProps) {
  return (
    <div className={cn('border-beam group relative rounded-2xl', className)} style={{ '--beam-duration': `${duration}s` } as never}>
      <div className="relative rounded-2xl bg-surface">{children}</div>
    </div>
  )
}
