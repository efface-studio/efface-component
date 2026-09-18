import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { useDisplayFonts } from '@/hooks/useDisplayFonts'

export interface KineticTextProps {
  text: string
  rows?: number
  className?: string
}

/**
 * 같은 글자 줄이 여러 겹 쌓여 3D 로 물결친다 — 줄마다 위상이 달라 파도처럼 굴러가고,
 * 포인터 쪽으로 기운다. 큰 타이포 히어로용.
 */
export function KineticText({ text, rows = 5, className }: KineticTextProps) {
  useDisplayFonts()
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = host.current
    if (!el || reduce) return
    const lines = Array.from(el.querySelectorAll<HTMLElement>('[data-row]'))
    let raf = 0
    let t = 0
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
    const tick = () => {
      t += 0.016
      tilt.x += (tilt.tx - tilt.x) * 0.06
      tilt.y += (tilt.ty - tilt.y) * 0.06
      lines.forEach((l, i) => {
        const ph = t * 1.4 + i * 0.55
        const rx = Math.sin(ph) * 38 + tilt.y * 20
        const x = Math.cos(ph * 0.7) * 30 + tilt.x * 40
        const depth = Math.cos(ph) * 0.5 + 0.5
        l.style.transform = `translateX(${x}px) rotateX(${rx}deg) translateZ(${depth * 40}px)`
        l.style.opacity = String(0.35 + depth * 0.65)
      })
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      tilt.tx = 0
      tilt.ty = 0
    }
    raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce, rows])
  return (
    <div ref={host} className={cn('flex h-full w-full flex-col items-center justify-center overflow-hidden select-none', className)} style={{ perspective: 700 }} aria-label={text}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} data-row aria-hidden className="font-display text-[clamp(40px,9vw,88px)] leading-[0.92] font-bold tracking-tight whitespace-nowrap will-change-transform" style={{ transformStyle: 'preserve-3d', color: i === Math.floor(rows / 2) ? 'var(--accent)' : 'var(--fg)' }}>
          {text}
        </div>
      ))}
    </div>
  )
}
