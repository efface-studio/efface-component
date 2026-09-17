import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'

export interface AccordionItem {
  q: ReactNode
  a: ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  /** 처음 열려 있을 인덱스. null이면 모두 닫힘. */
  defaultOpen?: number | null
  className?: string
}

/**
 * FAQ 아코디언 (v1). 번호 + 질문, 오른쪽 `+`가 45° 돌아 `×`가 되고
 * 답은 높이 0 → auto로 펼쳐진다.
 */
export function Accordion({ items, defaultOpen = 0, className }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div className={cn('border-t border-line', className)}>
      {items.map(({ q, a }, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="flex flex-1 items-baseline gap-4">
                <span className="font-mono text-xs text-fg-dim tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-base font-medium md:text-lg">{q}</span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line transition group-hover:border-fg"
              >
                <Plus size={14} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden"
                >
                  <div className="pr-12 pb-5 pl-9 text-[15px] leading-relaxed text-fg-dim">{a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
