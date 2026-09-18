import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface StrikeProps {
  children: ReactNode
  /** true가 되면 선이 왼쪽에서 그어진다 */
  shown: boolean
  /** ms */
  delay?: number
  color?: string
  className?: string
}

/**
 * 파란 취소선이 그어지는 단어 (v2 푸터 태그라인 · Mom-Work 푸터 · EffaceIntro).
 * 글자는 흐린 회색으로 물러나고, 선은 `scaleX(0→1)`로 왼쪽에서 자란다.
 */
export function Strike({ children, shown, delay = 0, color = '#3B82F6', className }: StrikeProps) {
  return (
    <span className={cn('relative inline-block text-fg-faint', className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[53%] -right-[3%] -left-[3%] h-[0.08em] origin-left rounded-full transition-transform duration-700 ease-out-quart motion-reduce:transition-none',
          shown ? 'scale-x-100' : 'scale-x-0 motion-reduce:scale-x-100',
        )}
        style={{ background: color, transitionDelay: `${delay}ms` }}
      />
    </span>
  )
}
