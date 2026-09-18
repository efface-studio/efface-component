import { cn } from '@/lib/cn'

export interface ShimmerTextProps {
  children: string
  className?: string
}

/** 글자 위로 빛이 한 번씩 훑고 지나간다 — 배경 그라데이션을 글자에 클립. */
export function ShimmerText({ children, className }: ShimmerTextProps) {
  return <span className={cn('shimmer-text', className)}>{children}</span>
}
