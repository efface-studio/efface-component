import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface LensProps {
  text?: string
  zoom?: number
  className?: string
}

/**
 * 돋보기. 포인터 자리의 글자 격자를 둥근 렌즈가 확대해 보여 주고, 렌즈 가장자리는 굴절처럼 휜다.
 * canvas 에 같은 장면을 두 번 그린다 — 한 번은 그대로, 한 번은 렌즈 안을 크게.
 */
export function Lens({ text = 'efface', zoom = 2.4, className }: LensProps) {
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
    let fg = '#000'
    let accent = '#2563eb'
    let bg = '#fff'
    const lens = { x: -999, y: -999, r: 0, tx: -999, ty: -999, tr: 0 }
    const scene = (scale: number, ox: number, oy: number) => {
      ctx.save()
      ctx.translate(ox, oy)
      ctx.scale(scale, scale)
      ctx.font = `600 22px 'Pretendard Variable', Pretendard, system-ui, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = fg
      const step = 120
      for (let y = 30; y < h; y += 44)
        for (let x = 10 - ((y / 44) % 2) * 60; x < w; x += step) {
          const near = Math.hypot(x + 30 - lens.x, y - lens.y) < lens.r
          ctx.fillStyle = near ? accent : fg
          ctx.globalAlpha = near ? 1 : 0.35
          ctx.fillText(text, x, y)
        }
      ctx.globalAlpha = 1
      ctx.restore()
    }
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
      bg = cs.backgroundColor
      accent = cs.getPropertyValue('--accent').trim() || accent
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      scene(1, 0, 0)
      if (lens.r > 1) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
        scene(zoom, lens.x - lens.x * zoom, lens.y - lens.y * zoom)
        // 가장자리 굴절 — 어두운 링 + 하이라이트
        const ring = ctx.createRadialGradient(lens.x, lens.y, lens.r * 0.72, lens.x, lens.y, lens.r)
        ring.addColorStop(0, 'rgba(0,0,0,0)')
        ring.addColorStop(1, 'rgba(0,0,0,0.35)')
        ctx.fillStyle = ring
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2)
        ctx.stroke()
        const hl = ctx.createRadialGradient(lens.x - lens.r * 0.4, lens.y - lens.r * 0.45, 0, lens.x - lens.r * 0.4, lens.y - lens.r * 0.45, lens.r * 0.6)
        hl.addColorStop(0, 'rgba(255,255,255,0.28)')
        hl.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = hl
        ctx.beginPath()
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const loop = () => {
      lens.x += (lens.tx - lens.x) * 0.2
      lens.y += (lens.ty - lens.y) * 0.2
      lens.r += (lens.tr - lens.r) * 0.15
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (lens.r < 1) {
        lens.x = x
        lens.y = y
      }
      lens.tx = x
      lens.ty = y
      lens.tr = 80
    }
    const onLeave = () => {
      lens.tr = 0
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [text, zoom, reduce])
  return (
    <div className={cn('relative h-full w-full cursor-none touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
