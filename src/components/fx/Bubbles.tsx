import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountCanvas, rand } from './canvasLoop'

export interface BubblesProps {
  className?: string
}

type B = { x: number; y: number; r: number; vx: number; vy: number; wob: number; life: number; pop: number; hue: number }

/**
 * 비눗방울 — 얇은 막의 간섭색(무지개 띠)이 표면을 따라 돌고, 위쪽엔 창 반사가 맺힌다. 천천히 떠오르며
 * 흔들리고, 포인터가 닿으면 터져 물방울 조각으로 흩어진다. 아래서 계속 새로 분다.
 */
export function Bubbles({ className }: BubblesProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const bs: B[] = []
    const frags: { x: number; y: number; vx: number; vy: number; life: number }[] = []
    let next = 0.3
    return mountCanvas(
      c,
      () => ({
        init() {
          bs.length = 0
        },
        frame(ctx, dt, t, p, w, h) {
          const k = dt * 60
          if (!reduce && t > next && bs.length < 14) {
            next = t + rand(0.5, 1.2)
            bs.push({ x: rand(w * 0.15, w * 0.85), y: h + 30, r: rand(18, 54), vx: rand(-0.2, 0.2), vy: -rand(0.4, 0.9), wob: rand(0, 6), life: 0, pop: 0, hue: rand(0, 360) })
          }
          // 배경 — 부드러운 어두운 그라데이션
          const g = ctx.createLinearGradient(0, 0, 0, h)
          g.addColorStop(0, '#0e1220')
          g.addColorStop(1, '#1a1030')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
          for (let i = bs.length - 1; i >= 0; i--) {
            const b = bs[i]!
            if (b.pop > 0) {
              b.pop += dt
              if (b.pop > 0.3) bs.splice(i, 1)
              continue
            }
            b.life += dt
            b.x += (b.vx + Math.sin(t * 1.4 + b.wob) * 0.35) * k
            b.y += b.vy * k
            if (b.y < -b.r) bs.splice(i, 1)
            // 포인터에 닿으면 터진다
            if (p.inside && Math.hypot(p.x - b.x, p.y - b.y) < b.r) {
              b.pop = 0.001
              for (let j = 0; j < 14; j++) {
                const a = (j / 14) * Math.PI * 2
                frags.push({ x: b.x + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r, vx: Math.cos(a) * rand(1, 3), vy: Math.sin(a) * rand(1, 3), life: 1 })
              }
            }
          }
          for (const b of bs) {
            const r = b.r * Math.min(1, b.life * 3) // 불어나며 커진다
            const sq = 1 + Math.sin(t * 6 + b.wob) * 0.04 // 출렁임
            ctx.save()
            ctx.translate(b.x, b.y)
            ctx.scale(sq, 1 / sq)
            if (b.pop > 0) {
              // 터짐 — 링이 순간 커지며 사라진다
              ctx.globalAlpha = 1 - b.pop / 0.3
              ctx.strokeStyle = 'rgba(255,255,255,0.8)'
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.arc(0, 0, r * (1 + b.pop * 2), 0, Math.PI * 2)
              ctx.stroke()
              ctx.restore()
              continue
            }
            // 막 — 안쪽은 거의 투명, 가장자리로 갈수록 간섭색
            const film = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r)
            film.addColorStop(0, 'rgba(255,255,255,0.02)')
            film.addColorStop(0.75, `hsla(${(b.hue + t * 40) % 360} 90% 70% / 0.18)`)
            film.addColorStop(0.9, `hsla(${(b.hue + 120 + t * 40) % 360} 90% 65% / 0.32)`)
            film.addColorStop(1, `hsla(${(b.hue + 240 + t * 40) % 360} 90% 75% / 0.5)`)
            ctx.fillStyle = film
            ctx.beginPath()
            ctx.arc(0, 0, r, 0, Math.PI * 2)
            ctx.fill()
            // 표면을 도는 무지개 띠
            ctx.save()
            ctx.beginPath()
            ctx.arc(0, 0, r * 0.97, 0, Math.PI * 2)
            ctx.clip()
            ctx.globalAlpha = 0.35
            for (let s = 0; s < 3; s++) {
              const a = t * 0.7 + b.wob + (s * Math.PI * 2) / 3
              const cx = Math.cos(a) * r * 0.6
              const cy = Math.sin(a) * r * 0.6
              const band = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.7)
              band.addColorStop(0, `hsla(${(b.hue + s * 120) % 360} 100% 70% / 0.9)`)
              band.addColorStop(1, 'rgba(255,255,255,0)')
              ctx.fillStyle = band
              ctx.fillRect(-r, -r, r * 2, r * 2)
            }
            ctx.restore()
            // 창 반사 — 왼쪽 위 하이라이트 두 개
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            ctx.beginPath()
            ctx.ellipse(-r * 0.42, -r * 0.45, r * 0.16, r * 0.09, -0.7, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = 'rgba(255,255,255,0.35)'
            ctx.beginPath()
            ctx.ellipse(-r * 0.25, -r * 0.62, r * 0.06, r * 0.035, -0.7, 0, Math.PI * 2)
            ctx.fill()
            // 테두리
            ctx.strokeStyle = 'rgba(255,255,255,0.35)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(0, 0, r, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
          }
          // 조각
          ctx.fillStyle = 'rgba(220,235,255,0.9)'
          for (let i = frags.length - 1; i >= 0; i--) {
            const f = frags[i]!
            f.x += f.vx * k
            f.y += f.vy * k
            f.vy += 0.08 * k
            f.life -= 0.03 * k
            if (f.life <= 0) {
              frags.splice(i, 1)
              continue
            }
            ctx.globalAlpha = f.life
            ctx.beginPath()
            ctx.arc(f.x, f.y, 1.6, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        },
      }),
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0e1220]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
