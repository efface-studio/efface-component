import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface MorphTextProps {
  words: string[]
  /** 한 단어가 머무는 시간(ms) */
  every?: number
  className?: string
}

/**
 * 단어가 다음 단어로 녹아내리듯 바뀐다 — 두 겹의 글자를 블러로 겹치고 대비를 세게 올려
 * 획이 액체처럼 이어졌다 갈라진다. 글자 수가 달라도 자연스럽다.
 */
export function MorphText({ words, every = 2600, className }: MorphTextProps) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [p, setP] = useState(0) // 0 → 1 진행
  useEffect(() => {
    if (reduce) return
    let raf = 0
    let start = performance.now()
    const morph = 900
    const tick = (now: number) => {
      const el = now - start
      if (el < every - morph) setP(0)
      else if (el < every) setP((el - (every - morph)) / morph)
      else {
        start = now
        setI((v) => (v + 1) % words.length)
        setP(0)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [words.length, every, reduce])

  const a = words[i] ?? ''
  const b = words[(i + 1) % words.length] ?? ''
  // 앞 글자는 빠르게 흐려지며 사라지고, 뒷 글자는 흐림에서 또렷해진다
  const fa = Math.min(8 / Math.max(1 - p, 0.001) - 8, 100)
  const fb = Math.min(8 / Math.max(p, 0.001) - 8, 100)
  return (
    <span className={cn('relative inline-block', className)} style={{ filter: reduce ? undefined : 'url(#ef-morph-threshold)' }} aria-label={reduce ? a : `${a} → ${b}`}>
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id="ef-morph-threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      <span className="invisible whitespace-nowrap">{a.length >= b.length ? a : b}</span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap" style={{ filter: `blur(${reduce ? 0 : fa}px)`, opacity: reduce ? 1 : Math.pow(1 - p, 0.4) }}>
        {a}
      </span>
      {!reduce && (
        <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap" style={{ filter: `blur(${fb}px)`, opacity: Math.pow(p, 0.4) }}>
          {b}
        </span>
      )}
    </span>
  )
}
