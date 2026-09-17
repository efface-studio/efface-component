import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface MarqueeProps {
  children: ReactNode
  direction?: 'left' | 'right'
  /** 한 바퀴(초) */
  duration?: number
  /** 항목 사이 간격 클래스 */
  gap?: string
  /** 양 끝 페이드. `mask`는 마스크 이미지(v2), `fade`는 배경색 그라데이션 덮개(v1). */
  edge?: 'mask' | 'fade' | 'none'
  className?: string
}

/**
 * 무한 가로 마퀴. 자식을 두 번 이어 붙이고 `-50%`까지 옮긴다 (v1·v2 공통).
 * 자식은 `shrink-0`이어야 한다. reduced-motion에서는 멈춘다.
 */
export function Marquee({ children, direction = 'left', duration = 40, gap = 'gap-4', edge = 'fade', className }: MarqueeProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        edge === 'mask' && '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      {edge === 'fade' && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-bg to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-bg to-transparent" />
        </>
      )}
      <div
        className={cn('flex w-max py-1.5 will-change-transform motion-reduce:animate-none', gap)}
        style={{ animation: `${direction === 'left' ? 'marquee' : 'marquee-reverse'} ${duration}s linear infinite` }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
