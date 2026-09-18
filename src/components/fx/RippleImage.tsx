import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface RippleImageProps {
  src: string
  className?: string
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float; varying vec2 uv; uniform sampler2D img; uniform vec2 mouse; uniform float t; uniform vec2 res; uniform vec2 imgRes; uniform float strength;
void main(){
  // contain 맞춤
  float ra = res.x/res.y, ia = imgRes.x/imgRes.y; vec2 s = ra > ia ? vec2(ia/ra, 1.) : vec2(1., ra/ia);
  vec2 c = (uv - 0.5) / s + 0.5;
  vec2 d = uv - mouse; d.x *= ra; float dist = length(d);
  // 포인터에서 퍼지는 동심원 물결 + 배경의 느린 잔물결
  float wave = sin(dist * 40. - t * 6.) * exp(-dist * 4.) * strength;
  float idle = sin(uv.y * 18. + t * 1.4) * 0.004 + sin(uv.x * 14. - t) * 0.004;
  vec2 off = normalize(d + 1e-5) * wave * 0.05 + vec2(idle);
  // 색수차 — 채널마다 조금씩 다르게
  float r = texture2D(img, c + off * 1.15).r; float g = texture2D(img, c + off).g; float b = texture2D(img, c + off * 0.85).b;
  float a = texture2D(img, c + off).a;
  if (c.x < 0. || c.x > 1. || c.y < 0. || c.y > 1.) { gl_FragColor = vec4(0.); return; }
  gl_FragColor = vec4(r, g, b, a);
}`

/**
 * 이미지 위로 포인터가 지나가면 물결이 일어 굴절되고 색이 살짝 갈라진다(색수차).
 * WebGL 셰이더 — 로고나 사진 어디든.
 */
export function RippleImage({ src, className }: RippleImageProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const host = canvas.parentElement ?? canvas
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return
    if (gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.restoreContext()
    const sh = (type: number, srcCode: string) => {
      const s = gl.createShader(type)
      if (!s) throw new Error('shader')
      gl.shaderSource(s, srcCode)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[RippleImage] shader', gl.getShaderInfoLog(s))
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
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    let imgW = 1
    let imgH = 1
    let ready = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // SVG 는 래스터 크기가 필요하다
      const c = document.createElement('canvas')
      c.width = 1024
      c.height = 1024
      const cx = c.getContext('2d')
      if (!cx) return
      const s = Math.min(1024 / img.width, 1024 / img.height)
      cx.drawImage(img, (1024 - img.width * s) / 2, (1024 - img.height * s) / 2, img.width * s, img.height * s)
      imgW = 1024
      imgH = 1024
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c)
      ready = true
    }
    img.src = src
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let strength = 0
    let targetStrength = 0
    let t = 0
    let raf = 0
    const resize = () => {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const draw = () => {
      t += 0.016
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      strength += (targetStrength - strength) * 0.08
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      if (ready) {
        gl.uniform1i(U('img'), 0)
        gl.uniform2f(U('mouse'), mouse.x, 1 - mouse.y)
        gl.uniform1f(U('t'), t)
        gl.uniform2f(U('res'), canvas.width, canvas.height)
        gl.uniform2f(U('imgRes'), imgW, imgH)
        gl.uniform1f(U('strength'), strength)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
      targetStrength = 1
    }
    const onLeave = () => {
      targetStrength = 0
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
  }, [src, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
