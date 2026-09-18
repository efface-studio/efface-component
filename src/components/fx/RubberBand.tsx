import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface RubberBandProps {
  className?: string
}

/**
 * 고무줄. 가로로 팽팽한 선을 포인터가 잡아당기면 따라 휘고, 놓으면 튕기며 진동하다 잦아든다.
 * 그냥 지나가기만 해도 살짝 흔들린다.
 */
export function RubberBand({ className }: RubberBandProps) {
  const path = useRef<SVGPathElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const p = path.current
    const el = host.current
    if (!p || !el) return
    let raf = 0
    let w = 600
    let h = 200
    const s = { x: 300, y: 100, vy: 0, held: false, ty: 100 }
    const resize = () => {
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      s.y = h / 2
      s.ty = h / 2
      s.x = w / 2
    }
    const tick = () => {
      if (!s.held) {
        // 스프링 — 가운데로
        const k = 0.09
        const a = (h / 2 - s.y) * k
        s.vy = (s.vy + a) * 0.9
        s.y += s.vy
      }
      p.setAttribute('d', `M0 ${h / 2} Q ${s.x} ${s.y} ${w} ${h / 2}`)
      raf = requestAnimationFrame(tick)
    }
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e: PointerEvent) => {
      const q = local(e)
      if (Math.abs(q.y - h / 2) < 40) s.held = true
    }
    const onMove = (e: PointerEvent) => {
      const q = local(e)
      s.x = q.x
      if (s.held) s.y = q.y
      else if (Math.abs(q.y - h / 2) < 26 && !reduce) s.vy += (q.y - h / 2) * 0.05 // 스치면 살짝
    }
    const onUp = () => {
      s.held = false
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    if (reduce) p.setAttribute('d', `M0 ${h / 2} L${w} ${h / 2}`)
    else raf = requestAnimationFrame(tick)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('pointerleave', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerleave', onUp)
    }
  }, [reduce])
  return (
    <div ref={host} className={cn('relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing', className)}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path ref={path} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}
