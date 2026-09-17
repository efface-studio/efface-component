import { Fragment } from 'react'
import { cn } from '@/lib/cn'

export interface LanguageToggleProps<L extends string = string> {
  locales: readonly L[]
  value: L
  onChange: (next: L) => void
  className?: string
}

/** KO / EN 스위치 (v2). 제어 컴포넌트 — 라우팅은 바깥에서 한다. */
export function LanguageToggle<L extends string>({ locales, value, onChange, className }: LanguageToggleProps<L>) {
  return (
    <div className={cn('flex items-center gap-1.5 font-mono', className)} aria-label="Language">
      {locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span className="text-fg-faint/50" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange(l)}
            className={cn('text-xs tracking-wide transition-colors duration-200', value === l ? 'text-fg' : 'text-fg-faint hover:text-fg-dim')}
            aria-current={value === l}
          >
            {l.toUpperCase()}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
