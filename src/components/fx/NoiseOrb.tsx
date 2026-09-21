import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface NoiseOrbProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform float down; uniform vec3 accent; uniform vec3 bg;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a*noise(p); p = p*2.02 + 1.7; a *= .5; } return s; }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c,-s,s,c); }
float disp(vec3 p){
  vec3 q = p; q.xz *= rot(t*.25 + mouse.x*1.5); q.yz *= rot(mouse.y*.8);
  float n = fbm(q*2.2 + vec3(0., t*.35, 0.));
  return (n - .5) * (.55 + .35*down);
}
float map(vec3 p){ return length(p) - 1. - disp(p)*.5; }
vec3 nrm(vec3 p){ vec2 e = vec2(.004, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.);
  vec3 ro = vec3(0., 0., 3.4); vec3 rd = normalize(vec3(q, -2.));
  float d = 0., dist; vec3 p;
  for (int i = 0; i < 80; i++){ p = ro + rd*d; dist = map(p); if (dist < .002 || d > 8.) break; d += dist*.7; }
  vec3 col = bg;
  // 뒤 후광 — 구 주위로 액센트 빛이 번진다
  float rr = length(q);
  col += accent * exp(-pow(max(rr - .9, 0.)*3.2, 1.6)) * .35;
  if (d < 8.){
    vec3 n = nrm(p);
    float h = disp(p);
    float fres = pow(1. - max(dot(n, -rd), 0.), 2.2);
    // 골은 뜨겁게(밝은 액센트 → 흰빛), 마루는 어둡고 매끈하게
    vec3 hot = mix(accent, vec3(1.,.95,.85), smoothstep(-.05, .3, h));
    vec3 cold = mix(vec3(.02,.03,.06), accent*.35, .5 + .5*n.y);
    col = mix(cold, hot, smoothstep(-.02, .18, h));
    col += fres * accent * .9;
    vec3 L = normalize(vec3(.5, .8, .9));
    col += pow(max(dot(reflect(rd, n), L), 0.), 40.) * .5;
    // 안쪽에서 새는 빛 — 골일수록 뜨겁다
    col += hot * pow(max(h*3.5, 0.), 2.) * 2.2;
  }
  col = col / (1. + col*.5);
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 노이즈 구 — 프랙탈 노이즈로 표면이 부풀고 꺼지는 구를 레이마칭한다. 골에서는 안쪽 빛이 새어
 * 액센트 → 흰빛으로 달아오르고 마루는 어둡고 매끈하다. 프레넬 림과 후광. 포인터가 돌리고, 누르면 더 거칠어진다.
 */
export function NoiseOrb({ className }: NoiseOrbProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1, still: !!reduce, name: 'NoiseOrb' })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#06070b]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
