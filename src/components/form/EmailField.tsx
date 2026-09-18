import { forwardRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Mail } from 'lucide-react'
import { TextField, type TextFieldProps } from './TextField'
import { EMAIL_DOMAINS, EMAIL_RE, completeDomain } from './emailDomains'

export interface EmailFieldProps extends Omit<TextFieldProps, 'type' | 'value' | 'onChange' | 'below' | 'overlay' | 'trailing'> {
  value: string
  onChange: (v: string) => void
  /** 자동완성 도메인 — 앞글자 매칭이라 순서가 우선순위 */
  domains?: readonly string[]
}

/**
 * 이메일 필드. `@` 뒤를 치면 유명 도메인이 커서 뒤에 흐리게 떠오르고(g → gmail.com, e → efface.dev),
 * Tab 이나 → 로 받아들인다. 받아들이는 순간 글자가 액센트색으로 한 번 반짝이고 가라앉는다.
 * 형식이 맞으면 체크가 그려진다.
 */
export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(function EmailField(
  { value, onChange, domains = EMAIL_DOMAINS, error, className, onKeyDown, ...rest },
  ref,
) {
  const [flash, setFlash] = useState(0)
  const ghost = completeDomain(value, domains)
  const valid = EMAIL_RE.test(value)
  const at = value.indexOf('@')

  const accept = () => {
    if (!ghost) return
    onChange(value.slice(0, at + 1) + ghost.domain)
    setFlash((n) => n + 1)
  }

  return (
    <TextField
      ref={ref}
      type="email"
      autoComplete="email"
      inputMode="email"
      spellCheck={false}
      leading={<Mail size={16} />}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || !ghost) return
        const el = e.currentTarget
        const atEnd = el.selectionStart === el.value.length && el.selectionEnd === el.value.length
        if (e.key === 'Tab' || (e.key === 'ArrowRight' && atEnd) || (e.key === 'End' && atEnd)) {
          e.preventDefault()
          accept()
        }
      }}
      valid={valid && !error}
      error={error}
      className={className}
      overlay={
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre text-[15px]">
          {/* 친 글자만큼 자리를 비우고 그 뒤에 나머지 도메인을 흐리게 */}
          <span className="invisible">{value}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            {ghost && (
              <motion.span key={ghost.domain} className="text-fg-faint" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }} transition={{ duration: 0.16 }}>
                {ghost.rest}
              </motion.span>
            )}
          </AnimatePresence>
          {/* 받아들인 도메인이 한 번 반짝인다 */}
          <AnimatePresence>
            {flash > 0 && !ghost && at > 0 && (
              <motion.span
                key={flash}
                className="absolute inset-y-0 left-0 flex items-center text-accent"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <span className="invisible">{value.slice(0, at + 1)}</span>
                {value.slice(at + 1)}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      }
      trailing={
        <AnimatePresence>
          {ghost && (
            <motion.kbd
              key="tab"
              className="rounded border border-line bg-bg-soft px-1.5 py-0.5 font-mono text-[10px] leading-none text-fg-faint"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.16 }}
            >
              Tab
            </motion.kbd>
          )}
        </AnimatePresence>
      }
      {...rest}
    />
  )
})
