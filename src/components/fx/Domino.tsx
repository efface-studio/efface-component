import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface DominoProps {
  count?: number
  className?: string
}

/**
 * 도미노 — 나선으로 늘어선 도미노가 차례로 넘어진다(CSS 3D, 밑변을 축으로 회전). 넘어지는 순서는 거리로
 * 정해져 파도가 번지듯 보이고, 다 넘어지면 잠시 뒤 하나씩 다시 선다. 누르면 그 자리부터 다시 시작.
 */
export function Domino({ count = 44, className }: DominoProps) {
  const reduce = useReducedMotion()
  const [fallen, setFallen] = useState(false)
  const [start, setStart] = useState(0)
  const timer = useRef(0)
  useEffect(() => {
    if (reduce) return
    // 넘어졌다 서기를 반복
    const run = () => {
      setFallen((f) => !f)
      timer.current = window.setTimeout(run, fallen ? 2600 : count * 90 + 2400)
    }
    timer.current = window.setTimeout(run, 900)
    return () => window.clearTimeout(timer.current)
  }, [reduce, fallen, count])
  // 나선 배치 — 원근이 있는 판 위
  const items = Array.from({ length: count }, (_, i) => {
    const t = i / count
    const a = t * Math.PI * 3.2
    const r = 18 + t * 42 // %
    return { i, x: 50 + Math.cos(a) * r * 0.9, y: 52 + Math.sin(a) * r * 0.55, rot: (a * 180) / Math.PI + 90 }
  })
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0f1116]', className)} style={{ perspective: 900 }}>
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(52deg) translateY(-6%)' }}>
        {/* 판 */}
        <div className="absolute inset-[-20%] rounded-[40%] bg-[radial-gradient(circle,#1d2030_0%,#0f1116_70%)]" />
        {items.map((d) => {
          // 시작점에서 먼 순서로 지연
          const order = (d.i - start + count) % count
          const delay = order * 0.09
          return (
            <button
              type="button"
              key={d.i}
              aria-label={`도미노 ${d.i + 1}`}
              onClick={() => {
                setStart(d.i)
                setFallen(true)
              }}
              className="absolute"
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: 14, height: 34, transformStyle: 'preserve-3d', transform: `translate(-50%, -100%) rotateZ(${d.rot}deg)` }}
            >
              <motion.span
                className="absolute inset-0 block rounded-[3px] border border-white/25 bg-[linear-gradient(180deg,#f7f7fa,#c9ccd6)] shadow-[0_6px_14px_-4px_rgba(0,0,0,0.8)]"
                style={{ transformOrigin: '50% 100%', transformStyle: 'preserve-3d' }}
                animate={fallen && !reduce ? { rotateX: -84 } : { rotateX: 0 }}
                transition={fallen ? { type: 'spring', stiffness: 260, damping: 14, delay } : { duration: 0.35, delay: (count - order) * 0.02 }}
              >
                <span className="absolute inset-x-[3px] top-[45%] h-px bg-black/25" />
                <span className="absolute left-1/2 top-[22%] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#3b62e5]" />
                <span className="absolute left-1/2 top-[70%] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-black/60" />
              </motion.span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
