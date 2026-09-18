import { forwardRef, type ComponentType, type SVGProps } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/cn'
import { AppleIcon, GitHubIcon, GoogleIcon, KakaoIcon, NaverIcon } from './socialIcons'
import { SOCIAL_PROVIDERS, type SocialProvider } from './social.constants'

export type SocialVariant = 'neutral' | 'brand'

interface ProviderSpec {
  name: string
  /** "~로 계속하기" 조사까지 포함한 기본 라벨 */
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** brand 변형 — 각 회사 브랜드 가이드의 버튼 색(테마별 값은 index.css 의 --social-*) */
  brand: string
  /** neutral 변형에서 아이콘을 감싸는 브랜드색 배지(카카오·네이버처럼 단색 배경이 아이콘의 일부인 경우) */
  badge?: string
}

const PROVIDERS: Record<SocialProvider, ProviderSpec> = {
  google: { name: 'Google', label: 'Google로 계속하기', Icon: GoogleIcon, brand: 'border border-google-line bg-google text-google-fg hover:bg-google-line/20' },
  apple: { name: 'Apple', label: 'Apple로 계속하기', Icon: AppleIcon, brand: 'bg-apple text-apple-fg hover:opacity-85' },
  github: { name: 'GitHub', label: 'GitHub으로 계속하기', Icon: GitHubIcon, brand: 'bg-github text-github-fg hover:opacity-85' },
  kakao: { name: '카카오', label: '카카오로 계속하기', Icon: KakaoIcon, brand: 'bg-kakao text-kakao-fg hover:brightness-95', badge: 'bg-kakao text-kakao-fg' },
  naver: { name: '네이버', label: '네이버로 계속하기', Icon: NaverIcon, brand: 'bg-naver text-naver-fg hover:brightness-95', badge: 'bg-naver text-naver-fg' },
}

export interface SocialButtonProps extends Omit<HTMLMotionProps<'button'>, 'className' | 'children' | 'ref'> {
  provider: SocialProvider
  /**
   * neutral — 모든 공급자가 같은 선 버튼, 아이콘만 브랜드색 (Notion · Linear · Vercel 식. 기본).
   * brand — 회사 가이드의 채움색 (카카오 노랑 · 네이버 초록 · 애플 검정 …).
   */
  variant?: SocialVariant
  /** 라벨 덮어쓰기. 기본은 "Google로 계속하기" 식 */
  children?: string
  /** 아이콘만 있는 원형 버튼 — 여러 공급자를 한 줄에 놓을 때 */
  compact?: boolean
  size?: 'md' | 'lg'
  className?: string
}

/**
 * 소셜 로그인 버튼. 아이콘과 글자를 한 덩어리로 가운데에 두고(애플 가이드),
 * 호버하면 아이콘이 살짝 들리고 누르면 가라앉는다.
 */
export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(function SocialButton(
  { provider, variant = 'neutral', children, compact = false, size = 'lg', className, disabled, ...rest },
  ref,
) {
  const spec = PROVIDERS[provider]
  const reduce = useReducedMotion()
  const { Icon } = spec
  const neutral = variant === 'neutral'
  // neutral 에서 카카오·네이버는 브랜드색 원 배지 안에, 나머지는 currentColor(구글은 4색)
  const badged = neutral && !!spec.badge
  const iconPx = compact ? 20 : 18
  const glyph = badged ? (
    <span className={cn('flex items-center justify-center rounded-full', spec.badge, compact ? 'h-7 w-7' : 'h-5 w-5')}>
      <Icon width={compact ? 15 : 11} height={compact ? 15 : 11} />
    </span>
  ) : (
    <Icon width={iconPx} height={iconPx} />
  )

  const skin = neutral
    ? 'border border-line bg-surface text-fg hover:border-line-strong hover:bg-bg-soft'
    : spec.brand

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={compact ? spec.label : undefined}
      title={compact ? spec.label : undefined}
      disabled={disabled}
      whileHover={reduce || disabled ? undefined : 'hover'}
      whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2.5 font-medium tracking-tight transition-[background-color,opacity,filter,border-color,box-shadow] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        compact ? cn('rounded-full', size === 'lg' ? 'h-12 w-12' : 'h-11 w-11') : cn('w-full rounded-md px-4', size === 'lg' ? 'h-12 text-[15px]' : 'h-11 text-sm'),
        skin,
        className,
      )}
      {...rest}
    >
      <motion.span aria-hidden className="inline-flex shrink-0 items-center justify-center" variants={{ hover: { y: -1, scale: 1.08 } }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}>
        {glyph}
      </motion.span>
      {!compact && <span>{children ?? spec.label}</span>}
    </motion.button>
  )
})

/** 문서/데모용 — 모든 공급자를 순서대로 */
export { SOCIAL_PROVIDERS }
