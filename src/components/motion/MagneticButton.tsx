import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { SPRING } from '@/lib/motion'

export interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** 커서 쪽으로 끌리는 최대 이동(px) */
  strength?: number
}

/**
 * 자식을 감싸 커서 쪽으로 미세하게 끌어당긴다 (v1). 주요 CTA에만 드물게 쓴다.
 */
export function MagneticButton({ children, className, strength = 14 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING.magnetic)
  const sy = useSpring(y, SPRING.magnetic)

  const onMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set(((e.clientX - cx) / rect.width) * 2 * strength)
    y.set(((e.clientY - cy) / rect.height) * 2 * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  )
}
