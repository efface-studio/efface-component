import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { cn } from '@/lib/cn'
import { useDisplayFonts } from '@/hooks/useDisplayFonts'

export interface SpotlightTextProps {
  /** 겹쳐 그릴 줄들. 짝수 줄은 왼쪽, 홀수 줄은 오른쪽으로 3% 어긋난다. */
  lines: string[]
  /** 마스크 안에서 드러나는 그라데이션 */
  gradient?: string
  /** 외곽선 색 */
  stroke?: string
  /** 스포트라이트 반경(px) */
  radius?: number
  children?: ReactNode
  className?: string
}

/**
 * 외곽선만 있는 거대 텍스트 위에, 커서 주변 마스크 안에서만 그라데이션 채움이
 * 드러난다 (v1 CTA "EFFACE / BUILT IN SEOUL"). 세 레이어: 외곽선 · 마스크된 채움 · 글로우.
 */
export function SpotlightText({
  lines,
  gradient = 'linear-gradient(120deg, #BFDBFE 0%, #93C5FD 40%, #60A5FA 60%, #BAE6FD 100%)',
  stroke = 'rgba(10,10,10,0.10)',
  radius = 360,
  children,
  className,
}: SpotlightTextProps) {
  useDisplayFonts()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(50)
  const py = useMotionValue(50)
  const sx = useSpring(px, { stiffness: 180, damping: 28, mass: 0.5 })
  const sy = useSpring(py, { stiffness: 180, damping: 28, mass: 0.5 })

  const onMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set(((e.clientX - rect.left) / rect.width) * 100)
    py.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${sx}% ${sy}%, #000 0%, rgba(0,0,0,0.5) 50%, transparent 100%)`
  const glow = useMotionTemplate`radial-gradient(circle 600px at ${sx}% ${sy}%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 35%, transparent 70%)`

  const line = (t: string, i: number, extra: string, style: React.CSSProperties) => (
    <div
      key={i}
      className={cn('text-[16vw] leading-[0.92] font-black tracking-tight whitespace-nowrap md:text-[14vw]', extra)}
      style={{ transform: i % 2 === 0 ? 'translateX(-3%)' : 'translateX(3%)', ...style }}
    >
      {t}
    </div>
  )

  return (
    <div ref={ref} onMouseMove={onMove} className={cn('relative overflow-hidden', className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none">
        {lines.map((t, i) => line(t, i, 'text-transparent', { WebkitTextStroke: `1px ${stroke}` }))}
      </div>
      <motion.div
        aria-hidden
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none"
      >
        {lines.map((t, i) => line(t, i, 'bg-clip-text text-transparent', { backgroundImage: gradient }))}
      </motion.div>
      <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  )
}
