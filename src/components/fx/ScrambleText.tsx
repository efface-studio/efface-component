import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ScrambleTextProps {
  text: string
  /** 언제 풀리는지 — 마운트 · 화면에 들어올 때 · 호버 */
  trigger?: 'mount' | 'view' | 'hover'
  /** 전체가 풀리는 데 걸리는 시간(ms) */
  duration?: number
  chars?: string
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#%&@$0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * 글자가 무작위 기호로 끓다가 왼쪽부터 차례로 제자리를 찾는다(디코드 효과).
 * 아직 안 풀린 글자는 흐리게 — 다 풀리면 원래 글자만 남는다.
 */
export function ScrambleText({ text, trigger = 'view', duration = 900, chars = GLYPHS, className, as = 'span' }: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [out, setOut] = useState<{ ch: string; done: boolean }[]>(() => text.split('').map((ch) => ({ ch, done: true })))
  const raf = useRef(0)

  const play = useCallback(() => {
    if (reduce) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const n = text.length
    const tick = (now: number) => {
      const t = (now - start) / duration
      const next = text.split('').map((ch, i) => {
        if (ch === ' ') return { ch, done: true }
        const local = t * (n + 6) - i // 왼쪽부터 순서대로 풀린다
        if (local >= 4) return { ch, done: true }
        return { ch: chars[Math.floor(Math.random() * chars.length)] ?? ch, done: false }
      })
      setOut(next)
      if (t < 1.3) raf.current = requestAnimationFrame(tick)
      else setOut(text.split('').map((ch) => ({ ch, done: true })))
    }
    raf.current = requestAnimationFrame(tick)
  }, [text, duration, chars, reduce])

  useEffect(() => {
    if (trigger === 'mount' || (trigger === 'view' && inView)) play()
    return () => cancelAnimationFrame(raf.current)
  }, [trigger, inView, play])

  const Tag = as
  return (
    <Tag ref={ref as never} className={cn('font-mono whitespace-pre', className)} onMouseEnter={trigger === 'hover' ? play : undefined} aria-label={text}>
      {out.map((c, i) => (
        <span key={i} aria-hidden className={cn('inline-block transition-opacity duration-150', !c.done && 'text-accent opacity-70')}>
          {c.ch}
        </span>
      ))}
    </Tag>
  )
}
