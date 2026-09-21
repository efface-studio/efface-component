import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountCanvas, rand, themeColors } from './canvasLoop'

export interface PlinkoProps {
  className?: string
}

type Ball = { x: number; y: number; vx: number; vy: number; r: number; hue: number; done: boolean }
type Peg = { x: number; y: number; hit: number }

/**
 * 플링코 — 못 판을 따라 공이 튕기며 떨어져 아래 칸에 쌓인다. 못은 맞을 때 빛나고, 칸은 쌓인 만큼
 * 막대가 자란다(가운데가 높은 종 모양이 저절로 생긴다). 누르면 그 자리에서 떨어뜨리고, 가만히 두면 자동.
 */
export function Plinko({ className }: PlinkoProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    let pegs: Peg[] = []
    const balls: Ball[] = []
    let bins: number[] = []
    let binW = 20
    let rows = 9
    let next = 0.4
    let top = 0
    let floor = 0
    const layout = (w: number, h: number) => {
      rows = w < 420 ? 8 : 10
      const cols = rows + 2
      binW = w / cols
      top = h * 0.14
      floor = h * 0.8
      pegs = []
      const gapY = (floor - top) / rows
      for (let r = 0; r < rows; r++) {
        const n = r + 3
        const startX = w / 2 - ((n - 1) * binW) / 2
        for (let i = 0; i < n; i++) pegs.push({ x: startX + i * binW, y: top + r * gapY, hit: 0 })
      }
      bins = Array(cols).fill(0)
      balls.length = 0
    }
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        const drop = (x: number) => balls.push({ x: x + rand(-2, 2), y: top - 40, vx: 0, vy: 0, r: Math.max(4, binW * 0.16), hue: rand(200, 250), done: false })
        return {
          init: layout,
          down(x) {
            drop(x)
          },
          frame(ctx, dt, t, _p, w, h) {
            if (!reduce && t > next) {
              next = t + rand(0.35, 0.8)
              drop(w / 2 + rand(-binW * 0.6, binW * 0.6))
            }
            const k = Math.min(2, dt * 60)
            for (const b of balls) {
              if (b.done) continue
              b.vy += 0.32 * k
              b.x += b.vx * k
              b.y += b.vy * k
              b.vx *= 0.995
              for (const pg of pegs) {
                const dx = b.x - pg.x
                const dy = b.y - pg.y
                const d = Math.hypot(dx, dy)
                const min = b.r + 4
                if (d < min && d > 0) {
                  const nx = dx / d
                  const ny = dy / d
                  b.x = pg.x + nx * min
                  b.y = pg.y + ny * min
                  const dot = b.vx * nx + b.vy * ny
                  b.vx = (b.vx - 2 * dot * nx) * 0.55 + rand(-0.6, 0.6)
                  b.vy = (b.vy - 2 * dot * ny) * 0.55
                  pg.hit = 1
                }
              }
              if (b.x < b.r) {
                b.x = b.r
                b.vx = Math.abs(b.vx) * 0.5
              }
              if (b.x > w - b.r) {
                b.x = w - b.r
                b.vx = -Math.abs(b.vx) * 0.5
              }
              if (b.y > floor + 6) {
                b.done = true
                const i = Math.min(bins.length - 1, Math.max(0, Math.floor(b.x / binW)))
                bins[i] = (bins[i] ?? 0) + 1
              }
            }
            // 오래된 공 정리
            while (balls.length > 120) balls.shift()
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            // 칸 막대 — 쌓인 만큼
            const maxBin = Math.max(6, ...bins)
            for (let i = 0; i < bins.length; i++) {
              const hh = ((bins[i] ?? 0) / maxBin) * (h - floor - 16)
              ctx.fillStyle = col.accent
              ctx.globalAlpha = 0.25 + 0.6 * ((bins[i] ?? 0) / maxBin)
              ctx.fillRect(i * binW + 3, h - 8 - hh, binW - 6, hh)
            }
            ctx.globalAlpha = 1
            // 칸 구분선
            ctx.fillStyle = col.dim
            for (let i = 1; i < bins.length; i++) ctx.fillRect(i * binW - 0.5, floor, 1, h - floor - 8)
            // 못
            for (const pg of pegs) {
              pg.hit *= 0.9
              ctx.fillStyle = col.fg
              ctx.globalAlpha = 0.35 + pg.hit * 0.65
              ctx.beginPath()
              ctx.arc(pg.x, pg.y, 3.5 + pg.hit * 2, 0, Math.PI * 2)
              ctx.fill()
              if (pg.hit > 0.2) {
                ctx.globalAlpha = pg.hit * 0.5
                ctx.fillStyle = col.accent
                ctx.beginPath()
                ctx.arc(pg.x, pg.y, 10 * pg.hit, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            ctx.globalAlpha = 1
            // 공
            for (const b of balls) {
              if (b.done) continue
              const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, 0, b.x, b.y, b.r)
              g.addColorStop(0, '#ffffff')
              g.addColorStop(1, `hsl(${b.hue} 80% 55%)`)
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
              ctx.fill()
            }
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
