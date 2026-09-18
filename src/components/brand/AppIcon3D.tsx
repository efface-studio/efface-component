import { useEffect, useRef } from 'react'

export interface AppIcon3DProps {
  /** 타일 위에 돋을새김할 글리프 SVG. fill 과 data-d(돌출 높이)를 가진 path/rect/circle. */
  src: string
  /** 타일 색 */
  color: string
  /** 정지 회전 (도) */
  rx?: number
  ry?: number
  rz?: number
  size?: number
  className?: string
}

/**
 * 3D 앱 아이콘 (v2 AppCards). 둥근 상자 타일 위에 SVG 글리프를 부드럽게 돌출시킨다.
 * 한 번만 렌더하는 정적 이미지 — rAF 루프가 없다. WebGL 컨텍스트는 언마운트 시 해제.
 */
export function AppIcon3D({ src, color, rx = 12, ry = -22, rz = 8, size = 220, className }: AppIcon3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let dispose: (() => void) | undefined
    let cancelled = false
    import('@/components/three/appIcon3d').then(({ createAppIcon }) => {
      if (cancelled || !hostRef.current) return
      dispose = createAppIcon(hostRef.current, { src, color, rx, ry, rz, size })
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [src, color, rx, ry, rz, size])

  return <div ref={hostRef} className={className} style={{ width: size, height: size }} aria-hidden="true" />
}
