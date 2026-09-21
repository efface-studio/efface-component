import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, rand } from './canvasLoop'

export interface GalaxyProps {
  className?: string
}

/**
 * 나선 은하 — 수천 개의 별을 로그 나선 팔·중심 팽대부·얇은 원반에 뿌리고 3D 로 투영한다.
 * 안쪽이 빠르게 도는 차등 회전, 팔은 푸른 신생 별과 붉은 먼지, 중심은 노란 늙은 별. 포인터가 기울인다.
 */
export function Galaxy({ className }: GalaxyProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const n = isCoarsePointer() ? 2200 : 5200
    type Star = { r: number; a: number; z: number; s: number; col: string; speed: number }
    const stars: Star[] = []
    for (let i = 0; i < n; i++) {
      const bulge = Math.random() < 0.22
      const r = bulge ? Math.pow(Math.random(), 1.8) * 0.28 : 0.12 + Math.pow(Math.random(), 0.7) * 0.95
      const arm = Math.floor(Math.random() * 2)
      // 로그 나선: 각 = k·ln(r) + 팔 오프셋 + 흩어짐
      const spread = bulge ? Math.PI * 2 : 0.35 + r * 0.5
      const a = 3.2 * Math.log(r + 0.08) + arm * Math.PI + rand(-spread, spread)
      const z = (bulge ? rand(-0.16, 0.16) : rand(-0.03, 0.03)) * (1 - r * 0.4)
      const hot = Math.random()
      const col = bulge ? `hsl(${42 + hot * 15} 90% ${70 + hot * 20}%)` : hot < 0.12 ? `hsl(${10 + hot * 60} 80% 55%)` : hot < 0.6 ? `hsl(${210 + hot * 30} 85% ${75 + hot * 20}%)` : `hsl(${200 + hot * 40} 40% 95%)`
      stars.push({ r, a, z, s: bulge ? rand(0.6, 1.6) : rand(0.5, 1.4) * (hot > 0.85 ? 1.8 : 1), col, speed: 0.5 / (0.25 + r) })
    }
    const view = { pitch: 0.95, yaw: 0, tp: 0.95, ty: 0 }
    return mountCanvas(
      c,
      () => ({
        frame(ctx, dt, t, p, w, h) {
          view.tp = p.inside ? 0.55 + ((p.y / h) * 0.9) : 0.95
          view.ty = p.inside ? (p.x / w - 0.5) * 0.8 : Math.sin(t * 0.08) * 0.25
          view.pitch += (view.tp - view.pitch) * 0.04
          view.yaw += (view.ty - view.yaw) * 0.04
          ctx.fillStyle = '#03040a'
          ctx.fillRect(0, 0, w, h)
          const cx = w / 2
          const cy = h / 2
          const R = Math.min(w, h) * 0.46
          // 중심 광휘
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55)
          g.addColorStop(0, 'rgba(255,225,170,0.55)')
          g.addColorStop(0.25, 'rgba(255,200,140,0.18)')
          g.addColorStop(1, 'rgba(120,120,200,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.ellipse(cx, cy, R * 0.6, R * 0.6 * Math.abs(Math.sin(view.pitch)) + R * 0.08, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalCompositeOperation = 'lighter'
          const sp = Math.sin(view.pitch)
          const cp = Math.cos(view.pitch)
          const sy = Math.sin(view.yaw)
          const cyw = Math.cos(view.yaw)
          const spin = reduce ? 0 : t * 0.12
          for (const s of stars) {
            const a = s.a + spin * s.speed
            let x = Math.cos(a) * s.r
            let y = Math.sin(a) * s.r
            const z0 = s.z
            // 요(yaw) → 피치
            const x1 = x * cyw - y * sy
            const y1 = x * sy + y * cyw
            const y2 = y1 * sp + z0 * cp
            const z2 = -y1 * cp + z0 * sp
            x = x1
            y = y2
            const depth = 1 / (1 + z2 * 0.6)
            const px = cx + x * R * depth
            const py = cy + y * R * depth
            const size = s.s * depth * (w > 700 ? 1 : 0.8)
            ctx.globalAlpha = 0.55 + 0.45 * depth
            ctx.fillStyle = s.col
            ctx.fillRect(px - size / 2, py - size / 2, size, size)
          }
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          // 아주 먼 배경 별
          ctx.fillStyle = 'rgba(255,255,255,0.35)'
          for (let i = 0; i < 40; i++) {
            const x = ((i * 977) % 1000) / 1000
            const y = ((i * 613) % 1000) / 1000
            ctx.fillRect(x * w, y * h, 1, 1)
          }
          void dt
        },
      }),
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#03040a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
