import { hexToRgb01 } from '@/lib/color'

export interface ShaderFrame {
  w: number
  h: number
  /** 포인터, 가운데 0 · 가장자리 ±1 (부드럽게 따라온다) */
  mouse: [number, number]
  down: boolean
}

export interface ShaderOptions {
  /** 픽셀 비율 상한 — 레이마칭처럼 픽셀당 비용이 큰 것은 1 */
  dpr?: number
  /** 정지 화면 — 한 프레임만 그린다(감소 모션) */
  still?: boolean
  /** 포인터 감쇠 (0~1, 클수록 빨리 따라온다) */
  ease?: number
  /** 프레임마다 추가 uniform 을 넣는다 */
  onFrame?: (gl: WebGLRenderingContext, u: (name: string) => WebGLUniformLocation | null, t: number, f: ShaderFrame) => void
  /** 로그용 이름 */
  name?: string
}

export const SHADER_VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`

/**
 * 전체 화면 조각 셰이더 한 장을 캔버스에 띄운다. 공용 uniform:
 *  t(초) · res(px) · mouse(-1~1) · down(0/1) · accent · bg · fg (호스트의 CSS 토큰에서)
 * 크기는 부모를 따르고(ResizeObserver), 화면 밖이면 멈추며, 언마운트 때 컨텍스트를 놓는다.
 */
export function mountShader(canvas: HTMLCanvasElement, frag: string, opts: ShaderOptions = {}): () => void {
  const host = canvas.parentElement ?? canvas
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
  if (!gl) return () => {}
  if (gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.restoreContext()
  const name = opts.name ?? 'shader'
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) throw new Error('shader')
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(`[${name}]`, gl.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()
  if (!prog) return () => {}
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, SHADER_VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const cache = new Map<string, WebGLUniformLocation | null>()
  const U = (n: string) => {
    if (!cache.has(n)) cache.set(n, gl.getUniformLocation(prog, n))
    return cache.get(n) ?? null
  }

  const m = { x: 0, y: 0, tx: 0, ty: 0 }
  let down = false
  let accent: [number, number, number] = [0.23, 0.38, 0.9]
  let bg: [number, number, number] = [0.04, 0.05, 0.06]
  let fg: [number, number, number] = [0.95, 0.95, 0.96]
  const rgb = (s: string, fb: [number, number, number]): [number, number, number] => {
    const mm = s.match(/[\d.]+/g)
    return mm && mm.length >= 3 ? [Number(mm[0]) / 255, Number(mm[1]) / 255, Number(mm[2]) / 255] : fb
  }
  const resize = () => {
    const r = host.getBoundingClientRect()
    const dpr = Math.min(opts.dpr ?? 1.5, window.devicePixelRatio || 1)
    canvas.width = Math.max(1, Math.floor(r.width * dpr))
    canvas.height = Math.max(1, Math.floor(r.height * dpr))
    canvas.style.width = `${r.width}px`
    canvas.style.height = `${r.height}px`
    gl.viewport(0, 0, canvas.width, canvas.height)
    const cs = getComputedStyle(host)
    accent = hexToRgb01(cs.getPropertyValue('--accent').trim() || '#3b62e5')
    bg = rgb(cs.backgroundColor, bg)
    fg = rgb(cs.color, fg)
  }
  const ease = opts.ease ?? 0.08
  let t = 0
  let last = performance.now()
  let raf = 0
  let visible = true
  const draw = (now: number) => {
    raf = 0
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    t += dt
    m.x += (m.tx - m.x) * ease
    m.y += (m.ty - m.y) * ease
    gl.uniform1f(U('t'), t)
    gl.uniform2f(U('res'), canvas.width, canvas.height)
    gl.uniform2f(U('mouse'), m.x, m.y)
    gl.uniform1f(U('down'), down ? 1 : 0)
    gl.uniform3f(U('accent'), ...accent)
    gl.uniform3f(U('bg'), ...bg)
    gl.uniform3f(U('fg'), ...fg)
    opts.onFrame?.(gl, U, t, { w: canvas.width, h: canvas.height, mouse: [m.x, m.y], down })
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (!opts.still && visible) raf = requestAnimationFrame(draw)
  }
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
    m.ty = -((e.clientY - r.top) / r.height - 0.5) * 2
  }
  const onDown = (e: PointerEvent) => {
    down = true
    onMove(e)
  }
  const onUp = () => {
    down = false
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  const io = new IntersectionObserver(([en]) => {
    visible = !!en?.isIntersecting
    if (visible && !raf && !opts.still) {
      last = performance.now()
      raf = requestAnimationFrame(draw)
    }
  })
  io.observe(host)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  raf = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    gl.deleteProgram(prog)
    gl.deleteBuffer(buf)
    window.setTimeout(() => {
      if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
    }, 0)
  }
}
