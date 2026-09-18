import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface RibbonProps {
  className?: string
}

/**
 * 비단 띠. 3D 로 꼬이며 흐르는 띠를 얇은 사변형 조각으로 그린다 — 앞뒤 면의 밝기가 달라 꼬임이 보인다.
 * 포인터가 띠를 들어 올린다.
 */
export function Ribbon({ className }: RibbonProps) {
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
    const pt = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      pt.x += (pt.tx - pt.x) * 0.05
      pt.y += (pt.ty - pt.y) * 0.05
      const N = 90
      const width = 70
      let prev: [number, number, number, number] | null = null
      for (let i = 0; i <= N; i++) {
        const u = i / N
        const lift = Math.exp(-((u - pt.x) ** 2) * 12) * (0.5 - pt.y) * 180
        const cx = u * w
        const cy = h / 2 + Math.sin(u * 5 + t * 1.2) * 40 + Math.sin(u * 2.3 - t * 0.7) * 30 + lift
        const twist = u * 8 + t * 1.6
        const half = Math.cos(twist) * width * 0.5
        const nx = -Math.sin(u * 5 + t * 1.2) * 0.2
        const p1: [number, number] = [cx - nx * half, cy - half]
        const p2: [number, number] = [cx + nx * half, cy + half]
        if (prev) {
          const facing = Math.cos(twist) // 앞/뒤
          const hue = 220 + u * 60
          const light = 45 + facing * 22
          ctx.fillStyle = `hsl(${hue} 85% ${light}%)`
          ctx.strokeStyle = ctx.fillStyle
          ctx.beginPath()
          ctx.moveTo(prev[0], prev[1])
          ctx.lineTo(p1[0], p1[1])
          ctx.lineTo(p2[0], p2[1])
          ctx.lineTo(prev[2], prev[3])
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
        prev = [p1[0], p1[1], p2[0], p2[1]]
      }
    }
    const loop = () => {
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pt.tx = (e.clientX - r.left) / r.width
      pt.ty = (e.clientY - r.top) / r.height
    }
    const onLeave = () => {
      pt.tx = 0.5
      pt.ty = 0.5
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
