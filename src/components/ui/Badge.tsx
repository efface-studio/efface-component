import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'success' | 'warning' | 'accent' | 'neutral'

const DOT: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-amber-500',
  accent: 'bg-brand',
  neutral: 'bg-fg-faint',
}

export interface StatusDotProps {
  tone?: BadgeTone
  /** 바깥으로 퍼지는 ping (v1 Hero 배지 · Portfolio Live). */
  ping?: boolean
  /** 안쪽에서 숨쉬듯 흐려지는 pulse (Mom-Work 배너 `efDot`). */
  pulse?: boolean
  className?: string
}

/** 상태 점. `ping`은 바깥 확산, `pulse`는 자체 숨쉬기. */
export function StatusDot({ tone = 'success', ping = false, pulse = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-1.5 w-1.5', className)}>
      {ping && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', DOT[tone])} />}
      <span
        className={cn('relative h-1.5 w-1.5 rounded-full', DOT[tone])}
        style={pulse ? { animation: 'efDot 2.2s ease-in-out infinite' } : undefined}
      />
    </span>
  )
}

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  ping?: boolean
  /** 모노 대문자 라벨 스타일 (v1 Testimonials privacy 배지) */
  mono?: boolean
  /** 흰 배경 + 블러 (스크린샷 위에 얹는 v1 Live/Demo 배지) */
  floating?: boolean
  className?: string
}

/** 점 + 짧은 텍스트의 알약 배지. */
export function Badge({ children, tone = 'success', ping = false, mono = false, floating = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-medium tracking-wide',
        floating ? 'border border-line bg-surface/95 backdrop-blur' : 'bg-surface-2',
        mono && 'font-mono',
        className,
      )}
    >
      <StatusDot tone={tone} ping={ping} />
      {children}
    </span>
  )
}

/** 상단 파일럿 배지 (v1 Hero) — 선 있는 알약 + 초록 ping 점. */
export function PilotBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-2 rounded-full border border-line bg-surface pr-3 pl-2 text-xs text-fg-dim',
        className,
      )}
    >
      <StatusDot tone="success" ping />
      {children}
    </span>
  )
}
