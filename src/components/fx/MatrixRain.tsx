import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface MatrixRainProps {
  className?: string
}

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789EFFACE<>/{}=+*#'

/**
 * 디지털 비. 글자 줄기가 떨어지며 꼬리가 옅어진다. 포인터 주변은 액센트로 밝아지고 줄기가 빨라진다.
 */
export function MatrixRain({ className }: MatrixRainProps) {
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
    const size = 14
    let drops: number[] = []
    let pointer: { x: number; y: number } | null = null
    let fg = '#0f0'
    let accent = '#2563eb'
    let bgRgb = '11,12,16'
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      const m = cs.backgroundColor.match(/[\d.]+/g)
      if (m && m.length >= 3) bgRgb = `${m[0]},${m[1]},${m[2]}`
      drops = Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -50)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = `rgb(${bgRgb})`
      ctx.fillRect(0, 0, w, h)
    }
    let frame = 0
    const draw = () => {
      frame++
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = `rgba(${bgRgb},0.16)`
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${size}px 'JetBrains Mono', ui-monospace, monospace`
      for (let i = 0; i < drops.length; i++) {
        const x = i * size
        const y = (drops[i] ?? 0) * size
        const near = pointer ? Math.max(0, 1 - Math.abs(pointer.x - x) / 90) : 0
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '0'
        ctx.fillStyle = near > 0.4 ? accent : fg
        ctx.globalAlpha = 0.55 + near * 0.45
        ctx.fillText(ch, x, y)
        ctx.globalAlpha = 1
        const speed = 1 + near * 1.5
        if (frame % (near > 0.4 ? 1 : 2) === 0) drops[i] = (drops[i] ?? 0) + speed
        if (y > h && Math.random() > 0.975) drops[i] = 0
      }
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#0b0c10] text-[#5ee0a5]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
