import { useCallback, useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export type OTPStatus = 'idle' | 'verifying' | 'success' | 'error'

export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  /** 자리가 다 차면 호출. 여기서 status 를 verifying → success/error 로 바꾼다 */
  onComplete?: (code: string) => void
  status?: OTPStatus
  /** error 일 때 아래에 보일 문구 */
  errorMessage?: string
  disabled?: boolean
  autoFocus?: boolean
  label?: string
  className?: string
}

const SPRING = { type: 'spring', stiffness: 520, damping: 32, mass: 0.6 } as const

/**
 * 인증코드 입력.
 *  - 셀 위에 투명 input 하나를 덮어 붙여넣기·자동완성(one-time-code)·모바일 키패드가 그대로 된다.
 *  - 활성 링은 layoutId 로 셀 사이를 스프링으로 미끄러진다.
 *  - 숫자는 블러와 함께 아래서 튀어 오르고, 잉크 파문이 셀 바깥으로 퍼진다. 붙여넣기는 도미노처럼 차례로.
 *  - 다 차면 셀들이 하나의 알약으로 합쳐져 검증 중을 보이고, 성공이면 체크가 그려지고
 *    실패면 흔들리며 숫자가 흩어진 뒤 비워진다.
 */
export function OTPInput({ length = 6, value, onChange, onComplete, status = 'idle', errorMessage, disabled, autoFocus, label = '인증코드', className }: OTPInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  // 붙여넣기처럼 한 번에 여러 자리가 들어오면 도미노처럼 차례로 — 그 회차를 key 에 섞어 다시 재생시킨다
  const [burst, setBurst] = useState(0)
  const [cascade, setCascade] = useState(false)
  const prevLen = useRef(value.length)
  const reduce = useReducedMotion()
  const digits = value.slice(0, length).split('')
  const active = Math.min(value.length, length - 1)
  const busy = status === 'verifying' || status === 'success'

  useEffect(() => {
    const jumped = value.length - prevLen.current > 1
    prevLen.current = value.length
    if (!jumped) return
    setBurst((b) => b + 1)
    setCascade(true)
    const t = window.setTimeout(() => setCascade(false), 400)
    return () => window.clearTimeout(t)
  }, [value])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // 오류: 잠깐 보여준 뒤 비운다
  useEffect(() => {
    if (status !== 'error') return
    const t = window.setTimeout(() => {
      onChange('')
      inputRef.current?.focus()
    }, 700)
    return () => window.clearTimeout(t)
  }, [status, onChange])

  const set = useCallback(
    (next: string) => {
      const clean = next.replace(/\D/g, '').slice(0, length)
      onChange(clean)
      if (clean.length === length) onComplete?.(clean)
    },
    [length, onChange, onComplete],
  )

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    set(e.clipboardData.getData('text'))
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value.length === 0) e.preventDefault()
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
      )}
      <LayoutGroup id={id}>
        <motion.div
          className="relative"
          animate={status === 'error' && !reduce ? { x: [0, -10, 9, -7, 6, -3, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {busy ? (
              /* 셀들이 합쳐진 알약 — layoutId 가 같아 셀 컨테이너에서 이어진다 */
              <motion.div
                key="pill"
                layoutId={`${id}-frame`}
                className={cn('relative flex h-14 items-center justify-center overflow-hidden rounded-full border', status === 'success' ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-fg-dim')}
                transition={SPRING}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                {status === 'verifying' && !reduce && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
                    initial={{ x: '-120%' }}
                    animate={{ x: '360%' }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {status === 'verifying' ? (
                  <span className="flex items-center gap-2.5 font-mono text-[13px] tracking-[0.2em]">
                    {digits.map((d, i) => (
                      <motion.span key={i} initial={{ opacity: 0.4 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}>
                        {d}
                      </motion.span>
                    ))}
                  </span>
                ) : (
                  <motion.span className="flex items-center gap-2 text-[14px] font-semibold" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} />
                    </svg>
                    확인됐어요
                  </motion.span>
                )}
              </motion.div>
            ) : (
              <motion.div key="cells" layoutId={`${id}-frame`} className="relative" transition={SPRING} exit={{ opacity: 0 }}>
                {/* 실제 입력 — 셀 전체를 덮는 투명 input */}
                <input
                  ref={inputRef}
                  id={id}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  onPaste={onPaste}
                  onKeyDown={onKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={length}
                  disabled={disabled}
                  aria-label={label}
                  className="absolute inset-0 z-10 w-full cursor-text opacity-0"
                  style={{ caretColor: 'transparent' }}
                />
                <div className={cn('flex gap-2', disabled && 'opacity-50')} aria-hidden>
                  {Array.from({ length }).map((_, i) => {
                    const d = digits[i]
                    const isActive = focused && i === active && !disabled
                    const err = status === 'error'
                    return (
                      <div
                        key={i}
                        className={cn(
                          'relative flex h-14 flex-1 items-center justify-center rounded-xl border bg-surface text-[24px] font-semibold tracking-tight tabular-nums transition-colors duration-200',
                          err ? 'border-red-500 text-red-500' : d ? 'border-line-strong text-fg' : 'border-line text-fg',
                        )}
                      >
                        {/* 활성 링 — 셀 사이를 미끄러진다 */}
                        {isActive && !err && (
                          <motion.span layoutId={`${id}-active`} className="pointer-events-none absolute -inset-px rounded-xl border-2 border-accent shadow-[0_0_0_4px_var(--accent-soft)]" transition={SPRING} aria-hidden />
                        )}
                        {/* 숫자 — 아래서 블러와 함께 튀어 오르고, 지우면 위로 흩어진다 */}
                        <AnimatePresence mode="popLayout" initial={false}>
                          {d ? (
                            <motion.span
                              key={`${i}-${d}-${burst}`}
                              className="relative"
                              initial={reduce ? false : { y: 16, opacity: 0, scale: 0.6, filter: 'blur(6px)' }}
                              animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                              exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, scale: 0.6, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                              transition={{ ...SPRING, delay: cascade ? i * 0.05 : 0 }}
                            >
                              {d}
                            </motion.span>
                          ) : (
                            isActive && <motion.span key="caret" className="caret-blink h-7 w-0.5 rounded-full bg-accent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                          )}
                        </AnimatePresence>
                        {/* 잉크 파문 — 숫자가 들어올 때 한 번 */}
                        {d && !reduce && (
                          <motion.span
                            key={`ripple-${i}-${d}-${burst}`}
                            className="pointer-events-none absolute inset-0 rounded-xl"
                            initial={{ boxShadow: '0 0 0 0px var(--accent-soft)', backgroundColor: 'var(--accent-soft)' }}
                            animate={{ boxShadow: '0 0 0 12px rgba(59,98,229,0)', backgroundColor: 'rgba(59,98,229,0)' }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: cascade ? i * 0.05 : 0 }}
                            aria-hidden
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.p key="err" role="alert" className="text-[12.5px] text-red-500" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
