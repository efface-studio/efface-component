import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountCanvas, rand, themeColors } from './canvasLoop'

export interface MagnetLettersProps {
  text?: string
  className?: string
}

/**
 * 자석 글자 — 글자 하나하나가 물리 몸체다. 포인터가 가까이 오면 밀려나며 돌고, 멀어지면 스프링으로
 * 제자리에 돌아와 문장이 다시 읽힌다. 누르면 반대로 끌어당겨 뭉친다. 서로 부딪히면 튕긴다.
 */
export function MagnetLetters({ text = '작게 일하고, 깊게 팝니다.', className }: MagnetLettersProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    type L = { ch: string; x: number; y: number; hx: number; hy: number; vx: number; vy: number; r: number; av: number; w: number }
    let ls: L[] = []
    let fontPx = 40
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        return {
          init(w, h) {
            fontPx = Math.min(w / (text.length * 0.72), h * 0.28, 64)
            const meas = document.createElement('canvas').getContext('2d')!
            meas.font = `600 ${fontPx}px Pretendard Variable, system-ui, sans-serif`
            const widths = [...text].map((ch) => meas.measureText(ch).width)
            const total = widths.reduce((a, b) => a + b, 0)
            let x = w / 2 - total / 2
            ls = [...text].map((ch, i) => {
              const cw = widths[i]!
              const l: L = { ch, x: x + cw / 2, y: h / 2, hx: x + cw / 2, hy: h / 2, vx: 0, vy: 0, r: 0, av: 0, w: cw }
              x += cw
              return l
            })
          },
          frame(ctx, dt, t, p, w, h) {
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            const k = Math.min(2, dt * 60)
            const R = fontPx * 2.2
            for (const l of ls) {
              if (l.ch === ' ') continue
              // 포인터 — 밀거나(기본) 당긴다(누름)
              if (p.inside && !reduce) {
                const dx = l.x - p.x
                const dy = l.y - p.y
                const d = Math.hypot(dx, dy) || 1
                if (d < R) {
                  const f = ((R - d) / R) * (p.down ? -1.6 : 2.2)
                  l.vx += (dx / d) * f * k
                  l.vy += (dy / d) * f * k
                  l.av += (dx / d) * f * 0.02 * k
                }
              }
              // 제자리 스프링
              l.vx += (l.hx - l.x) * 0.035 * k
              l.vy += (l.hy - l.y) * 0.035 * k
              l.av += -l.r * 0.06 * k
              l.vx *= 0.9
              l.vy *= 0.9
              l.av *= 0.88
              l.x += l.vx * k
              l.y += l.vy * k
              l.r += l.av * k
              // 은은한 숨
              if (!reduce) l.y += Math.sin(t * 1.3 + l.hx * 0.02) * 0.08
            }
            // 글자끼리 충돌
            for (let i = 0; i < ls.length; i++)
              for (let j = i + 1; j < ls.length; j++) {
                const a = ls[i]!
                const b = ls[j]!
                if (a.ch === ' ' || b.ch === ' ') continue
                const min = (a.w + b.w) * 0.42
                const dx = b.x - a.x
                const dy = b.y - a.y
                const d = Math.hypot(dx, dy) || 1
                if (d < min) {
                  const push = ((min - d) / d) * 0.25
                  a.x -= dx * push
                  a.y -= dy * push
                  b.x += dx * push
                  b.y += dy * push
                }
              }
            ctx.font = `600 ${fontPx}px Pretendard Variable, system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            for (const l of ls) {
              if (l.ch === ' ') continue
              const off = Math.hypot(l.x - l.hx, l.y - l.hy)
              ctx.save()
              ctx.translate(l.x, l.y)
              ctx.rotate(l.r)
              // 자리에서 멀어질수록 액센트로
              ctx.fillStyle = off > 6 ? col.accent : col.fg
              ctx.shadowColor = off > 6 ? col.accent : 'transparent'
              ctx.shadowBlur = off > 6 ? 14 : 0
              ctx.fillText(l.ch, 0, 0)
              ctx.restore()
            }
            void rand
          },
        }
      },
      { still: !!reduce },
    )
  }, [reduce, text])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
