import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface FractalTreeProps {
  className?: string
}

/**
 * 프랙탈 나무. 가지가 재귀로 자라고, 바람(포인터 가로 위치)에 따라 끝가지일수록 크게 휘어요.
 * 누르면 새 나무가 씨앗부터 자라난다. 잎은 액센트.
 */
export function FractalTree({ className }: FractalTreeProps) {
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
    let grow = 0 // 0 → 1 자라는 정도
    let seedRand = Math.random() * 1000
    let fg = '#000'
    let accent = '#2563eb'
    let wind = 0
    let targetWind = 0
    const rand = (i: number) => {
      const x = Math.sin(i * 12.9898 + seedRand) * 43758.5453
      return x - Math.floor(x)
    }
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
    }
    let id = 0
    const branch = (x: number, y: number, len: number, ang: number, depth: number, maxDepth: number) => {
      const k = Math.min(1, Math.max(0, grow * (maxDepth + 1) - depth))
      if (k <= 0) return
      id++
      const sway = wind * (depth / maxDepth) ** 2 * 0.45 + Math.sin(t * 1.6 + depth + x * 0.01) * 0.02 * (depth / maxDepth)
      const a = ang + sway
      const L = len * k
      const nx = x + Math.cos(a) * L
      const ny = y + Math.sin(a) * L
      ctx.strokeStyle = fg
      ctx.lineWidth = Math.max(0.6, (maxDepth - depth) * 0.9)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      if (depth >= maxDepth) {
        if (k >= 1) {
          ctx.fillStyle = accent
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(nx, ny, 2.2, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
        return
      }
      if (k < 1) return
      const spread = 0.35 + rand(id) * 0.3
      const n = rand(id + 7) < 0.25 && depth > 2 ? 3 : 2
      for (let i = 0; i < n; i++) {
        const off = n === 2 ? (i ? spread : -spread) : (i - 1) * spread
        branch(nx, ny, len * (0.66 + rand(id + i) * 0.1), a + off, depth + 1, maxDepth)
      }
    }
    const draw = () => {
      t += 0.016
      grow = Math.min(1, grow + 0.006)
      wind += (targetWind - wind) * 0.04
      id = 0
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      branch(w / 2, h - 10, h * 0.22, -Math.PI / 2, 0, 9)
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      targetWind = ((e.clientX - r.left) / r.width - 0.5) * 2
    }
    const onLeave = () => {
      targetWind = 0
    }
    const onDown = () => {
      seedRand = Math.random() * 1000
      grow = 0
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      grow = 1
      id = 0
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      branch(w / 2, h - 10, h * 0.22, -Math.PI / 2, 0, 9)
    } else raf = requestAnimationFrame(draw)
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
