import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { fbm2, mountCanvas, rand, themeColors } from './canvasLoop'

export interface SmokeTextProps {
  text?: string
  className?: string
}

/**
 * 연기 글자 — 글자를 이루던 입자들이 컬 노이즈 바람을 타고 연기처럼 흩어졌다가, 잠시 뒤(또는 누르면)
 * 제자리로 돌아와 다시 글자가 된다. 흩어질 땐 위로 말려 올라가고 옅어진다.
 */
export function SmokeText({ text = 'efface', className }: SmokeTextProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    type P = { x: number; y: number; tx: number; ty: number; vx: number; vy: number; a: number; s: number }
    let ps: P[] = []
    let mode: 'text' | 'smoke' = 'text'
    let since = 0
    const sample = (w: number, h: number) => {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const o = off.getContext('2d')!
      o.fillStyle = '#fff'
      o.font = `700 ${Math.min(w * 0.22, h * 0.55)}px Pretendard Variable, system-ui, sans-serif`
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillText(text, w / 2, h / 2)
      const d = o.getImageData(0, 0, w, h).data
      const step = coarse ? 5 : 3
      ps = []
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step) {
          if ((d[(y * w + x) * 4 + 3] ?? 0) > 128) ps.push({ x: x + rand(-1, 1), y: y + rand(-1, 1), tx: x, ty: y, vx: 0, vy: 0, a: 1, s: rand(1.2, 2.4) })
        }
    }
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        const toggle = () => {
          mode = mode === 'text' ? 'smoke' : 'text'
          since = 0
          if (mode === 'smoke') for (const p of ps) {
            p.vx = rand(-0.4, 0.4)
            p.vy = rand(-0.6, -0.1)
          }
        }
        return {
          init: sample,
          down: toggle,
          frame(ctx, dt, t, _p, w, h) {
            since += dt
            if (!reduce && ((mode === 'text' && since > 3.2) || (mode === 'smoke' && since > 4.2))) toggle()
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            ctx.fillStyle = col.fg
            const k = dt * 60
            for (const p of ps) {
              if (mode === 'smoke') {
                // 컬 노이즈 바람 — 위로 말려 올라간다
                const n = fbm2(p.x * 0.006 + t * 0.15, p.y * 0.006 - t * 0.2)
                const ang = n * Math.PI * 4
                p.vx += Math.cos(ang) * 0.06 * k
                p.vy += (Math.sin(ang) * 0.06 - 0.03) * k
                p.vx *= 0.97
                p.vy *= 0.97
                p.x += p.vx * k
                p.y += p.vy * k
                p.a = Math.max(0.05, p.a - 0.004 * k)
              } else {
                // 제자리로 — 스프링
                const dx = p.tx - p.x
                const dy = p.ty - p.y
                p.vx = (p.vx + dx * 0.05) * 0.78
                p.vy = (p.vy + dy * 0.05) * 0.78
                p.x += p.vx * k
                p.y += p.vy * k
                p.a = Math.min(1, p.a + 0.03 * k)
              }
              ctx.globalAlpha = p.a * (mode === 'smoke' ? 0.55 : 0.95)
              ctx.beginPath()
              ctx.arc(p.x, p.y, p.s * (mode === 'smoke' ? 1 + (1 - p.a) * 2.5 : 1), 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.globalAlpha = 1
          },
        }
      },
      { still: !!reduce, dpr: 1.5 },
    )
  }, [reduce, text])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
