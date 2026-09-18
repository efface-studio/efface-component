import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

export interface JellyCardProps {
  children: ReactNode
  className?: string
}

/**
 * 젤리 카드. 커서가 들어오면 그쪽으로 눌리며 찌그러지고, 나가면 출렁이며 되돌아온다(오버슛 큰 스프링).
 * 누르면 더 깊게 눌린다.
 */
export function JellyCard({ children, className }: JellyCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const press = useMotionValue(0)
  const spring = { stiffness: 260, damping: 9, mass: 0.8 }
  const sx = useSpring(mx, spring)
  const sy = useSpring(my, spring)
  const sp = useSpring(press, { stiffness: 320, damping: 12 })
  const rotateX = useTransform(sy, [-1, 1], [14, -14])
  const rotateY = useTransform(sx, [-1, 1], [-14, 14])
  const scaleX = useTransform([sx, sp], ([x, p]) => 1 + Math.abs(x as number) * 0.06 - (p as number) * 0.04)
  const scaleY = useTransform([sy, sp], ([y, p]) => 1 + Math.abs(y as number) * 0.06 - (p as number) * 0.06)
  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
    press.set(0)
  }
  return (
    <div className="[perspective:900px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        onMouseDown={() => press.set(1)}
        onMouseUp={() => press.set(0)}
        style={{ rotateX, rotateY, scaleX, scaleY }}
        className={cn('w-[280px] cursor-pointer rounded-3xl border border-line bg-gradient-to-br from-[#3b62e5] to-[#7c3aed] p-6 text-white shadow-[0_24px_50px_-24px_rgba(59,98,229,0.8)] select-none', className)}
      >
        {children}
      </motion.div>
    </div>
  )
}
