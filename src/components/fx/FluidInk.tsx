import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'

export interface FluidInkProps {
  /** 잉크 색 후보 — 기본은 앱 카드 토큰 */
  colors?: string[]
  className?: string
}

/* ── GLSL ─────────────────────────────────────────────────────
   Stam 의 안정 유체(Stable Fluids)를 WebGL 로 — 이류(advect) → 발산 → 압력(야코비) → 기울기 빼기.
   포인터가 움직이면 속도와 잉크를 그 자리에 뿌린다(splat). */
const VERT = `
attribute vec2 p; varying vec2 uv; varying vec2 L, R, T, B; uniform vec2 texel;
void main(){ uv = p*0.5+0.5; L = uv - vec2(texel.x,0.); R = uv + vec2(texel.x,0.); T = uv + vec2(0.,texel.y); B = uv - vec2(0.,texel.y); gl_Position = vec4(p,0.,1.); }`
const SPLAT = `
precision highp float; varying vec2 uv; uniform sampler2D target; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){ vec2 d = uv - point; d.x *= aspect; vec3 splat = exp(-dot(d,d)/radius) * color; vec3 base = texture2D(target, uv).xyz; gl_FragColor = vec4(base + splat, 1.); }`
const ADVECT = `
precision highp float; varying vec2 uv; uniform sampler2D velocity; uniform sampler2D source; uniform vec2 texel; uniform float dt; uniform float dissipation;
void main(){ vec2 coord = uv - dt * texture2D(velocity, uv).xy * texel; gl_FragColor = dissipation * texture2D(source, coord); gl_FragColor.a = 1.; }`
const DIVERGENCE = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D velocity;
void main(){ float l = texture2D(velocity,L).x, r = texture2D(velocity,R).x, t = texture2D(velocity,T).y, b = texture2D(velocity,B).y; vec2 c = texture2D(velocity,uv).xy;
 if (L.x < 0.) l = -c.x; if (R.x > 1.) r = -c.x; if (T.y > 1.) t = -c.y; if (B.y < 0.) b = -c.y; gl_FragColor = vec4(0.5*(r-l+t-b),0.,0.,1.); }`
const PRESSURE = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D pressure; uniform sampler2D divergence;
void main(){ float l = texture2D(pressure,L).x, r = texture2D(pressure,R).x, t = texture2D(pressure,T).x, b = texture2D(pressure,B).x; float d = texture2D(divergence,uv).x; gl_FragColor = vec4((l+r+b+t-d)*0.25,0.,0.,1.); }`
const GRADIENT = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D pressure; uniform sampler2D velocity;
void main(){ float l = texture2D(pressure,L).x, r = texture2D(pressure,R).x, t = texture2D(pressure,T).x, b = texture2D(pressure,B).x; vec2 v = texture2D(velocity,uv).xy; v -= vec2(r-l, t-b); gl_FragColor = vec4(v,0.,1.); }`
const DISPLAY = `
precision highp float; varying vec2 uv; uniform sampler2D dye; uniform vec3 bg;
void main(){ vec3 c = texture2D(dye, uv).rgb; float a = clamp(max(c.r, max(c.g, c.b)), 0., 1.); gl_FragColor = vec4(mix(bg, c, a), 1.); }`
const CLEAR = `precision mediump float; varying vec2 uv; uniform sampler2D target; uniform float value; void main(){ gl_FragColor = value * texture2D(target, uv); }`

interface FBO {
  fb: WebGLFramebuffer
  tex: WebGLTexture
  w: number
  h: number
  texel: [number, number]
}
interface DoubleFBO {
  read: FBO
  write: FBO
  swap: () => void
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * 잉크 유체. 포인터를 끌면 색 잉크가 소용돌이치며 번지고 서서히 옅어진다.
 * GPU 에서 도는 안정 유체 시뮬레이션(WebGL) — half-float 를 못 쓰는 기기면 조용히 빈 캔버스.
 */
const DEFAULT_COLORS = ['#2563eb', '#14b8b0', '#7c3aed', '#f59e0b', '#3b62e5']

export function FluidInk({ colors = DEFAULT_COLORS, className }: FluidInkProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduce) return
    const host = canvas.parentElement ?? canvas
    const attrs = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
    // WebGL2 면 half-float 렌더 타깃이 기본에 가깝다(Safari 포함). 아니면 WebGL1 + 확장.
    const gl2 = canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null
    const gl = (gl2 ?? canvas.getContext('webgl', attrs)) as WebGLRenderingContext | null
    if (!gl) return
    if (gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.restoreContext()
    let HALF: number
    let INTERNAL: number
    if (gl2) {
      gl2.getExtension('EXT_color_buffer_half_float')
      gl2.getExtension('EXT_color_buffer_float')
      HALF = gl2.HALF_FLOAT
      INTERNAL = gl2.RGBA16F
    } else {
      const half = gl.getExtension('OES_texture_half_float')
      const linear = gl.getExtension('OES_texture_half_float_linear')
      if (!half || !linear) {
        host.dataset.fluidUnsupported = '1'
        return
      }
      HALF = half.HALF_FLOAT_OES
      INTERNAL = gl.RGBA
    }
    const palette = colors.map(hexToRgb)

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)
      if (!sh) throw new Error('shader')
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('[FluidInk] shader', gl.getShaderInfoLog(sh))
      return sh
    }
    const vert = compile(gl.VERTEX_SHADER, VERT)
    const program = (frag: string) => {
      const p = gl.createProgram()
      if (!p) throw new Error('program')
      gl.attachShader(p, vert)
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag))
      gl.linkProgram(p)
      const uniforms: Record<string, WebGLUniformLocation | null> = Object.create(null) as Record<string, WebGLUniformLocation | null>
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i)
        if (info) uniforms[info.name] = gl.getUniformLocation(p, info.name)
      }
      return { p, u: (name: string) => uniforms[name] ?? null }
    }
    const P = { splat: program(SPLAT), advect: program(ADVECT), div: program(DIVERGENCE), pressure: program(PRESSURE), grad: program(GRADIENT), display: program(DISPLAY), clear: program(CLEAR) }

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const idx = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    const fbo = (w: number, h: number): FBO => {
      const tex = gl.createTexture()
      const fb = gl.createFramebuffer()
      if (!tex || !fb) throw new Error('fbo')
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, INTERNAL, w, h, 0, gl.RGBA, HALF, null)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete')
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { fb, tex, w, h, texel: [1 / w, 1 / h] }
    }
    const dfbo = (w: number, h: number): DoubleFBO => {
      const d = { read: fbo(w, h), write: fbo(w, h), swap() {} }
      d.swap = () => {
        const t = d.read
        d.read = d.write
        d.write = t
      }
      return d
    }
    const bind = (f: FBO, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, f.tex)
      return unit
    }
    const blit = (target: FBO | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb)
        gl.viewport(0, 0, target.w, target.h)
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    let velocity: DoubleFBO
    let dye: DoubleFBO
    let divergence: FBO
    let pressure: DoubleFBO
    let simW = 0
    let simH = 0
    let dyeW = 0
    let dyeH = 0
    let bg: [number, number, number] = [0, 0, 0]

    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      const aspect = canvas.width / canvas.height
      const coarse = isCoarsePointer()
      const sim = coarse ? 80 : 112
      const dyeRes = coarse ? 256 : 384
      simW = aspect > 1 ? Math.round(sim * aspect) : sim
      simH = aspect > 1 ? sim : Math.round(sim / aspect)
      dyeW = aspect > 1 ? Math.round(dyeRes * aspect) : dyeRes
      dyeH = aspect > 1 ? dyeRes : Math.round(dyeRes / aspect)
      try {
        velocity = dfbo(simW, simH)
        dye = dfbo(dyeW, dyeH)
        divergence = fbo(simW, simH)
        pressure = dfbo(simW, simH)
      } catch {
        host.dataset.fluidUnsupported = '1'
        cancelAnimationFrame(raf)
        return
      }
      const cs = getComputedStyle(host)
      const c = document.createElement('canvas').getContext('2d')
      if (c) {
        c.fillStyle = cs.backgroundColor
        const v = c.fillStyle
        if (v.startsWith('#')) bg = hexToRgb(v)
        else {
          const m = v.match(/[\d.]+/g)
          if (m && m.length >= 3) bg = [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
        }
      }
    }

    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
      gl.useProgram(P.splat.p)
      gl.uniform1i(P.splat.u('target'), bind(velocity.read, 0))
      gl.uniform1f(P.splat.u('aspect'), canvas.width / canvas.height)
      gl.uniform2f(P.splat.u('point'), x, y)
      gl.uniform3f(P.splat.u('color'), dx, dy, 0)
      gl.uniform1f(P.splat.u('radius'), 0.0025)
      blit(velocity.write)
      velocity.swap()
      gl.uniform1i(P.splat.u('target'), bind(dye.read, 0))
      gl.uniform3f(P.splat.u('color'), color[0] * 0.3, color[1] * 0.3, color[2] * 0.3)
      blit(dye.write)
      dye.swap()
    }

    let last = performance.now()
    let raf = 0
    const step = (dt: number) => {
      gl.disable(gl.BLEND)
      // 이류 — 속도
      gl.useProgram(P.advect.p)
      gl.uniform2f(P.advect.u('texel'), ...velocity.read.texel)
      gl.uniform1i(P.advect.u('velocity'), bind(velocity.read, 0))
      gl.uniform1i(P.advect.u('source'), 0)
      gl.uniform1f(P.advect.u('dt'), dt)
      gl.uniform1f(P.advect.u('dissipation'), 0.985)
      blit(velocity.write)
      velocity.swap()
      // 이류 — 잉크
      gl.uniform1i(P.advect.u('velocity'), bind(velocity.read, 0))
      gl.uniform1i(P.advect.u('source'), bind(dye.read, 1))
      gl.uniform1f(P.advect.u('dissipation'), 0.992)
      blit(dye.write)
      dye.swap()
      // 발산
      gl.useProgram(P.div.p)
      gl.uniform2f(P.div.u('texel'), ...velocity.read.texel)
      gl.uniform1i(P.div.u('velocity'), bind(velocity.read, 0))
      blit(divergence)
      // 압력 초기화 → 야코비
      gl.useProgram(P.clear.p)
      gl.uniform1i(P.clear.u('target'), bind(pressure.read, 0))
      gl.uniform1f(P.clear.u('value'), 0.8)
      blit(pressure.write)
      pressure.swap()
      gl.useProgram(P.pressure.p)
      gl.uniform2f(P.pressure.u('texel'), ...velocity.read.texel)
      gl.uniform1i(P.pressure.u('divergence'), bind(divergence, 0))
      for (let i = 0; i < 16; i++) {
        gl.uniform1i(P.pressure.u('pressure'), bind(pressure.read, 1))
        blit(pressure.write)
        pressure.swap()
      }
      // 기울기 빼기
      gl.useProgram(P.grad.p)
      gl.uniform2f(P.grad.u('texel'), ...velocity.read.texel)
      gl.uniform1i(P.grad.u('pressure'), bind(pressure.read, 0))
      gl.uniform1i(P.grad.u('velocity'), bind(velocity.read, 1))
      blit(velocity.write)
      velocity.swap()
      // 화면
      gl.useProgram(P.display.p)
      gl.uniform1i(P.display.u('dye'), bind(dye.read, 0))
      gl.uniform3f(P.display.u('bg'), ...bg)
      blit(null)
    }
    const loop = (now: number) => {
      const dt = Math.min(0.016, (now - last) / 1000)
      last = now
      step(dt)
      raf = requestAnimationFrame(loop)
    }

    let prev: { x: number; y: number } | null = null
    let ci = 0
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = 1 - (e.clientY - r.top) / r.height
      if (prev) {
        const dx = (x - prev.x) * 6000
        const dy = (y - prev.y) * 6000
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          const color = palette[ci % palette.length] ?? [0.2, 0.4, 1]
          splat(x, y, dx, dy, color)
        }
      }
      prev = { x, y }
    }
    const onLeave = () => {
      prev = null
      ci++
    }
    const onDown = (e: PointerEvent) => {
      ci++
      const r = canvas.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = 1 - (e.clientY - r.top) / r.height
      const color = palette[ci % palette.length] ?? [0.2, 0.4, 1]
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        splat(x, y, Math.cos(a) * 900, Math.sin(a) * 900, color)
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (host.dataset.fluidUnsupported) return () => ro.disconnect()
    // 시작할 때 잉크 몇 방울
    for (let i = 0; i < 4; i++) {
      const color = palette[i % palette.length] ?? [0.2, 0.4, 1]
      splat(0.2 + Math.random() * 0.6, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 1500, color)
    }
    raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [colors, reduce])

  return (
    <div className={cn('group/fluid relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
      <p className="pointer-events-none absolute inset-0 hidden items-center justify-center font-mono text-[11px] text-fg-faint group-data-[fluid-unsupported=1]/fluid:flex">이 브라우저는 유체 시뮬레이션(half-float)을 지원하지 않아요</p>
    </div>
  )
}
