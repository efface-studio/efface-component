import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { KIND_CLASS, tokenize } from '@/docs/components/highlight'

export interface LiveCodeProps {
  code: string
  /** 글자당 ms */
  speed?: number
  /** 다 치면 잠깐 쉬었다 다시 */
  loop?: boolean
  className?: string
}

/**
 * 코드가 스스로 쳐진다 — 구문 색이 실시간으로 입혀지고 캐럿이 깜빡인다.
 * 다 치면 잠시 보여 준 뒤 지우고 다시 친다.
 */
export function LiveCode({ code, speed = 28, loop = true, className }: LiveCodeProps) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? code.length : 0)
  useEffect(() => {
    if (reduce) return
    let i = 0
    let t = 0
    const step = () => {
      i++
      setN(i)
      if (i < code.length) {
        const ch = code[i - 1]
        t = window.setTimeout(step, ch === '\n' ? speed * 6 : speed + Math.random() * speed)
      } else if (loop) {
        t = window.setTimeout(() => {
          i = 0
          setN(0)
          t = window.setTimeout(step, 500)
        }, 2600)
      }
    }
    t = window.setTimeout(step, 400)
    return () => window.clearTimeout(t)
  }, [code, speed, loop, reduce])
  const shown = code.slice(0, n)
  return (
    <pre className={cn('overflow-hidden rounded-lg border border-line bg-(--code-bg) p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-fg', className)} aria-label={code}>
      <code>
        {tokenize(shown, 'tsx').map((t, i) => (
          <span key={i} className={KIND_CLASS[t.kind]}>
            {t.text}
          </span>
        ))}
        <span className="live-caret" />
      </code>
    </pre>
  )
}
