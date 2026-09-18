import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { SOLAR_BODIES, SOLAR_STOPS, type SolarBody } from './solar.bodies'

export interface SolarSystemProps {
  /** 가만히 두면 행성들을 차례로 찾아간다 */
  auto?: boolean
  className?: string
}

type Three = typeof import('three')
type Stop = (typeof SOLAR_STOPS)[number]

interface Api {
  flyTo: (id: Stop) => void
  zoomBy: (f: number) => void
  reset: () => void
}

const TEX = '/space/'
/** 시뮬레이션 시간 — 1초에 며칠. 지구가 한 바퀴 도는 데 약 90초 */
const DAYS_PER_SEC = 4
const IDLE_MS = 7000
const TOUR_MS = 9000

/* 대기 — 뒷면(후광)과 앞면(림 안개)을 같은 셰이더로. 햇빛 방향 쪽이 더 밝다 */
const ATMO_VERT = `varying vec3 vN; varying vec3 vP;
void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`
const ATMO_FRAG = `uniform vec3 color; uniform vec3 sunDir; uniform float strength; uniform float back;
varying vec3 vN; varying vec3 vP;
void main(){
  vec3 V = normalize(-vP);
  float d = dot(vN, V);
  // 뒷면: 실루엣(=0)에서 밖으로 갈수록 옅어진다 · 앞면: 가장자리로 갈수록 짙어진다
  float rim = back > 0.5 ? pow(clamp(abs(d) / 0.34, 0.0, 1.0), 1.6) : pow(1.0 - max(d, 0.0), 3.2);
  float lit = clamp(dot(vN, sunDir) * 0.7 + 0.45, 0.0, 1.0);
  gl_FragColor = vec4(color, rim * strength * lit);
}`

function glowTexture(THREE: Three, inner: string, outer: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, inner)
  grad.addColorStop(0.25, outer)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * 태양계 — three.js. 실제 텍스처(NASA · Solar System Scope)로 태양·행성·달·토성 고리를 그린다.
 *  - 지구: 낮 지도 + 밤 불빛(어두운 쪽에만) + 법선(지형) + 바다 반사 + 구름 층 + 대기 산란 후광
 *  - 끌어서 궤도 회전, 휠·핀치로 거리, 더블클릭/칩으로 천체에 비행(따라간다), 화살표·+/- 키
 *  - auto 면 가만히 있을 때 행성을 차례로 찾아가고, 화면 밖이면 그리지 않는다
 */
