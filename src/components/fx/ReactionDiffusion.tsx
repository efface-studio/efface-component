import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'

export interface ReactionDiffusionProps {
  className?: string
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`
const STEP = `
precision highp float; varying vec2 uv; uniform sampler2D state; uniform vec2 texel; uniform vec2 mouse; uniform float feed; uniform float kill;
void main(){
  vec2 c = texture2D(state, uv).xy;
  // 9점 라플라시안 — 가중치 합이 0 (0.2×4 + 0.05×4 − 1) 이어야 안정
  vec2 orth = texture2D(state, uv + vec2(texel.x,0.)).xy + texture2D(state, uv - vec2(texel.x,0.)).xy + texture2D(state, uv + vec2(0.,texel.y)).xy + texture2D(state, uv - vec2(0.,texel.y)).xy;
  vec2 diag = texture2D(state, uv + texel).xy + texture2D(state, uv - texel).xy + texture2D(state, uv + vec2(texel.x,-texel.y)).xy + texture2D(state, uv - vec2(texel.x,-texel.y)).xy;
  vec2 lap = orth * 0.2 + diag * 0.05 - c;
  float a = c.x, b = c.y;
  float abb = a*b*b;
  float na = a + (1.0*lap.x - abb + feed*(1.-a));
  float nb = b + (0.5*lap.y + abb - (kill+feed)*b);
  // 포인터가 B 를 뿌린다
  vec2 d = uv - mouse; d.x *= texel.y/texel.x;
  if (length(d) < 0.02) nb = 0.9;
  gl_FragColor = vec4(clamp(na,0.,1.), clamp(nb,0.,1.), 0., 1.);
}`
const SHOW = `
precision highp float; varying vec2 uv; uniform sampler2D state; uniform vec3 accent; uniform vec3 bg; uniform vec3 fg;
void main(){
  vec2 c = texture2D(state, uv).xy;
  float v = smoothstep(0.12, 0.32, c.y);
  float edge = smoothstep(0.1, 0.2, c.y) - smoothstep(0.25, 0.4, c.y);
  vec3 col = mix(bg, fg, v);
  col = mix(col, accent, edge * 0.9);
  gl_FragColor = vec4(col, 1.);
}`

function hex(h: string): [number, number, number] {
  const m = h.replace('#', '')
  if (m.length !== 6) return [0.23, 0.38, 0.9]
  return [parseInt(m.slice(0, 2), 16) / 255, parseInt(m.slice(2, 4), 16) / 255, parseInt(m.slice(4, 6), 16) / 255]
}

/**
 * 반응·확산(그레이-스콧). 두 화학물질이 퍼지고 반응하며 산호·지문 같은 튜링 무늬가 스스로 자라난다.
 * 포인터가 지나간 자리에서 무늬가 시작되고, 누르면 다른 종류의 무늬(점 → 줄기 → 미로)로 바뀐다.
 * WebGL 핑퐁 — 프레임마다 여러 번 반복해서 눈에 띄게 자란다.
 */
export function ReactionDiffusion({ className }: ReactionDiffusionProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const host = canvas.parentElement ?? canvas
    const attrs = { antialias: false, alpha: false, depth: false }
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
      if (!half || !gl.getExtension('OES_texture_half_float_linear')) {
        host.dataset.unsupported = '1'
        return
      }
      HALF = half.HALF_FLOAT_OES
      INTERNAL = gl.RGBA
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) throw new Error('shader')
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[RD]', gl.getShaderInfoLog(s))
      return s
    }
    const vert = sh(gl.VERTEX_SHADER, VERT)
    const program = (frag: string) => {
      const p = gl.createProgram()
      if (!p) throw new Error('program')
      gl.attachShader(p, vert)
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag))
      gl.linkProgram(p)
      return { p, u: (n: string) => gl.getUniformLocation(p, n) }
    }
    const P = { step: program(STEP), show: program(SHOW) }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    let w = 0
    let h = 0
    let texs: WebGLTexture[] = []
    let fbs: WebGLFramebuffer[] = []
    let cur = 0
    const PRESETS = [
      { feed: 0.037, kill: 0.06 }, // 점
      { feed: 0.055, kill: 0.062 }, // 줄기·산호
      { feed: 0.029, kill: 0.057 }, // 미로
    ]
    let preset = 1
    const mouse = { x: -9, y: -9 }
    let accent: [number, number, number] = [0.23, 0.38, 0.9]
    let bg: [number, number, number] = [0.04, 0.04, 0.05]
    let fg: [number, number, number] = [0.95, 0.95, 0.96]
    let raf = 0
    const STEPS = isCoarsePointer() ? 5 : 10 // 프레임당 반복 — 모바일은 절반
    const makeTex = () => {
      const t = gl.createTexture()
      const f = gl.createFramebuffer()
      if (!t || !f) throw new Error('tex')
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      // 초기 상태: A=1, B=0 에 가운데 씨앗 몇 개
      const data = new Float32Array(w * h * 4)
      for (let i = 0; i < w * h; i++) {
        data[i * 4] = 1
        const x = i % w
        const y = (i / w) | 0
        const seedR = 6
        const cx = w / 2
        const cy = h / 2
        if ((x - cx) ** 2 + (y - cy) ** 2 < seedR * seedR || Math.random() < 0.0008) data[i * 4 + 1] = 1
      }
      // Float32 → half 로 올릴 수 없으면 FLOAT 타입으로 업로드 시도
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, INTERNAL, w, h, 0, gl.RGBA, gl2 ? gl2.FLOAT : HALF, gl2 ? data : null)
      } catch {
        gl.texImage2D(gl.TEXTURE_2D, 0, INTERNAL, w, h, 0, gl.RGBA, HALF, null)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, f)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo')
      return { t, f }
    }
    const seedWebGL1 = () => {
      // WebGL1 은 데이터 없이 만들었으니 첫 프레임에 포인터 뿌리기로 씨앗을 준다
      mouse.x = 0.5
      mouse.y = 0.5
    }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width / 2))
      h = Math.max(1, Math.floor(r.height / 2))
      canvas.width = w * 2
      canvas.height = h * 2
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      try {
        const a = makeTex()
        const b = makeTex()
        texs = [a.t, b.t]
        fbs = [a.f, b.f]
      } catch {
        host.dataset.unsupported = '1'
        cancelAnimationFrame(raf)
        return
      }
      if (!gl2) seedWebGL1()
      const cs = getComputedStyle(host)
      accent = hex(cs.getPropertyValue('--accent').trim() || '#3b62e5')
      const m = cs.backgroundColor.match(/[\d.]+/g)
      if (m && m.length >= 3) bg = [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255]
      const fm = cs.color.match(/[\d.]+/g)
      if (fm && fm.length >= 3) fg = [Number(fm[0]) / 255, Number(fm[1]) / 255, Number(fm[2]) / 255]
    }
    const draw = () => {
      if (host.dataset.unsupported) return
      const pr = PRESETS[preset % PRESETS.length]!
      gl.useProgram(P.step.p)
      gl.viewport(0, 0, w, h)
      for (let i = 0; i < STEPS; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[1 - cur]!)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texs[cur]!)
        gl.uniform1i(P.step.u('state'), 0)
        gl.uniform2f(P.step.u('texel'), 1 / w, 1 / h)
        gl.uniform2f(P.step.u('mouse'), mouse.x, mouse.y)
        gl.uniform1f(P.step.u('feed'), pr.feed)
        gl.uniform1f(P.step.u('kill'), pr.kill)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        cur = 1 - cur
        if (!gl2 && i === 0) {
          mouse.x = -9
          mouse.y = -9
        }
      }
      gl.useProgram(P.show.p)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[cur]!)
      gl.uniform1i(P.show.u('state'), 0)
      gl.uniform3f(P.show.u('accent'), ...accent)
      gl.uniform3f(P.show.u('bg'), ...bg)
      gl.uniform3f(P.show.u('fg'), ...fg)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / r.width
      mouse.y = 1 - (e.clientY - r.top) / r.height
    }
    const onLeave = () => {
      mouse.x = -9
      mouse.y = -9
    }
    const onDown = () => {
      preset++
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    raf = requestAnimationFrame(draw)
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
  }, [reduce])
  return (
    <div className={cn('group/rd relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
      <p className="pointer-events-none absolute inset-0 hidden items-center justify-center font-mono text-[11px] text-fg-faint group-data-[unsupported=1]/rd:flex">이 브라우저는 float 텍스처를 지원하지 않아요</p>
    </div>
  )
}
