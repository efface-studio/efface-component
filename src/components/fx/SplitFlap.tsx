import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface SplitFlapProps {
  text: string
  /** 칸 수 — 글자보다 길면 빈 칸으로 채운다 */
  length?: number
  /** 한 번 넘어가는 시간(ms) */
  step?: number
  className?: string
}

const ORDER = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-:'

/**
 * 공항 안내판(스플릿 플랩). 각 칸이 글자 순서대로 탁탁 넘어가다 목표 글자에서 멈춘다.
 * 왼쪽 칸부터 조금씩 늦게 시작해 물결처럼 보인다.
 */
export function SplitFlap({ text, length, step = 55, className }: SplitFlapProps) {
  const n = length ?? text.length
  const target = text.toUpperCase().padEnd(n, ' ').slice(0, n)
  const reduce = useReducedMotion()
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: n }, () => ' '))
  const [flipping, setFlipping] = useState<boolean[]>(() => Array.from({ length: n }, () => false))
  const timers = useRef<number[]>([])

  useEffect(() => {
    timers.current.forEach((t) => window.clearInterval(t))
    timers.current = []
    if (reduce) return
    target.split('').forEach((ch, i) => {
      const goal = ORDER.indexOf(ch) >= 0 ? ch : ' '
      const start = window.setTimeout(() => {
        const iv = window.setInterval(() => {
          setCells((prev) => {
            const cur = prev[i] ?? ' '
            if (cur === goal) {
              window.clearInterval(iv)
              setFlipping((f) => {
                const nf = f.slice()
                nf[i] = false
                return nf
              })
              return prev
            }
            const next = prev.slice()
            next[i] = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length] ?? ' '
            return next
          })
          setFlipping((f) => {
            const nf = f.slice()
            nf[i] = true
            return nf
          })
        }, step)
        timers.current.push(iv)
      }, i * 60)
      timers.current.push(start)
    })
    return () => timers.current.forEach((t) => window.clearInterval(t))
  }, [target, step, reduce])

  const shown = reduce ? target.split('') : cells
  return (
    <div className={cn('inline-flex gap-1', className)} aria-label={text} role="img">
      {shown.map((ch, i) => (
        <span key={i} className={cn('split-flap relative inline-flex h-[1.5em] w-[1.05em] items-center justify-center overflow-hidden rounded-[0.18em] bg-fg font-mono text-[1em] font-semibold text-bg', flipping[i] && 'is-flip')} aria-hidden style={{ perspective: '2em' }}>
          <span className="split-flap__char">{ch}</span>
          {/* 위 반쪽 — 넘어갈 때 앞으로 접힌다 */}
          <span className="split-flap__top absolute inset-0 flex items-center justify-center bg-fg" style={{ clipPath: 'inset(0 0 50% 0)' }}>
            {ch}
          </span>
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-bg/50" />
        </span>
      ))}
    </div>
  )
}
