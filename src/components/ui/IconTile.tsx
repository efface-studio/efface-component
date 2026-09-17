import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface IconTileProps {
  children: ReactNode
  /** 호버 시 회전 각도. v1 Services는 -8, Process는 6. */
  rotate?: number
  /** 잉크 채움 (v1 Process). 기본은 옅은 회색 타일. */
  filled?: boolean
  size?: 9 | 10
  className?: string
}

/**
 * 아이콘 타일 (v1). 부모 `motion.div`에 `whileHover="hover"`가 있으면
 * variants 전파로 스프링 회전·확대가 걸린다.
 */
export function IconTile({ children, rotate = -8, filled = false, size = 10, className }: IconTileProps) {
  return (
    <motion.div
      variants={{ hover: { scale: 1.1, rotate } }}
      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
      className={cn(
        'flex items-center justify-center rounded-md',
        size === 10 ? 'h-10 w-10' : 'h-9 w-9',
        filled ? 'bg-fg text-bg' : 'bg-surface-2 text-fg',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
