import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/cn'

export interface DockItem {
  id: string
  label: string
  icon: ReactNode
  /** 아이콘 타일 배경 (Apple 앱 아이콘처럼 그라데이션) */
  tile?: string
  /** 실행 중 표시 점 */
  running?: boolean
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
 * macOS 독 — 리퀴드 글래스. 뒤가 비쳐 흐려지고(backdrop) 위 모서리에 빛이 맺히며,
 * 포인터와의 거리로 아이콘이 커지고 이웃도 따라 커진다. 누르면 아이콘이 한 번 튄다.
 */
export function Dock({ items, size = 48, max = 92, range = 160, className }: DockProps) {
  const mouseX = useMotionValue(Infinity)
  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn('liquid-glass relative flex items-end gap-2.5 rounded-[26px] px-3 pb-2.5', className)}
      style={{ height: max + 24 }}
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
  const [bounce, setBounce] = useState(0)
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return Infinity
    return x - (r.left + r.width / 2)
  })
  const target = useTransform(distance, [-range, 0, range], [size, max, size])
  const width = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 })
  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width, height: width }}
      onClick={() => setBounce((b) => b + 1)}
      className="group relative flex shrink-0 items-center justify-center"
      aria-label={item.label}
    >
      <motion.span
        key={bounce}
        initial={bounce ? { y: 0 } : false}
        animate={bounce ? { y: [0, -18, 0, -8, 0] } : { y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="dock-tile flex h-full w-full items-center justify-center rounded-[24%] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]"
        style={{ background: item.tile ?? 'linear-gradient(160deg, #3a3d46, #1c1e24)' }}
      >
        <span className="flex h-[58%] w-[58%] items-center justify-center [&>img]:h-full [&>img]:w-full [&>img]:drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
      </motion.span>
      {item.running && <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />}
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-[11px] whitespace-nowrap text-white opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100">{item.label}</span>
    </motion.button>
  )
}
