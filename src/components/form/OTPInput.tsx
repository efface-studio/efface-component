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
const GAP = 8
/** 빛 줄기가 한 번 훑는 시간 */
const SWEEP = 1.1
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * 인증코드 입력.
 *  - 셀 위에 투명 input 하나를 덮어 붙여넣기·자동완성(one-time-code)·모바일 키패드가 그대로 된다.
 *  - 활성 링은 layoutId 로 셀 사이를 스프링으로 미끄러진다.
 *  - 숫자는 블러와 함께 아래서 튀어 오르고, 잉크 파문이 셀 바깥으로 퍼진다. 붙여넣기는 도미노처럼 차례로.
 *  - 다 차면 빛 줄기가 셀을 왼쪽에서 오른쪽으로 훑으며 검증한다(지나가는 자리가 액센트로 켜진다).
 *    성공이면 셀들이 차례로 액센트로 차오른 뒤 가운데로 모여 하나의 체크 배지가 되고,
 *    실패면 빨갛게 번지며 흔들리고 숫자가 아래로 떨어진 뒤 비워진다.
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
  // 성공 때 셀들이 가운데로 모이는 거리 — 셀 폭 + 간격
  const rowRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(56)
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const measure = () => {
      const cell = row.firstElementChild as HTMLElement | null
      if (cell) setStep(cell.getBoundingClientRect().width + GAP)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [])

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
    if (autoFocus) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  // 오류: 잠깐 보여준 뒤 비운다
  useEffect(() => {
    if (status !== 'error') return
    const hadFocus = document.activeElement === inputRef.current
    const t = window.setTimeout(() => {
      onChange('')
      // 원래 치고 있던 사람만 다시 포커스 — 자동 데모가 페이지를 끌어내리지 않게
      if (hadFocus) inputRef.current?.focus({ preventScroll: true })
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

  const mid = (length - 1) / 2

  /** 상태별 셀 애니메이션 */
  const cellAnim = (i: number) => {
    if (reduce) return {}
    if (status === 'verifying')
      return {
        // 빛 줄기가 지나가는 순간 액센트로 켜졌다가 꺼진다
        borderColor: ['var(--line-strong)', 'var(--accent)', 'var(--line-strong)'],
        color: ['var(--fg)', 'var(--accent)', 'var(--fg)'],
        y: [0, -3, 0],
        transition: { duration: 0.45, repeat: Infinity, repeatDelay: SWEEP - 0.45, delay: 0.05 + (i / length) * SWEEP, ease: 'easeInOut' as const },
      }
    if (status === 'success')
      return {
        // 차례로 액센트로 차오른 뒤 → 가운데로 모여 사라진다
        backgroundColor: ['var(--surface)', 'var(--accent)', 'var(--accent)', 'var(--accent)'],
        borderColor: ['var(--line-strong)', 'var(--accent)', 'var(--accent)', 'var(--accent)'],
        color: ['var(--fg)', '#fff', '#fff', '#fff'],
        scale: [1, 1.08, 1, 1, 0.25],
        x: [0, 0, 0, 0, (mid - i) * step],
        opacity: [1, 1, 1, 1, 0],
        transition: { duration: 1.0, times: [0, 0.18, 0.32, 0.55, 1], delay: i * 0.05, ease: EASE },
      }
    if (status === 'error')
      return {
        borderColor: 'var(--color-danger)',
        color: 'var(--color-danger)',
        backgroundColor: ['var(--surface)', 'rgba(239,68,68,0.16)', 'var(--surface)'],
        transition: { duration: 0.5, delay: i * 0.04 },
      }
    return { x: 0, y: 0, scale: 1, opacity: 1, backgroundColor: 'var(--surface)', borderColor: digits[i] ? 'var(--line-strong)' : 'var(--line)', color: 'var(--fg)' }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="sr-only" role="status">
        {status === 'verifying' ? '확인 중' : status === 'success' ? '확인됐어요' : status === 'error' ? (errorMessage ?? '코드가 맞지 않아요') : ''}
      </span>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
      )}
      <LayoutGroup id={id}>
        <motion.div
          className="relative"
          animate={status === 'error' && !reduce ? { x: [0, -10, 9, -7, 6, -3, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.1 }}
        >
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
            disabled={disabled || busy}
            aria-label={label || '인증코드'}
            className={cn('absolute inset-0 z-10 w-full cursor-text opacity-0', busy && 'pointer-events-none')}
            style={{ caretColor: 'transparent' }}
          />
          <div ref={rowRef} className={cn('flex', disabled && 'opacity-50')} style={{ gap: GAP }} aria-hidden>
            {Array.from({ length }).map((_, i) => {
              const d = digits[i]
              const isActive = focused && i === active && !disabled && !busy
              const err = status === 'error'
              return (
                <motion.div
                  key={i}
                  className={cn(
                    'relative flex h-14 flex-1 items-center justify-center rounded-xl border bg-surface text-[24px] font-semibold tracking-tight tabular-nums',
                    err ? 'border-danger text-danger' : d ? 'border-line-strong text-fg' : 'border-line text-fg',
                  )}
                  initial={false}
                  animate={cellAnim(i)}
                >
                  {/* 활성 링 — 셀 사이를 미끄러진다 */}
                  {isActive && !err && (
                    <motion.span layoutId={`${id}-active`} className="pointer-events-none absolute -inset-px rounded-xl border-2 border-accent shadow-[0_0_0_4px_var(--accent-soft)]" transition={SPRING} aria-hidden />
                  )}
                  {/* 숫자 — 아래서 블러와 함께 튀어 오르고, 지우면 위로 흩어진다. 실패면 아래로 떨어진다 */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {d ? (
                      <motion.span
                        key={`${i}-${d}-${burst}`}
                        className="relative"
                        initial={reduce ? false : { y: 16, opacity: 0, scale: 0.6, filter: 'blur(6px)' }}
                        animate={err && !reduce ? { y: 26, opacity: 0, scale: 0.8, filter: 'blur(3px)', transition: { duration: 0.35, delay: 0.3 + i * 0.05, ease: 'easeIn' } } : { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
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
                  {d && !reduce && status === 'idle' && (
                    <motion.span
                      key={`ripple-${i}-${d}-${burst}`}
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      initial={{ boxShadow: '0 0 0 0px var(--accent-soft)', backgroundColor: 'var(--accent-soft)' }}
                      animate={{ boxShadow: '0 0 0 12px rgba(59,98,229,0)', backgroundColor: 'rgba(59,98,229,0)' }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: cascade ? i * 0.05 : 0 }}
                      aria-hidden
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* 검증 중 — 빛 줄기가 왼쪽에서 오른쪽으로 훑는다 */}
          <AnimatePresence>
            {status === 'verifying' && !reduce && (
              <motion.span
                key="sweep"
                aria-hidden
                className="pointer-events-none absolute -inset-y-2 w-16 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent-soft)_0%,transparent_70%)]"
                initial={{ left: '-8%', opacity: 0 }}
                animate={{ left: ['-8%', '100%'], opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: SWEEP, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent to-transparent" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* 성공 — 모인 자리에 체크 배지가 맺히고 문구가 옆으로 미끄러져 나온다 */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div key="ok" className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ delay: reduce ? 0 : 0.95, duration: 0.01 }}>
                <motion.span
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white"
                  initial={reduce ? false : { scale: 0.3 }}
                  animate={{ scale: 1 }}
                  transition={{ ...SPRING, delay: reduce ? 0 : 0.95 }}
                >
                  {!reduce && <motion.span aria-hidden className="absolute inset-0 rounded-full" initial={{ boxShadow: '0 0 0 0px var(--accent-soft)' }} animate={{ boxShadow: '0 0 0 22px rgba(59,98,229,0)' }} transition={{ duration: 0.8, ease: 'easeOut', delay: 1.05 }} />}
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.path d="M5 12.5 10 17.5 19 7" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 1.1 }} />
                  </svg>
                </motion.span>
                <motion.span className="text-[15px] font-semibold text-fg" initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE, delay: reduce ? 0 : 1.2 }}>
                  확인됐어요
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.p key="err" role="alert" className="text-[12.5px] text-danger" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
