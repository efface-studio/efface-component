import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ScrollLineProps {
  children: ReactNode
  /** 선의 세로 위치(px) */
  top?: number
  /** 좌우 여백(px) */
  inset?: number
  gradient?: string
  className?: string
}

/**
 * 스크롤 진행에 따라 왼쪽에서 오른쪽으로 그어지는 가로 선 (v1 Process).
 * 회색 기준선 위에 그라데이션 선이 스프링으로 따라온다. md 이상에서만 보인다.
 */
export function ScrollLine({ children, top = 60, inset = 28, gradient = 'linear-gradient(90deg, #2563eb 0%, #ec4899 100%)', className }: ScrollLineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const eased = useSpring(scrollYProgress, { stiffness: 100, damping: 25, mass: 0.4 })
  const width = useTransform(eased, [0, 1], ['0%', '100%'])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="absolute z-0 hidden h-px bg-line md:block" style={{ top, left: inset, right: inset }} />
      <motion.div className="absolute z-0 hidden h-px md:block" style={{ top, left: inset, width, maxWidth: `calc(100% - ${inset * 2}px)`, background: gradient }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
