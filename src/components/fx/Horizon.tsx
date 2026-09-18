import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface HorizonProps {
  className?: string
}

/**
 * 지평선 격자(신스웨이브 바닥). 원근 격자가 앞으로 흘러오고, 포인터가 지평선을 좌우로 기울인다.
 * 위엔 해가 떠 있고 격자 선은 액센트로 빛난다.
 */
export function Horizon({ className }: HorizonProps) {
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
    let t = 0
    let accent = '#2563eb'
    const cam = { x: 0, tx: 0 }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      accent = getComputedStyle(host).getPropertyValue('--accent').trim() || accent
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const hy = h * 0.55
      cam.x += (cam.tx - cam.x) * 0.06
      // 해
      const sun = ctx.createLinearGradient(0, hy - 120, 0, hy)
      sun.addColorStop(0, '#ffb35c')
      sun.addColorStop(1, '#ff5c8a')
      ctx.fillStyle = sun
      ctx.beginPath()
      ctx.arc(w / 2 - cam.x * 40, hy - 40, 70, 0, Math.PI * 2)
      ctx.fill()
      // 해에 가로 줄
      ctx.fillStyle = 'rgba(7,9,15,1)'
      for (let i = 0; i < 6; i++) ctx.fillRect(w / 2 - 120, hy - 40 + i * 10 + Math.sin(t * 2 + i) * 2, 240, 2 + i)
      // 바닥
      ctx.fillStyle = '#07090f'
      ctx.fillRect(0, hy, w, h - hy)
      ctx.strokeStyle = accent
      ctx.lineWidth = 1
      // 세로선 — 소실점에서 퍼진다
      const vx = w / 2 - cam.x * 120
      for (let i = -14; i <= 14; i++) {
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(vx, hy)
        ctx.lineTo(w / 2 + i * (w / 10) - cam.x * 60, h)
        ctx.stroke()
      }
      // 가로선 — 앞으로 흘러온다
      for (let i = 0; i < 16; i++) {
        const k = ((i + (t * 0.8) % 1) / 16) ** 2.2
        const y = hy + k * (h - hy)
        ctx.globalAlpha = 0.25 + k * 0.7
        ctx.lineWidth = 0.6 + k * 1.6
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      // 지평선 빛
      const glow = ctx.createLinearGradient(0, hy - 30, 0, hy + 30)
      glow.addColorStop(0, 'rgba(255,92,138,0)')
      glow.addColorStop(0.5, 'rgba(255,92,138,0.45)')
      glow.addColorStop(1, 'rgba(255,92,138,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, hy - 30, w, 60)
    }
    const loop = () => {
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      cam.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
    }
    const onLeave = () => {
      cam.tx = 0
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
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[linear-gradient(180deg,#1a1033_0%,#3b1a5c_55%,#07090f_55%)]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
