import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TypeWriterProps {
  text: string
  /** 글자당 ms */
  speed?: number
  /** ms */
  delay?: number
  caret?: boolean
  className?: string
}

/**
 * 한 글자씩 타이핑 (v2 EffaceIntro 라벨·사전 정의). 뷰포트에 들어오면 시작한다.
 * 높이가 흔들리지 않게 전체 텍스트를 투명하게 깔아 자리를 잡아 둔다.
 */
export function TypeWriter({ text, speed = 28, delay = 0, caret = true, className }: TypeWriterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  // reduced-motion이면 처음부터 전문을 보여준다
  const [n, setN] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 0))

  useEffect(() => {
    if (!inView || n >= text.length) return
    let i = 0
    let timer = 0
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 1
        setN(i)
        if (i >= text.length) window.clearInterval(timer)
      }, speed)
    }, delay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(timer)
    }
    // n은 시작 조건으로만 읽는다 — 타이핑 중 재시작을 막기 위해 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text, speed, delay])

  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      <span aria-hidden className="invisible">{text}</span>
      <span className="absolute inset-0">
        {text.slice(0, n)}
        {caret && <span aria-hidden className="caret-blink ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.12em] bg-accent" />}
      </span>
    </span>
  )
}
