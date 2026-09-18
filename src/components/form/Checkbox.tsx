import { forwardRef, useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label?: ReactNode
  className?: string
}

const PARTICLES = [0, 60, 120, 180, 240, 300]

/** 체크박스 — 상자가 팝하며 채워지고 체크가 그려지는 동안 작은 입자가 여섯 방향으로 튄다. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, id, checked, defaultChecked, disabled, onChange, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  const reduce = useReducedMotion()
  const [inner, setInner] = useState(!!defaultChecked)
  const on = checked ?? inner
  const [burst, setBurst] = useState(0)
  return (
    <label htmlFor={inputId} className={cn('group inline-flex cursor-pointer items-center gap-2.5 select-none', disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setInner(e.target.checked)
            if (e.target.checked) setBurst((b) => b + 1)
            onChange?.(e)
          }}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...rest}
        />
        <motion.span
          className={cn('absolute inset-0 rounded-[5px] border transition-[border-color,box-shadow] duration-200 peer-focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] group-hover:border-fg-faint', on ? 'border-accent bg-accent' : 'border-line-strong bg-surface')}
          animate={on && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        <svg viewBox="0 0 16 16" className="relative h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: on ? 0.08 : 0 }} />
        </svg>
        {/* 입자 — 체크될 때 한 번 */}
        <AnimatePresence>
          {on && burst > 0 && !reduce && (
            <span key={burst} className="pointer-events-none absolute inset-0" aria-hidden>
              {PARTICLES.map((deg) => (
                <motion.span
                  key={deg}
                  className="absolute top-1/2 left-1/2 h-1 w-1 rounded-full bg-accent"
                  initial={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
                  animate={{ x: `calc(-50% + ${Math.cos((deg * Math.PI) / 180) * 16}px)`, y: `calc(-50% + ${Math.sin((deg * Math.PI) / 180) * 16}px)`, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      {label && <span className="text-[13.5px] text-fg-dim transition-colors group-hover:text-fg">{label}</span>}
    </label>
  )
})
