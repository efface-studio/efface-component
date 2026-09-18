import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none'

export interface SkeletonProps {
  /** 모양. text 는 글줄 높이(1em 기준), circle 은 아바타. */
  shape?: 'block' | 'text' | 'circle'
  width?: number | string
  height?: number | string
  /** 기본 shimmer — 왼→오로 하이라이트가 지나간다. pulse 는 제자리에서 숨쉬기. */
  animation?: SkeletonAnimation
  /** 둥글기. block 기본 rounded-md, text 기본 rounded, circle 은 항상 원. */
  radius?: string
  className?: string
  style?: CSSProperties
}

/**
 * 스켈레톤 — 내용이 오기 전 자리를 잡아 두는 회색 블록.
 * 실제 콘텐츠와 같은 크기·둥글기로 두면 로드 뒤 레이아웃이 튀지 않는다.
 * reduced-motion 이면 애니메이션 없이 정지된 톤으로 보인다.
 */
export function Skeleton({ shape = 'block', width, height, animation = 'shimmer', radius, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'skeleton block shrink-0',
        animation === 'shimmer' && 'skeleton--shimmer',
        animation === 'pulse' && 'skeleton--pulse',
        shape === 'circle' ? 'rounded-full' : shape === 'text' ? (radius ?? 'rounded') : (radius ?? 'rounded-md'),
        shape === 'text' && 'h-[1em] w-full',
        shape === 'circle' && 'h-10 w-10',
        className,
      )}
      style={{ width, height, ...style }}
    />
  )
}

export interface SkeletonTextProps {
  /** 줄 수 */
  lines?: number
  /** 마지막 줄 폭 (0~1). 문단 끝처럼 보이게 */
  lastWidth?: number
  /** 줄 간격 클래스 */
  gap?: string
  animation?: SkeletonAnimation
  className?: string
}

/** 글줄 여러 개. 마지막 줄만 짧게 끊어 문단처럼 보인다. */
export function SkeletonText({ lines = 3, lastWidth = 0.6, gap = 'gap-2.5', animation, className }: SkeletonTextProps) {
  return (
    <span className={cn('flex flex-col', gap, className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} shape="text" animation={animation} className="h-[0.9em]" style={{ width: i === lines - 1 && lines > 1 ? `${lastWidth * 100}%` : undefined }} />
      ))}
    </span>
  )
}

export interface SkeletonAvatarProps {
  size?: number
  animation?: SkeletonAnimation
  className?: string
}

export function SkeletonAvatar({ size = 40, animation, className }: SkeletonAvatarProps) {
  return <Skeleton shape="circle" width={size} height={size} animation={animation} className={className} />
}

/* ── 조합 ────────────────────────────────────────────────── */

export interface SkeletonCardProps {
  /** 상단 이미지 영역 비율 (예: '16/10'). 없으면 이미지 없이 */
  media?: string
  lines?: number
  animation?: SkeletonAnimation
  className?: string
}

/** 카드 자리 — 미디어 + 제목 + 본문 두어 줄 + 메타. CardGrid 셀과 같은 여백. */
export function SkeletonCard({ media = '16/10', lines = 2, animation, className }: SkeletonCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface', className)} aria-busy="true">
      {media && <Skeleton animation={animation} radius="rounded-none" className="w-full" style={{ aspectRatio: media, height: 'auto' }} />}
      <div className="p-5">
        <Skeleton animation={animation} height={18} width="55%" />
        <SkeletonText lines={lines} animation={animation} className="mt-3 text-[14px]" />
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <SkeletonAvatar size={28} animation={animation} />
          <Skeleton animation={animation} height={12} width={96} />
          <Skeleton animation={animation} height={12} width={48} className="ml-auto" />
        </div>
      </div>
    </div>
  )
}

export interface SkeletonRowProps {
  avatar?: boolean
  /** 오른쪽 끝 액션 자리 */
  trailing?: boolean
  animation?: SkeletonAnimation
  className?: string
}

/** 목록 한 줄 — 아바타 + 제목/부제 + 오른쪽 값. 구성원·알림·결재 목록 자리. */
export function SkeletonRow({ avatar = true, trailing = true, animation, className }: SkeletonRowProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)} aria-busy="true">
      {avatar && <SkeletonAvatar size={36} animation={animation} />}
      <div className="min-w-0 flex-1">
        <Skeleton animation={animation} height={14} width="40%" />
        <Skeleton animation={animation} height={12} width="65%" className="mt-2" />
      </div>
      {trailing && <Skeleton animation={animation} height={24} width={64} radius="rounded-full" />}
    </div>
  )
}

export interface SkeletonStatProps {
  animation?: SkeletonAnimation
  className?: string
}

/** 큰 숫자 + 라벨 자리 (Stat · 대시보드 타일). */
export function SkeletonStat({ animation, className }: SkeletonStatProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-busy="true">
      <Skeleton animation={animation} height={44} width={120} />
      <Skeleton animation={animation} height={12} width={88} />
    </div>
  )
}

/**
 * 로딩 ↔ 콘텐츠 전환 래퍼. `loading` 이 true 인 동안 skeleton 을, 끝나면 children 을
 * 부드럽게 교차시킨다. 두 상태의 높이를 맞춰 두면 전환이 튀지 않는다.
 */
export function SkeletonSwap({ loading, skeleton, children, className }: { loading: boolean; skeleton: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)} aria-busy={loading || undefined}>
      <div className={cn('transition-opacity duration-500 ease-out-quart', loading ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0')} aria-hidden={!loading}>
        {skeleton}
      </div>
      <div className={cn('transition-opacity duration-500 ease-out-quart', loading ? 'pointer-events-none absolute inset-0 opacity-0' : 'opacity-100')} aria-hidden={loading}>
        {children}
      </div>
    </div>
  )
}
