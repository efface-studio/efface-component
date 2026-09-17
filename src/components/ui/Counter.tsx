import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { easeOutCubic } from '@/lib/motion'

export interface CounterProps {
  to: number
  decimals?: number
  suffix?: string
  prefix?: string
  /** ms */
  duration?: number
  className?: string
}

/**
 * 숫자 카운터 (v1 Stats). 뷰포트에 들어오면 0에서 `to`까지 ease-out-cubic으로 오른다.
 * `tabular-nums`라 자릿수가 바뀌어도 폭이 흔들리지 않는다.
 */
export function Counter({ to, decimals = 0, suffix = '', prefix = '', duration = 1200, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setVal(to * easeOutCubic(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className ? `tabular-nums ${className}` : 'tabular-nums'}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export interface StatProps extends CounterProps {
  label: string
  align?: 'left' | 'center'
}

/** 큰 숫자 + 작은 라벨. */
export function Stat({ label, align = 'left', ...counter }: StatProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-center md:text-left'}>
      <div className="mb-3 text-4xl leading-none font-semibold tracking-tight md:text-6xl">
        <Counter {...counter} />
      </div>
      <p className="text-xs tracking-wide text-fg-dim md:text-sm">{label}</p>
    </div>
  )
}
