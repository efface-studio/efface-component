import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label?: ReactNode
  className?: string
}

/** 체크박스 — 18px 상자, 체크 표시는 선이 그려지듯 나타난다. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, id, checked, disabled, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <label htmlFor={inputId} className={cn('group inline-flex cursor-pointer items-center gap-2.5 select-none', disabled && 'cursor-not-allowed opacity-60', className)}>
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input ref={ref} id={inputId} type="checkbox" checked={checked} disabled={disabled} className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" {...rest} />
        <span className="absolute inset-0 rounded-[5px] border border-line-strong bg-surface transition-[background-color,border-color,box-shadow] duration-200 peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] group-hover:border-fg-faint" />
        <svg viewBox="0 0 16 16" className="relative h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} />
        </svg>
      </span>
      {label && <span className="text-[13.5px] text-fg-dim transition-colors group-hover:text-fg">{label}</span>}
    </label>
  )
})
