import { forwardRef, useEffect, useId, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> {
  label?: string
  /** 라벨이 입력 안에 있다가 포커스/입력 시 위로 떠오른다 */
  floating?: boolean
  /** 아래 보조 문구. error 가 있으면 그게 대신 보인다 */
  hint?: string
  error?: string
  /** true 면 오른쪽에 체크가 그려지고 초록 링이 한 번 퍼진다 */
  valid?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  size?: 'md' | 'lg'
  className?: string
  inputClassName?: string
  /** 입력 아래 슬롯 (이메일 도메인 제안 같은 것) */
  below?: ReactNode
  /** 입력 글자 위에 겹치는 슬롯 — 고스트 자동완성 등. 입력과 같은 좌표계 */
  overlay?: ReactNode
}

const SPRING = { type: 'spring', stiffness: 480, damping: 32 } as const

/**
 * 텍스트 필드.
 *  - 포커스: 액센트 링 + 밑줄이 왼쪽에서 그어지고, 빛 줄기가 위 테두리를 한 번 지나간다. 아이콘은 살짝 커지며 색이 든다.
 *  - floating: 라벨이 입력 안에 있다가 스프링으로 위로 떠오른다.
 *  - valid: 체크가 그려지고 초록 링이 퍼진다. error: 흔들리고 문구가 미끄러져 들어온다.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, floating = false, hint, error, valid, leading, trailing, size = 'md', className, inputClassName, below, overlay, id, disabled, value, defaultValue, onChange, onFocus, onBlur, placeholder, ...rest },
  ref,
) {
  const auto = useId()
  const inputId = id ?? auto
  const descId = `${inputId}-desc`
  const invalid = !!error
  const reduce = useReducedMotion()
  const [focused, setFocused] = useState(false)
  const [innerHas, setInnerHas] = useState(!!defaultValue)
  const hasValue = value !== undefined ? String(value).length > 0 : innerHas
  const lifted = !floating || focused || hasValue
  const h = size === 'lg' ? 48 : 44

  // 오류가 생기거나 바뀔 때 한 번 흔든다 — 리마운트 없이(포커스가 유지돼야 계속 칠 수 있다)
  const shake = useAnimationControls()
  useEffect(() => {
    if (!error || reduce) return
    void shake.start({ x: [0, -6, 6, -4, 4, -2, 0], transition: { duration: 0.4, ease: 'easeInOut' } })
  }, [error, reduce, shake])

  return (
    <motion.div className={cn('ef-field flex flex-col gap-1.5', disabled && 'opacity-60', className)} animate={shake}>
      {label && !floating && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-fg">
          {label}
        </label>
      )}
      <div className={cn('relative', floating && label && 'pt-5')}>
        <div
          className={cn(
            'group/field relative flex items-center gap-2 overflow-hidden rounded-md border bg-surface px-3 transition-[border-color,box-shadow] duration-200',
            invalid
              ? 'border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]'
              : valid
                ? 'border-emerald-500/70'
                : 'border-line hover:border-line-strong focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]',
          )}
          style={{ height: h }}
        >
          {/* 포커스 빛 줄기 — 위 테두리를 한 번 훑고 지나간다 */}
          <AnimatePresence>
            {focused && !invalid && !reduce && (
              <motion.span
                key="streak"
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '400%', opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
          {/* 밑줄 — 왼쪽에서 그어진다 */}
          <motion.span
            aria-hidden
            className={cn('pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left', invalid ? 'bg-red-500' : valid ? 'bg-emerald-500' : 'bg-accent')}
            initial={false}
            animate={{ scaleX: focused || invalid || valid ? 1 : 0 }}
            transition={SPRING}
          />
          {leading && (
            <motion.span
              className={cn('flex shrink-0 items-center transition-colors', focused ? 'text-accent' : 'text-fg-faint')}
              animate={{ scale: focused ? 1.12 : 1, rotate: focused ? -6 : 0 }}
              transition={SPRING}
            >
              {leading}
            </motion.span>
          )}
          <div className="relative flex h-full min-w-0 flex-1 items-center">
            {label && floating && (
              <motion.label
                htmlFor={inputId}
                className={cn('pointer-events-none absolute left-0 origin-left whitespace-nowrap', lifted ? (focused ? 'text-accent' : invalid ? 'text-red-500' : 'text-fg-dim') : 'text-fg-faint')}
                initial={false}
                animate={{ y: lifted ? -(h / 2 + 12) : 0, scale: lifted ? 0.8 : 1, fontSize: 15 }}
                transition={SPRING}
                style={{ fontWeight: 500 }}
              >
                {label}
              </motion.label>
            )}
            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              value={value}
              defaultValue={defaultValue}
              placeholder={floating ? (focused ? placeholder : undefined) : placeholder}
              aria-invalid={invalid || undefined}
              aria-describedby={hint || error ? descId : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setInnerHas(e.target.value.length > 0)
                onChange?.(e)
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => {
                setFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                setFocused(false)
                onBlur?.(e)
              }}
              className={cn('h-full w-full min-w-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-faint', inputClassName)}
              {...rest}
            />
            {overlay}
          </div>
          {/* 유효 체크 — 그려지며 초록 링이 퍼진다 */}
          <AnimatePresence>
            {valid && !invalid && (
              <motion.span key="ok" className="relative flex shrink-0 items-center text-emerald-500" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={SPRING}>
                {!reduce && <motion.span aria-hidden className="absolute inset-0 rounded-full" initial={{ boxShadow: '0 0 0 0px rgba(16,185,129,0.45)' }} animate={{ boxShadow: '0 0 0 14px rgba(16,185,129,0)' }} transition={{ duration: 0.7, ease: 'easeOut' }} />}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          {trailing && <span className="flex shrink-0 items-center text-fg-faint">{trailing}</span>}
        </div>
        {below}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {(error || hint) && (
          <motion.p
            key={error ? `err:${error}` : `hint:${hint}`}
            id={descId}
            className={cn('text-[12.5px] leading-snug', error ? 'text-red-500' : 'text-fg-dim')}
            role={error ? 'alert' : undefined}
            initial={{ opacity: 0, y: -4, x: error ? -6 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {error ?? hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
