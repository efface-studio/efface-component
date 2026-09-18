import { useId, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

/** 구이(gooey) 필터 — 흐린 뒤 알파를 세게 잘라 원들이 액체처럼 붙는다 */
export function GooeyFilter({ id, blur = 10 }: { id: string; blur?: number }) {
  return (
    <svg className="absolute h-0 w-0" aria-hidden>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export interface GooeyMenuProps {
  items: { id: string; icon: ReactNode; label: string }[]
  className?: string
}

/**
 * 누르면 버튼에서 작은 원들이 액체처럼 늘어져 나와 떨어진다(구이 메뉴).
 * 색 원들은 필터 안에, 아이콘은 필터 밖(선명하게) — 같은 자리에 겹친다.
 */
export function GooeyMenu({ items, className }: GooeyMenuProps) {
  const id = useId().replace(/:/g, '')
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const pos = (i: number) => {
    const n = items.length
    const a = Math.PI * (0.15 + (0.7 * i) / Math.max(1, n - 1)) // 부채꼴 위쪽
    return { x: Math.cos(a) * 84, y: -Math.sin(a) * 84 }
  }
  return (
    <div className={cn('relative h-40 w-56', className)}>
      <GooeyFilter id={id} />
      {/* 액체 층 */}
      <div className="absolute inset-0" style={{ filter: `url(#${id})` }}>
        <div className="absolute bottom-3 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-fg" />
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            className="absolute bottom-5 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-fg"
            initial={false}
            animate={open ? { ...pos(i), scale: 1 } : { x: 0, y: 0, scale: 0.6 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18, delay: open ? i * 0.05 : (items.length - i) * 0.03 }}
          />
        ))}
      </div>
      {/* 선명한 층 */}
      {items.map((it, i) => (
        <motion.button
          key={it.id}
          type="button"
          aria-label={it.label}
          tabIndex={open ? 0 : -1}
          className="absolute bottom-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-bg"
          initial={false}
          animate={open ? { ...pos(i), opacity: 1, scale: 1 } : { x: 0, y: 0, opacity: 0, scale: 0.6 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18, delay: open ? i * 0.05 + 0.05 : 0 }}
        >
          {it.icon}
        </motion.button>
      ))}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="absolute bottom-3 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-bg">
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex">
          <Plus size={22} />
        </motion.span>
      </button>
    </div>
  )
}

export interface LavaProps {
  count?: number
  className?: string
}

/** 액체 덩이들이 서로 붙었다 떨어지며 떠다닌다(라바 램프). */
export function Lava({ count = 6, className }: LavaProps) {
  const id = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <GooeyFilter id={id} blur={14} />
      <div className="absolute inset-0" style={{ filter: `url(#${id})` }}>
        {Array.from({ length: count }).map((_, i) => {
          const s = 60 + ((i * 37) % 70)
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-accent"
              style={{ width: s, height: s, left: `${10 + ((i * 53) % 70)}%`, top: `${15 + ((i * 29) % 60)}%` }}
              animate={reduce ? undefined : { x: [0, (i % 2 ? -1 : 1) * (40 + (i * 13) % 50), 0], y: [0, (i % 3 ? 1 : -1) * (30 + (i * 17) % 40), 0] }}
              transition={{ duration: 6 + (i % 4) * 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )
        })}
      </div>
    </div>
  )
}
