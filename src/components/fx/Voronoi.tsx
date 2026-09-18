import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface VoronoiProps {
  seeds?: number
  className?: string
}

/**
 * 보로노이 세포. 씨앗들이 떠다니며 가장 가까운 씨앗의 영역으로 화면이 갈라진다 — 경계는 밝은 선, 안쪽은 씨앗별 색.
 * 포인터도 씨앗이라 그 영역이 따라오고, 누르면 씨앗이 하나 더 생긴다.
 */
export function Voronoi({ seeds = 14, className }: VoronoiProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const S = 3
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let img: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    let pointer: { x: number; y: number } | null = null
    const pts: { x: number; y: number; vx: number; vy: number; c: [number, number, number] }[] = []
    const hsl = (hue: number): [number, number, number] => {
      const c = document.createElement('canvas').getContext('2d')
      if (!c) return [0, 0, 0]
      c.fillStyle = `hsl(${hue} 70% 45%)`
      const v = c.fillStyle
      return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]
    }
    const add = (x: number, y: number) => pts.push({ x, y, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, c: hsl(200 + Math.random() * 80) })
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lw = Math.ceil(w / S)
      lh = Math.ceil(h / S)
      off = document.createElement('canvas')
      off.width = lw
      off.height = lh
      img = off.getContext('2d')?.createImageData(lw, lh) ?? null
      if (!pts.length) for (let i = 0; i < seeds; i++) add(Math.random() * lw, Math.random() * lh)
    }
    const draw = () => {
      if (!img || !off) return
      const all = pointer ? [...pts, { x: pointer.x / S, y: pointer.y / S, vx: 0, vy: 0, c: [255, 255, 255] as [number, number, number] }] : pts
      const d = img.data
      for (let y = 0; y < lh; y++)
        for (let x = 0; x < lw; x++) {
          let d1 = Infinity
          let d2 = Infinity
          let best = all[0]!
          for (const p of all) {
            const dx = p.x - x
            const dy = p.y - y
            const dd = dx * dx + dy * dy
            if (dd < d1) {
              d2 = d1
              d1 = dd
              best = p
            } else if (dd < d2) d2 = dd
          }
          const edge = Math.sqrt(d2) - Math.sqrt(d1) // 경계에 가까울수록 0
          const k = Math.min(1, edge / 2.2)
          const shade = 0.55 + 0.45 * Math.min(1, Math.sqrt(d1) / 40)
          const i = (y * lw + x) * 4
          d[i] = best.c[0] * shade * k + 255 * (1 - k)
          d[i + 1] = best.c[1] * shade * k + 255 * (1 - k)
          d[i + 2] = best.c[2] * shade * k + 255 * (1 - k)
          d[i + 3] = 255
        }
      off.getContext('2d')?.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
    }
    const loop = () => {
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > lw) p.vx *= -1
        if (p.y < 0 || p.y > lh) p.vy *= -1
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
      add((e.clientX - r.left) / S, (e.clientY - r.top) / S)
      if (pts.length > 26) pts.shift()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
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
  }, [seeds, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
