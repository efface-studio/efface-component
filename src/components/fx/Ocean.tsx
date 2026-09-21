import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface OceanProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
// 게르스트너 식 파도 합 — 높이와 기울기
vec3 wave(vec2 p){
  float h = 0.; vec2 g = vec2(0.);
  float amp = .28, freq = .9, ang = .3, spd = 1.1;
  for (int i = 0; i < 6; i++){
    vec2 d = vec2(cos(ang), sin(ang));
    float ph = dot(d, p)*freq + t*spd;
    float s = sin(ph), c = cos(ph);
    // 뾰족한 마루
    float k = pow(.5 + .5*s, 2.2);
    h += amp * k;
    g += d * amp * 2.2 * pow(.5 + .5*s, 1.2) * .5 * c * freq;
    amp *= .58; freq *= 1.72; ang += 1.9; spd *= 1.12;
  }
  return vec3(h, g);
}
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.);
  vec2 sun = vec2(mouse.x*.9, .22 + mouse.y*.18);
  vec3 sky = mix(vec3(.55,.72,.92), vec3(.12,.25,.55), smoothstep(0., 1., q.y*1.6));
  float sd = length(q - sun);
  vec3 sunCol = vec3(1.,.93,.78);
  sky += sunCol * (smoothstep(.06, .035, sd) + .35*exp(-sd*6.) + .12*exp(-sd*2.));
  vec3 col = sky;
  float horizon = .02;
  if (q.y < horizon){
    // 수면 위 점 — 화면 y 로 거리를 정한다(멀수록 촘촘)
    float dist = 1.2 / (horizon - q.y + .04);
    vec2 wp = vec2(q.x * dist * .9, dist) + vec2(0., t*.6);
    vec3 w = wave(wp * .35);
    vec3 n = normalize(vec3(-w.y, 1., -w.z) * vec3(1., 1. + dist*.15, 1.));
    vec3 V = normalize(vec3(q.x, horizon - q.y + .05, 1.));
    float fres = pow(1. - max(dot(n, -V), 0.), 4.);
    fres = .06 + .94*fres;
    vec3 deep = mix(vec3(.02,.09,.18), vec3(.05,.32,.42), smoothstep(0., .6, w.x));
    vec3 L = normalize(vec3(sun.x*3., .6, 2.5));
    float spec = pow(max(dot(reflect(V, n), L), 0.), 220.) * 2.5 + pow(max(dot(reflect(V, n), L), 0.), 24.)*.25;
    // 태양 기둥 — 해 아래 수면에 길게 반짝인다
    float glitter = exp(-pow((q.x - sun.x)*4., 2.)) * pow(noise(wp*8. + t*3.)*noise(wp*5.3 - t*2.), 1.5) * 3.;
    // 거품 — 마루 꼭대기에
    float foam = smoothstep(.55, .8, w.x) * noise(wp*9. + t) * .8;
    col = mix(deep, sky*.9, fres) + sunCol*(spec + glitter*.5) + foam;
    col = mix(col, sky, smoothstep(6., 40., dist)); // 대기 원근
  }
  col = pow(col, vec3(.95));
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 바다 — 여섯 겹 게르스트너 파도의 높이·기울기로 법선을 만들어 프레넬 반사(하늘 ↔ 깊은 물),
 * 태양 정반사와 수면에 길게 늘어지는 반짝임, 마루의 거품, 대기 원근을 그린다. 포인터가 해를 옮긴다.
 */
export function Ocean({ className }: OceanProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1.5, still: !!reduce, name: 'Ocean', ease: 0.04 })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#0b2a4a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
