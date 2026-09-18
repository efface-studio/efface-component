import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface CirclePackingProps {
  className?: string
}

interface C {
  x: number
  y: number
  r: number
  grow: boolean
  hue: number
}

/**
 * 원 채우기. 빈 자리에 원이 태어나 이웃에 닿을 때까지 자란다 — 화면이 서서히 비눗방울 거품처럼 메워진다.
 * 포인터가 지나간 자리는 원들이 밀려나며 길이 트이고, 누르면 처음부터.
 */
export function CirclePacking({ className }: CirclePackingProps) {
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
    let fg = '#000'
    let pointer: { x: number; y: number } | null = null
    let circles: C[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      fg = getComputedStyle(host).color
      circles = []
    }
    const spawn = () => {
      for (let tries = 0; tries < 30; tries++) {
        const x = Math.random() * w
        const y = Math.random() * h
        let ok = true
        for (const c of circles)
          if ((c.x - x) ** 2 + (c.y - y) ** 2 < (c.r + 2) ** 2) {
            ok = false
            break
          }
        if (ok) {
          circles.push({ x, y, r: 1, grow: true, hue: 200 + Math.random() * 80 })
          return
        }
      }
    }
    const step = () => {
      if (circles.length < 420) for (let i = 0; i < 3; i++) spawn()
      for (const c of circles) {
        if (pointer) {
          const dx = c.x - pointer.x
          const dy = c.y - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          if (d < 90) {
            c.x += (dx / d) * (1 - d / 90) * 4
            c.y += (dy / d) * (1 - d / 90) * 4
          }
        }
        if (!c.grow) continue
        c.r += 0.5
        if (c.x - c.r < 0 || c.y - c.r < 0 || c.x + c.r > w || c.y + c.r > h) c.grow = false
        for (const o of circles) {
          if (o === c) continue
          const d = Math.hypot(c.x - o.x, c.y - o.y)
          if (d < c.r + o.r + 1.5) {
            c.grow = false
            break
          }
        }
      }
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const c of circles) {
        ctx.beginPath()
        ctx.arc(c.x, c.y, Math.max(0.5, c.r), 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${c.hue} 70% 50% / ${c.grow ? 0.55 : 0.18})`
        ctx.fill()
        ctx.strokeStyle = c.grow ? `hsl(${c.hue} 80% 65%)` : fg
        ctx.globalAlpha = c.grow ? 1 : 0.5
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
    const loop = () => {
      step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      circles = []
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 400; i++) step()
      draw()
    } else raf = requestAnimationFrame(loop)
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
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
