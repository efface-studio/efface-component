import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface MorphCursorProps {
  children: ReactNode
  /** 이 선택자에 맞는 요소 위에서 커서가 그 모양으로 변한다 */
  target?: string
  className?: string
}

/**
 * 원형 커서가 따라오다가 버튼 같은 요소 위에선 그 요소의 모양(둥근 사각)으로 늘어나 감싼다(Linear 식).
 * 요소를 벗어나면 다시 원으로 오므라든다. 안의 요소는 실제 커서를 숨긴다.
 */
export function MorphCursor({ children, target = '[data-cursor]', className }: MorphCursorProps) {
  const host = useRef<HTMLDivElement>(null)
  const cur = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = host.current
    const c = cur.current
    if (!el || !c || reduce) return
    const s = { x: 0, y: 0, w: 22, h: 22, r: 11, tx: 0, ty: 0, tw: 22, th: 22, tr: 11, on: false, lock: null as HTMLElement | null }
    let raf = 0
    const loop = () => {
      const k = s.lock ? 0.22 : 0.3
      s.x += (s.tx - s.x) * k
      s.y += (s.ty - s.y) * k
      s.w += (s.tw - s.w) * 0.22
      s.h += (s.th - s.h) * 0.22
      s.r += (s.tr - s.r) * 0.22
      c.style.transform = `translate(${s.x - s.w / 2}px, ${s.y - s.h / 2}px)`
      c.style.width = `${s.w}px`
      c.style.height = `${s.h}px`
      c.style.borderRadius = `${s.r}px`
      c.style.opacity = s.on ? '1' : '0'
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      s.on = true
      const hit = (e.target as Element | null)?.closest?.(target) as HTMLElement | null
      if (hit && el.contains(hit)) {
        const b = hit.getBoundingClientRect()
        s.lock = hit
        // 요소 안에서 포인터 쪽으로 살짝 끌린다(자석)
        const cx = b.left - r.left + b.width / 2 + (x - (b.left - r.left + b.width / 2)) * 0.15
        const cy = b.top - r.top + b.height / 2 + (y - (b.top - r.top + b.height / 2)) * 0.15
        s.tx = cx
        s.ty = cy
        s.tw = b.width + 12
        s.th = b.height + 12
        s.tr = parseFloat(getComputedStyle(hit).borderRadius) + 6 || 14
      } else {
        s.lock = null
        s.tx = x
        s.ty = y
        s.tw = 22
        s.th = 22
        s.tr = 11
      }
    }
    const onLeave = () => {
      s.on = false
      s.lock = null
    }
    raf = requestAnimationFrame(loop)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [target, reduce])

  return (
    <div ref={host} className={cn('relative h-full w-full', !reduce && 'cursor-none [&_*]:cursor-none', className)}>
      {children}
      <div ref={cur} aria-hidden className="pointer-events-none absolute top-0 left-0 z-20 border-2 border-accent bg-accent/15 opacity-0 mix-blend-normal transition-opacity duration-200" style={{ width: 22, height: 22, borderRadius: 11 }} />
    </div>
  )
}
