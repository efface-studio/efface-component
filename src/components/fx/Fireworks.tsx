import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, rand } from './canvasLoop'

export interface FireworksProps {
  /** 자동 발사 간격(초) */
  every?: number
  className?: string
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; size: number; drag: number; sparkle: boolean; crackle: boolean }
type Rocket = { x: number; y: number; vx: number; vy: number; col: string; kind: number; hue: number }

/**
 * 불꽃놀이 — 로켓이 올라가 터지면 종류마다 다르게 퍼진다: 모란(구), 버드나무(길게 늘어지는 꼬리),
 * 고리, 크래클(2차 잔불꽃). 중력·공기 저항·잔상이 있고, 누르면 그 자리에서 터진다.
 */
export function Fireworks({ every = 1.4, className }: FireworksProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    const sparks: Spark[] = []
    const rockets: Rocket[] = []
    let next = 0.6
    const burst = (x: number, y: number, hue: number, kind: number) => {
      const n = (kind === 2 ? 60 : kind === 1 ? 90 : 140) * (coarse ? 0.55 : 1)
      for (let i = 0; i < n; i++) {
        const a = kind === 2 ? (i / n) * Math.PI * 2 : Math.random() * Math.PI * 2
        const sp = kind === 2 ? 3.6 : kind === 1 ? rand(1.2, 3.2) : rand(0.6, 4.2)
        // 모란은 구 — 속도 분포를 구면으로
        const v = kind === 0 ? sp * Math.sqrt(Math.random()) : sp
        const hue2 = hue + rand(-12, 12)
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: kind === 1 ? rand(1.8, 2.8) : rand(0.9, 1.6), col: `hsl(${hue2} 100% ${kind === 1 ? 72 : 62}%)`, size: kind === 1 ? 1.6 : rand(1.4, 2.4), drag: kind === 1 ? 0.985 : 0.975, sparkle: Math.random() < 0.35, crackle: kind === 3 && Math.random() < 0.5 })
      }
      // 섬광
      sparks.push({ x, y, vx: 0, vy: 0, life: 0, max: 0.18, col: 'white', size: 40, drag: 1, sparkle: false, crackle: false })
    }
    return mountCanvas(
      c,
      () => ({
        init() {
          sparks.length = 0
          rockets.length = 0
        },
        down(x, y) {
          burst(x, y, rand(0, 360), Math.floor(Math.random() * 4))
        },
        frame(ctx, dt, t, _p, w, h) {
          // 잔상 — 지난 프레임을 조금씩 지운다
          ctx.globalCompositeOperation = 'destination-out'
          ctx.fillStyle = 'rgba(0,0,0,0.18)'
          ctx.fillRect(0, 0, w, h)
          ctx.globalCompositeOperation = 'lighter'
          if (!reduce && t > next) {
            next = t + every * rand(0.6, 1.4)
            const x = rand(w * 0.2, w * 0.8)
            rockets.push({ x, y: h + 4, vx: rand(-0.4, 0.4), vy: -rand(h * 0.011, h * 0.0145), col: 'hsl(40 100% 80%)', kind: Math.floor(Math.random() * 4), hue: rand(0, 360) })
          }
          const g = 0.09 * (dt * 60)
          for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i]!
            r.x += r.vx * dt * 60
            r.y += r.vy * dt * 60
            r.vy += g * 0.55
            ctx.fillStyle = r.col
            ctx.beginPath()
            ctx.arc(r.x, r.y, 2, 0, Math.PI * 2)
            ctx.fill()
            // 꼬리 불티
            sparks.push({ x: r.x, y: r.y, vx: rand(-0.3, 0.3), vy: rand(0.2, 0.8), life: 0, max: 0.35, col: 'hsl(35 100% 70%)', size: 1.2, drag: 0.95, sparkle: false, crackle: false })
            if (r.vy > -1.2) {
              burst(r.x, r.y, r.hue, r.kind)
              rockets.splice(i, 1)
            }
          }
          for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i]!
            s.life += dt
            if (s.life > s.max) {
              if (s.crackle) for (let k = 0; k < 4; k++) sparks.push({ x: s.x, y: s.y, vx: rand(-1.5, 1.5), vy: rand(-1.5, 1.5), life: 0, max: rand(0.2, 0.5), col: 'hsl(50 100% 85%)', size: 1.3, drag: 0.9, sparkle: true, crackle: false })
              sparks.splice(i, 1)
              continue
            }
            s.vx *= s.drag
            s.vy = s.vy * s.drag + g
            s.x += s.vx * dt * 60
            s.y += s.vy * dt * 60
            const k = 1 - s.life / s.max
            const tw = s.sparkle ? (Math.sin(s.life * 60 + s.x) > 0 ? 1 : 0.25) : 1
            ctx.globalAlpha = Math.max(0, k) * tw
            ctx.fillStyle = s.col
            if (s.size > 10) {
              const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size)
              gr.addColorStop(0, 'rgba(255,255,255,0.9)')
              gr.addColorStop(1, 'rgba(255,255,255,0)')
              ctx.fillStyle = gr
              ctx.beginPath()
              ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
              ctx.fill()
            } else {
              ctx.beginPath()
              ctx.arc(s.x, s.y, s.size * (0.6 + 0.4 * k), 0, Math.PI * 2)
              ctx.fill()
            }
          }
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          if (sparks.length > 3000) sparks.splice(0, sparks.length - 3000)
        },
      }),
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce, every])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#05060d]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
