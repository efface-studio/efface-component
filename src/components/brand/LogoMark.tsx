import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

export interface LogoMarkProps {
  className?: string
  style?: CSSProperties
  /** 앞 사각형 색. 기본은 로고 블루. */
  accent?: string
}

/**
 * efface 마크 (v2) — 겹친 둥근 사각형 두 개. 뒤는 `currentColor`, 앞은 블루.
 * `text-*`로 뒤 사각형 색을 정한다: 다크에서는 흰색, 라이트에서는 잉크.
 */
export function LogoMark({ className, style, accent = '#3b62e5' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      style={style}
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill="currentColor" />
      <rect x="13.5" y="13.5" width="13" height="13" rx="3.6" fill={accent} />
    </svg>
  )
}
