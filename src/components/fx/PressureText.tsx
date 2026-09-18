import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PressureTextProps {
  text: string
  className?: string
}

/**
 * 가변 글꼴(Pretendard Variable)의 굵기 축을 포인터가 누른다 — 가까운 글자는 두꺼워지고 멀면 가늘어진다.
 * 글자마다 font-variation-settings 를 매 프레임 바꾼다. 가만히 두면 굵기가 파도처럼 흐른다.
 */
export function PressureText({ text, className }: PressureTextProps) {
  const host = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = host.current
    if (!el || reduce) return
    const letters = Array.from(el.querySelectorAll<HTMLElement>('[data-l]'))
    let raf = 0
    let t = 0
    let pointer: { x: number; y: number } | null = null
    const tick = () => {
      t += 0.016
      letters.forEach((l, i) => {
        let w = 300 + (Math.sin(t * 1.6 - i * 0.45) * 0.5 + 0.5) * 300
        if (pointer) {
          const r = l.getBoundingClientRect()
          const dx = r.left + r.width / 2 - pointer.x
          const dy = r.top + r.height / 2 - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const k = Math.max(0, 1 - d / 160)
          w = 200 + k * 700
        }
        l.style.fontVariationSettings = `'wght' ${Math.round(w)}`
        l.style.opacity = String(0.55 + ((w - 200) / 700) * 0.45)
      })
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
    }
    const onLeave = () => {
      pointer = null
    }
    raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])
  return (
    <span ref={host} className={cn('inline-flex cursor-default select-none', className)} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} data-l aria-hidden className="inline-block whitespace-pre" style={{ fontVariationSettings: "'wght' 500" }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
