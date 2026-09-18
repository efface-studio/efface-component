import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ThemeRevealProps {
  /** 같은 내용을 두 테마로 그린다 */
  children: ReactNode
  radius?: number
  className?: string
}

/**
 * 포인터 주위 원 안으로 반대 테마가 들여다보인다 — 다크 위를 라이트 손전등으로 비추듯.
 * 같은 자식을 두 번 그리고 위 겹을 원형 마스크로 자른다. 나가면 원이 오므라든다.
 */
export function ThemeReveal({ children, radius = 130, className }: ThemeRevealProps) {
  const host = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = host.current
    const t = top.current
    if (!el || !t) return
    let raf = 0
    const s = { x: -999, y: -999, r: 0, tx: -999, ty: -999, tr: 0 }
    const tick = () => {
      s.x += (s.tx - s.x) * 0.18
      s.y += (s.ty - s.y) * 0.18
      s.r += (s.tr - s.r) * 0.12
      const m = `radial-gradient(circle ${s.r}px at ${s.x}px ${s.y}px, #000 98%, transparent 100%)`
      t.style.webkitMaskImage = m
      t.style.maskImage = m
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (s.r === 0) {
        s.x = x
        s.y = y
      }
      s.tx = x
      s.ty = y
      s.tr = radius
    }
    const onLeave = () => {
      s.tr = 0
    }
    if (!reduce) raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [radius, reduce])
  return (
    <div ref={host} className={cn('relative h-full w-full overflow-hidden', className)}>
      <div data-theme="dark" className="absolute inset-0 bg-bg text-fg">
        {children}
      </div>
      <div ref={top} data-theme="light" className="absolute inset-0 bg-bg text-fg" style={{ maskImage: 'radial-gradient(circle 0px at -999px -999px, #000 98%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle 0px at -999px -999px, #000 98%, transparent 100%)' }} aria-hidden>
        {children}
      </div>
    </div>
  )
}
