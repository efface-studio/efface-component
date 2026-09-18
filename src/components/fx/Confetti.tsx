import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { createConfetti, type ConfettiEngine } from './confettiEngine'

export interface ConfettiButtonProps {
  children: ReactNode
  className?: string
}

/** 누르면 그 자리에서 색종이가 터지는 버튼. */
export function ConfettiButton({ children, className }: ConfettiButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const engine = useRef<ConfettiEngine | null>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!host.current) return
    engine.current = createConfetti(host.current)
    return () => engine.current?.dispose()
  }, [])
  return (
    <div ref={host} className={cn('relative flex h-full w-full items-center justify-center overflow-hidden', className)}>
      <button
        type="button"
        onClick={(e) => {
          if (reduce) return
          const r = host.current?.getBoundingClientRect()
          engine.current?.burst(r ? e.clientX - r.left : undefined, r ? e.clientY - r.top : undefined)
        }}
        className="relative rounded-full bg-accent px-7 py-3 text-[15px] font-medium text-white shadow-[0_8px_30px_-8px_var(--accent)] transition-transform active:scale-95"
      >
        {children}
      </button>
    </div>
  )
}
