import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TiltCardProps {
  children: ReactNode
  /** 최대 기울기(도). v2 Capabilities = 10, AppCards = 11/7. */
  tiltX?: number
  tiltY?: number
  /** 기울기를 따라가는 하이라이트 표시 */
  glare?: boolean
  perspective?: number
  className?: string
}

/**
 * 커서 위치로 3D 기울기 + 하이라이트 (v2 Capabilities / AppCards 씬의 호버 부분).
 * 원본은 rAF 루프가 직접 transform을 썼지만, 여기서는 motion 스프링으로 같은 감각을 낸다.
 */
export function TiltCard({ children, tiltX = 7, tiltY = 11, glare = true, perspective = 1200, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 160, damping: 20, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 160, damping: 20, mass: 0.5 })
  const rotateY = useTransform(sx, [0, 1], [-tiltY, tiltY])
  const rotateX = useTransform(sy, [0, 1], [tiltX, -tiltX])
  const gx = useTransform(sx, [0, 1], [20, 80])
  const gy = useTransform(sy, [0, 1], [10, 70])
  const sheen = useMotionTemplate`radial-gradient(55% 40% at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)`

  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <div style={{ perspective }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn('relative will-change-transform')}
      >
        {children}
        {glare && <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: sheen }} />}
      </motion.div>
    </div>
  )
}
