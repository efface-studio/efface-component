import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface WarpProps {
  count?: number
  className?: string
}

interface Star {
  x: number
  y: number
  z: number
  pz: number
}

/**
 * 워프 터널 — 별들이 화면 중심에서 뻗어 나오며 속도선이 된다.
 * 포인터가 소실점을 끌고, 누르고 있으면 속도가 붙는다.
 */
export function Warp({ count = 420, className }: WarpProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let speed = 0.012
    let targetSpeed = 0.012
    const vp = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let fg = '#fff'
    let accent = '#2563eb'
    const stars: Star[] = Array.from({ length: count }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), pz: 0 }))
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 잔상
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      speed += (targetSpeed - speed) * 0.05
      vp.x += (vp.tx - vp.x) * 0.06
      vp.y += (vp.ty - vp.y) * 0.06
      const cx = vp.x * w
      const cy = vp.y * h
      const f = Math.max(w, h) * 0.9
      for (const s of stars) {
        s.pz = s.z
        s.z -= speed
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1
          s.y = Math.random() * 2 - 1
          s.z = 1
          s.pz = 1
        }
        const sx = cx + (s.x * f) / (s.z * 4)
        const sy = cy + (s.y * f) / (s.z * 4)
        const px = cx + (s.x * f) / (s.pz * 4)
        const py = cy + (s.y * f) / (s.pz * 4)
        const k = 1 - s.z
        ctx.strokeStyle = k > 0.85 ? accent : fg
        ctx.globalAlpha = Math.min(1, k * 1.4)
        ctx.lineWidth = 0.6 + k * 2.4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      vp.tx = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * 0.6
      vp.ty = 0.5 + ((e.clientY - r.top) / r.height - 0.5) * 0.6
    }
    const onLeave = () => {
      vp.tx = 0.5
      vp.ty = 0.5
      targetSpeed = 0.012
    }
    const onDown = () => {
      targetSpeed = 0.06
    }
    const onUp = () => {
      targetSpeed = 0.012
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerup', onUp)
    }
  }, [count, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#05060a] text-white', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
