import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'kakao'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  /** v1 기본 CTA — 잉크 채움. 다크 테마에서는 반전(흰 바탕 · 검정 글자). */
  primary: 'bg-fg text-bg hover:bg-fg-2',
  /** v1 보조 CTA — 선만, 호버 시 선이 진해진다. */
  secondary: 'border border-line bg-bg/80 text-fg backdrop-blur-sm hover:border-fg',
  /** Mom-Work 배너 CTA — 로고 블루 채움. */
  accent: 'bg-brand text-white hover:bg-brand-bright',
  /** 아이콘/텍스트만. */
  ghost: 'text-fg-dim hover:bg-line/40 hover:text-fg',
  /** 카카오 채널. */
  kakao: 'bg-kakao text-kakao-fg hover:opacity-90',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
}

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** 알약형(rounded-full). 기본은 rounded-md. */
  pill?: boolean
  /** 오른쪽 끝 아이콘 슬롯 — 화살표 등. `group` 호버로 이동시킬 수 있다. */
  trailing?: ReactNode
  leading?: ReactNode
  className?: string
  children?: ReactNode
}

export type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>
export type ButtonLinkProps = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>

function classes({ variant = 'primary', size = 'md', pill, className }: BaseProps) {
  return cn(
    'group inline-flex items-center justify-center font-medium whitespace-nowrap transition-[background-color,border-color,color,opacity,transform] duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    pill ? 'rounded-full' : 'rounded-md',
    VARIANT[variant],
    SIZE[size],
    className,
  )
}

/**
 * 버튼. v1의 `h-12 px-6 rounded-md bg-ink`와 Mom-Work 배너의 `rounded-full bg-accent`
 * 두 계열을 variant / pill로 합쳤다. 이동이면 `ButtonLink`를 쓴다.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, pill, trailing, leading, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={classes({ variant, size, pill, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  )
})

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, pill, trailing, leading, className, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={classes({ variant, size, pill, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </a>
  )
})
