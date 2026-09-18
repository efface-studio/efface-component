import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface LiquidButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

/**
 * 커서가 들어온 지점에서 잉크가 번지듯 채워지고, 나간 지점으로 빠져나간다.
 * 글자는 채워지는 동안 반전된다.
 */
export function LiquidButton({ children, className, onClick }: LiquidButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const [pt, setPt] = useState({ x: 50, y: 50 })
  const [on, setOn] = useState(false)
  const at = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPt({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        at(e)
        setOn(true)
      }}
      onMouseLeave={(e) => {
        at(e)
        setOn(false)
      }}
      className={cn(
        'group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-fg px-7 text-[15px] font-medium tracking-tight text-fg transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        on && 'text-bg',
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute aspect-square w-[260%] rounded-full bg-fg"
        style={{ left: `${pt.x}%`, top: `${pt.y}%`, x: '-50%', y: '-50%' }}
        initial={false}
        animate={{ scale: on ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 28, mass: 0.7 }}
      />
      <span className="relative">{children}</span>
    </button>
  )
}
