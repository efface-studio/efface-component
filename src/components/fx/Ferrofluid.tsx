import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface FerrofluidProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform float down; uniform vec3 accent;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
// 자석(포인터) 위치 — 화면 앞쪽 평면
vec3 magnet(){ return vec3(mouse.x*1.6, mouse.y*1.0, 1.1); }
float map(vec3 p){
  // 납작한 웅덩이
  float pool = length(p*vec3(1., 2.6, 1.)) - 1.05;
  float ripple = .03*sin(p.x*7. + t*2.)*sin(p.z*6. - t*1.6);
  // 자석에 가까울수록 가시가 선다 — 방향은 자석 쪽, 주기는 노이즈 셀
  vec3 m = magnet();
  float near = smoothstep(1.6, 0., length(p - m)) * (0.55 + 0.45*down);
  vec3 dir = normalize(m - p);
  float cells = noise(p*7. + vec3(0., 0., t*.15));
  float spikes = pow(cells, 3.) * near * (.55 + .35*down);
  // 가시는 자석 방향으로 길어진다
  float pull = dot(p - vec3(0., -.35, 0.), dir);
  return pool + ripple - spikes*1.2 - near*.18*max(pull, 0.);
}
vec3 nrm(vec3 p){ vec2 e = vec2(.002, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.);
  vec3 ro = vec3(0., 1.1, 3.2); vec3 rd = normalize(vec3(q.x, q.y - .35, -2.));
  float d = 0., dist; vec3 p;
  for (int i = 0; i < 96; i++){ p = ro + rd*d; dist = map(p); if (dist < .0012 || d > 9.) break; d += dist*.8; }
  vec3 col = vec3(.03,.032,.04);
  // 바닥 — 은은한 비네트
  col *= 1. - length(q)*.35;
  if (d < 9.){
    vec3 n = nrm(p);
    vec3 L1 = normalize(vec3(-.6, 1., .8)); vec3 L2 = normalize(vec3(.8, .5, -.3));
    float sp1 = pow(max(dot(reflect(rd, n), L1), 0.), 60.);
    float sp2 = pow(max(dot(reflect(rd, n), L2), 0.), 30.);
    float fres = pow(1. - max(dot(n, -rd), 0.), 3.);
    // 검은 유체 — 거의 반사만
    col = vec3(.01) + fres*vec3(.12,.13,.18) + sp1*vec3(1.) + sp2*accent*.7;
    col += max(dot(n, L1), 0.)*.03;
  }
  // 자석 표시 — 포인터 아래 은은한 액센트 빛
  vec3 m = magnet();
  col += accent * exp(-length(q - vec2(m.x, m.y)*.62)*3.) * .08 * (1. + down);
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 자성 유체 — 검고 매끈한 웅덩이가 포인터(자석)에 끌려 노이즈 셀마다 가시를 세운다.
 * 누르면 자력이 세져 더 뾰족해진다. 레이마칭 + 두 광원의 정반사만으로 검은 유체의 질감을 만든다.
 */
export function Ferrofluid({ className }: FerrofluidProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1, still: !!reduce, name: 'Ferrofluid', ease: 0.12 })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#07080a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
