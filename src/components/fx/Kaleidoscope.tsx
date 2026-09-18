import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface KaleidoscopeProps {
  /** 거울 수 */
  slices?: number
  className?: string
}

/**
 * 만화경. 포인터가 그리는 획이 N 개의 거울에 비쳐 대칭 문양이 된다 — 색은 시간에 따라 돌고,
 * 획은 천천히 바랜다. 가만히 두면 스스로 그린다. 누르면 지운다.
 */
export function Kaleidoscope({ slices = 10, className }: KaleidoscopeProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let hue = 200
    let last: { x: number; y: number } | null = null
    let pointer: { x: number; y: number } | null = null
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#07090f'
      ctx.fillRect(0, 0, w, h)
    }
    const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const cx = w / 2
      const cy = h / 2
      hue = (hue + 1.2) % 360
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineWidth = 3
      ctx.strokeStyle = `hsl(${hue} 90% 62%)`
      ctx.shadowColor = `hsl(${hue} 90% 62%)`
      ctx.shadowBlur = 8
      for (let i = 0; i < slices; i++) {
        const a = (i / slices) * Math.PI * 2
        for (const mirror of [1, -1]) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(a)
          ctx.scale(1, mirror)
          ctx.beginPath()
          ctx.moveTo(from.x - cx, from.y - cy)
          ctx.lineTo(to.x - cx, to.y - cy)
          ctx.stroke()
          ctx.restore()
        }
      }
      ctx.shadowBlur = 0
    }
    const loop = () => {
      t += 0.016
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = 'rgba(7,9,15,0.03)'
      ctx.fillRect(0, 0, w, h)
      if (!pointer) {
        // 스스로 그리는 궤적 — 리사주
        const p = { x: w / 2 + Math.sin(t * 1.1) * w * 0.28 + Math.sin(t * 2.7) * 30, y: h / 2 + Math.cos(t * 0.8) * h * 0.28 + Math.cos(t * 3.1) * 20 }
        if (last) stroke(last, p)
        last = p
      }
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const p = { x: e.clientX - r.left, y: e.clientY - r.top }
      if (pointer && last) stroke(last, p)
      pointer = p
      last = p
    }
    const onLeave = () => {
      pointer = null
      last = null
    }
    const onDown = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#07090f'
      ctx.fillRect(0, 0, w, h)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [slices, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#07090f]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
