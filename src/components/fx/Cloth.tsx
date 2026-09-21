import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, themeColors } from './canvasLoop'

export interface ClothProps {
  className?: string
}

/**
 * 천 — 위를 핀으로 고정한 베를레(Verlet) 천이 중력과 바람에 흔들린다. efface 마크가 무늬로 짜여 있고
 * 포인터를 빠르게 지나면 그 방향으로 바람이 불며, 누르면 그 자리의 실이 끊어져 찢어진다.
 */
export function Cloth({ className }: ClothProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    const COLS = coarse ? 30 : 44
    const ROWS = coarse ? 20 : 28
    type P = { x: number; y: number; ox: number; oy: number; pin: boolean }
    type L = { a: number; b: number; len: number; on: boolean }
    let pts: P[] = []
    let links: L[] = []
    let sp = 10
    let ox = 0
    let oy = 0
    let lastP = { x: 0, y: 0, t: 0 }
    let wind = 0
    const build = (w: number, h: number) => {
      sp = Math.min((w * 0.7) / COLS, (h * 0.78) / ROWS)
      ox = (w - COLS * sp) / 2
      oy = h * 0.08
      pts = []
      links = []
      for (let j = 0; j <= ROWS; j++)
        for (let i = 0; i <= COLS; i++) {
          const x = ox + i * sp
          const y = oy + j * sp
          pts.push({ x, y, ox: x, oy: y, pin: j === 0 && i % 4 === 0 })
        }
      const id = (i: number, j: number) => j * (COLS + 1) + i
      for (let j = 0; j <= ROWS; j++)
        for (let i = 0; i <= COLS; i++) {
          if (i < COLS) links.push({ a: id(i, j), b: id(i + 1, j), len: sp, on: true })
          if (j < ROWS) links.push({ a: id(i, j), b: id(i, j + 1), len: sp, on: true })
        }
    }
    // 무늬 — 마크(둥근 판 두 장) 를 격자 좌표로
    const inMark = (u: number, v: number): 0 | 1 | 2 => {
      const sq = (x0: number, y0: number) => {
        const s = 0.42
        const r = 0.11
        const dx = u - x0
        const dy = v - y0
        const cx = Math.min(Math.max(dx, -s / 2 + r), s / 2 - r)
        const cy = Math.min(Math.max(dy, -s / 2 + r), s / 2 - r)
        return Math.hypot(dx - cx, dy - cy) <= r
      }
      if (sq(0.6, 0.6)) return 2
      if (sq(0.4, 0.4)) return 1
      return 0
    }
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        return {
          init: build,
          down(x, y) {
            // 찢기 — 포인터 근처 실을 끊는다
            for (const l of links) {
              const a = pts[l.a]!
              const b = pts[l.b]!
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              if (Math.hypot(mx - x, my - y) < sp * 1.6) l.on = false
            }
          },
          frame(ctx, dt, t, p, w, h) {
            // 바람 — 포인터 속도 + 잔잔한 파도
            if (p.inside) {
              // 첫 샘플은 기준만 잡는다(없던 포인터가 갑자기 나타나면 속도가 폭발한다)
              if (lastP.t > 0 && t - lastP.t < 0.5) {
                const vx = (p.x - lastP.x) / Math.max(t - lastP.t, 1e-3)
                wind = Math.max(-1.2, Math.min(1.2, wind + Math.max(-0.25, Math.min(0.25, vx * 0.0003))))
              }
              lastP = { x: p.x, y: p.y, t }
            } else lastP.t = 0
            wind *= 0.94
            const gust = Math.sin(t * 0.7) * 0.9 + Math.sin(t * 1.9) * 0.4
            const gx = reduce ? 0 : (gust + wind * 6) * 0.12
            const g = reduce ? 0 : 42 * dt * dt * 60
            // 베를레 적분
            if (!reduce)
              for (const q of pts) {
                if (q.pin) continue
                const vx = (q.x - q.ox) * 0.985
                const vy = (q.y - q.oy) * 0.985
                q.ox = q.x
                q.oy = q.y
                q.x += vx + gx * dt * 60 * (0.6 + 0.4 * Math.sin((q.y - oy) * 0.02 + t * 2))
                q.y += vy + g
              }
            // 제약 — 세 번
            for (let k = 0; k < 3; k++)
              for (const l of links) {
                if (!l.on) continue
                const a = pts[l.a]!
                const b = pts[l.b]!
                const dx = b.x - a.x
                const dy = b.y - a.y
                const d = Math.hypot(dx, dy) || 1e-4
                const diff = ((d - l.len) / d) * 0.5
                const mx = dx * diff
                const my = dy * diff
                if (!a.pin) {
                  a.x += mx
                  a.y += my
                }
                if (!b.pin) {
                  b.x -= mx
                  b.y -= my
                }
              }
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            // 천 — 네모마다 무늬색, 늘어난 만큼 어둡게(주름 음영)
            for (let j = 0; j < ROWS; j++)
              for (let i = 0; i < COLS; i++) {
                const a = pts[j * (COLS + 1) + i]!
                const b = pts[j * (COLS + 1) + i + 1]!
                const d = pts[(j + 1) * (COLS + 1) + i]!
                const e = pts[(j + 1) * (COLS + 1) + i + 1]!
                // 찢어진 곳은 비운다
                const l1 = links[(j * (COLS + 1) + i) * 2]
                if (l1 && !l1.on) continue
                const stretch = (Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(d.x - a.x, d.y - a.y)) / (2 * sp)
                const shade = Math.min(1, Math.max(0.55, 1.35 - stretch * 0.5))
                const m = inMark((i + 0.5) / COLS, (j + 0.5) / ROWS)
                const base = m === 2 ? col.accent : m === 1 ? '#f4f4f6' : '#1c1e26'
                ctx.fillStyle = base
                ctx.globalAlpha = shade
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.lineTo(e.x, e.y)
                ctx.lineTo(d.x, d.y)
                ctx.closePath()
                ctx.fill()
              }
            ctx.globalAlpha = 1
            // 핀
            ctx.fillStyle = col.dim
            for (const q of pts) if (q.pin) ctx.fillRect(q.x - 2, q.y - 2, 4, 4)
          },
        }
      },
      { still: !!reduce },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
