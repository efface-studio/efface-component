import { useRef, useState, type MouseEvent } from 'react'
import { motion, useReducedMotion, type TargetAndTransition } from 'motion/react'
import { cn } from '@/lib/cn'

export interface JellyTextProps {
  text: string
  /** 영향 반지름(px) */
  radius?: number
  className?: string
}

type Off = TargetAndTransition
const REST: Off = { y: 0, scale: 1, rotate: 0 }

/**
 * 글자들이 젤리처럼 포인터를 피한다 — 가까운 글자가 밀려 올라가고 커졌다가 스프링으로 돌아온다.
 */
export function JellyText({ text, radius = 90, className }: JellyTextProps) {
  const reduce = useReducedMotion()
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const [off, setOff] = useState<Off[]>(() => text.split('').map(() => REST))

  const onMove = (e: MouseEvent) => {
    if (reduce) return
    setOff(
      text.split('').map((_, i) => {
        const el = letters.current[i]
        if (!el) return REST
        const r = el.getBoundingClientRect()
        const dx = r.left + r.width / 2 - e.clientX
        const dy = r.top + r.height / 2 - e.clientY
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d > radius) return REST
        const k = (1 - d / radius) ** 1.6
        return { y: -24 * k, scale: 1 + 0.35 * k, rotate: (dx / radius) * -16 * k }
      }),
    )
  }
  const reset = () => setOff(text.split('').map(() => REST))

  return (
    <span onMouseMove={onMove} onMouseLeave={reset} className={cn('inline-flex cursor-default select-none', className)} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          ref={(el) => {
            letters.current[i] = el
          }}
          aria-hidden
          className="inline-block origin-bottom whitespace-pre"
          animate={off[i] ?? REST}
          transition={{ type: 'spring', stiffness: 380, damping: 16, mass: 0.6 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}
