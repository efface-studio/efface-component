import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { cssColorToRgb } from '@/lib/color'

export interface InterferenceProps {
  className?: string
}

/**
 * 파동 간섭. 두 파원에서 퍼지는 동심원이 겹쳐 보강·상쇄 무늬를 만든다 — 한 파원은 포인터.
 * 누르면 파원이 하나 늘어난다(최대 4). 저해상도 ImageData 로 계산.
 */
export function Interference({ className }: InterferenceProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const S = 3
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let t = 0
    let img: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    const sources: { x: number; y: number }[] = []
    let pointer: { x: number; y: number } | null = null
    let accent: [number, number, number] = [59, 98, 229]
    let bg: [number, number, number] = [11, 12, 16]
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
      const cs = getComputedStyle(host)
      accent = cssColorToRgb(cs.getPropertyValue('--accent').trim() || '#3b62e5')
      bg = cssColorToRgb(cs.backgroundColor)
      if (!sources.length) sources.push({ x: 0.32, y: 0.5 }, { x: 0.68, y: 0.5 })
    }
    const draw = () => {
      if (!img || !off) return
      const d = img.data
      const all = sources.map((s) => ({ x: s.x * lw, y: s.y * lh }))
      if (pointer) all[all.length - 1] = { x: pointer.x / S, y: pointer.y / S }
      const k = 0.35
      for (let y = 0; y < lh; y++)
        for (let x = 0; x < lw; x++) {
          let v = 0
          for (const s of all) {
            const dx = x - s.x
            const dy = y - s.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            v += Math.sin(dist * k - t * 4) / (1 + dist * 0.012)
          }
          v /= all.length
          const a = Math.max(0, v) // 마루만 밝게
          const m = v * v // 보강 간섭 자리
          const i = (y * lw + x) * 4
          d[i] = bg[0] + (accent[0] - bg[0]) * a + 120 * m * a
          d[i + 1] = bg[1] + (accent[1] - bg[1]) * a + 120 * m * a
          d[i + 2] = bg[2] + (accent[2] - bg[2]) * a + 160 * m * a
          d[i + 3] = 255
        }
      off.getContext('2d')?.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
      // 파원 표시
      for (const s of all) {
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(s.x * S, s.y * S, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const loop = () => {
      t += 0.016
      // 포인터 없을 땐 두 번째 파원이 천천히 떠다닌다
      if (!pointer) {
        const last = sources[sources.length - 1]!
        last.x = 0.68 + Math.sin(t * 0.5) * 0.14
        last.y = 0.5 + Math.cos(t * 0.7) * 0.2
      }
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (sources.length >= 4) sources.splice(0, 1)
      sources.splice(sources.length - 1, 0, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
