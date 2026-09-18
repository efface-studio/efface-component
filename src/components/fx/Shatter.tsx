import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ShatterProps {
  src: string
  /** 조각 격자 수 */
  grid?: number
  className?: string
}

interface Shard {
  pts: [number, number][]
  cx: number
  cy: number
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  a: number
}

/**
 * 이미지가 누른 자리에서 유리처럼 산산조각 나 흩어졌다가, 조각들이 되돌아와 다시 붙는다.
 * 조각은 격자를 흔든 삼각형 — 누른 점에 가까울수록 세게 튄다.
 */
export function Shatter({ src, grid = 9, className }: ShatterProps) {
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
    let img: HTMLImageElement | null = null
    let box = { x: 0, y: 0, w: 0, h: 0 }
    let shards: Shard[] = []
    let phase: 'still' | 'fly' | 'return' = 'still'
    let t = 0

    const build = () => {
      shards = []
      if (!img) return
      const s = Math.min((w * 0.7) / img.width, (h * 0.7) / img.height)
      box = { w: img.width * s, h: img.height * s, x: 0, y: 0 }
      box.x = (w - box.w) / 2
      box.y = (h - box.h) / 2
      const n = grid
      const P: [number, number][][] = []
      for (let j = 0; j <= n; j++) {
        const row: [number, number][] = []
        for (let i = 0; i <= n; i++) {
          const jx = i === 0 || i === n ? 0 : (Math.random() - 0.5) * (box.w / n) * 0.8
          const jy = j === 0 || j === n ? 0 : (Math.random() - 0.5) * (box.h / n) * 0.8
          row.push([box.x + (i / n) * box.w + jx, box.y + (j / n) * box.h + jy])
        }
        P.push(row)
      }
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const a = P[j]?.[i]
          const b = P[j]?.[i + 1]
          const c = P[j + 1]?.[i + 1]
          const d = P[j + 1]?.[i]
          if (!a || !b || !c || !d) continue
          const tris: [number, number][][] = Math.random() > 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]
          for (const pts of tris) {
            const cx = (pts[0]![0] + pts[1]![0] + pts[2]![0]) / 3
            const cy = (pts[0]![1] + pts[1]![1] + pts[2]![1]) / 3
            shards.push({ pts, cx, cy, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, a: 1 })
          }
        }
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
      build()
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      if (!img) return
      for (const s of shards) {
        ctx.save()
        ctx.globalAlpha = s.a
        ctx.translate(s.cx + s.x, s.cy + s.y)
        ctx.rotate(s.rot)
        ctx.translate(-s.cx, -s.cy)
        ctx.beginPath()
        const [p0, p1, p2] = s.pts
        if (!p0 || !p1 || !p2) continue
        ctx.moveTo(p0[0], p0[1])
        ctx.lineTo(p1[0], p1[1])
        ctx.lineTo(p2[0], p2[1])
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(img, box.x, box.y, box.w, box.h)
        ctx.restore()
      }
    }
    const loop = () => {
      t += 1 / 60
      if (phase === 'fly') {
        for (const s of shards) {
          s.vy += 0.25
          s.x += s.vx
          s.y += s.vy
          s.rot += s.vr
          s.a = Math.max(0, s.a - 0.012)
        }
        if (t > 1.4) {
          phase = 'return'
          t = 0
        }
      } else if (phase === 'return') {
        const k = Math.min(1, t / 0.9)
        const e = 1 - Math.pow(1 - k, 3)
        for (const s of shards) {
          s.x *= 1 - e * 0.25
          s.y *= 1 - e * 0.25
          s.rot *= 1 - e * 0.25
          s.a = Math.min(1, s.a + 0.05)
        }
        if (k >= 1) {
          for (const s of shards) {
            s.x = 0
            s.y = 0
            s.rot = 0
            s.a = 1
          }
          phase = 'still'
        }
      }
      draw()
      raf = phase === 'still' ? 0 : requestAnimationFrame(loop)
    }
    const shatter = (px: number, py: number) => {
      if (phase !== 'still' || reduce) return
      for (const s of shards) {
        const dx = s.cx - px
        const dy = s.cy - py
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = Math.max(2, 26 - d / 12)
        s.vx = (dx / d) * f + (Math.random() - 0.5) * 3
        s.vy = (dy / d) * f - 6 + (Math.random() - 0.5) * 3
        s.vr = (Math.random() - 0.5) * 0.25
        s.a = 1
      }
      phase = 'fly'
      t = 0
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      shatter(e.clientX - r.left, e.clientY - r.top)
    }
    const im = new Image()
    im.onload = () => {
      img = im
      build()
      draw()
    }
    im.src = src
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointerdown', onDown)
    }
  }, [src, grid, reduce])
  return (
    <div className={cn('relative h-full w-full cursor-pointer touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
