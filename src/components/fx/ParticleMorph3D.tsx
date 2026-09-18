import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ParticleMorph3DProps {
  /** 점 개수 */
  count?: number
  /** 모양이 바뀌는 간격(ms) */
  every?: number
  className?: string
}

type Shape = (i: number, n: number) => [number, number, number]

const R = 1.6
const SHAPES: { name: string; fn: Shape }[] = [
  {
    // 구 — 피보나치 나선
    name: 'sphere',
    fn: (i, n) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
      const th = Math.PI * (1 + Math.sqrt(5)) * i
      return [R * Math.cos(th) * Math.sin(phi), R * Math.sin(th) * Math.sin(phi), R * Math.cos(phi)]
    },
  },
  {
    // efface 마크 — 두 둥근 사각 판(앞뒤로 어긋나게)
    name: 'logo',
    fn: (i, n) => {
      const half = i < n / 2
      const j = half ? i : i - n / 2
      const m = n / 2
      const side = Math.ceil(Math.sqrt(m))
      const u = (j % side) / side - 0.5
      const v = Math.floor(j / side) / side - 0.5
      const s = 1.7
      // 둥근 모서리 — 사각 밖 모서리는 안쪽으로 당긴다
      const cx = Math.max(0, Math.abs(u) - 0.32)
      const cy = Math.max(0, Math.abs(v) - 0.32)
      const k = Math.sqrt(cx * cx + cy * cy)
      const uu = k > 0.18 ? u * (0.18 / k) * 1 + (u > 0 ? 0.32 * (1 - 0.18 / k) : -0.32 * (1 - 0.18 / k)) : u
      const vv = k > 0.18 ? v * (0.18 / k) * 1 + (v > 0 ? 0.32 * (1 - 0.18 / k) : -0.32 * (1 - 0.18 / k)) : v
      const off = half ? -0.55 : 0.55
      return [uu * s + off, vv * s - off, half ? 0.25 : -0.25]
    },
  },
  {
    // 토러스
    name: 'torus',
    fn: (i, n) => {
      const a = (i / n) * Math.PI * 2 * 37
      const b = (i / n) * Math.PI * 2
      const r1 = 1.25
      const r2 = 0.5
      return [(r1 + r2 * Math.cos(a)) * Math.cos(b), (r1 + r2 * Math.cos(a)) * Math.sin(b), r2 * Math.sin(a)]
    },
  },
  {
    // 나선 은하
    name: 'galaxy',
    fn: (i, n) => {
      const t = i / n
      const arm = i % 3
      const a = t * Math.PI * 6 + (arm * Math.PI * 2) / 3
      const r = 0.2 + t * 1.9
      const jitter = ((i * 7919) % 100) / 100 - 0.5
      return [Math.cos(a) * r + jitter * 0.25, Math.sin(a) * r + jitter * 0.25, jitter * 0.3]
    },
  },
]

/**
 * 수천 개의 점이 구 → efface 마크 → 토러스 → 은하로 형태를 바꾼다(three.js Points).
 * 포인터를 따라 천천히 돌고, 누르면 다음 모양으로 넘어간다.
 */
export function ParticleMorph3D({ count = 6000, every = 3800, className }: ParticleMorph3DProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const host = canvas.parentElement ?? canvas
    let dispose = () => {}
    let cancelled = false
    void import('three').then((THREE) => {
      if (cancelled) return
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.z = 6

      const from = new Float32Array(count * 3)
      const to = new Float32Array(count * 3)
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const cs = getComputedStyle(host)
      const fg = new THREE.Color(cs.color)
      const accent = new THREE.Color(cs.getPropertyValue('--accent').trim() || '#2563eb')
      const fill = (arr: Float32Array, shape: Shape) => {
        for (let i = 0; i < count; i++) {
          const [x, y, z] = shape(i, count)
          arr[i * 3] = x
          arr[i * 3 + 1] = y
          arr[i * 3 + 2] = z
        }
      }
      let si = 0
      fill(from, SHAPES[0]?.fn ?? SHAPES[0]!.fn)
      fill(to, SHAPES[0]?.fn ?? SHAPES[0]!.fn)
      pos.set(from)
      for (let i = 0; i < count; i++) {
        const c = i % 9 === 0 ? accent : fg
        col[i * 3] = c.r
        col[i * 3 + 1] = c.g
        col[i * 3 + 2] = c.b
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const mat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })
      const points = new THREE.Points(geo, mat)
      scene.add(points)

      let morphT = 1
      const next = () => {
        si = (si + 1) % SHAPES.length
        from.set(pos)
        fill(to, SHAPES[si]!.fn)
        morphT = 0
      }
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
      let raf = 0
      let t = 0
      const ease = (x: number) => 1 - Math.pow(1 - x, 4)
      const tick = () => {
        t += 0.016
        if (morphT < 1) {
          morphT = Math.min(1, morphT + 0.012)
          const e = ease(morphT)
          for (let i = 0; i < count * 3; i++) {
            const f = from[i] ?? 0
            const g = to[i] ?? 0
            // 점마다 조금씩 다른 타이밍 — 앞줄부터 흘러가듯
            const d = ((i / 3) % 97) / 97
            const k = Math.min(1, Math.max(0, (e - d * 0.25) / 0.75))
            pos[i] = f + (g - f) * k
          }
          ;(geo.attributes.position as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true
        }
        tilt.x += (tilt.tx - tilt.x) * 0.05
        tilt.y += (tilt.ty - tilt.y) * 0.05
        points.rotation.y = t * 0.25 + tilt.x * 0.8
        points.rotation.x = Math.sin(t * 0.3) * 0.2 + tilt.y * 0.5
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }
      const resize = () => {
        const r = host.getBoundingClientRect()
        renderer.setSize(r.width, r.height, false)
        camera.aspect = r.width / r.height
        camera.updateProjectionMatrix()
      }
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect()
        tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
        tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      }
      const onLeave = () => {
        tilt.tx = 0
        tilt.ty = 0
      }
      const ro = new ResizeObserver(resize)
      ro.observe(host)
      resize()
      if (reduce) {
        fill(pos, SHAPES[1]!.fn)
        ;(geo.attributes.position as InstanceType<typeof THREE.BufferAttribute>).needsUpdate = true
        renderer.render(scene, camera)
      } else raf = requestAnimationFrame(tick)
      const iv = reduce ? 0 : window.setInterval(next, every)
      host.addEventListener('pointermove', onMove)
      host.addEventListener('pointerleave', onLeave)
      host.addEventListener('pointerdown', next)
      dispose = () => {
        cancelAnimationFrame(raf)
        window.clearInterval(iv)
        ro.disconnect()
        host.removeEventListener('pointermove', onMove)
        host.removeEventListener('pointerleave', onLeave)
        host.removeEventListener('pointerdown', next)
        geo.dispose()
        mat.dispose()
        renderer.dispose()
      }
    })
    return () => {
      cancelled = true
      dispose()
    }
  }, [count, every, reduce])

  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block h-full w-full" aria-hidden />
    </div>
  )
}
