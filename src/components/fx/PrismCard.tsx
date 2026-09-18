import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PrismCardProps {
  children: ReactNode
  className?: string
}

/**
 * 프리즘 유리 카드. 포인터를 따라 3D 로 기울고, 표면에 무지개 굴절광이 흐르며,
 * 테두리는 빛을 받은 쪽만 밝아진다. 뒤에는 카드 그림자가 반대쪽으로 늘어진다.
 */
export function PrismCard({ children, className }: PrismCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 150, damping: 20 })
  const sy = useSpring(my, { stiffness: 150, damping: 20 })
  const rx = useTransform(sy, [0, 1], [10, -10])
  const ry = useTransform(sx, [0, 1], [-14, 14])
  const gx = useTransform(sx, (v) => `${v * 100}%`)
  const gy = useTransform(sy, (v) => `${v * 100}%`)
  const hue = useTransform(sx, [0, 1], [0, 360])
  const glare = useMotionTemplate`radial-gradient(60% 50% at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 60%)`
  const prism = useMotionTemplate`conic-gradient(from ${hue}deg at ${gx} ${gy}, #ff5c8a, #ffb35c, #f9f871, #5cffb1, #5cc8ff, #b45cff, #ff5c8a)`
  const border = useMotionTemplate`radial-gradient(120% 120% at ${gx} ${gy}, rgba(255,255,255,0.9), rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.05))`
  const shadowX = useTransform(sx, [0, 1], [24, -24])
  const shadowY = useTransform(sy, [0, 1], [30, -10])
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px -20px rgba(0,0,0,0.6)`

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
    <div className="[perspective:1100px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, boxShadow: shadow, transformStyle: 'preserve-3d' }}
        className={cn('relative w-[300px] overflow-hidden rounded-2xl bg-white/[0.06] p-6 text-fg backdrop-blur-xl', className)}
      >
        {/* 굴절 테두리 */}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl p-px" style={{ background: border, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
        {/* 프리즘 — 아주 옅게, 빛 쪽으로 */}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-screen" style={{ background: prism, WebkitMaskImage: 'radial-gradient(80% 80% at 50% 50%, #000 30%, transparent)', maskImage: 'radial-gradient(80% 80% at 50% 50%, #000 30%, transparent)' }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className="relative" style={{ transform: 'translateZ(30px)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
