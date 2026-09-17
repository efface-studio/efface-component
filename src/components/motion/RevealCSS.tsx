import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInViewOnce } from '@/hooks/useInViewOnce'

export interface RevealCSSProps {
  children: ReactNode
  /** ms */
  delay?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * motion 없이 IntersectionObserver + CSS 전환만으로 떠오르는 Reveal (Mom-Work).
 * 번들이 가벼워야 하는 곳, 리스트 셀(`as="li"`)에 쓴다. reduced-motion 시 즉시 표시.
 */
export function RevealCSS({ children, delay = 0, as: Tag = 'div', className, style }: RevealCSSProps) {
  const [ref, shown] = useInViewOnce<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-600 ease-out-quart motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        className,
      )}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms', ...style }}
    >
      {children}
    </Tag>
  )
}
