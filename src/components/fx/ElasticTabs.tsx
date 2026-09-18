import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ElasticTabsProps {
  tabs: string[]
  value?: number
  onChange?: (i: number) => void
  className?: string
}

/**
 * 탭 인디케이터가 고무처럼 늘어났다 줄어들며 옮겨간다 — 떠나는 쪽이 먼저 늘고 도착하며 오므라든다.
 * layoutId 하나로 자리를 잇고, 스프링을 조금 느슨하게 해 오버슛을 살렸다.
 */
export function ElasticTabs({ tabs, value, onChange, className }: ElasticTabsProps) {
  const [inner, setInner] = useState(0)
  const active = value ?? inner
  return (
    <div className={cn('relative inline-flex rounded-full border border-line bg-surface p-1', className)} role="tablist">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={active === i}
          onClick={() => {
            setInner(i)
            onChange?.(i)
          }}
          className={cn('relative z-10 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300', active === i ? 'text-bg' : 'text-fg-dim hover:text-fg')}
        >
          {active === i && <motion.span layoutId="elastic-tab" className="absolute inset-0 -z-10 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }} style={{ originX: 0.5 }} />}
          {t}
        </button>
      ))}
    </div>
  )
}
