import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PhysicsBallsProps {
  labels: string[]
  className?: string
}

interface Ball {
  x: number
  y: number
  px: number
  py: number
  r: number
  label: string
  accent: boolean
  held: boolean
}

/**
 * 태그들이 공이 되어 떨어지고 서로 부딪히며 쌓인다(베를레 물리). 잡아서 던질 수 있고,
 * 누르면 전부 튀어 오른다. 벽은 컨테이너.
 */
export function PhysicsBalls({ labels, className }: PhysicsBallsProps) {
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
    let bg = '#fff'
    let accent = '#2563eb'
    let line = '#ddd'
    const balls: Ball[] = []
    let held: Ball | null = null
    let pointer = { x: 0, y: 0, px: 0, py: 0 }

    const font = () => `500 13px 'Pretendard Variable', Pretendard, system-ui, sans-serif`
    const build = () => {
      balls.length = 0
      ctx.font = font()
      labels.forEach((label, i) => {
        const tw = ctx.measureText(label).width
        const r = Math.max(22, tw / 2 + 14)
        balls.push({ x: 40 + ((i * 97) % Math.max(1, w - 80)), y: -r - i * 30, px: 0, py: 0, r, label, accent: i % 4 === 0, held: false })
      })
      for (const b of balls) {
        b.px = b.x
        b.py = b.y
      }
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
      line = cs.getPropertyValue('--line').trim() || line
      if (!balls.length) build()
    }
    const step = () => {
      const g = 0.35
      for (const b of balls) {
        if (b.held) {
          b.px = b.x - (pointer.x - pointer.px)
          b.py = b.y - (pointer.y - pointer.py)
          b.x = pointer.x
          b.y = pointer.y
          continue
        }
        const vx = (b.x - b.px) * 0.995
        const vy = (b.y - b.py) * 0.995 + g
        b.px = b.x
        b.py = b.y
        b.x += vx
        b.y += vy
        // 벽
        if (b.x - b.r < 0) {
          b.x = b.r
          b.px = b.x + vx * 0.5
        }
        if (b.x + b.r > w) {
          b.x = w - b.r
          b.px = b.x + vx * 0.5
        }
        if (b.y + b.r > h) {
          b.y = h - b.r
          b.py = b.y + vy * 0.45
        }
      }
      // 충돌
      for (let k = 0; k < 3; k++) {
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const a = balls[i]
            const b = balls[j]
            if (!a || !b) continue
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.sqrt(dx * dx + dy * dy) || 0.001
            const min = a.r + b.r
            if (d < min) {
              const nx = dx / d
              const ny = dy / d
              const push = (min - d) / 2
              if (!a.held) {
                a.x -= nx * push
                a.y -= ny * push
              }
              if (!b.held) {
                b.x += nx * push
                b.y += ny * push
              }
            }
          }
        }
      }
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.font = font()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const b of balls) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.accent ? accent : bg
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = b.accent ? accent : line
        ctx.stroke()
        ctx.fillStyle = b.accent ? '#fff' : fg
        ctx.fillText(b.label, b.x, b.y)
      }
    }
    const loop = () => {
      step()
      draw()
      pointer.px = pointer.x
      pointer.py = pointer.y
      raf = requestAnimationFrame(loop)
    }
    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e: PointerEvent) => {
      const p = at(e)
      pointer = { x: p.x, y: p.y, px: p.x, py: p.y }
      held = balls.find((b) => (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < b.r * b.r) ?? null
      if (held) held.held = true
      else for (const b of balls) b.py = b.y + 8 + Math.random() * 10 // 빈 곳을 누르면 전부 튀어오른다
    }
    const onMove = (e: PointerEvent) => {
      const p = at(e)
      pointer.x = p.x
      pointer.y = p.y
    }
    const onUp = () => {
      if (held) held.held = false
      held = null
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 240; i++) step()
      draw()
    } else raf = requestAnimationFrame(loop)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    host.addEventListener('pointerleave', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointerleave', onUp)
    }
  }, [labels, reduce])
  return (
    <div className={cn('relative h-full w-full cursor-grab touch-none select-none bg-surface active:cursor-grabbing', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
