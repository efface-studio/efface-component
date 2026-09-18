import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { hexToRgb01 } from '@/lib/color'
import { MANDELBROT_PLANETS } from './mandelbrot.planets'

export interface MandelbrotProps {
  /** 유휴 상태에서 행성들을 차례로 비행한다 */
  auto?: boolean
  className?: string
}

const VERT = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`

/* 섭동: 기준 궤도 Z_n(중심점, JS double 로 계산해 텍스처로) 에 대한 픽셀 편차 d 만 float 로 돈다.
   d 는 zoom 배율로 나눈 값이라 항상 O(1) — 확대가 1e-13 까지 가도 float32 로 충분하다. */
const FRAG = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 uv; out vec4 frag;
uniform sampler2D refTex; uniform int refLen; uniform int iters; uniform float zoom; uniform vec2 res; uniform float t; uniform vec3 accent;
vec3 palette(float k){
  // 깊은 우주 — 남색 → 보라 → 청록 → 흰빛
  vec3 a = vec3(0.04, 0.05, 0.12), b = vec3(0.45, 0.35, 0.6), c = vec3(1.0, 0.9, 0.8), d = vec3(0.10, 0.28, 0.55);
  return a + b * cos(6.28318 * (c * k + d));
}
void main(){
  vec2 q = uv; q.x *= res.x/res.y;
  vec2 d0 = q, d = vec2(0.), z = vec2(0.);
  float n = -1.;
  for (int i = 0; i < 2000; i++) {
    if (i >= iters) break;
    if (i + 1 >= refLen) { n = float(i); break; } // 기준 궤도가 먼저 탈출 — 근처 픽셀도 같이 탈출한 것으로
    vec2 Z = texelFetch(refTex, ivec2(i, 0), 0).xy;
    d = 2.0 * vec2(Z.x*d.x - Z.y*d.y, Z.x*d.y + Z.y*d.x) + zoom * vec2(d.x*d.x - d.y*d.y, 2.0*d.x*d.y) + d0;
    vec2 Z1 = texelFetch(refTex, ivec2(i + 1, 0), 0).xy;
    z = Z1 + zoom * d;
    if (dot(z, z) > 256.0) { n = float(i + 1); break; }
  }
  if (n < 0.) { frag = vec4(0.01, 0.012, 0.02, 1.); return; }
  float sn = n - log2(log2(dot(z, z))) + 4.0;
  float k = sqrt(sn) * 0.09 + t * 0.02;
  vec3 col = palette(k);
  col = mix(col, accent, 0.18 * (0.5 + 0.5 * sin(sn * 0.3)));
  // 가장자리 쪽(탈출 늦음)을 살짝 밝게 — 성운 느낌
  col *= 0.75 + 0.35 * smoothstep(0., 60., sn);
  frag = vec4(col, 1.);
}`

