import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useReducedMotionPref } from '@/hooks/useMediaQuery'

export interface LogoScene3DProps {
  className?: string
  /** 정지 프레임 하나만 그린다. 기본은 reduced-motion 설정을 따른다. */
  still?: boolean
  /** 스튜디오 배경 없이 투명 캔버스 (무배경 3D 마크) */
  transparent?: boolean
  /** 마크를 가운데 놓는다 (`anchor={0.5}` 와 같다). */
  centered?: boolean
  /** 마크의 가로 위치 — 캔버스 폭의 비율(0…1). 기본 0.7. 화면 비율이 달라져도 같은 자리에 온다. */
  anchor?: number
}

/**
 * 살아 있는 "유리 사각형" 로고 씬 (v2 Hero 배경). WebGL 이라 어느 해상도에서도
 * 선명하다. three.js 는 동적 import 로 첫 번들에서 뺀다. 씬은 뷰포트를 벗어나면
 * 렌더를 멈추고, 언마운트 시 지오메트리·머티리얼·텍스처를 모두 해제한다.
 */
export function LogoScene3D({ className, still, transparent = false, centered = false, anchor }: LogoScene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotionPref()
  const frozen = still ?? reduced

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let dispose: (() => void) | undefined
    let cancelled = false
    import('@/components/three/glassScene').then(({ createGlassScene }) => {
      if (cancelled || !canvasRef.current) return
      dispose = createGlassScene(canvasRef.current, { still: frozen, transparent, centered, anchor })
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [frozen, transparent, centered, anchor])

  return <canvas ref={canvasRef} className={cn('block h-full w-full', className)} aria-hidden="true" />
}
