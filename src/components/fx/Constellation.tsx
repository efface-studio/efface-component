import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ConstellationProps {
  count?: number
  /** 선이 이어지는 거리(px) */
  link?: number
  className?: string
}

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

/**
 * 별들이 천천히 떠다니며 가까운 별끼리 실처럼 이어진다. 포인터는 큰 별이 되어 주변을 끌어모으고,
 * 누르면 그 자리에서 별들이 밀려났다 돌아온다.
 */
export function Constellation({ count = 90, link = 120, className }: ConstellationProps) {
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
    const nodes: Node[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      if (!nodes.length) for (let i = 0; i < count; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 })
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const all = pointer ? [...nodes, { x: pointer.x, y: pointer.y, vx: 0, vy: 0 }] : nodes
      for (let i = 0; i < all.length; i++) {
        const a = all[i]
        if (!a) continue
        for (let j = i + 1; j < all.length; j++) {
          const b = all[j]
          if (!b) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          const L = pointer && (a === all[all.length - 1] || b === all[all.length - 1]) ? link * 1.8 : link
          if (d2 < L * L) {
            const k = 1 - Math.sqrt(d2) / L
            ctx.strokeStyle = pointer && (i === all.length - 1 || j === all.length - 1) ? accent : fg
            ctx.globalAlpha = k * 0.5
            ctx.lineWidth = 0.8 + k
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      for (const n of nodes) {
        ctx.fillStyle = fg
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      if (pointer) {
        ctx.fillStyle = accent
        ctx.shadowColor = accent
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
    const loop = () => {
      for (const n of nodes) {
        if (pointer) {
          const dx = pointer.x - n.x
          const dy = pointer.y - n.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          if (d < link * 2) {
            n.vx += (dx / d) * 0.012
            n.vy += (dy / d) * 0.012
          }
        }
        n.vx *= 0.985
        n.vy *= 0.985
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        n.x = Math.max(0, Math.min(w, n.x))
        n.y = Math.max(0, Math.min(h, n.y))
      }
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
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      for (const n of nodes) {
        const dx = n.x - px
        const dy = n.y - py
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = Math.max(0, 1 - d / 220) * 9
        n.vx += (dx / d) * f
        n.vy += (dy / d) * f
      }
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
  }, [count, link, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
