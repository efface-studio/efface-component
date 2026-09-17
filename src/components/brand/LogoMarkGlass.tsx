import { useId } from 'react'

export interface LogoMarkGlassProps {
  size?: number
  accent?: string
  className?: string
}

/**
 * efface 마크 — 유리 질감 (Mom-Work 배너). 뒤에 어두운 사본 두 장을 깔아
 * 두께를 만들고, 앞면은 그라데이션으로 빛을 받는다. 다크 배경 전용.
 */
export function LogoMarkGlass({ size = 26, accent = '#3b62e5', className }: LogoMarkGlassProps) {
  const id = useId()
  const light = `${id}-light`
  const dark = `${id}-accent`
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={light} x1="4" y1="4" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#eeeef1" />
          <stop offset="1" stopColor="#b9b9c4" />
        </linearGradient>
        <linearGradient id={dark} x1="12" y1="12" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8aa2ff" />
          <stop offset="0.45" stopColor={accent} />
          <stop offset="1" stopColor="#1a2a72" />
        </linearGradient>
      </defs>
      <rect x="6.7" y="6.7" width="13" height="13" rx="3.6" fill="#7c7c86" />
      <rect x="6.1" y="6.1" width="13" height="13" rx="3.6" fill="#a8a8b3" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill={`url(#${light})`} />
      <rect x="14.7" y="14.7" width="13" height="13" rx="3.6" fill="#101a4a" />
      <rect x="14.1" y="14.1" width="13" height="13" rx="3.6" fill="#1d2e71" />
      <rect x="13.5" y="13.5" width="13" height="13" rx="3.6" fill={`url(#${dark})`} />
    </svg>
  )
}
