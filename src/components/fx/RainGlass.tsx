import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { mountCanvas, rand } from './canvasLoop'

export interface RainGlassProps {
  className?: string
}

type Drop = { x: number; y: number; r: number; vy: number; wob: number; life: number }

/**
 * 비 내리는 유리창 — 흐린 도시 불빛 앞 유리에 빗방울이 맺힌다. 큰 방울은 무게로 흘러내리며 길을 남기고,
 * 길 위의 작은 방울을 삼켜 커진다. 방울 안엔 뒤 풍경이 거꾸로 굴절돼 비친다. 누르면 그 자리에 물이 튄다.
 */
export function RainGlass({ className }: RainGlassProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const coarse = isCoarsePointer()
    let scene: HTMLCanvasElement | null = null
    let sceneSharp: HTMLCanvasElement | null = null
    let trails: HTMLCanvasElement | null = null
    let mask: HTMLCanvasElement | null = null
    const drops: Drop[] = []
    const small: Drop[] = []
    const paintScene = (w: number, h: number) => {
      // 뒤 풍경 — 밤 도시 창불(보케). 선명본과 흐린본 두 장
      const mk = () => {
        const cv = document.createElement('canvas')
        cv.width = w
        cv.height = h
        return cv
      }
      sceneSharp = mk()
      const s = sceneSharp.getContext('2d')!
      const g = s.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#0a1020')
      g.addColorStop(1, '#1b1428')
      s.fillStyle = g
      s.fillRect(0, 0, w, h)
      let seed = 7
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
      for (let i = 0; i < 90; i++) {
        const x = rnd() * w
        const y = rnd() * h
        const r = 3 + rnd() * 9
        const hue = rnd() < 0.6 ? 35 + rnd() * 20 : rnd() < 0.5 ? 200 + rnd() * 30 : 330
        s.fillStyle = `hsl(${hue} 90% ${60 + rnd() * 25}%)`
        s.globalAlpha = 0.5 + rnd() * 0.5
        s.beginPath()
        s.arc(x, y, r, 0, Math.PI * 2)
        s.fill()
      }
      s.globalAlpha = 1
      scene = mk()
      const b = scene.getContext('2d')!
      b.filter = 'blur(9px)'
      b.drawImage(sceneSharp, 0, 0)
      b.filter = 'none'
      trails = mk()
      mask = mk()
    }
    return mountCanvas(
      c,
      () => ({
        init(w, h) {
          paintScene(w, h)
          drops.length = 0
          small.length = 0
          for (let i = 0; i < (coarse ? 70 : 160); i++) small.push({ x: rand(0, w), y: rand(0, h), r: rand(1, 3.2), vy: 0, wob: rand(0, 6), life: 1 })
        },
        down(x, y) {
          for (let i = 0; i < 12; i++) small.push({ x: x + rand(-30, 30), y: y + rand(-30, 30), r: rand(1.5, 4), vy: 0, wob: rand(0, 6), life: 1 })
        },
        frame(ctx, dt, t, _p, w, h) {
          if (!scene || !sceneSharp || !trails || !mask) return
          const tctx = trails.getContext('2d')!
          // 자국은 서서히 마른다
          tctx.globalCompositeOperation = 'destination-out'
          tctx.fillStyle = 'rgba(0,0,0,0.02)'
          tctx.fillRect(0, 0, w, h)
          tctx.globalCompositeOperation = 'source-over'
          if (!reduce && Math.random() < 0.06 * dt * 60 && drops.length < 12) drops.push({ x: rand(0, w), y: -10, r: rand(4, 8), vy: 0, wob: rand(0, 6), life: 1 })
          const k = dt * 60
          for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i]!
            d.vy += 0.03 * d.r * k
            d.vy = Math.min(d.vy, 2.2 + d.r * 0.25)
            // 멈칫멈칫 — 표면 장력
            if (Math.random() < 0.05) d.vy *= 0.3
            d.y += d.vy * k
            d.x += Math.sin(t * 3 + d.wob) * 0.25 * k
            // 길 남기기
            tctx.fillStyle = 'rgba(255,255,255,0.9)'
            tctx.beginPath()
            tctx.arc(d.x, d.y, d.r * 0.55, 0, Math.PI * 2)
            tctx.fill()
            // 작은 방울 삼키기
            for (let j = small.length - 1; j >= 0; j--) {
              const s = small[j]!
              if (Math.abs(s.x - d.x) < d.r + s.r && Math.abs(s.y - d.y) < d.r * 1.4) {
                d.r = Math.min(12, Math.sqrt(d.r * d.r + s.r * s.r * 0.6))
                small.splice(j, 1)
              }
            }
            if (d.y > h + 20) drops.splice(i, 1)
          }
          if (!reduce && small.length < (coarse ? 70 : 160) && Math.random() < 0.4) small.push({ x: rand(0, w), y: rand(0, h), r: rand(0.8, 2.5), vy: 0, wob: 0, life: 0 })
          // 배경(흐림) → 자국 있는 곳은 선명(닦인 유리)
          ctx.drawImage(scene, 0, 0)
          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          // 자국 마스크로 선명본을 얹는다(마스크 캔버스는 재사용)
          const mctx = mask.getContext('2d')!
          mctx.globalCompositeOperation = 'source-over'
          mctx.clearRect(0, 0, w, h)
          mctx.drawImage(sceneSharp, 0, 0)
          mctx.globalCompositeOperation = 'destination-in'
          mctx.drawImage(trails, 0, 0)
          ctx.drawImage(mask, 0, 0)
          ctx.restore()
          // 방울 — 안에 뒤 풍경이 거꾸로·작게 비친다(굴절), 가장자리 하이라이트
          const drawDrop = (d: Drop, alpha: number) => {
            if (d.life < 1) d.life = Math.min(1, d.life + 0.05 * k)
            const r = d.r * d.life
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.beginPath()
            ctx.ellipse(d.x, d.y, r, r * 1.15, 0, 0, Math.PI * 2)
            ctx.clip()
            ctx.translate(d.x, d.y)
            ctx.scale(1.35, -1.35)
            ctx.drawImage(sceneSharp!, -d.x, -d.y)
            ctx.restore()
            ctx.globalAlpha = alpha
            const g = ctx.createRadialGradient(d.x - r * 0.35, d.y - r * 0.45, 0, d.x, d.y, r)
            g.addColorStop(0, 'rgba(255,255,255,0.55)')
            g.addColorStop(0.5, 'rgba(255,255,255,0.05)')
            g.addColorStop(1, 'rgba(120,140,170,0.35)')
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.ellipse(d.x, d.y, r, r * 1.15, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
          }
          for (const s of small) drawDrop(s, 0.85)
          for (const d of drops) drawDrop(d, 1)
        },
      }),
      { still: !!reduce, dpr: 1 },
    )
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0a1020]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
