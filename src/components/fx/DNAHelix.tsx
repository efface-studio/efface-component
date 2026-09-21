import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountCanvas, themeColors } from './canvasLoop'

export interface DNAHelixProps {
  className?: string
}

const BASES = ['A', 'T', 'G', 'C'] as const
const PAIR: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' }

/**
 * DNA 이중나선 — 두 가닥이 서로 감기며 돌고, 사이를 염기쌍(A–T · G–C)이 잇는다. 3D 투영이라
 * 뒤로 돌아간 가닥은 작고 흐리며, 앞은 크고 선명하다. 포인터의 높이가 회전 속도, 좌우가 기울기.
 */
export function DNAHelix({ className }: DNAHelixProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const seq = Array.from({ length: 40 }, () => BASES[Math.floor(Math.random() * 4)]!)
    let phase = 0
    const view = { tilt: 0.25, tt: 0.25, speed: 1, ts: 1 }
    return mountCanvas(
      c,
      (host) => {
        const col = themeColors(host)
        const baseCol: Record<string, string> = { A: '#3b62e5', T: '#ff9f43', G: '#2ecc71', C: '#ff5d8f' }
        return {
          frame(ctx, dt, t, p, w, h) {
            view.tt = p.inside ? (p.x / w - 0.5) * 0.9 : Math.sin(t * 0.3) * 0.2
            view.ts = p.inside ? 0.4 + (1 - p.y / h) * 2.2 : 1
            view.tilt += (view.tt - view.tilt) * 0.05
            view.speed += (view.ts - view.speed) * 0.05
            if (!reduce) phase += dt * 1.2 * view.speed
            ctx.fillStyle = col.bg
            ctx.fillRect(0, 0, w, h)
            const cx = w / 2
            const R = Math.min(w * 0.22, 120)
            const step = h / 26
            type Node = { x: number; y: number; z: number; strand: 0 | 1; i: number }
            const nodes: Node[] = []
            for (let i = 0; i < 40; i++) {
              const y = (i - 6) * step * 1.1 - ((phase * step * 1.1) % step)
              const a = phase * 0.9 + i * 0.5
              for (const s of [0, 1] as const) {
                const aa = a + s * Math.PI
                const x = Math.cos(aa) * R
                const z = Math.sin(aa) * R
                // 기울기: z 를 y 에 섞는다
                nodes.push({ x, y: y + z * view.tilt, z, strand: s, i })
              }
            }
            // 염기쌍 — 뒤에서 앞 순서로
            const pairs = [...Array(40).keys()].sort((a, b) => Math.sin(phase * 0.9 + a * 0.5) - Math.sin(phase * 0.9 + b * 0.5))
            ctx.lineCap = 'round'
            for (const i of pairs) {
              const a = nodes[i * 2]!
              const b = nodes[i * 2 + 1]!
              const depth = (a.z + b.z) / (2 * R) // -1..1 는 아니고 0 근처 — 쌍은 항상 원 중심을 지난다
              const base = seq[i]!
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
              const fade = 0.55 + 0.45 * Math.cos(phase * 0.9 + i * 0.5)
              ctx.lineWidth = 3
              ctx.globalAlpha = 0.9
              ctx.strokeStyle = baseCol[base]!
              ctx.beginPath()
              ctx.moveTo(cx + a.x, a.y)
              ctx.lineTo(cx + mid.x, mid.y)
              ctx.stroke()
              ctx.strokeStyle = baseCol[PAIR[base]!]!
              ctx.beginPath()
              ctx.moveTo(cx + mid.x, mid.y)
              ctx.lineTo(cx + b.x, b.y)
              ctx.stroke()
              void depth
              void fade
            }
            // 가닥 구슬 — 깊이로 크기·밝기
            const ordered = [...nodes].sort((a, b) => a.z - b.z)
            for (const n of ordered) {
              const k = (n.z / R + 1) / 2 // 0 뒤 · 1 앞
              const r = 4 + k * 5
              ctx.globalAlpha = 0.35 + 0.65 * k
              const g = ctx.createRadialGradient(cx + n.x - r * 0.3, n.y - r * 0.3, 0, cx + n.x, n.y, r)
              g.addColorStop(0, n.strand ? '#ffffff' : col.accent)
              g.addColorStop(1, n.strand ? 'rgba(200,205,220,0.9)' : col.accent)
              ctx.fillStyle = g
              ctx.beginPath()
              ctx.arc(cx + n.x, n.y, r, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.globalAlpha = 1
            // 위아래 페이드
            const fadeG = ctx.createLinearGradient(0, 0, 0, h)
            fadeG.addColorStop(0, col.bg)
            fadeG.addColorStop(0.12, 'rgba(0,0,0,0)')
            fadeG.addColorStop(0.88, 'rgba(0,0,0,0)')
            fadeG.addColorStop(1, col.bg)
            ctx.fillStyle = fadeG
            ctx.fillRect(0, 0, w, h)
          },
        }
      },
      { still: !!reduce },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
