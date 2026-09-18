import { forwardRef, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TextField, type TextFieldProps } from './TextField'
import { passwordScore, PASSWORD_RULES } from './passwordScore'

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'trailing' | 'value' | 'onChange' | 'inputClassName'> {
  value: string
  onChange: (v: string) => void
  /** 네 칸 강도 미터 */
  strength?: boolean
  /** 규칙 체크리스트 (길이·대소문자·숫자·기호) — 실시간으로 켜진다 */
  rules?: boolean
  /** 표시 상태를 밖에서 제어 (데모용) */
  show?: boolean
  onShowChange?: (show: boolean) => void
}

const LABEL = ['', '약함', '보통', '좋음', '강함']
const COLOR = ['', '#ef4444', '#f59e0b', '#22c55e', '#3b62e5']
const PEEK_MS = 700

/**
 * 비밀번호 필드.
 *  - 글자는 오버레이로 그린다: 마지막으로 친 글자는 잠깐 보였다가 가려지고(iOS 식),
 *    표시/숨김을 바꾸면 왼쪽부터 차례로 3D 플립하며 드러난다.
 *  - 눈 아이콘은 깜빡이듯 모핑. 강도 미터와 규칙 체크리스트는 실시간.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ value, onChange, strength = false, rules = false, show: showProp, onShowChange, className, leading, ...rest }, ref) {
  const [showInner, setShowInner] = useState(false)
  const show = showProp ?? showInner
  const setShow = (next: boolean) => {
    setShowInner(next)
    onShowChange?.(next)
  }
  const [peek, setPeek] = useState<number | null>(null)
  const timer = useRef(0)
  const reduce = useReducedMotion()
  const score = passwordScore(value)

  // 마지막 글자 잠깐 보여주기
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    if (next.length > value.length) {
      setPeek(next.length - 1)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setPeek(null), PEEK_MS)
    } else setPeek(null)
    onChange(next)
  }

  const chars = value.split('')

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <TextField
        ref={ref}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={handle}
        autoComplete={rest.autoComplete ?? 'current-password'}
        leading={leading ?? <Lock size={16} />}
        // 실제 글자는 투명 — 오버레이가 그린다. 캐럿은 남긴다.
        inputClassName="font-mono text-[14px] text-transparent caret-fg"
        trailing={
          <button type="button" onClick={() => setShow(!show)} className="-mr-1 flex h-8 w-8 items-center justify-center rounded text-fg-faint transition-colors hover:text-fg" aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} aria-pressed={show}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={show ? 'on' : 'off'} initial={{ scaleY: 0.2, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0.2, opacity: 0 }} transition={{ duration: 0.16 }} className="flex">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
        }
        below={
          /* 글자 오버레이 — 입력과 같은 위치·서체 */
          <div className={cn('pointer-events-none absolute inset-x-3 flex items-center pl-6 font-mono text-[14px] text-fg', rest.floating ? 'top-5' : 'top-0', rest.size === 'lg' ? 'h-12' : 'h-11')} aria-hidden style={{ perspective: 300 }}>
            {chars.map((ch, i) => {
              const reveal = show || peek === i
              return (
                <span key={i} className="relative inline-block min-w-[0.6em] text-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={reveal ? 'c' : 'm'}
                      className="inline-block"
                      initial={reduce ? { opacity: 0 } : { rotateX: -90, opacity: 0, y: 4 }}
                      animate={{ rotateX: 0, opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { rotateX: 90, opacity: 0, y: -4 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 34, delay: show ? Math.min(i * 0.02, 0.3) : 0 }}
                    >
                      {reveal ? ch : '•'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )
            })}
          </div>
        }
        {...rest}
      />
      {strength && (
        <div className="flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <motion.span
                  className="block h-full rounded-full"
                  initial={false}
                  animate={{ scaleX: score >= i ? 1 : 0, backgroundColor: COLOR[score] || COLOR[1] }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26, delay: score >= i ? (i - 1) * 0.05 : 0 }}
                  style={{ transformOrigin: 'left' }}
                />
              </span>
            ))}
          </div>
          <span className="w-8 text-right font-mono text-[11px] text-fg-dim">{LABEL[score]}</span>
        </div>
      )}
      {rules && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {PASSWORD_RULES.map((r) => {
            const ok = r.test(value)
            return (
              <li key={r.label} className="flex items-center gap-2 text-[12px]">
                <span className={cn('relative flex h-4 w-4 items-center justify-center rounded-full border transition-colors', ok ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong text-transparent')}>
                  <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={false} animate={{ pathLength: ok ? 1 : 0 }} transition={{ duration: 0.25 }} />
                  </svg>
                </span>
                <motion.span className={cn('relative', ok ? 'text-fg-dim' : 'text-fg-faint')} animate={{ x: ok ? [0, 2, 0] : 0 }} transition={{ duration: 0.25 }}>
                  {r.label}
                  <motion.span aria-hidden className="absolute top-1/2 left-0 h-px w-full bg-fg-faint" initial={false} animate={{ scaleX: ok ? 1 : 0 }} style={{ transformOrigin: 'left' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
                </motion.span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
})
