import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
}

/**
 * 뒤집히는 카드. 호버(또는 탭)하면 Y 축으로 돌아 뒷면이 나온다 — 돌 때 살짝 들리고 그림자가 길어진다.
 */
export function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)
  const reduce = useReducedMotion()
  return (
    <div className={cn('h-[200px] w-[300px] [perspective:1200px]', className)} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped((v) => !v)}>
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0, y: flipped ? -8 : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="absolute inset-0 rounded-2xl border border-line bg-surface p-5 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 rounded-2xl bg-fg p-5 text-bg shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
      </motion.div>
    </div>
  )
}
