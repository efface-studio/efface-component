import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface NotificationStackProps {
  items: { id: string; title: string; body: string; time: string }[]
  className?: string
}

/**
 * iOS 알림 뭉치. 접혀 있을 땐 뒤 카드들이 살짝 비치고, 올리면 펼쳐지며 각자 자리로 흩어진다.
 * 새 알림은 위에서 미끄러져 들어온다.
 */
export function NotificationStack({ items, className }: NotificationStackProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('relative w-[320px] select-none', className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ height: open ? items.length * 78 + 8 : 96 }}>
      <AnimatePresence initial={false}>
        {items.map((n, i) => (
          <motion.div
            key={n.id}
            layout
            className="absolute inset-x-0 top-0 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md"
            initial={{ y: -40, opacity: 0, scale: 0.95 }}
            animate={open ? { y: i * 78, scale: 1, opacity: 1 } : { y: i * 8, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 - i * 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: open ? i * 0.03 : (items.length - i) * 0.02 }}
            style={{ zIndex: items.length - i }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13.5px] font-semibold">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-fg-faint">{n.time}</span>
                </div>
                <p className="truncate text-[12.5px] text-fg-dim">{n.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
