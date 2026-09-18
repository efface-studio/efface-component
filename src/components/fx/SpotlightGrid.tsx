import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface SpotlightGridProps {
  children: ReactNode
  className?: string
}

/**
 * 격자 위에서 포인터를 움직이면 각 카드의 테두리와 바탕이 포인터 자리에서 빛난다.
 * 카드마다 --sx/--sy 를 써 넣어 CSS 그라데이션이 따라온다 (렌더 없이 DOM 만 갱신).
 */
export function SpotlightGrid({ children, className }: SpotlightGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.PointerEvent) => {
    const host = ref.current
    if (!host) return
    for (const card of host.querySelectorAll<HTMLElement>('.spot-card')) {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--sx', `${e.clientX - r.left}px`)
      card.style.setProperty('--sy', `${e.clientY - r.top}px`)
    }
  }
  return (
    <div ref={ref} onPointerMove={onMove} className={cn('group/spot grid gap-3', className)}>
      {children}
    </div>
  )
}

export function SpotCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('spot-card relative overflow-hidden rounded-xl border border-line bg-surface p-4', className)}>
      <div className="relative">{children}</div>
    </div>
  )
}
