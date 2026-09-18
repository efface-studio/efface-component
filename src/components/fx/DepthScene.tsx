import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface DepthSceneProps {
  className?: string
}

const LAYERS = [
  { z: 0.15, size: 260, x: 20, y: 30, blur: 6, o: 0.35, c: '#7c3aed' },
  { z: 0.35, size: 180, x: 70, y: 25, blur: 3, o: 0.5, c: '#14b8b0' },
  { z: 0.6, size: 120, x: 30, y: 70, blur: 1, o: 0.8, c: '#2563eb' },
  { z: 1, size: 90, x: 65, y: 65, blur: 0, o: 1, c: '#3b62e5' },
]

/**
 * 깊이가 다른 층들이 포인터에 따라 서로 다른 속도로 움직인다(패럴랙스).
 * 먼 층일수록 느리고 흐릿하며, 가까운 층은 크게 움직인다. 가운데 글자는 가장 앞.
 */
export function DepthScene({ className }: DepthSceneProps) {
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = host.current
    if (!el || reduce) return
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-z]'))
    let raf = 0
    let t = 0
    const pt = { x: 0, y: 0, tx: 0, ty: 0 }
    const tick = () => {
      t += 0.016
      pt.x += (pt.tx - pt.x) * 0.06
      pt.y += (pt.ty - pt.y) * 0.06
      for (const l of layers) {
        const z = Number(l.dataset.z)
        const dx = -pt.x * 60 * z + Math.sin(t * 0.6 + z * 5) * 6 * z
        const dy = -pt.y * 40 * z + Math.cos(t * 0.5 + z * 3) * 6 * z
        l.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${1 + z * 0.05 * (Math.abs(pt.x) + Math.abs(pt.y))})`
      }
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      pt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      pt.tx = 0
      pt.ty = 0
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
  return (
    <div ref={host} className={cn('relative h-full w-full overflow-hidden select-none', className)}>
      {LAYERS.map((l, i) => (
        <div
          key={i}
          data-z={l.z}
          aria-hidden
          className="absolute rounded-[28%] will-change-transform"
          style={{ width: l.size, height: l.size, left: `calc(${l.x}% - ${l.size / 2}px)`, top: `calc(${l.y}% - ${l.size / 2}px)`, background: `radial-gradient(circle at 30% 30%, ${l.c}, ${l.c}88)`, filter: `blur(${l.blur}px)`, opacity: l.o, boxShadow: `0 ${20 * l.z}px ${40 * l.z}px -10px rgba(0,0,0,0.5)` }}
        />
      ))}
      <div data-z={1.3} className="absolute inset-0 flex items-center justify-center will-change-transform">
        <p className="font-display text-5xl font-bold tracking-tight text-fg drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">depth</p>
      </div>
    </div>
  )
}
