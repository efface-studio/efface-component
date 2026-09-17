export interface LogoProps {
  size?: number
  className?: string
}

/**
 * efface 로고 (v1, efface.dev) — 블루 사각형이 뒤, 잉크 사각형이 앞.
 * v2 마크와 앞뒤 순서가 반대이며 라이트 배경 전용이다.
 */
export function Logo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="efface"
      role="img"
    >
      <rect x="32" y="32" width="58" height="58" rx="10" fill="#3b6dff" />
      <rect x="12" y="12" width="58" height="58" rx="10" fill="#0a0a0a" />
    </svg>
  )
}