export function SolarSystem({ auto = true, className }: SolarSystemProps) {
  const host = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<Api | null>(null)
  const autoRef = useRef(auto)
  const reduce = useReducedMotion()
  const [stop, setStop] = useState<Stop>('overview')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    autoRef.current = auto
  })

  useEffect(() => {
    const el = host.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    const coarse = isCoarsePointer()
    let disposed = false
    let cleanup = () => {}

    void import('three').then((THREE) => {
      if (disposed) return
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(coarse ? 1 : 1.5, window.devicePixelRatio || 1))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#02030a')
      const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 400)
      const aniso = Math.min(coarse ? 2 : 8, renderer.capabilities.getMaxAnisotropy())
      const SEG = coarse ? [40, 28] : [72, 48]
      const loader = new THREE.TextureLoader()
      const textures: import('three').Texture[] = []
      const load = (file: string, srgb = true) =>
        loader.loadAsync(TEX + file).then((t) => {
          if (disposed) {
            t.dispose()
            throw new Error('disposed')
          }
          if (srgb) t.colorSpace = THREE.SRGBColorSpace
          t.anisotropy = aniso
          textures.push(t)
          return t
        })
      const quiet = () => {}

      // ── 빛: 태양(점광원) + 아주 약한 환경광(밤 쪽이 완전히 검지 않게)
      const sunLight = new THREE.PointLight(0xfff1d6, 2.6, 0, 0)
      scene.add(sunLight)
      scene.add(new THREE.AmbientLight(0x223052, 0.35))

      // ── 별 배경: 은하수(등장방형) + 점 별
      const starGeo = new THREE.BufferGeometry()
      const starN = coarse ? 900 : 2200
      const sp = new Float32Array(starN * 3)
      for (let i = 0; i < starN; i++) {
        const u = Math.random() * 2 - 1
        const th = Math.random() * Math.PI * 2
        const r = 170 + Math.random() * 60
        const s = Math.sqrt(1 - u * u)
        sp[i * 3] = r * s * Math.cos(th)
        sp[i * 3 + 1] = r * u
        sp[i * 3 + 2] = r * s * Math.sin(th)
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
      const starMat = new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false })
      scene.add(new THREE.Points(starGeo, starMat))
      load('milkyway.jpg')
        .then((t) => {
          t.mapping = THREE.EquirectangularReflectionMapping
          scene.background = t
          scene.backgroundIntensity = 0.5
          scene.backgroundRotation = new THREE.Euler(0, 0, 0.42)
        })
        .catch(quiet)

      // ── 천체
      const sunDir = new THREE.Vector3(0, 0, 1)
      type Node = { body: SolarBody; pivot: import('three').Object3D; mesh: import('three').Mesh; spin: number; extras: import('three').Object3D[] }
      const nodes = new Map<string, Node>()
      const geos: import('three').BufferGeometry[] = []
      const mats: import('three').Material[] = []
      const meshes: import('three').Mesh[] = []

      for (const body of SOLAR_BODIES) {
        const geo = new THREE.SphereGeometry(body.r, SEG[0]!, SEG[1]!)
        geos.push(geo)
        const isSun = body.id === 'sun'
        const mat = isSun ? new THREE.MeshBasicMaterial({ color: body.color }) : new THREE.MeshStandardMaterial({ color: body.color, roughness: 1, metalness: 0 })
        mats.push(mat)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.rotation.z = THREE.MathUtils.degToRad(body.tilt)
        mesh.userData.id = body.id
        meshes.push(mesh)
        const pivot = new THREE.Object3D()
        pivot.add(mesh)
        // 시작 위치 — 행성마다 다른 각도에서
        pivot.userData.angle = (SOLAR_BODIES.indexOf(body) * 2.4) % (Math.PI * 2)
        const parent = body.parent ? nodes.get(body.parent)?.mesh : scene
        ;(parent ?? scene).add(pivot)
        // 자전 — 지구 기준 약 50초에 한 바퀴(실제 비율은 너무 빨라 보인다). 역행은 음수
        const spin = THREE.MathUtils.clamp((0.125 * 24) / Math.abs(body.day), 0.008, 0.4) * Math.sign(body.day)
        const node: Node = { body, pivot, mesh, spin, extras: [] }
        nodes.set(body.id, node)

        load(body.tex)
          .then((t) => {
            if (isSun) (mat as import('three').MeshBasicMaterial).map = t
            else (mat as import('three').MeshStandardMaterial).map = t
            mat.color.set('#ffffff')
            mat.needsUpdate = true
            if (body.id === 'earth') setReady(true)
          })
          .catch(quiet)

        if (isSun) {
          // 광구 후광 — 두 겹의 가산 스프라이트
          const glow = glowTexture(THREE, 'rgba(255,236,190,1)', 'rgba(255,150,60,0.55)')
          textures.push(glow)
          for (const [scale, op] of [
            [body.r * 5.2, 0.55],
            [body.r * 2.6, 0.9],
          ] as const) {
            const sm = new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })
            mats.push(sm)
            const sprite = new THREE.Sprite(sm)
            sprite.scale.setScalar(scale)
            mesh.add(sprite)
            node.extras.push(sprite)
          }
        }

        if (body.id === 'earth') {
          const em = mat as import('three').MeshStandardMaterial
          // 밤 불빛은 어두운 쪽에만 · 바다는 매끈하게(반사맵의 밝은 곳 = 낮은 거칠기)
          em.emissive = new THREE.Color('#ffd9a0')
          em.emissiveIntensity = 1.6
          em.normalScale = new THREE.Vector2(0.55, 0.55)
          em.onBeforeCompile = (shader) => {
            shader.uniforms.sunDir = { value: sunDir }
            shader.vertexShader = `varying vec3 vWN;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWN = normalize(mat3(modelMatrix) * normal);')
            shader.fragmentShader = `varying vec3 vWN; uniform vec3 sunDir;\n${shader.fragmentShader}`
              .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat ndl = dot(normalize(vWN), sunDir); totalEmissiveRadiance *= smoothstep(0.12, -0.18, ndl);')
              .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\nroughnessFactor *= 1.0 - texture2D(roughnessMap, vRoughnessMapUv).g * 0.82;\n#endif')
          }
          Promise.all([load('earth-night.jpg'), load('earth-normal.jpg', false), load('earth-spec.jpg', false)])
            .then(([night, normal, spec]) => {
              em.emissiveMap = night
              em.normalMap = normal
              em.roughnessMap = spec
              em.needsUpdate = true
            })
            .catch(quiet)
          // 구름 — 조금 큰 구, 알파로만. 지구보다 살짝 빨리 돈다
          const cg = new THREE.SphereGeometry(body.r * 1.014, SEG[0]!, SEG[1]!)
          geos.push(cg)
          const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, roughness: 1 })
          mats.push(cm)
          const clouds = new THREE.Mesh(cg, cm)
          mesh.add(clouds)
          node.extras.push(clouds)
          load('earth-clouds.jpg', false)
            .then((t) => {
              cm.alphaMap = t
              cm.opacity = 0.9
              cm.needsUpdate = true
            })
            .catch(quiet)
          // 대기 — 뒷면 후광 + 앞면 림
          for (const [scale, back, strength] of [
            [1.075, 1, 0.95],
            [1.0, 0, 0.55],
          ] as const) {
            const ag = new THREE.SphereGeometry(body.r * scale, SEG[0]!, SEG[1]!)
            geos.push(ag)
            const am = new THREE.ShaderMaterial({
              vertexShader: ATMO_VERT,
              fragmentShader: ATMO_FRAG,
              uniforms: { color: { value: new THREE.Color('#6fb4ff') }, sunDir: { value: new THREE.Vector3() }, strength: { value: strength }, back: { value: back } },
              transparent: true,
              depthWrite: false,
              side: back ? THREE.BackSide : THREE.FrontSide,
              blending: THREE.AdditiveBlending,
            })
            mats.push(am)
            const atmo = new THREE.Mesh(ag, am)
            mesh.add(atmo)
            node.extras.push(atmo)
          }
        }

        if (body.ring) {
          const { inner, outer, tex } = body.ring
          const rg = new THREE.RingGeometry(body.r * inner, body.r * outer, 160, 1)
          // 고리 텍스처는 안쪽→바깥쪽 한 줄: UV 를 반지름 방향으로 다시 편다
          const pos = rg.attributes.position!
          const uv = rg.attributes.uv!
          for (let i = 0; i < pos.count; i++) {
            const rr = Math.hypot(pos.getX(i), pos.getY(i))
            uv.setXY(i, (rr - body.r * inner) / (body.r * (outer - inner)), 0.5)
          }
          geos.push(rg)
          const rm = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, roughness: 0.9, metalness: 0, depthWrite: false })
          mats.push(rm)
          const ring = new THREE.Mesh(rg, rm)
          ring.rotation.x = -Math.PI / 2
          mesh.add(ring)
          node.extras.push(ring)
          load(tex)
            .then((t) => {
              rm.map = t
              rm.opacity = 1
              rm.needsUpdate = true
            })
            .catch(quiet)
        }

        if (body.orbit > 0 && !body.parent) {
          // 궤도선
          const n = 256
          const op = new Float32Array(n * 3)
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2
            op[i * 3] = Math.cos(a) * body.orbit
            op[i * 3 + 2] = Math.sin(a) * body.orbit
          }
          const og = new THREE.BufferGeometry()
          og.setAttribute('position', new THREE.BufferAttribute(op, 3))
          geos.push(og)
          const om = new THREE.LineBasicMaterial({ color: 0x8fa6ff, transparent: true, opacity: 0.16 })
          mats.push(om)
          scene.add(new THREE.LineLoop(og, om))
        }
      }

      // ── 카메라: 목표 주위 궤도(yaw·pitch·dist). 따라가는 천체가 있으면 목표가 매 프레임 그 위치
      const cam = { yaw: 0.9, pitch: 0.42, dist: 62, target: new THREE.Vector3() }
      const goal = { yaw: 0.9, pitch: 0.42, dist: 62, target: new THREE.Vector3() }
      let follow: Node | null = null
      const tmp = new THREE.Vector3()
      const distFor = (b: SolarBody) => (b.id === 'sun' ? b.r * 4.2 : Math.max(b.r * 4.6, 1.4))
      let lastInteraction = performance.now()
      let lastTour = performance.now()
      let tourIdx = 0
      const stops = SOLAR_STOPS

      const flyTo = (id: Stop, byUser = true) => {
        if (byUser) lastInteraction = performance.now()
        setStop(id)
        if (id === 'overview') {
          follow = null
          goal.target.set(0, 0, 0)
          goal.dist = 62
          goal.pitch = 0.42
          return
        }
        const node = nodes.get(id)
        if (!node) return
        follow = node
        goal.dist = distFor(node.body)
        goal.pitch = 0.22
        goal.yaw = cam.yaw + 0.9
      }
      const zoomBy = (f: number) => {
        lastInteraction = performance.now()
        goal.dist = THREE.MathUtils.clamp(goal.dist * f, follow ? follow.body.r * 1.6 : 1.2, 140)
      }
      api.current = { flyTo, zoomBy, reset: () => flyTo('overview') }

      // ── 입력
      const pointers = new Map<number, { x: number; y: number }>()
      let pinch = 0
      let dragged = false
      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const pick = (x: number, y: number) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        const hit = raycaster.intersectObjects(meshes, false)[0]
        return hit ? (hit.object.userData.id as Stop) : null
      }
      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest('[data-ef-ignore]')) return
        lastInteraction = performance.now()
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        dragged = false
        el.setPointerCapture(e.pointerId)
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          pinch = Math.hypot(a!.x - b!.x, a!.y - b!.y)
        }
      }
      const onMove = (e: PointerEvent) => {
        const p = pointers.get(e.pointerId)
        if (!p) return
        lastInteraction = performance.now()
        if (pointers.size === 2) {
          p.x = e.clientX
          p.y = e.clientY
          const [a, b] = [...pointers.values()]
          const d = Math.hypot(a!.x - b!.x, a!.y - b!.y)
          if (pinch > 0) zoomBy(pinch / d)
          pinch = d
          return
        }
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true
        goal.yaw -= dx * 0.006
        goal.pitch = THREE.MathUtils.clamp(goal.pitch + dy * 0.005, -1.35, 1.35)
        p.x = e.clientX
        p.y = e.clientY
      }
      const onUp = (e: PointerEvent) => {
        pointers.delete(e.pointerId)
        pinch = 0
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      }
      const onWheel = (e: WheelEvent) => {
        if ((e.target as HTMLElement).closest('[data-ef-ignore]')) return
        e.preventDefault()
        zoomBy(Math.exp(e.deltaY * 0.0012))
      }
      const onDbl = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-ef-ignore]')) return
        const id = pick(e.clientX, e.clientY)
        if (id) flyTo(id)
      }
      const onClick = (e: MouseEvent) => {
        if (dragged || (e.target as HTMLElement).closest('[data-ef-ignore]')) return
        const id = pick(e.clientX, e.clientY)
        if (id) flyTo(id)
      }
      const onKey = (e: KeyboardEvent) => {
        const k = e.key
        if (k === 'ArrowLeft') goal.yaw -= 0.18
        else if (k === 'ArrowRight') goal.yaw += 0.18
        else if (k === 'ArrowUp') goal.pitch = Math.min(1.35, goal.pitch + 0.12)
        else if (k === 'ArrowDown') goal.pitch = Math.max(-1.35, goal.pitch - 0.12)
        else if (k === '+' || k === '=') zoomBy(0.7)
        else if (k === '-' || k === '_') zoomBy(1 / 0.7)
        else if (k === '0') flyTo('overview')
        else if (/^[1-9]$/.test(k)) {
          const id = stops[Number(k)]
          if (id) flyTo(id)
        } else return
        e.preventDefault()
        lastInteraction = performance.now()
      }
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointercancel', onUp)
      el.addEventListener('wheel', onWheel, { passive: false })
      el.addEventListener('dblclick', onDbl)
      el.addEventListener('click', onClick)
      el.addEventListener('keydown', onKey)

      // ── 크기 · 가시성
      const resize = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(el)
      let visible = true
      const io = new IntersectionObserver(([en]) => {
        visible = !!en?.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      })
      io.observe(el)

      // ── 루프
      let raf = 0
      let last = performance.now()
      const tick = (now: number) => {
        raf = 0
        if (disposed) return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const days = reduce ? 0 : dt * DAYS_PER_SEC

        // 공전·자전
        for (const node of nodes.values()) {
          const { body, pivot, mesh } = node
          if (body.orbit > 0) {
            pivot.userData.angle += (days / body.period) * Math.PI * 2
            const a = pivot.userData.angle as number
            mesh.position.set(Math.cos(a) * body.orbit, 0, Math.sin(a) * body.orbit)
            if (body.parent) mesh.position.y = Math.sin(a) * body.orbit * 0.09 // 달 궤도 경사
          }
          if (!reduce) mesh.rotation.y += node.spin * dt
          for (const ex of node.extras) if ((ex as import('three').Mesh).material && !(ex instanceof THREE.Sprite)) ex.rotation.y += node.spin * dt * 0.18
        }
        // 지구 셰이더용 햇빛 방향(월드 → 카메라 공간은 셰이더 uniform 각각)
        const earth = nodes.get('earth')
        if (earth) {
          earth.mesh.getWorldPosition(tmp)
          sunDir.copy(tmp).multiplyScalar(-1).normalize()
          for (const ex of earth.extras) {
            const m = (ex as import('three').Mesh).material as import('three').ShaderMaterial | undefined
            if (m?.uniforms?.sunDir) (m.uniforms.sunDir.value as import('three').Vector3).copy(sunDir).transformDirection(camera.matrixWorldInverse)
          }
        }

        // 유휴 투어
        if (autoRef.current && !reduce && now - lastInteraction > IDLE_MS && now - lastTour > TOUR_MS) {
          lastTour = now
          tourIdx = (tourIdx + 1) % stops.length
          flyTo(stops[tourIdx]!, false)
        }
        if (follow && now - lastInteraction > 1500) goal.yaw += 0.07 * dt // 천체를 천천히 한 바퀴

        // 카메라 부드럽게
        if (follow) follow.mesh.getWorldPosition(goal.target)
        cam.target.lerp(goal.target, 1 - Math.pow(0.0025, dt))
        const k = 1 - Math.pow(0.012, dt)
        cam.yaw += (goal.yaw - cam.yaw) * k
        cam.pitch += (goal.pitch - cam.pitch) * k
        cam.dist += (goal.dist - cam.dist) * k
        camera.position.set(cam.target.x + Math.cos(cam.pitch) * Math.sin(cam.yaw) * cam.dist, cam.target.y + Math.sin(cam.pitch) * cam.dist, cam.target.z + Math.cos(cam.pitch) * Math.cos(cam.yaw) * cam.dist)
        camera.lookAt(cam.target)

        renderer.render(scene, camera)
        if (visible) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(raf)
        raf = 0
        ro.disconnect()
        io.disconnect()
        api.current = null
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
        el.removeEventListener('pointercancel', onUp)
        el.removeEventListener('wheel', onWheel)
        el.removeEventListener('dblclick', onDbl)
        el.removeEventListener('click', onClick)
        el.removeEventListener('keydown', onKey)
        geos.forEach((g) => g.dispose())
        starGeo.dispose()
        mats.forEach((m) => m.dispose())
        starMat.dispose()
        textures.forEach((t) => t.dispose())
        renderer.dispose()
        window.setTimeout(() => {
          if (!canvas.isConnected) renderer.forceContextLoss()
        }, 0)
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [reduce])

  const body = stop === 'overview' ? null : SOLAR_BODIES.find((b) => b.id === stop)

  return (
    <div ref={host} tabIndex={0} aria-label="태양계 — 끌어서 돌리고, 휠로 다가가고, 행성을 누르면 날아가요. 화살표·+/-·숫자 키" className={cn('group/ss relative h-full w-full cursor-grab touch-none overflow-hidden bg-[#02030a] outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-inset active:cursor-grabbing', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
      {!ready && <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[11px] text-white/40">행성 불러오는 중…</div>}
      {/* 천체 칩 */}
      <div data-ef-ignore className="absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onPointerDown={(e) => e.stopPropagation()}>
        {SOLAR_STOPS.map((id) => {
          const b = SOLAR_BODIES.find((x) => x.id === id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => api.current?.flyTo(id)}
              aria-pressed={stop === id}
              className={cn('shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10.5px] backdrop-blur-sm transition-colors', stop === id ? 'border-accent bg-accent text-white' : 'border-white/15 bg-black/40 text-white/75 hover:border-white/40 hover:text-white')}
            >
              {b ? b.name : '전체'}
            </button>
          )
        })}
      </div>
      {/* 사실 카드 · 조작 */}
      <div data-ef-ignore className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-2 text-white/75">
        <div className="max-w-[min(100%,300px)] rounded-md bg-black/45 px-2.5 py-2 backdrop-blur-sm">
          {body ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-semibold text-white">{body.name}</span>
                <span className="font-mono text-[10px] tracking-wider text-white/45 uppercase">{body.en}</span>
              </div>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[10.5px]">
                {[
                  [body.id === 'moon' ? '거리' : '태양까지', body.facts.dist],
                  ['지름', body.facts.diameter],
                  ['하루', body.facts.day],
                  ['1년', body.facts.year],
                  [body.id === 'sun' ? '행성' : '위성', body.facts.moons],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="text-white/85">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-1 text-[10.5px] text-white/55">{body.facts.note}</p>
            </>
          ) : (
            <>
              <div className="text-[13px] font-semibold text-white">태양계</div>
              <p className="mt-0.5 font-mono text-[10.5px] text-white/55">1초 = {DAYS_PER_SEC}일 · 크기·거리는 보기 좋게 압축 · 자전축·방향·순서는 실제</p>
            </>
          )}
        </div>
        <div className="pointer-events-auto flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => api.current?.zoomBy(0.7)} aria-label="다가가기" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            +
          </button>
          <button type="button" onClick={() => api.current?.zoomBy(1 / 0.7)} aria-label="물러나기" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            −
          </button>
          <button type="button" onClick={() => api.current?.reset()} aria-label="전체 보기" className="h-8 rounded-md border border-white/15 bg-black/40 px-2.5 text-white/80 backdrop-blur-sm hover:text-white">
            전체
          </button>
        </div>
      </div>
    </div>
  )
}
