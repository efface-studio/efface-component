import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface MandelbrotProps {
  className?: string
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float; varying vec2 uv; uniform vec2 res; uniform vec2 center; uniform float zoom; uniform float t; uniform vec3 accent;
void main(){
  vec2 q = uv; q.x *= res.x/res.y;
  vec2 c = center + q * zoom;
  vec2 z = vec2(0.);
  float n = 0.;
  const int MAX = 160;
  for (int i = 0; i < MAX; i++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.*z.x*z.y) + c;
    if (dot(z,z) > 64.) break;
    n += 1.;
  }
  if (n >= float(MAX) - 0.5) { gl_FragColor = vec4(0.03, 0.035, 0.05, 1.); return; }
  // 부드러운 반복수 → 색 띠
  float sn = n - log2(log2(dot(z,z))) + 4.;
  float k = sn * 0.06 + t * 0.15;
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (k + vec3(0.0, 0.33, 0.67)));
  col = mix(col, accent, 0.25) * (0.55 + 0.45 * smoothstep(0., 40., sn));
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 만델브로트 집합. 포인터가 가리키는 자리로 끝없이 확대해 들어간다 — 경계의 프랙탈이 계속 새 모양을 드러낸다.
 * 누르고 있으면 빨리, 떼면 천천히. 나가면 다시 멀어진다.
 */
export function Mandelbrot({ className }: MandelbrotProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const host = canvas.parentElement ?? canvas
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return
    if (gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.restoreContext()
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
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    let raf = 0
    let t = 0
    // 흥미로운 시작점(해마 골짜기 근처)
    const view = { cx: -0.745, cy: 0.186, zoom: 1.6, tcx: -0.745, tcy: 0.186 }
    let zoomSpeed = 0.992
    let accent: [number, number, number] = [0.23, 0.38, 0.9]
    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(1, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      const a = getComputedStyle(host).getPropertyValue('--accent').trim().replace('#', '')
      if (a.length === 6) accent = [parseInt(a.slice(0, 2), 16) / 255, parseInt(a.slice(2, 4), 16) / 255, parseInt(a.slice(4, 6), 16) / 255]
    }
    const draw = () => {
      t += 0.016
      view.zoom *= zoomSpeed
      if (view.zoom < 0.00004) view.zoom = 1.6 // float 정밀도 한계에서 되감기
      if (view.zoom > 2.2) view.zoom = 2.2
      view.cx += (view.tcx - view.cx) * 0.03
      view.cy += (view.tcy - view.cy) * 0.03
      gl.uniform2f(U('res'), canvas.width, canvas.height)
      gl.uniform2f(U('center'), view.cx, view.cy)
      gl.uniform1f(U('zoom'), view.zoom)
      gl.uniform1f(U('t'), t)
      gl.uniform3f(U('accent'), ...accent)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const qx = ((e.clientX - r.left) / r.width - 0.5) * 2 * (r.width / r.height)
      const qy = -((e.clientY - r.top) / r.height - 0.5) * 2
      view.tcx = view.cx + qx * view.zoom * 0.35
      view.tcy = view.cy + qy * view.zoom * 0.35
    }
    const onLeave = () => {
      zoomSpeed = 1.01
    }
    const onEnter = () => {
      zoomSpeed = 0.992
    }
    const onDown = () => {
      zoomSpeed = 0.975
    }
    const onUp = () => {
      zoomSpeed = 0.992
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerup', onUp)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#07090d]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
