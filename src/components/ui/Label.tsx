import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface LabelProps {
  children: ReactNode
  /** `//` 접두 표시. v2는 accent 색, v1은 muted 색으로 같은 줄에 붙인다. */
  slash?: boolean | 'accent' | 'muted'
  /** 깜빡이는 캐럿 (v2 Capabilities / EffaceIntro 라벨) */
  caret?: boolean
  as?: ElementType
  className?: string
}

/**
 * 모노 eyebrow 라벨 — 섹션 제목 위 `// label`. v1·v2 공통 관용구.
 */
export function Label({ children, slash = 'accent', caret = false, as: Tag = 'p', className }: LabelProps) {
  return (
    <Tag className={cn('label flex items-center gap-2', className)}>
      {slash && <span className={slash === 'muted' ? 'text-fg-faint' : 'text-accent'}>//</span>}
      <span>{children}</span>
      {caret && <span aria-hidden className="caret-blink ml-1 inline-block h-3.5 w-[7px] bg-accent align-middle" />}
    </Tag>
  )
}