/* WebGL1 폴백 — 순수 float, 1e-5 까지만 */
const VERT1 = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`
const FRAG1 = `precision highp float; varying vec2 uv; uniform vec2 res; uniform vec2 center; uniform float zoom; uniform int iters; uniform float t; uniform vec3 accent;
vec3 palette(float k){ vec3 a = vec3(0.04, 0.05, 0.12), b = vec3(0.45, 0.35, 0.6), c = vec3(1.0, 0.9, 0.8), d = vec3(0.10, 0.28, 0.55); return a + b * cos(6.28318 * (c * k + d)); }
void main(){ vec2 q = uv; q.x *= res.x/res.y; vec2 c = center + q * zoom; vec2 z = vec2(0.); float n = -1.;
  for (int i = 0; i < 600; i++) { if (i >= iters) break; z = vec2(z.x*z.x - z.y*z.y, 2.*z.x*z.y) + c; if (dot(z,z) > 256.) { n = float(i); break; } }
  if (n < 0.) { gl_FragColor = vec4(0.01, 0.012, 0.02, 1.); return; }
  float sn = n - log2(log2(dot(z,z))) + 4.; vec3 col = palette(sqrt(sn) * 0.09 + t * 0.02); col = mix(col, accent, 0.18); gl_FragColor = vec4(col * (0.75 + 0.35 * smoothstep(0., 60., sn)), 1.); }`

const ZOOM_MIN = 1e-13 // JS double 로 중심을 들 수 있는 한계 근처
const ZOOM_MAX = 2.5

interface View {
  x: number
  y: number
  zoom: number
}


/**
 * 만델브로트 우주. 끌어서 이동, 휠·핀치·더블클릭으로 확대, 화살표·+/- 키. 행성 칩을 누르면 그곳으로 비행한다.
 * 섭동(perturbation) 렌더링이라 float 한계(1e-5)를 넘어 1e-13 까지 들어간다. 가만히 두면 행성들을 차례로 돈다.
 */
export function Mandelbrot({ auto = true, className }: MandelbrotProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [readout, setReadout] = useState({ x: -0.6, y: 0, zoom: 1.35, planet: 'home' })
  const [deep, setDeep] = useState(true)
  const api = useRef<{ flyTo: (v: View, planet?: string) => void; reset: () => void; zoomBy: (f: number) => void } | null>(null)
  const autoRef = useRef(auto)
  useEffect(() => {
    autoRef.current = auto
  }, [auto])

  useEffect(() => {
    const canvas = ref.current
    const el = host.current
    if (!canvas || !el) return
    const attrs = { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: false }
    const gl2 = canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null
    const gl = (gl2 ?? (canvas.getContext('webgl', attrs) as WebGLRenderingContext | null)) as WebGLRenderingContext | WebGL2RenderingContext | null
    if (!gl) return
    if (gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.restoreContext()
    const isDeep = !!gl2
    setDeep(isDeep)
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) throw new Error('shader')
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[Mandelbrot]', gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, isDeep ? VERT : VERT1))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, isDeep ? FRAG : FRAG1))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(prog, n)

    // 기준 궤도 텍스처 (RG32F, 폭 = 최대 반복)
    const MAX_IT = 2000
    let refTex: WebGLTexture | null = null
    let refBuf = new Float32Array(MAX_IT * 2)
    if (gl2) {
      refTex = gl2.createTexture()
      gl2.bindTexture(gl2.TEXTURE_2D, refTex)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.NEAREST)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.NEAREST)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE)
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RG32F, MAX_IT, 1, 0, gl2.RG, gl2.FLOAT, null)
    }
    /** 중심점의 궤도를 double 로 계산 — 탈출하면 그 길이까지만 */
    const referenceOrbit = (cx: number, cy: number, iters: number): number => {
      let zx = 0
      let zy = 0
      let n = 0
      for (; n < iters; n++) {
        refBuf[n * 2] = zx
        refBuf[n * 2 + 1] = zy
        const nx = zx * zx - zy * zy + cx
        const ny = 2 * zx * zy + cy
        zx = nx
        zy = ny
        if (zx * zx + zy * zy > 1e6) {
          n++
          break
        }
      }
      return n
    }

    const view: View = { x: -0.6, y: 0, zoom: 1.35 }
    let planet = 'home'
    let accent: [number, number, number] = [0.23, 0.38, 0.9]
    let raf = 0
    let t = 0
    let lastReadout = 0
    let lastInput = performance.now()
    let flight: { from: View; to: View; start: number; dur: number; planet?: string } | null = null
    let tourIdx = 0
    let dwellUntil = 0
    const dirty = { v: true }

    const resize = () => {
      const r = el.getBoundingClientRect()
      const dpr = Math.min(1, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      accent = hexToRgb01(getComputedStyle(el).getPropertyValue('--accent').trim() || '#3b62e5')
      dirty.v = true
    }
    const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(isDeep ? ZOOM_MIN : 1e-5, z))
    const itersFor = (z: number) => Math.min(isDeep ? 1500 : 600, Math.round(120 + 110 * Math.log10(1.6 / z)))

    const draw = () => {
      const iters = itersFor(view.zoom)
      gl.uniform2f(U('res'), canvas.width, canvas.height)
      gl.uniform1f(U('zoom'), view.zoom)
      gl.uniform1i(U('iters'), iters)
      gl.uniform1f(U('t'), t)
      gl.uniform3f(U('accent'), ...accent)
      if (gl2 && refTex) {
        const len = referenceOrbit(view.x, view.y, Math.min(MAX_IT, iters + 2))
        gl2.activeTexture(gl2.TEXTURE0)
        gl2.bindTexture(gl2.TEXTURE_2D, refTex)
        gl2.texSubImage2D(gl2.TEXTURE_2D, 0, 0, 0, MAX_IT, 1, gl2.RG, gl2.FLOAT, refBuf)
        gl2.uniform1i(U('refTex'), 0)
        gl2.uniform1i(U('refLen'), len)
      } else {
        gl.uniform2f(U('center'), view.x, view.y)
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const ease = (u: number) => 1 - Math.pow(1 - u, 3)
    const startFlight = (to: View, name?: string, dur?: number) => {
      const ratio = Math.abs(Math.log10(view.zoom / to.zoom))
      flight = { from: { ...view }, to, start: performance.now(), dur: dur ?? Math.min(9000, 1400 + ratio * 900), planet: name }
    }
    const stepFlight = (now: number) => {
      if (!flight) return false
      const u = Math.min(1, (now - flight.start) / flight.dur)
      const e = ease(u)
      // 확대는 로그 공간에서, 중심은 확대 진행에 맞춰 — 멀리서 다가가는 느낌
      const lz0 = Math.log(flight.from.zoom)
      const lz1 = Math.log(flight.to.zoom)
      view.zoom = Math.exp(lz0 + (lz1 - lz0) * e)
      const k = lz1 < lz0 ? (view.zoom - flight.from.zoom) / (flight.to.zoom - flight.from.zoom) : e // 줌인이면 줌에 비례
      const kk = Math.min(1, Math.max(0, lz1 < lz0 ? 1 - (Math.log(view.zoom) - lz1) / (lz0 - lz1) : k))
      view.x = flight.from.x + (flight.to.x - flight.from.x) * kk
      view.y = flight.from.y + (flight.to.y - flight.from.y) * kk
      if (u >= 1) {
        view.x = flight.to.x
        view.y = flight.to.y
        view.zoom = flight.to.zoom
        if (flight.planet) planet = flight.planet
        flight = null
        dwellUntil = now + 3200
      }
      dirty.v = true
      return true
    }

    const loop = (now: number) => {
      t += 0.016
      const flying = stepFlight(now)
      // 유휴 투어 — 입력이 10초 없고, 자동 재생이 켜져 있으면 다음 행성으로
      if (!flying && autoRef.current && !reduce && now - lastInput > 10000 && now > dwellUntil) {
        tourIdx = (tourIdx + 1) % MANDELBROT_PLANETS.length
        const p = MANDELBROT_PLANETS[tourIdx]!
        startFlight({ x: p.x, y: p.y, zoom: p.zoom }, p.id)
      }
      // 색이 천천히 흐르므로 매 프레임 그리되, 정지 상태에선 4프레임에 한 번
      if (dirty.v || Math.floor(t * 60) % 4 === 0) {
        draw()
        dirty.v = false
      }
      if (now - lastReadout > 150) {
        lastReadout = now
        setReadout({ x: view.x, y: view.y, zoom: view.zoom, planet })
      }
      raf = requestAnimationFrame(loop)
    }

    // ── 입력 ──
    const local = (e: PointerEvent | WheelEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      return { px: e.clientX - r.left, py: e.clientY - r.top, w: r.width, h: r.height }
    }
    /** 화면 좌표 → 복소 평면 */
    const toC = (px: number, py: number, w: number, h: number) => ({ x: view.x + ((px / w) * 2 - 1) * (w / h) * view.zoom, y: view.y - ((py / h) * 2 - 1) * view.zoom })
    const interact = () => {
      lastInput = performance.now()
      flight = null
      planet = ''
      dirty.v = true
    }
    const zoomAt = (px: number, py: number, w: number, h: number, factor: number) => {
      const c = toC(px, py, w, h)
      const nz = clampZoom(view.zoom * factor)
      const f = nz / view.zoom
      view.x = c.x + (view.x - c.x) * f
      view.y = c.y + (view.y - c.y) * f
      view.zoom = nz
      interact()
    }
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch: { d: number; zoom: number; cx: number; cy: number } | null = null
    // 칩·버튼(data-ef-ignore) 위에서 시작한 입력은 캔버스 조작이 아니다 — React 의 stopPropagation 은 이 네이티브 리스너보다 늦다
    const onControl = (e: Event) => e.target instanceof Element && !!e.target.closest('[data-ef-ignore]')
    const onDown = (e: PointerEvent) => {
      if (!e.isTrusted || onControl(e)) return
      el.setPointerCapture?.(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y), zoom: view.zoom, cx: (a!.x + b!.x) / 2, cy: (a!.y + b!.y) / 2 }
      }
      interact()
    }
    const onMove = (e: PointerEvent) => {
      if (!e.isTrusted) return
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const { w, h } = local(e)
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a!.x - b!.x, a!.y - b!.y)
        const r = canvas.getBoundingClientRect()
        const mx = (a!.x + b!.x) / 2 - r.left
        const my = (a!.y + b!.y) / 2 - r.top
        const target = clampZoom(pinch.zoom * (pinch.d / Math.max(1, d)))
        zoomAt(mx, my, w, h, target / view.zoom)
        // 중점 이동만큼 팬
        view.x -= ((mx - (pinch.cx - r.left)) / h) * 2 * view.zoom
        view.y += ((my - (pinch.cy - r.top)) / h) * 2 * view.zoom
        pinch.cx = a!.x + (b!.x - a!.x) / 2
        pinch.cy = a!.y + (b!.y - a!.y) / 2
        return
      }
      if (pointers.size === 1) {
        view.x -= ((e.clientX - prev.x) / h) * 2 * view.zoom
        view.y += ((e.clientY - prev.y) / h) * 2 * view.zoom
        interact()
      }
    }
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinch = null
    }
    const onWheel = (e: WheelEvent) => {
      if (!e.isTrusted || onControl(e)) return
      e.preventDefault()
      const { px, py, w, h } = local(e)
      zoomAt(px, py, w, h, Math.exp(e.deltaY * 0.0022))
    }
    const onDbl = (e: MouseEvent) => {
      if (!e.isTrusted || onControl(e)) return
      const { px, py, w, h } = local(e)
      const c = toC(px, py, w, h)
      startFlight({ x: c.x, y: c.y, zoom: clampZoom(view.zoom * 0.15) }, undefined, 1200)
      lastInput = performance.now()
    }
    const onKey = (e: KeyboardEvent) => {
      const step = view.zoom * 0.12
      if (e.key === 'ArrowLeft') view.x -= step
      else if (e.key === 'ArrowRight') view.x += step
      else if (e.key === 'ArrowUp') view.y += step
      else if (e.key === 'ArrowDown') view.y -= step
      else if (e.key === '+' || e.key === '=') view.zoom = clampZoom(view.zoom * 0.8)
      else if (e.key === '-' || e.key === '_') view.zoom = clampZoom(view.zoom * 1.25)
      else if (e.key === '0') startFlight({ x: -0.6, y: 0, zoom: 1.35 }, 'home')
      else return
      e.preventDefault()
      interact()
    }

    api.current = {
      flyTo: (v, name) => {
        lastInput = performance.now()
        startFlight(v, name)
      },
      reset: () => {
        lastInput = performance.now()
        startFlight({ x: -0.6, y: 0, zoom: 1.35 }, 'home')
      },
      zoomBy: (f) => {
        const r = canvas.getBoundingClientRect()
        zoomAt(r.width / 2, r.height / 2, r.width, r.height, f)
      },
    }

    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    if (reduce) {
      draw()
      setReadout({ x: view.x, y: view.y, zoom: view.zoom, planet })
    } else raf = requestAnimationFrame(loop)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('dblclick', onDbl)
    el.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      api.current = null
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerleave', onUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('dblclick', onDbl)
      el.removeEventListener('keydown', onKey)
      if (refTex && gl2) gl2.deleteTexture(refTex)
      gl.deleteProgram(prog)
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
    }
  }, [reduce])

  const mag = 1.35 / readout.zoom
  const magLabel = mag < 1000 ? `${mag.toFixed(1)}×` : `${mag.toExponential(1).replace('e+', 'e')}×`
  return (
    <div ref={host} tabIndex={0} aria-label="만델브로트 우주 — 끌어서 이동, 휠로 확대, 화살표·+/- 키" className={cn('group/mb relative h-full w-full cursor-grab touch-none overflow-hidden bg-[#03040a] outline-none select-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing', className)}>
      <canvas ref={ref} className="block" aria-hidden />
      {/* 행성 칩 */}
      <div data-ef-ignore className="absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onPointerDown={(e) => e.stopPropagation()}>
        {MANDELBROT_PLANETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => api.current?.flyTo({ x: p.x, y: p.y, zoom: p.zoom }, p.id)}
            aria-pressed={readout.planet === p.id}
            className={cn('shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10.5px] backdrop-blur-sm transition-colors', readout.planet === p.id ? 'border-accent bg-accent text-white' : 'border-white/15 bg-black/40 text-white/80 hover:border-white/40 hover:text-white')}
          >
            {p.name}
          </button>
        ))}
      </div>
      {/* 좌표 · 배율 · 조작 */}
      <div data-ef-ignore className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-2 font-mono text-[10.5px] text-white/70">
        <div className="rounded-md bg-black/40 px-2 py-1 backdrop-blur-sm">
          <div>
            {readout.x.toFixed(Math.min(14, Math.max(4, Math.ceil(-Math.log10(readout.zoom)) + 3)))} {readout.y >= 0 ? '+' : '−'} {Math.abs(readout.y).toFixed(Math.min(14, Math.max(4, Math.ceil(-Math.log10(readout.zoom)) + 3)))}i
          </div>
          <div className="text-white/50">
            {magLabel} {!deep && '· 이 브라우저는 1e5× 까지'} {deep && readout.zoom <= ZOOM_MIN * 1.01 && '· 정밀도 한계'}
          </div>
        </div>
        <div className="pointer-events-auto flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => api.current?.zoomBy(0.5)} aria-label="확대" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            +
          </button>
          <button type="button" onClick={() => api.current?.zoomBy(2)} aria-label="축소" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            −
          </button>
          <button type="button" onClick={() => api.current?.reset()} aria-label="처음으로" className="h-8 rounded-md border border-white/15 bg-black/40 px-2.5 text-white/80 backdrop-blur-sm hover:text-white">
            처음으로
          </button>
        </div>
      </div>
    </div>
  )
}
