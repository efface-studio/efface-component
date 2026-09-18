import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

/** 두께가 있는 둥근 판 — 얇은 층을 translateZ 로 쌓는다 */
function Plate({ x, y, z, size, depth, color, edge, shine }: { x: number; y: number; z: number; size: number; depth: number; color: string; edge: string; shine: string }) {
  const radius = size * 0.28
  return (
    <div className="absolute" style={{ left: x, top: y, width: size, height: size, transformStyle: 'preserve-3d' }}>
      {Array.from({ length: depth }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            background: i === depth - 1 ? `radial-gradient(circle at var(--lx, 50%) var(--ly, 50%), ${shine} 0%, ${color} 55%)` : edge,
            transform: `translateZ(${z + i * 1.6}px)`,
            boxShadow: i === 0 ? '0 0 0 1px rgba(0,0,0,0.12)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

export interface LogoTilt3DProps {
  /** 한 변(px) */
  size?: number
  /** 두께(층 수) */
  depth?: number
  className?: string
}

/**
 * efface 마크를 CSS 3D 로 두껍게 쌓아 올린 입체 로고.
 * 두 판이 서로 다른 높이에 떠 있고, 포인터를 따라 기울며 판 사이로 빛이 훑고 그림자가 움직인다.
 * 가만히 두면 천천히 떠오르내린다.
 */
export function LogoTilt3D({ size = 220, depth = 14, className }: LogoTilt3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = host.current
    const st = stage.current
    if (!el || !st || reduce) return
    let raf = 0
    let t = 0
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
    const tick = () => {
      t += 0.016
      tilt.x += (tilt.tx - tilt.x) * 0.07
      tilt.y += (tilt.ty - tilt.y) * 0.07
      const idleX = Math.sin(t * 0.8) * 6
      const idleY = Math.cos(t * 0.6) * 8
      const rx = -tilt.y * 28 + idleX
      const ry = tilt.x * 34 + idleY
      st.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(${Math.sin(t * 1.1) * 6}px)`
      // 빛 — 기울기에 따라 하이라이트 위치
      st.style.setProperty('--lx', `${50 + tilt.x * 40 + idleY}%`)
      st.style.setProperty('--ly', `${50 - tilt.y * 40 - idleX}%`)
      el.style.setProperty('--sx', `${-tilt.x * 30 - idleY * 1.2}px`)
      el.style.setProperty('--sy', `${tilt.y * 30 + 40 - idleX}px`)
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      tilt.tx = 0
      tilt.ty = 0
    }
    raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])

  const plate = size * 0.62

  return (
    <div ref={host} className={cn('relative flex h-full w-full items-center justify-center select-none', className)} style={{ perspective: 900 }} aria-label="efface">
      {/* 바닥 그림자 — 기울기에 따라 움직인다 */}
      <div aria-hidden className="absolute rounded-full bg-black/45 blur-2xl" style={{ width: size * 0.9, height: size * 0.35, transform: 'translate(var(--sx, 0px), calc(var(--sy, 40px) + 90px))' }} />
      <div ref={stage} className="relative will-change-transform" style={{ width: size, height: size, transformStyle: 'preserve-3d' }}>
        <Plate x={0} y={0} z={0} size={plate} depth={depth} color="#eceef2" edge="#c9ccd6" shine="#ffffff" />
        <Plate x={size - plate} y={size - plate} z={depth * 1.6 + 10} size={plate} depth={depth} color="#3b62e5" edge="#2646b8" shine="#7d9cff" />
      </div>
    </div>
  )
}
