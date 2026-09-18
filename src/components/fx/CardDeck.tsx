import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface CardDeckProps {
  cards: { id: string; content: ReactNode }[]
  /** 자동으로 넘기는 간격(ms). 0 이면 끔 */
  auto?: number
  className?: string
}

/**
 * 카드 뭉치. 맨 위 카드를 옆으로 끌어 던지면(또는 자동으로) 날아가고, 아래 카드들이 한 칸씩 올라온다.
 * 던진 카드는 맨 뒤로 들어가 끝없이 돈다.
 */
export function CardDeck({ cards, auto = 0, className }: CardDeckProps) {
  const [order, setOrder] = useState(cards.map((c) => c.id))
  const [fling, setFling] = useState<{ id: string; dir: 1 | -1 } | null>(null)
  const reduce = useReducedMotion()
  const next = (dir: 1 | -1) => {
    const top = order[0]
    if (!top || fling) return
    setFling({ id: top, dir })
    window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0] ?? ''])
      setFling(null)
    }, 320)
  }
  useEffect(() => {
    if (!auto) return
    const t = window.setInterval(() => next(Math.random() > 0.5 ? 1 : -1), auto)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, order, fling])

  return (
    <div className={cn('relative h-[220px] w-[180px]', className)}>
      <AnimatePresence initial={false}>
        {order.slice(0, 4).map((id, i) => {
          const card = cards.find((c) => c.id === id)
          if (!card) return null
          const isTop = i === 0
          const flung = fling?.id === id
          return (
            <motion.div
              key={id}
              drag={isTop && !flung ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) next(info.offset.x > 0 ? 1 : -1)
              }}
              className={cn('absolute inset-0 flex cursor-grab items-center justify-center rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] active:cursor-grabbing', !isTop && 'pointer-events-none')}
              style={{ zIndex: 10 - i }}
              initial={{ scale: 0.86, y: 36, opacity: 0 }}
              animate={
                flung
                  ? { x: 340 * fling.dir, rotate: 22 * fling.dir, opacity: 0, transition: reduce ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }
                  : { x: 0, rotate: 0, scale: 1 - i * 0.05, y: i * 12, opacity: 1 - i * 0.18, transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 } }
              }
              exit={{ opacity: 0 }}
            >
              {card.content}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
