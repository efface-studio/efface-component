import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TopographyProps {
  className?: string
}

/**
 * 등고선 지도. 노이즈 높이장을 마칭 스퀘어로 잘라 등고선을 긋는다 — 땅이 천천히 융기·침강하며 선이 흐르고,
 * 포인터 자리가 봉우리로 솟는다. 5번째 선은 굵게(주곡선).
 */
export function Topography({ className }: TopographyProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const CELL = 8
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let fg = '#000'
    let accent = '#2563eb'
    const pt = { x: -9, y: -9, tx: -9, ty: -9 }
    let cols = 0
    let rows = 0
    let field = new Float32Array(0)
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      cols = Math.ceil(w / CELL) + 1
      rows = Math.ceil(h / CELL) + 1
      field = new Float32Array(cols * rows)
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
    }
    const height = (x: number, y: number) => {
      const nx = x * 0.012
      const ny = y * 0.012
      let v = Math.sin(nx * 1.3 + t * 0.4) * Math.cos(ny * 1.1 - t * 0.3) + Math.sin((nx + ny) * 0.7 + t * 0.2) * 0.8 + Math.cos(nx * 2.3 - ny * 1.7 + t * 0.5) * 0.35
      const dx = x - pt.x
      const dy = y - pt.y
      v += Math.exp(-(dx * dx + dy * dy) / 9000) * 2.4
      return v
    }
    const lerp = (a: number, b: number, va: number, vb: number, iso: number) => a + ((iso - va) / (vb - va || 1e-6)) * (b - a)
    const draw = () => {
      pt.x += (pt.tx - pt.x) * 0.08
      pt.y += (pt.ty - pt.y) * 0.08
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) field[j * cols + i] = height(i * CELL, j * CELL)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      const levels = 14
      for (let L = 0; L < levels; L++) {
        const iso = -2.2 + (L / (levels - 1)) * 5.2
        const major = L % 5 === 0
        ctx.strokeStyle = major ? accent : fg
        ctx.lineWidth = major ? 1.6 : 0.8
        ctx.globalAlpha = major ? 0.9 : 0.45
        ctx.beginPath()
        for (let j = 0; j < rows - 1; j++)
          for (let i = 0; i < cols - 1; i++) {
            const x0 = i * CELL
            const y0 = j * CELL
            const x1 = x0 + CELL
            const y1 = y0 + CELL
            const a = field[j * cols + i]!
            const b = field[j * cols + i + 1]!
            const c = field[(j + 1) * cols + i + 1]!
            const d = field[(j + 1) * cols + i]!
            const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0)
            if (idx === 0 || idx === 15) continue
            const top: [number, number] = [lerp(x0, x1, a, b, iso), y0]
            const right: [number, number] = [x1, lerp(y0, y1, b, c, iso)]
            const bottom: [number, number] = [lerp(x0, x1, d, c, iso), y1]
            const left: [number, number] = [x0, lerp(y0, y1, a, d, iso)]
            const seg = (p: [number, number], q: [number, number]) => {
              ctx.moveTo(p[0], p[1])
              ctx.lineTo(q[0], q[1])
            }
            switch (idx) {
              case 1: case 14: seg(left, bottom); break
              case 2: case 13: seg(bottom, right); break
              case 3: case 12: seg(left, right); break
              case 4: case 11: seg(top, right); break
              case 5: seg(top, left); seg(bottom, right); break
              case 6: case 9: seg(top, bottom); break
              case 7: case 8: seg(top, left); break
              case 10: seg(top, right); seg(bottom, left); break
            }
          }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    const loop = () => {
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pt.tx = e.clientX - r.left
      pt.ty = e.clientY - r.top
    }
    const onLeave = () => {
      pt.tx = -999
      pt.ty = -999
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
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
