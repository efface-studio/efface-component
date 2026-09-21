import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { fbm2, mountCanvas, rand } from './canvasLoop'

export interface InkWaterProps {
  className?: string
}

type Blob = { x: number; y: number; r: number; hue: number; born: number; seed: number; sat: number }

/**
 * 물속 잉크 — 떨어진 잉크 방울이 물속에서 번진다. 가장자리는 노이즈로 일렁이며 촉수처럼 갈라지고,
 * 안쪽은 옅어지며 아래로 가라앉는다. 여러 색이 겹치면 섞인다. 누르면 그 자리에 방울, 가만히 두면 가끔 떨어진다.
 */
export function InkWater({ className }: InkWaterProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const blobs: Blob[] = []
    let next = 0.8
    const drop = (x: number, y: number, t: number) => {
      blobs.push({ x, y, r: 6, hue: rand(190, 260) + (Math.random() < 0.3 ? 140 : 0), born: t, seed: Math.random() * 100, sat: rand(70, 95) })
      if (blobs.length > 9) blobs.shift()
    }
    return mountCanvas(
      c,
      () => ({
        init() {
          blobs.length = 0
        },
        down(x, y) {
          drop(x, y, performance.now() / 1000)
        },
        frame(ctx, dt, t, _p, w, h) {
          if (!reduce && t > next) {
            next = t + rand(2.2, 4.5)
            drop(rand(w * 0.2, w * 0.8), rand(h * 0.2, h * 0.6), t)
          }
          // 물 — 매 프레임 새로 칠한다(multiply 가 누적되면 색이 타 버린다)
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = '#e8eef5'
          ctx.fillRect(0, 0, w, h)
          ctx.globalCompositeOperation = 'multiply'
          for (const b of blobs) {
            const age = t - b.born + (reduce ? 3 : 0)
            const grow = 1 - Math.exp(-age * 0.9)
            const R = 10 + grow * Math.min(w, h) * 0.28
            b.y += dt * 6 // 가라앉는다
            const alpha = Math.max(0, 0.6 - age * 0.045)
            if (alpha <= 0) continue
            ctx.fillStyle = `hsla(${b.hue} ${b.sat}% 42% / ${alpha})`
            // 가장자리 — 각도마다 노이즈로 반지름이 다르고, 시간이 갈수록 촉수가 길어진다
            ctx.beginPath()
            const N = 96
            for (let i = 0; i <= N; i++) {
              const a = (i / N) * Math.PI * 2
              const n = fbm2(Math.cos(a) * 1.6 + b.seed, Math.sin(a) * 1.6 + b.seed + age * 0.25, 4)
              const tendril = Math.pow(n, 3) * Math.min(age, 7) * 22
              const rr = R * (0.55 + n * 0.55) + tendril
              const x = b.x + Math.cos(a) * rr
              const y = b.y + Math.sin(a) * rr * 1.15 + age * 3
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
            // 안쪽 짙은 심
            ctx.fillStyle = `hsla(${b.hue} ${b.sat}% 28% / ${alpha * 0.6})`
            ctx.beginPath()
            ctx.ellipse(b.x, b.y + age * 2, R * 0.25 * (1 + age * 0.05), R * 0.32, 0, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalCompositeOperation = 'source-over'
        },
      }),
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#e8eef5]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
