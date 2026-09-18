import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface HexPulseProps {
  size?: number
  className?: string
}

/**
 * 육각 벌집. 포인터 주변 칸이 부풀며 액센트로 켜지고, 누르면 그 자리에서 파문이 벌집을 타고 퍼진다.
 */
export function HexPulse({ size = 18, className }: HexPulseProps) {
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
    let line = '#ddd'
    let accent = '#2563eb'
    let pointer = { x: -9999, y: -9999 }
    const ripples: { x: number; y: number; t: number }[] = []
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
      line = cs.getPropertyValue('--line-strong').trim() || line
      accent = cs.getPropertyValue('--accent').trim() || accent
      draw()
    }
    const hex = (x: number, y: number, r: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6
        const px = x + Math.cos(a) * r
        const py = y + Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const dx = size * Math.sqrt(3)
      const dy = size * 1.5
      const cols = Math.ceil(w / dx) + 1
      const rows = Math.ceil(h / dy) + 1
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * dx + (r % 2 ? dx / 2 : 0)
          const y = r * dy
          let k = 0
          const pd = Math.hypot(x - pointer.x, y - pointer.y)
          if (pd < 120) k += (1 - pd / 120) ** 1.5
          for (const rp of ripples) {
            const d = Math.hypot(x - rp.x, y - rp.y)
            const ring = rp.t * 320
            const dd = Math.abs(d - ring)
            if (dd < 40) k += (1 - dd / 40) * (1 - rp.t)
          }
          k = Math.min(1, k + 0.04 * (Math.sin(t + c * 0.3 + r * 0.5) * 0.5 + 0.5))
          hex(x, y, size * (0.86 + k * 0.1) - 1.5)
          if (k > 0.05) {
            ctx.fillStyle = accent
            ctx.globalAlpha = k * 0.85
            ctx.fill()
            ctx.globalAlpha = 1
          }
          ctx.strokeStyle = k > 0.3 ? accent : line
          ctx.lineWidth = 1
          ctx.stroke()
        }
    }
    const loop = () => {
      t += 0.016
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        if (!rp) continue
        rp.t += 0.011
        if (rp.t >= 1) ripples.splice(i, 1)
      }
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 }
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0 })
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
  }, [size, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
