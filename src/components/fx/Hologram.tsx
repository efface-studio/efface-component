import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, rand } from './canvasLoop'

export interface HologramProps {
  className?: string
}

/**
 * 홀로그램 — efface 마크(두 개의 둥근 판)를 점구름으로 만들어 3D 로 띄운다. 바닥 발광판에서 빛기둥이 올라오고
 * 주사선·깜빡임·색수차·가끔 한 줄이 옆으로 밀리는 글리치가 실제 홀로그램처럼 보이게 한다. 포인터가 돌린다.
 */
export function Hologram({ className }: HologramProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    // 점구름 — 둥근 판 두 장(앞면·뒷면·테두리)
    const pts: { x: number; y: number; z: number; e: number }[] = []
    const dens = isCoarsePointer() ? 0.5 : 1
    const slab = (ox: number, oy: number, oz: number, count: number) => {
      const half = 0.5
      const rx = 0.16
      for (let i = 0; i < count * dens; i++) {
        let x = rand(-half, half)
        let y = rand(-half, half)
        // 둥근 모서리 밖은 버린다
        const cx = Math.min(Math.max(x, -half + rx), half - rx)
        const cy = Math.min(Math.max(y, -half + rx), half - rx)
        if (Math.hypot(x - cx, y - cy) > rx) continue
        const edge = Math.hypot(x - cx, y - cy) > rx - 0.03 || Math.abs(x) > half - 0.03 || Math.abs(y) > half - 0.03
        const z = (Math.random() < 0.5 ? -1 : 1) * 0.06
        pts.push({ x: x + ox, y: y + oy, z: z + oz, e: edge ? 1 : 0 })
        x = 0
        y = 0
      }
    }
    slab(-0.32, 0.32, 0.18, 1100)
    slab(0.32, -0.32, -0.18, 1100)
    const view = { yaw: 0.5, ty: 0.5 }
    let glitchUntil = 0
    let glitchY = 0
    let glitchDx = 0
    return mountCanvas(
      c,
      () => ({
        frame(ctx, dt, t, p, w, h) {
          view.ty = p.inside ? (p.x / w - 0.5) * 2.4 : t * 0.35
          view.yaw += (view.ty - view.yaw) * 0.06
          ctx.fillStyle = '#04060c'
          ctx.fillRect(0, 0, w, h)
          const cx = w / 2
          const baseY = h * 0.86
          const S = Math.min(w, h) * 0.42
          // 발광판 + 빛기둥
          const beam = ctx.createLinearGradient(0, baseY, 0, h * 0.15)
          beam.addColorStop(0, 'rgba(90,200,255,0.28)')
          beam.addColorStop(1, 'rgba(90,200,255,0)')
          ctx.fillStyle = beam
          ctx.beginPath()
          ctx.moveTo(cx - S * 0.55, baseY)
          ctx.lineTo(cx + S * 0.55, baseY)
          ctx.lineTo(cx + S * 0.95, h * 0.12)
          ctx.lineTo(cx - S * 0.95, h * 0.12)
          ctx.closePath()
          ctx.fill()
          const plate = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, S * 0.7)
          plate.addColorStop(0, 'rgba(120,220,255,0.9)')
          plate.addColorStop(0.4, 'rgba(60,160,255,0.25)')
          plate.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = plate
          ctx.beginPath()
          ctx.ellipse(cx, baseY, S * 0.7, S * 0.09, 0, 0, Math.PI * 2)
          ctx.fill()
          // 깜빡임·글리치
          const flicker = reduce ? 1 : 0.82 + 0.18 * Math.sin(t * 37) * Math.sin(t * 11) + (Math.random() < 0.02 ? -0.3 : 0)
          if (!reduce && t > glitchUntil && Math.random() < 0.012) {
            glitchUntil = t + rand(0.08, 0.22)
            glitchY = rand(0.2, 0.8)
            glitchDx = rand(-18, 18)
          }
          const cy = h * 0.5
          const sy = Math.sin(view.yaw)
          const cyw = Math.cos(view.yaw)
          const tilt = 0.22
          ctx.globalCompositeOperation = 'lighter'
          // 색수차 — 빨강·파랑 상을 살짝 어긋나게, 그 위에 시안 본상
          const passes: [number, string, number][] = [
            [-2.2, 'rgba(255,60,90,0.35)', 0.6],
            [2.2, 'rgba(60,120,255,0.35)', 0.6],
            [0, 'rgba(120,235,255,0.95)', 1],
          ]
          for (const [dx, color, mul] of passes) {
            ctx.fillStyle = color
            for (const q of pts) {
              const x1 = q.x * cyw - q.z * sy
              const z1 = q.x * sy + q.z * cyw
              const y1 = q.y + z1 * tilt
              const depth = 1 / (1 + z1 * 0.5)
              let px = cx + x1 * S * depth + dx
              const py = cy - y1 * S * depth
              if (t < glitchUntil && Math.abs(py / h - glitchY) < 0.04) px += glitchDx
              const a = (0.35 + 0.65 * depth) * flicker * mul * (q.e ? 1.6 : 0.75)
              ctx.globalAlpha = Math.min(1, a)
              const s = q.e ? 1.8 : 1.3
              ctx.fillRect(px - s / 2, py - s / 2, s, s)
            }
          }
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          // 주사선 — 위로 흐른다
          ctx.fillStyle = 'rgba(0,0,0,0.22)'
          const off = reduce ? 0 : (t * 40) % 4
          for (let y = -off; y < h; y += 4) ctx.fillRect(0, y, w, 1.2)
          // 밝은 스캔 밴드 하나가 훑고 지난다
          const band = ((t * 0.25) % 1) * h
          const bg = ctx.createLinearGradient(0, band - 40, 0, band + 40)
          bg.addColorStop(0, 'rgba(160,240,255,0)')
          bg.addColorStop(0.5, 'rgba(160,240,255,0.10)')
          bg.addColorStop(1, 'rgba(160,240,255,0)')
          ctx.fillStyle = bg
          ctx.fillRect(0, band - 40, w, 80)
          void dt
        },
      }),
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#04060c]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
