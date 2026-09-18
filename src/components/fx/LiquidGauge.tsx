import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface LiquidGaugeProps {
  /** 0 – 100 */
  value: number
  size?: number
  className?: string
}

/**
 * 액체 게이지. 원 안에 물이 차 있고 수면이 두 겹의 파도로 출렁인다. 값이 바뀌면 수면이 스프링처럼 오르내린다.
 */
export function LiquidGauge({ value, size = 180, className }: LiquidGaugeProps) {
  const id = useId().replace(/:/g, '')
  const a = useRef<SVGPathElement>(null)
  const b = useRef<SVGPathElement>(null)
  const label = useRef<SVGTextElement>(null)
  const reduce = useReducedMotion()
  const target = useRef(value)
  useEffect(() => {
    target.current = value
  }, [value])
  useEffect(() => {
    const pa = a.current
    const pb = b.current
    const lb = label.current
    if (!pa || !pb || !lb) return
    let raf = 0
    let t = 0
    let lvl = reduce ? value : 0
    let v = 0
    const wave = (phase: number, amp: number, y: number) => {
      let d = `M0 ${y}`
      for (let x = 0; x <= 100; x += 5) d += ` L${x} ${(y + Math.sin(x / 9 + phase) * amp).toFixed(2)}`
      return d + ' L100 100 L0 100 Z'
    }
    const tick = () => {
      t += 0.016
      // 스프링
      const k = 0.04
      const acc = (target.current - lvl) * k
      v = (v + acc) * 0.86
      lvl += v
      const y = 100 - lvl
      const amp = 2 + Math.abs(v) * 2
      pa.setAttribute('d', wave(t * 2.2, amp, y))
      pb.setAttribute('d', wave(t * 1.6 + 2, amp * 0.8, y + 1.5))
      lb.textContent = `${Math.round(lvl)}%`
      if (!reduce) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [reduce, value])
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn('select-none', className)} role="img" aria-label={`${value}%`}>
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" className="fill-surface stroke-line" strokeWidth="1.5" />
      <g clipPath={`url(#${id}-c)`}>
        <path ref={b} className="fill-accent/40" />
        <path ref={a} className="fill-accent" />
      </g>
      <text ref={label} x="50" y="54" textAnchor="middle" className="fill-fg font-mono text-[15px] font-semibold" style={{ mixBlendMode: 'difference' }} />
    </svg>
  )
}
