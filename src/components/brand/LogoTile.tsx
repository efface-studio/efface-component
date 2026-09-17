import { cn } from '@/lib/cn'
import { LogoMark } from './LogoMark'

export type LogoTileSurface = 'ink' | 'paper' | 'brand' | 'glass' | 'outline'

export interface LogoTileProps {
  /** 타일 바탕. `glass`는 배너의 유리 그라데이션. */
  surface?: LogoTileSurface
  size?: number
  /** 모서리 반경 비율 (iOS 아이콘 ≈ 0.22) */
  radius?: number
  className?: string
}

const SURFACE: Record<LogoTileSurface, { bg: string; mark: string; accent?: string; ring?: string }> = {
  ink: { bg: '#0a0a0b', mark: '#f6f6f7' },
  paper: { bg: '#ffffff', mark: '#0a0a0a', ring: 'inset 0 0 0 1px rgba(0,0,0,0.08)' },
  brand: { bg: '#3b62e5', mark: '#ffffff', accent: '#0a0a0b' },
  glass: { bg: 'linear-gradient(135deg, #1b1b21 0%, #0a0a0b 100%)', mark: '#f6f6f7', ring: 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.5)' },
  outline: { bg: 'transparent', mark: 'currentColor', ring: 'inset 0 0 0 1px var(--line-strong)' },
}

/**
 * 배경 타일 위의 마크 — 파비콘·앱 아이콘·아바타 용도. 마크는 타일의 62%.
 */
export function LogoTile({ surface = 'ink', size = 64, radius = 0.22, className }: LogoTileProps) {
  const s = SURFACE[surface]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size, borderRadius: size * radius, background: s.bg, boxShadow: s.ring, color: s.mark }}
      aria-hidden="true"
    >
      <LogoMark style={{ width: size * 0.62, height: size * 0.62 }} accent={s.accent} />
    </span>
  )
}
