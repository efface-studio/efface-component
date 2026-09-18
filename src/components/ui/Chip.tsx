import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ICON_PATHS, TECH } from '@/lib/iconPaths'

/* ── TechChip (v1 Marquee) ─────────────────────────────────────── */

export interface TechChipProps {
  name: string
  href?: string
  /** simple-icons path d. 없으면 이름으로 TECH 표에서 찾고, 그래도 없으면 첫 글자 타일. */
  iconPath?: string
  /** 브랜드 hex (# 포함). 호버 시 아이콘이 이 색으로 물든다. 없으면 TECH 표의 색. */
  color?: string
  className?: string
}

/** 어두운 브랜드색(검정 계열)은 다크 테마에서 안 보이므로 흰색으로 */
function darkSafe(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i)
  if (!m) return hex
  const n = parseInt(m[1] ?? '000000', 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum < 0.28 ? '#ffffff' : hex
}

/**
 * 기술 스택 칩 (v1). 흰 알약 + 회색 아이콘, 호버 시 떠오르며 브랜드 컬러가 드러난다.
 * 아이콘은 simple-icons 경로를 인라인으로 그린다 — 이름만 넘겨도 TECH 표에서 찾는다.
 */
export function TechChip({ name, href, iconPath, color, className }: TechChipProps) {
  const known = TECH[name]
  const path = iconPath ?? (known ? ICON_PATHS[known.slug] : undefined)
  const brand = color ?? known?.color ?? '#000000'
  const link = href ?? known?.href
  const Tag = link ? 'a' : 'span'
  return (
    <Tag
      {...(link ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'tech-chip group relative flex h-12 items-center gap-2.5 rounded-full border border-line bg-surface px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-fg hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        className,
      )}
      style={{ '--brand': brand, '--brand-dark': darkSafe(brand) } as CSSProperties}
    >
      {path ? (
        <svg role="img" aria-label={name} viewBox="0 0 24 24" width={20} height={20} className="tech-chip__icon shrink-0 transition-colors duration-300">
          <path d={path} />
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
