import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, rand } from './canvasLoop'

export interface SnowGlobeProps {
  className?: string
}

type Flake = { x: number; y: number; z: number; vx: number; vy: number; vz: number; s: number }

/**
 * 스노우글로브 — 유리구 안에서 눈이 천천히 가라앉고 바닥에 쌓인다. 흔들면(누르거나 포인터를 빠르게 움직이면)
 * 눈이 소용돌이치며 다시 떠오른다. 구는 굴절 하이라이트와 받침이 있고, 안엔 efface 마크가 서 있다.
 */
export function SnowGlobe({ className }: SnowGlobeProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    const flakes: Flake[] = []
    let lastX = 0
    let shake = 0
    let R = 100
    let cx = 0
    let cy = 0
    let floorY = 0
    const spawn = () => {
      flakes.length = 0
      for (let i = 0; i < (coarse ? 260 : 520); i++) {
        const a = Math.random() * Math.PI * 2
        const rr = Math.sqrt(Math.random()) * R * 0.9
        flakes.push({ x: Math.cos(a) * rr, y: rand(-R * 0.9, R * 0.8), z: rand(-0.9, 0.9), vx: 0, vy: 0, vz: 0, s: rand(1, 2.4) })
      }
    }
    return mountCanvas(
      c,
      (host) => {
        const accent = getComputedStyle(host).getPropertyValue('--accent').trim() || '#3b62e5'
        return {
          init(w, h) {
            R = Math.min(w, h) * 0.34
            cx = w / 2
            cy = h * 0.46
            floorY = R * 0.72
            spawn()
          },
          down() {
            shake = 1
          },
          frame(ctx, dt, t, p, w, h) {
            // 흔들기 — 포인터 속도
            if (p.inside) {
              const v = Math.abs(p.x - lastX) / Math.max(dt, 1e-3)
              if (v > 900) shake = Math.min(1, shake + 0.35)
              lastX = p.x
            }
            const k = dt * 60
            for (const f of flakes) {
              if (shake > 0.02 && !reduce) {
                // 소용돌이 + 위로 튀어오름
                const a = Math.atan2(f.y, f.x)
                f.vx += (-Math.sin(a) * 2.2 + rand(-1, 1)) * shake * 0.6
                f.vy += (-3 - rand(0, 2)) * shake * 0.5
                f.vz += rand(-0.3, 0.3) * shake
              }
              f.vy += 0.012 * k
              f.vx *= 0.96
              f.vy *= 0.96
              f.vz *= 0.96
              f.x += f.vx * k + Math.sin(t * 1.5 + f.s * 7) * 0.08
              f.y += f.vy * k
              f.z += f.vz * 0.01 * k
              f.z = Math.max(-0.95, Math.min(0.95, f.z))
              // 구 안에 가둔다
              const rr = R * 0.93
              const d = Math.hypot(f.x, f.y)
              if (d > rr) {
                f.x *= rr / d
                f.y *= rr / d
                f.vx *= -0.3
                f.vy *= -0.3
              }
              if (f.y > floorY) {
                f.y = floorY - rand(0, 6)
                f.vy = 0
                f.vx *= 0.5
              }
            }
            shake *= 0.9
            // 배경
            const bg = ctx.createLinearGradient(0, 0, 0, h)
            bg.addColorStop(0, '#0c0f1a')
            bg.addColorStop(1, '#1a1522')
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, w, h)
            // 받침
            ctx.fillStyle = '#3a2a24'
            ctx.beginPath()
            ctx.ellipse(cx, cy + R * 0.98, R * 0.62, R * 0.16, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#4b352c'
            ctx.fillRect(cx - R * 0.62, cy + R * 0.82, R * 1.24, R * 0.16)
            ctx.beginPath()
            ctx.ellipse(cx, cy + R * 0.82, R * 0.62, R * 0.16, 0, 0, Math.PI * 2)
            ctx.fill()
            // 구 안
            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, R, 0, Math.PI * 2)
            ctx.clip()
            const inner = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
            inner.addColorStop(0, '#1a2440')
            inner.addColorStop(1, '#0a0d18')
            ctx.fillStyle = inner
            ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
            // 쌓인 눈
            ctx.fillStyle = '#eef2ff'
            ctx.beginPath()
            ctx.ellipse(cx, cy + floorY + 4, R * 0.75, R * 0.14, 0, 0, Math.PI * 2)
            ctx.fill()
            // 뒤쪽 눈
            const back = flakes.filter((f) => f.z < 0)
            const front = flakes.filter((f) => f.z >= 0)
            const drawFlakes = (arr: Flake[]) => {
              for (const f of arr) {
                const depth = (f.z + 1) / 2
                ctx.globalAlpha = 0.35 + 0.65 * depth
                ctx.fillStyle = '#ffffff'
                const s = f.s * (0.6 + depth * 0.7)
                ctx.beginPath()
                ctx.arc(cx + f.x * (0.8 + depth * 0.2), cy + f.y, s, 0, Math.PI * 2)
                ctx.fill()
              }
              ctx.globalAlpha = 1
            }
            drawFlakes(back)
            // 마크 — 눈 위에 선 두 판
            const m = R * 0.22
            ctx.fillStyle = '#f4f4f6'
            roundRect(ctx, cx - m * 0.85, cy + floorY - m * 1.7, m, m, m * 0.28)
            ctx.fillStyle = accent
            roundRect(ctx, cx - m * 0.15, cy + floorY - m * 1.05, m, m, m * 0.28)
            drawFlakes(front)
            ctx.restore()
            // 유리 — 굴절 림 + 하이라이트
            const rim = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R)
            rim.addColorStop(0, 'rgba(255,255,255,0)')
            rim.addColorStop(1, 'rgba(180,200,255,0.25)')
            ctx.fillStyle = rim
            ctx.beginPath()
            ctx.arc(cx, cy, R, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.fillStyle = 'rgba(255,255,255,0.35)'
            ctx.beginPath()
            ctx.ellipse(cx - R * 0.42, cy - R * 0.5, R * 0.18, R * 0.09, -0.75, 0, Math.PI * 2)
            ctx.fill()
          },
        }
      },
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0c0f1a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}
