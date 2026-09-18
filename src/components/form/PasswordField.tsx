import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { TextField, type TextFieldProps } from './TextField'
import { passwordScore } from './passwordScore'

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'trailing'> {
  /** 강도 미터 표시 (value 기준) */
  strength?: boolean
}

const LABEL = ['', '약함', '보통', '좋음', '강함']
const COLOR = ['', '#ef4444', '#f59e0b', '#22c55e', '#3b62e5']

/** 비밀번호 필드 — 눈 아이콘으로 표시/숨김, 옵션으로 네 칸 강도 미터. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ strength = false, value, className, ...rest }, ref) {
  const [show, setShow] = useState(false)
  const score = passwordScore(String(value ?? ''))
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <TextField
        ref={ref}
        type={show ? 'text' : 'password'}
        value={value}
        autoComplete={rest.autoComplete ?? 'current-password'}
        trailing={
          <button type="button" onClick={() => setShow((v) => !v)} className="-mr-1 flex h-8 w-8 items-center justify-center rounded text-fg-faint transition-colors hover:text-fg" aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} aria-pressed={show}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
    </div>
  )
})
