import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PlasmaProps {
  className?: string
}

/**
 * 플라스마(데모신 고전). 사인파 여러 겹을 합쳐 색을 흘려보낸다 — 저해상도로 계산해 확대.
 * 포인터가 파동의 중심을 끌고, 누르면 팔레트가 바뀐다.
 */
export function Plasma({ className }: PlasmaProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const S = 4
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let t = 0
    let pal = 0
    let img: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    const c = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const PALETTES: [number, number, number][] = [
      [0, 2.1, 4.2],
      [1.0, 3.5, 5.6],
      [2.5, 0.8, 4.0],
    ]
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lw = Math.ceil(w / S)
      lh = Math.ceil(h / S)
      off = document.createElement('canvas')
      off.width = lw
      off.height = lh
      img = off.getContext('2d')?.createImageData(lw, lh) ?? null
    }
    const draw = () => {
      if (!img || !off) return
      c.x += (c.tx - c.x) * 0.05
      c.y += (c.ty - c.y) * 0.05
      const d = img.data
      const ph = PALETTES[pal % PALETTES.length]!
      const cx = c.x * lw
      const cy = c.y * lh
      for (let y = 0; y < lh; y++)
        for (let x = 0; x < lw; x++) {
          const v =
            Math.sin(x * 0.09 + t) + Math.sin((y * 0.11 + t * 0.7)) + Math.sin((x + y) * 0.06 + t * 0.5) + Math.sin(Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) * 0.12 - t * 1.6)
          const u = v * 0.8
          const i = (y * lw + x) * 4
          d[i] = 128 + 127 * Math.sin(u + ph[0])
          d[i + 1] = 128 + 127 * Math.sin(u + ph[1])
          d[i + 2] = 128 + 127 * Math.sin(u + ph[2])
          d[i + 3] = 255
        }
      off.getContext('2d')?.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
    }
    const loop = () => {
      t += 0.03
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      c.tx = (e.clientX - r.left) / r.width
      c.ty = (e.clientY - r.top) / r.height
    }
    const onDown = () => {
      pal++
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
