import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { SPRING } from '@/lib/motion'
import { cn } from '@/lib/cn'

export interface CursorGlowProps {
  children: ReactNode
  /** 글로우 색 (rgb 삼중항) — v1 accent 블루 */
  rgb?: string
  /** 점 격자 표시 (v1 Hero). 격자는 커서 근처에서 더 진하게 드러난다. */
  dots?: boolean
  /** 글로우 반경(px) */
  radius?: number
  className?: string
}

/**
 * 커서를 따라다니는 부드러운 글로우 + 점 격자 (v1 Hero / CTA).
 * 위치는 퍼센트로 두고 스프링을 걸어 마우스보다 조금 늦게 따라온다.
 */
export function CursorGlow({ children, rgb = '37,99,235', dots = true, radius = 480, className }: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(50)
  const py = useMotionValue(40)
  const sx = useSpring(px, SPRING.cursor)
  const sy = useSpring(py, SPRING.cursor)

  const onMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set(((e.clientX - rect.left) / rect.width) * 100)
    py.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const glow = useMotionTemplate`radial-gradient(circle ${radius}px at ${sx}% ${sy}%, rgba(${rgb},0.16) 0%, rgba(${rgb},0.06) 35%, transparent 70%)`
  const dotMask = useMotionTemplate`radial-gradient(circle 320px at ${sx}% ${sy}%, #000 0%, rgba(0,0,0,0.5) 40%, transparent 80%)`

  return (
    <div ref={ref} onMouseMove={onMove} className={cn('relative overflow-hidden', className)}>
      {dots && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot [mask-image:linear-gradient(180deg,white,transparent)] [data-theme=dark]:bg-dot-dark" />
          <motion.div aria-hidden style={{ maskImage: dotMask, WebkitMaskImage: dotMask }} className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: `radial-gradient(circle, rgba(${rgb},0.55) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
            />
          </motion.div>
        </>
      )}
      <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  )
}
