import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* ── TechChip (v1 Marquee) ─────────────────────────────────────── */

export interface TechChipProps {
  name: string
  href?: string
  /** simple-icons path d. 없으면 첫 글자 타일. */
  iconPath?: string
  /** 브랜드 hex (# 포함). 호버 시 아이콘이 이 색으로 물든다. */
  color?: string
  className?: string
}

/**
 * 기술 스택 칩 (v1). 흰 알약 + 회색 아이콘, 호버 시 떠오르며 브랜드 컬러가 드러난다.
 */
export function TechChip({ name, href, iconPath, color = '#000000', className }: TechChipProps) {
  const Tag = href ? 'a' : 'span'
  return (
    <Tag
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group relative flex h-12 items-center gap-2.5 rounded-full border border-line bg-surface px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-fg hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        className,
      )}
      style={{ '--brand': color } as CSSProperties}
    >
      {iconPath ? (
        <svg
          role="img"
          aria-label={name}
          viewBox="0 0 24 24"
          width={20}
          height={20}
          className="shrink-0 fill-[#737373] transition-colors duration-300 group-hover:fill-(--brand)"
        >
          <path d={iconPath} />
        </svg>
      ) : (
        <span
          aria-hidden
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-[10px] text-fg-dim transition group-hover:bg-fg group-hover:text-bg"
        >
          {name.slice(0, 1)}
        </span>
      )}
      <span className="text-sm font-medium tracking-tight text-fg-2 transition group-hover:text-fg">{name}</span>
    </Tag>
  )
}

/* ── DotChip (v2 Capabilities) ─────────────────────────────────── */

export interface DotChipProps {
  children: ReactNode
  /** 점 색. 목록에서 순환시킨다. */
  dot?: string
  className?: string
}

/** 점 하나 달린 도구 이름 (v2). 크롬 없이 목록처럼 읽힌다. */
export function DotChip({ children, dot, className }: DotChipProps) {
  return (
    <span className={cn('cap-chip', className)} style={dot ? ({ '--dot': dot } as CSSProperties) : undefined}>
      {children}
    </span>
  )
}

/* ── FilterChip (선택형) ───────────────────────────────────────── */

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  selected?: boolean
  className?: string
}

/** 선택 가능한 필터 칩. 선택 시 잉크 채움. */
export function FilterChip({ selected = false, className, children, ...rest }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
        selected ? 'border-fg bg-fg text-bg' : 'border-line bg-surface text-fg-dim hover:border-fg-faint hover:text-fg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
