import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { hexToRgb01 } from '@/lib/color'

export interface SDFSceneProps {
  className?: string
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform vec3 accent; uniform vec3 bg;
// 부드러운 최소 — 덩이들이 녹아 붙는다
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0., 1.); return mix(b, a, h) - k*h*(1.-h); }
float sdSphere(vec3 p, float r){ return length(p) - r; }
float sdBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b; return length(max(q,0.)) + min(max(q.x,max(q.y,q.z)),0.) - r; }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c,-s,s,c); }
float map(vec3 p){
  p.xz *= rot(mouse.x*1.2 + t*0.25); p.yz *= rot(-mouse.y*0.8);
  // efface 마크를 3D 로 — 둥근 판 두 장 + 떠다니는 구
  float a = sdBox(p - vec3(-0.45, 0.45, 0.), vec3(0.55,0.55,0.12), 0.18);
  float b = sdBox(p - vec3( 0.45,-0.45, 0.25), vec3(0.55,0.55,0.12), 0.18);
  float s1 = sdSphere(p - vec3(sin(t*1.3)*1.3, cos(t*0.9)*0.9, sin(t*0.7)*0.8), 0.35);
  float s2 = sdSphere(p - vec3(cos(t*1.1)*1.1, sin(t*1.7)*0.7, cos(t*1.3)*0.9), 0.28);
  return smin(smin(a, b, 0.25), smin(s1, s2, 0.5), 0.35);
}
vec3 normal(vec3 p){ vec2 e = vec2(0.002, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
void main(){
  vec2 q = uv; q.x *= res.x/res.y;
  vec3 ro = vec3(0., 0., 4.2); vec3 rd = normalize(vec3(q, -2.2));
  float d = 0.; float dist; vec3 p;
  for (int i = 0; i < 80; i++){ p = ro + rd*d; dist = map(p); if (dist < 0.001 || d > 12.) break; d += dist; }
  vec3 col = bg;
  if (d < 12.) {
    vec3 n = normal(p);
    vec3 L = normalize(vec3(0.6, 0.9, 0.8));
    float diff = max(0., dot(n, L));
    float spec = pow(max(0., dot(reflect(-L, n), -rd)), 40.);
    float fres = pow(1. - max(0., dot(n, -rd)), 3.);
    // 위 판은 밝게, 아래 판과 구는 액센트
    float which = smoothstep(-0.2, 0.2, p.y - p.x*0.1 + 0.0);
    vec3 base = mix(accent, vec3(0.93, 0.94, 0.97), which);
    col = base * (0.18 + diff * 0.85) + spec * 0.6 + fres * accent * 0.6;
    // 안개
    col = mix(col, bg, smoothstep(5., 9., d));
  }
  gl_FragColor = vec4(col, 1.);
}`


/**
 * 레이마칭. 삼각형 하나 없이 거리 함수(SDF)로 3D 를 그린다 — efface 마크 판 두 장과 구들이
 * 액체처럼 녹아 붙고(smooth-min), 정반사·프레넬·안개가 들어간다. 포인터가 카메라를 돌린다.
 */
export function SDFScene({ className }: SDFSceneProps) {
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
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[SDFScene]', gl.getShaderInfoLog(s))
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
    let t = 0
    let raf = 0
    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    let accent: [number, number, number] = [0.23, 0.38, 0.9]
    let bg: [number, number, number] = [0.04, 0.05, 0.06]
    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(1, window.devicePixelRatio || 1) // 레이마칭은 픽셀당 비용이 커서 1x
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
      const cs = getComputedStyle(host)
      accent = hexToRgb01(cs.getPropertyValue('--accent').trim() || '#3b62e5')
      const mm = cs.backgroundColor.match(/[\d.]+/g)
      if (mm && mm.length >= 3) bg = [Number(mm[0]) / 255, Number(mm[1]) / 255, Number(mm[2]) / 255]
    }
    const draw = () => {
      t += 0.016
      m.x += (m.tx - m.x) * 0.06
      m.y += (m.ty - m.y) * 0.06
      gl.uniform1f(U('t'), t)
      gl.uniform2f(U('res'), canvas.width, canvas.height)
      gl.uniform2f(U('mouse'), m.x, m.y)
      gl.uniform3f(U('accent'), ...accent)
      gl.uniform3f(U('bg'), ...bg)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      m.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      m.tx = 0
      m.ty = 0
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
