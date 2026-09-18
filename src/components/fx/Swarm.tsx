import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface SwarmProps {
  count?: number
  className?: string
}

interface Boid {
  x: number
  y: number
  vx: number
  vy: number
}

/**
 * 새떼(보이드). 정렬 · 결집 · 분리 세 규칙만으로 떼가 살아 움직인다.
 * 포인터는 포식자 — 떼가 갈라지며 피하고, 누르면 그 자리로 몰려든다.
 */
export function Swarm({ count = 140, className }: SwarmProps) {
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
    let accent = '#2563eb'
    let pointer: { x: number; y: number } | null = null
    let attract = false
    const boids: Boid[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      if (!boids.length) for (let i = 0; i < count; i++) boids.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 })
    }
    const step = () => {
      const R = 60
      for (const b of boids) {
        let ax = 0
        let ay = 0
        let cx = 0
        let cy = 0
        let sx = 0
        let sy = 0
        let n = 0
        for (const o of boids) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > R * R) continue
          n++
          ax += o.vx
          ay += o.vy
          cx += o.x
          cy += o.y
          if (d2 < 400) {
            sx -= dx / (d2 + 1)
            sy -= dy / (d2 + 1)
          }
        }
        if (n) {
          b.vx += ((ax / n - b.vx) * 0.05 + (cx / n - b.x) * 0.002) + sx * 6
          b.vy += ((ay / n - b.vy) * 0.05 + (cy / n - b.y) * 0.002) + sy * 6
        }
        if (pointer) {
          const dx = pointer.x - b.x
          const dy = pointer.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          if (attract) {
            b.vx += (dx / d) * 0.25
            b.vy += (dy / d) * 0.25
          } else if (d < 140) {
            b.vx -= (dx / d) * (1 - d / 140) * 1.4
            b.vy -= (dy / d) * (1 - d / 140) * 1.4
          }
        }
        // 속도 제한
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1
        const max = 3.2
        const min = 1.2
        if (sp > max) {
          b.vx = (b.vx / sp) * max
          b.vy = (b.vy / sp) * max
        } else if (sp < min) {
          b.vx = (b.vx / sp) * min
          b.vy = (b.vy / sp) * min
        }
        b.x += b.vx
        b.y += b.vy
        if (b.x < 0) b.x += w
        if (b.x > w) b.x -= w
        if (b.y < 0) b.y += h
        if (b.y > h) b.y -= h
      }
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const b of boids) {
        const a = Math.atan2(b.vy, b.vx)
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(a)
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.moveTo(6, 0)
        ctx.lineTo(-4, 3)
        ctx.lineTo(-2, 0)
        ctx.lineTo(-4, -3)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      if (pointer) {
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, attract ? 8 : 5, 0, Math.PI * 2)
        ctx.fill()
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
      attract = false
    }
    const onDown = () => {
      attract = true
    }
    const onUp = () => {
      attract = false
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerup', onUp)
    }
  }, [count, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
