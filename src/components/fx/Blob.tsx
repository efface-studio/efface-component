import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface BlobProps {
  className?: string
}

/**
 * 살아 있는 덩이. 반지름이 여러 파장으로 출렁이는 SVG 경로를 매 프레임 다시 그린다.
 * 포인터 쪽으로 늘어나고, 누르면 움찔한다. 안에는 그라데이션.
 */
export function Blob({ className }: BlobProps) {
  const ref = useRef<SVGPathElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const p = ref.current
    const el = host.current
    if (!p || !el) return
    let raf = 0
    let t = 0
    const pt = { x: 0, y: 0, tx: 0, ty: 0 }
    let squash = 0
    const N = 64
    const build = () => {
      const pts: [number, number][] = []
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2
        let r = 90 + Math.sin(a * 3 + t * 1.3) * 8 + Math.sin(a * 5 - t * 1.9) * 5 + Math.cos(a * 2 + t * 0.7) * 6
        // 포인터 쪽으로 늘어남
        const dot = Math.cos(a) * pt.x + Math.sin(a) * pt.y
        r += Math.max(0, dot) * 32
        r *= 1 - squash * 0.18 * Math.abs(Math.sin(a))
        pts.push([150 + Math.cos(a) * r, 150 + Math.sin(a) * r])
      }
      // 부드러운 닫힌 곡선 (Catmull-Rom → cubic)
      let d = ''
      for (let i = 0; i < N; i++) {
        const p0 = pts[(i - 1 + N) % N]!
        const p1 = pts[i]!
        const p2 = pts[(i + 1) % N]!
        const p3 = pts[(i + 2) % N]!
        const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
        const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
        d += i === 0 ? `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}` : ''
        d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
      }
      return d + ' Z'
    }
    const tick = () => {
      t += 0.016
      pt.x += (pt.tx - pt.x) * 0.08
      pt.y += (pt.ty - pt.y) * 0.08
      squash *= 0.9
      p.setAttribute('d', build())
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      pt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      pt.tx = 0
      pt.ty = 0
    }
    const onDown = () => {
      squash = 1
    }
    if (reduce) p.setAttribute('d', build())
    else raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onDown)
    }
  }, [reduce])
  return (
    <div ref={host} className={cn('flex h-full w-full items-center justify-center select-none', className)}>
      <svg viewBox="0 0 300 300" className="h-[260px] w-[260px]" aria-hidden>
        <defs>
          <linearGradient id="ef-blob-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b62e5" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#14b8b0" />
          </linearGradient>
        </defs>
        <path ref={ref} fill="url(#ef-blob-g)" />
      </svg>
    </div>
  )
}
