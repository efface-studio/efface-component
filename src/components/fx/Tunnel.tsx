import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TunnelProps {
  className?: string
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float; varying vec2 uv; uniform vec2 res; uniform float t; uniform vec2 mouse; uniform vec3 accent;
void main(){
  vec2 q = uv; q.x *= res.x/res.y;
  q -= mouse * 0.35;
  float r = length(q);
  float a = atan(q.y, q.x);
  // 극좌표 → 터널 텍스처 좌표
  float depth = 0.35 / (r + 0.02) + t * 1.4;
  float ang = a / 3.14159 * 6. + sin(depth * 0.35) * 0.4;
  float grid = smoothstep(0.92, 1.0, abs(sin(depth * 3.1416))) + smoothstep(0.92, 1.0, abs(sin(ang * 3.1416)));
  float pulse = 0.5 + 0.5 * sin(depth * 2. - t * 6.);
  vec3 col = mix(vec3(0.02, 0.03, 0.06), accent, grid * 0.9);
  col += accent * pulse * 0.12 * (1. - grid);
  // 깊이 안개 (가운데로 갈수록 어둡게)
  col *= smoothstep(0., 0.28, r) * 1.2;
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 터널. 극좌표로 접은 격자가 끝없이 안으로 빨려 들어간다 — 포인터가 소실점을 끌고 다니고,
 * 누르고 있으면 속도가 붙는다. 셰이더 한 장.
 */
export function Tunnel({ className }: TunnelProps) {
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
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[Tunnel]', gl.getShaderInfoLog(s))
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
    let speed = 1
    let targetSpeed = 1
    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    let accent: [number, number, number] = [0.23, 0.38, 0.9]
    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      const a = getComputedStyle(host).getPropertyValue('--accent').trim().replace('#', '')
      if (a.length === 6) accent = [parseInt(a.slice(0, 2), 16) / 255, parseInt(a.slice(2, 4), 16) / 255, parseInt(a.slice(4, 6), 16) / 255]
    }
    const draw = () => {
      speed += (targetSpeed - speed) * 0.05
      t += 0.016 * speed
      m.x += (m.tx - m.x) * 0.06
      m.y += (m.ty - m.y) * 0.06
      gl.uniform2f(U('res'), canvas.width, canvas.height)
      gl.uniform1f(U('t'), t)
      gl.uniform2f(U('mouse'), m.x, m.y)
      gl.uniform3f(U('accent'), ...accent)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      m.ty = -((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      m.tx = 0
      m.ty = 0
      targetSpeed = 1
    }
    const onDown = () => {
      targetSpeed = 3.2
    }
    const onUp = () => {
      targetSpeed = 1
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
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
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerup', onUp)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#05080f]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
