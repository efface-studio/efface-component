import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, themeColors } from './canvasLoop'

export interface CrystalGrowthProps {
  className?: string
}

/**
 * 결정 성장 — 확산 제한 응집(DLA). 떠도는 입자가 씨앗에 닿으면 붙어 가지를 뻗고, 새 가지 끝이 다시
 * 입자를 잡아 눈꽃·서리 같은 프랙탈이 자란다. 붙은 순서대로 색이 옮겨가고, 누르면 그 자리에 새 씨앗.
 */
export function CrystalGrowth({ className }: CrystalGrowthProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    const CELL = coarse ? 3 : 2
    let gw = 0
    let gh = 0
    let grid: Uint16Array = new Uint16Array(0) // 0 빈칸 · n 붙은 순서(색)
    let walkers: { x: number; y: number }[] = []
    let stuck = 0
    let layer: HTMLCanvasElement | null = null
    let lctx: CanvasRenderingContext2D | null = null
    let seedsAt: { x: number; y: number }[] = []
    const seed = (x: number, y: number) => {
      const i = Math.round(y / CELL) * gw + Math.round(x / CELL)
      if (i >= 0 && i < grid.length) grid[i] = 1
    }
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        const paint = (gx: number, gy: number, n: number) => {
          if (!lctx) return
          const hue = (200 + n * 0.04) % 360
          lctx.fillStyle = `hsl(${hue} 85% ${60 + Math.min(30, n * 0.002)}%)`
          lctx.fillRect(gx * CELL, gy * CELL, CELL, CELL)
        }
        return {
          init(w, h) {
            gw = Math.ceil(w / CELL)
            gh = Math.ceil(h / CELL)
            grid = new Uint16Array(gw * gh)
            layer = document.createElement('canvas')
            layer.width = w
            layer.height = h
            lctx = layer.getContext('2d')
            stuck = 0
            seedsAt = [{ x: w / 2, y: h / 2 }]
            seed(w / 2, h / 2)
            const n = coarse ? 900 : 2200
            walkers = Array.from({ length: n }, () => ({ x: Math.random() * gw, y: Math.random() * gh }))
          },
          down(x, y) {
            seedsAt.push({ x, y })
            seed(x, y)
          },
          frame(ctx, dt, t, p, w, h) {
            void dt
            void t
            // 걷기 — 입자마다 여러 걸음, 이웃에 결정이 있으면 붙는다
            const steps = reduce ? 0 : 6
            for (let s = 0; s < steps; s++) {
              for (const wk of walkers) {
                wk.x += (Math.random() - 0.5) * 2.2
                wk.y += (Math.random() - 0.5) * 2.2
                // 포인터 쪽으로 살짝 흐른다 — 결정이 포인터 방향으로 자란다
                if (p.inside) {
                  wk.x += ((p.x / CELL - wk.x) / gw) * 0.6
                  wk.y += ((p.y / CELL - wk.y) / gh) * 0.6
                }
                if (wk.x < 1) wk.x = gw - 2
                else if (wk.x > gw - 2) wk.x = 1
                if (wk.y < 1) wk.y = gh - 2
                else if (wk.y > gh - 2) wk.y = 1
                const gx = wk.x | 0
                const gy = wk.y | 0
                const i = gy * gw + gx
                if (grid[i - 1] || grid[i + 1] || grid[i - gw] || grid[i + gw] || grid[i - gw - 1] || grid[i + gw + 1]) {
                  stuck++
                  grid[i] = Math.min(65535, stuck)
                  paint(gx, gy, stuck)
                  // 다시 가장자리에서 출발
                  const a = Math.random() * Math.PI * 2
                  wk.x = gw / 2 + Math.cos(a) * gw * 0.48
                  wk.y = gh / 2 + Math.sin(a) * gh * 0.48
                }
              }
            }
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            if (layer) {
              ctx.shadowColor = 'rgba(120,200,255,0.55)'
              ctx.shadowBlur = 8
              ctx.drawImage(layer, 0, 0)
              ctx.shadowBlur = 0
            }
            // 떠도는 입자
            ctx.fillStyle = 'rgba(160,200,255,0.35)'
            for (let i = 0; i < walkers.length; i += 3) {
              const wk = walkers[i]!
              ctx.fillRect(wk.x * CELL, wk.y * CELL, 1.5, 1.5)
            }
            // 씨앗
            ctx.fillStyle = col.fg
            for (const s of seedsAt) ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3)
          },
        }
      },
      { still: !!reduce, dpr: 1 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
