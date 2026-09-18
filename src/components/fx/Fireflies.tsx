import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface FirefliesProps {
  count?: number
  className?: string
}

interface Fly {
  x: number
  y: number
  a: number
  s: number
  ph: number
  r: number
}

/**
 * 반딧불이. 빛점들이 느긋하게 떠다니며 숨 쉬듯 밝아졌다 어두워진다.
 * 포인터 가까이의 반딧불이는 몰려와 더 밝게 빛나고, 누르면 흩어진다.
 */
export function Fireflies({ count = 70, className }: FirefliesProps) {
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
    let pointer: { x: number; y: number } | null = null
    let scatter = 0
    const flies: Fly[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      if (!flies.length) for (let i = 0; i < count; i++) flies.push({ x: Math.random() * w, y: Math.random() * h, a: Math.random() * Math.PI * 2, s: 0.3 + Math.random() * 0.5, ph: Math.random() * 10, r: 1.5 + Math.random() * 2 })
    }
    const draw = () => {
      t += 0.016
      scatter *= 0.94
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const f of flies) {
        f.a += (Math.random() - 0.5) * 0.3
        let vx = Math.cos(f.a) * f.s
        let vy = Math.sin(f.a) * f.s
        let near = 0
        if (pointer) {
          const dx = pointer.x - f.x
          const dy = pointer.y - f.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          near = Math.max(0, 1 - d / 180)
          vx += (dx / d) * near * 1.2 * (1 - scatter * 3)
          vy += (dy / d) * near * 1.2 * (1 - scatter * 3)
        }
        f.x += vx
        f.y += vy
        if (f.x < -10) f.x = w + 10
        if (f.x > w + 10) f.x = -10
        if (f.y < -10) f.y = h + 10
        if (f.y > h + 10) f.y = -10
        const glow = (Math.sin(t * 2 + f.ph) * 0.5 + 0.5) * 0.7 + 0.3 + near * 0.8
        const R = f.r * (3 + glow * 6)
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R)
        const c = near > 0.3 ? '96,170,255' : '255,220,120'
        g.addColorStop(0, `rgba(${c},${0.9 * glow})`)
        g.addColorStop(0.3, `rgba(${c},${0.35 * glow})`)
        g.addColorStop(1, `rgba(${c},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(f.x, f.y, R, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      scatter = 1
      for (const f of flies) f.a += Math.PI + (Math.random() - 0.5)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)
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
  }, [count, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#07090f]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
