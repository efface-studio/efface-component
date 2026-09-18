import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/cn'

export interface DockItem {
  id: string
  label: string
  icon: ReactNode
}

export interface DockProps {
  items: DockItem[]
  /** 기본 크기 · 최대 크기(px) */
  size?: number
  max?: number
  /** 영향 범위(px) */
  range?: number
  className?: string
}

/**
 * macOS 독. 포인터와의 거리로 아이콘이 커지고 이웃도 조금 따라 커진다.
 * 크기는 스프링이라 포인터가 빠져나가도 부드럽게 가라앉는다.
 */
export function Dock({ items, size = 44, max = 84, range = 150, className }: DockProps) {
  const mouseX = useMotionValue(Infinity)
  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn('flex h-[var(--dock-h)] items-end gap-2 rounded-2xl border border-line bg-surface/80 px-3 pb-2.5 backdrop-blur-md', className)}
      style={{ '--dock-h': `${max + 20}px` } as never}
      role="toolbar"
    >
      {items.map((it) => (
        <DockIcon key={it.id} item={it} mouseX={mouseX} size={size} max={max} range={range} />
      ))}
    </div>
  )
}

function DockIcon({ item, mouseX, size, max, range }: { item: DockItem; mouseX: MotionValue<number>; size: number; max: number; range: number }) {
  const ref = useRef<HTMLButtonElement>(null)
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return Infinity
    return x - (r.left + r.width / 2)
  })
  const target = useTransform(distance, [-range, 0, range], [size, max, size])
  const width = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 })
  return (
    <motion.button ref={ref} type="button" style={{ width, height: width }} className="group relative flex aspect-square items-center justify-center rounded-xl border border-line bg-bg shadow-sm" aria-label={item.label}>
      <span className="flex h-[58%] w-[58%] items-center justify-center [&>img]:h-full [&>img]:w-full [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] whitespace-nowrap text-fg opacity-0 shadow-sm transition-opacity group-hover:opacity-100">{item.label}</span>
    </motion.button>
  )
}
