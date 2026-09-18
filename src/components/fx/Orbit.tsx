import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface OrbitProps {
  className?: string
}

interface Body {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  c: string
  trail: [number, number][]
}

/**
 * 중력. 행성들이 가운데 별을 돌며 꼬리를 남긴다. 포인터는 또 하나의 별 — 궤도가 휘어지고,
 * 누르면 새 행성이 그 자리에서 태어난다.
 */
export function Orbit({ className }: OrbitProps) {
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
    let pointer: { x: number; y: number } | null = null
    const colors = ['#3b62e5', '#14b8b0', '#7c3aed', '#f59e0b', '#ff5c8a']
    const bodies: Body[] = []
    const spawn = (x: number, y: number) => {
      const cx = w / 2
      const cy = h / 2
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) || 1
      const v = Math.sqrt(2600 / d) // 원 궤도 속도
      bodies.push({ x, y, vx: (-dy / d) * v, vy: (dx / d) * v, r: 3 + Math.random() * 3, c: colors[bodies.length % colors.length] ?? '#fff', trail: [] })
      if (bodies.length > 9) bodies.shift()
    }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      if (!bodies.length) for (let i = 0; i < 5; i++) spawn(w / 2 + 60 + i * 28, h / 2 + (i % 2 ? 20 : -20))
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      for (const b of bodies) {
        for (let s = 0; s < 3; s++) {
          let ax = 0
          let ay = 0
          const dx = cx - b.x
          const dy = cy - b.y
          const d2 = Math.max(400, dx * dx + dy * dy)
          const d = Math.sqrt(d2)
          ax += (dx / d) * (2600 / d2)
          ay += (dy / d) * (2600 / d2)
          if (pointer) {
            const px = pointer.x - b.x
            const py = pointer.y - b.y
            const p2 = Math.max(300, px * px + py * py)
            const pd = Math.sqrt(p2)
            ax += (px / pd) * (900 / p2)
            ay += (py / pd) * (900 / p2)
          }
          b.vx += ax / 3
          b.vy += ay / 3
          b.x += b.vx / 3
          b.y += b.vy / 3
        }
        b.trail.push([b.x, b.y])
        if (b.trail.length > 60) b.trail.shift()
        // 너무 멀리 가면 되돌림
        if (Math.hypot(b.x - cx, b.y - cy) > Math.max(w, h)) {
          b.x = cx + 80
          b.y = cy
          b.vx = 0
          b.vy = Math.sqrt(2600 / 80)
          b.trail = []
        }
        ctx.strokeStyle = b.c
        ctx.lineWidth = 1.5
        ctx.beginPath()
        b.trail.forEach(([x, y], i) => {
          ctx.globalAlpha = i / b.trail.length
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = b.c
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
      // 별
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28)
      g.addColorStop(0, '#fff')
      g.addColorStop(0.3, '#ffe08a')
      g.addColorStop(1, 'rgba(255,200,80,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, 28, 0, Math.PI * 2)
      ctx.fill()
      if (pointer) {
        const pg = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 18)
        pg.addColorStop(0, '#9dc0ff')
        pg.addColorStop(1, 'rgba(100,150,255,0)')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 18, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      spawn(e.clientX - r.left, e.clientY - r.top)
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
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#05060a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
