import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> {
  label?: string
  /** 아래 보조 문구. error 가 있으면 그게 대신 보인다 */
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
  size?: 'md' | 'lg'
  className?: string
  inputClassName?: string
}

/**
 * 텍스트 필드. 라벨 위, 입력 h-11(lg h-12), 포커스에 액센트 링, 오류는 빨간 선 + 문구.
 * 라벨·힌트·오류를 `aria-describedby` 로 묶어 스크린 리더가 함께 읽는다.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, leading, trailing, size = 'md', className, inputClassName, id, disabled, ...rest },
  ref,
) {
  const auto = useId()
  const inputId = id ?? auto
  const descId = `${inputId}-desc`
  const invalid = !!error
  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-60', className)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-fg">
          {label}
        </label>
      )}
      <div
        className={cn(
          'group/field flex items-center gap-2 rounded-md border bg-surface px-3 transition-[border-color,box-shadow] duration-200',
          size === 'lg' ? 'h-12' : 'h-11',
          invalid
            ? 'border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]'
            : 'border-line hover:border-line-strong focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]',
        )}
      >
        {leading && <span className="flex shrink-0 items-center text-fg-faint transition-colors group-focus-within/field:text-fg-dim">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={hint || error ? descId : undefined}
          className={cn('h-full min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-faint', inputClassName)}
          {...rest}
        />
        {trailing && <span className="flex shrink-0 items-center text-fg-faint">{trailing}</span>}
      </div>
      {(error || hint) && (
        <p id={descId} className={cn('text-[12.5px] leading-snug', error ? 'text-red-500' : 'text-fg-dim')} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
})
