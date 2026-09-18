import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface HalftoneProps {
  src: string
  /** 점 간격(px) */
  cell?: number
  className?: string
}

/**
 * 이미지를 하프톤 점으로 그린다. 포인터가 빛이 되어 가까운 점은 커지고 색이 들며,
 * 손을 떼면 잉크 점으로 돌아간다. 인쇄물 느낌의 로고 표현.
 */
export function Halftone({ src, cell = 9, className }: HalftoneProps) {
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
    let dots: { x: number; y: number; v: number; sat: number }[] = []
    let pointer = { x: -9999, y: -9999 }
    let t = 0
    const sample = (img: HTMLImageElement) => {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const c = off.getContext('2d')
      if (!c) return
      const s = Math.min((w * 0.72) / img.width, (h * 0.72) / img.height)
      const dw = img.width * s
      const dh = img.height * s
      c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      const d = c.getImageData(0, 0, w, h).data
      dots = []
      for (let y = cell / 2; y < h; y += cell)
        for (let x = cell / 2; x < w; x += cell) {
          const i = (Math.floor(y) * w + Math.floor(x)) * 4
          const a = (d[i + 3] ?? 0) / 255
          if (a < 0.1) continue
          const r = d[i] ?? 0
          const g = d[i + 1] ?? 0
          const b = d[i + 2] ?? 0
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
          const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255
          dots.push({ x, y, v: a * (0.35 + lum * 0.65), sat })
        }
    }
    let img: HTMLImageElement | null = null
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
      if (img) sample(img)
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const R = 150
      for (const p of dots) {
        const dx = p.x - pointer.x
        const dy = p.y - pointer.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const light = d < R ? (1 - d / R) ** 1.5 : 0
        const breathe = 0.9 + 0.1 * Math.sin(t * 2 + p.x * 0.02 + p.y * 0.03)
        const r = (cell * 0.5) * p.v * breathe * (1 + light * 0.9)
        ctx.fillStyle = p.sat > 0.15 || light > 0.3 ? accent : fg
        ctx.globalAlpha = 0.85 + light * 0.15
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.min(r, cell * 0.75), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    const loop = () => {
      t += 1 / 60
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 }
    }
    const im = new Image()
    im.onload = () => {
      img = im
      sample(im)
      draw()
    }
    im.src = src
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
  }, [src, cell, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
