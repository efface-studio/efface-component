import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface LifeProps {
  cell?: number
  className?: string
}

/**
 * 생명 게임(콘웨이). 셀들이 규칙 넷으로 태어나고 죽는다. 포인터로 셀을 그려 넣고, 누르면 글라이더 총을 심는다.
 * 새로 태어난 셀은 액센트, 오래된 셀은 흐려진다.
 */
export function Life({ cell = 6, className }: LifeProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let cols = 0
    let rows = 0
    let grid = new Uint8Array(0)
    let age = new Uint8Array(0)
    let raf = 0
    let frame = 0
    let fg = '#000'
    let accent = '#2563eb'
    const seed = () => {
      for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.12 ? 1 : 0
    }
    const resize = () => {
      const r = host.getBoundingClientRect()
      cols = Math.max(1, Math.floor(r.width / cell))
      rows = Math.max(1, Math.floor(r.height / cell))
      canvas.width = cols * cell
      canvas.height = rows * cell
      canvas.style.width = `${cols * cell}px`
      canvas.style.height = `${rows * cell}px`
      grid = new Uint8Array(cols * rows)
      age = new Uint8Array(cols * rows)
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      seed()
    }
    const step = () => {
      const next = new Uint8Array(cols * rows)
      let alive = 0
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          let n = 0
          for (let j = -1; j <= 1; j++)
            for (let i = -1; i <= 1; i++) {
              if (!i && !j) continue
              const xx = (x + i + cols) % cols
              const yy = (y + j + rows) % rows
              n += grid[yy * cols + xx]!
            }
          const k = y * cols + x
          const v = grid[k]!
          const nv = v ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0
          next[k] = nv
          age[k] = nv ? Math.min(255, (v ? age[k]! : 0) + 1) : 0
          alive += nv
        }
      grid = next
      if (alive < cols * rows * 0.02) seed()
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const k = y * cols + x
          if (!grid[k]) continue
          const a = age[k]!
          ctx.fillStyle = a < 3 ? accent : fg
          ctx.globalAlpha = a < 3 ? 1 : Math.max(0.25, 1 - a / 40)
          ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1)
        }
      ctx.globalAlpha = 1
    }
    const loop = () => {
      frame++
      if (frame % 6 === 0) step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    const paint = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = ((e.clientX - r.left) / cell) | 0
      const y = ((e.clientY - r.top) / cell) | 0
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const xx = x + i
          const yy = y + j
          if (xx >= 0 && yy >= 0 && xx < cols && yy < rows && Math.random() < 0.6) grid[yy * cols + xx] = 1
        }
    }
    const gun = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = ((e.clientX - r.left) / cell) | 0
      const y = ((e.clientY - r.top) / cell) | 0
      // 글라이더 총 (Gosper)
      const G: [number, number][] = [[24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2], [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3], [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4], [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5], [10, 6], [16, 6], [24, 6], [11, 7], [15, 7], [12, 8], [13, 8]]
      for (const [i, j] of G) {
        const xx = x - 18 + i
        const yy = y - 4 + j
        if (xx >= 0 && yy >= 0 && xx < cols && yy < rows) grid[yy * cols + xx] = 1
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', paint)
    host.addEventListener('pointerdown', gun)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', paint)
      host.removeEventListener('pointerdown', gun)
    }
  }, [cell, reduce])
  return (
    <div className={cn('relative flex h-full w-full items-center justify-center touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
