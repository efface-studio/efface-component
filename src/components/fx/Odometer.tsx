import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface OdometerProps {
  value: number
  /** 천 단위 구분 */
  grouping?: boolean
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * 숫자가 슬롯머신 드럼처럼 굴러 바뀐다. 오른쪽 자리부터 살짝 늦게 따라와 물결처럼 보인다.
 * 모든 글자를 같은 1em 상자에 넣어(leading-none) 접두·구분자·숫자가 한 줄에 정확히 맞는다.
 */
export function Odometer({ value, grouping = true, decimals = 0, prefix, suffix, className }: OdometerProps) {
  const reduce = useReducedMotion()
  const str = grouping ? value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : value.toFixed(decimals)
  const chars = str.split('')
  const digitCount = chars.filter((c) => /\d/.test(c)).length
  let seen = 0
  const cell = 'inline-flex h-[1em] items-center leading-none'
  return (
    <span className={cn('inline-flex items-center leading-none font-semibold tracking-tight tabular-nums', className)} aria-label={`${prefix ?? ''}${str}${suffix ?? ''}`}>
      {prefix && <span className={cn(cell, 'mr-[0.04em]')}>{prefix}</span>}
      {chars.map((c, i) => {
        if (!/\d/.test(c))
          return (
            <span key={`s${i}`} aria-hidden className={cell}>
              {c}
            </span>
          )
        const idx = seen++
        const fromRight = digitCount - 1 - idx
        const d = Number(c)
        return (
          <span key={`d${i}`} aria-hidden className="relative inline-block h-[1em] w-[0.6em] overflow-hidden leading-none">
            <motion.span
              className="absolute top-0 left-0 flex w-full flex-col"
              initial={false}
              animate={{ y: `${-d}em` }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 130, damping: 20, mass: 0.9, delay: fromRight * 0.05 }}
            >
              {DIGITS.map((n) => (
                <span key={n} className="flex h-[1em] items-center justify-center leading-none">
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        )
      })}
      {suffix && <span className={cn(cell, 'ml-[0.15em] text-[0.55em] font-medium text-fg-dim')}>{suffix}</span>}
    </span>
  )
}
