import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface BlackHoleProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform vec3 accent;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a*noise(p); p = p*2.1 + 3.7; a *= .5; } return s; }
// 별밭 — 셀마다 별 하나, 렌즈에 휘어진 좌표로 본다
vec3 stars(vec2 p){
  vec3 c = vec3(0.);
  for (int k = 0; k < 2; k++){
    vec2 g = p * (18. + 14.*float(k)) + float(k)*7.3;
    vec2 i = floor(g), f = fract(g);
    float h = hash(i + float(k));
    vec2 o = vec2(hash(i + 1.3), hash(i + 2.7));
    float d = length(f - o);
    float tw = .7 + .3*sin(t*2. + h*40.);
    c += smoothstep(.06 + h*.03, 0., d) * (0.35 + h) * tw * mix(vec3(.8,.85,1.), vec3(1.,.9,.7), h);
  }
  return c;
}
// 강착 원반 — 기울어진 타원, 안쪽이 뜨겁고 다가오는 쪽(오른쪽)이 도플러로 밝다
vec3 disk(vec2 q, float flip){
  vec2 e = vec2(q.x, q.y*flip / 0.32);
  float r = length(e); float a = atan(e.y, e.x);
  float band = fbm(vec2(a*2.5 + t*.6, r*6. - t*.9));
  float m = smoothstep(.26, .30, r) * smoothstep(1.05, .55, r);
  float heat = pow(smoothstep(1.05, .26, r), 1.6);
  float doppler = .55 + .65*smoothstep(-1., 1., e.x / max(r, 1e-3));
  vec3 col = mix(vec3(1.,.45,.12), vec3(1.,.9,.7), heat) * (0.6 + 0.8*band) * doppler;
  return col * m * (0.9 + 0.4*heat);
}
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.) + vec2(mouse.x*.12, mouse.y*.08);
  float r = length(q);
  float rs = 0.19; // 사건의 지평선
  // 렌즈 — 빛이 구멍 쪽으로 휜다. 배경 별은 휜 좌표로 샘플
  float bend = 0.045 / max(r*r - rs*rs*.4, .015);
  vec2 sq = q - normalize(q) * bend;
  float ang = t*.01; mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec3 col = stars(R*sq*.9) * smoothstep(rs*1.05, rs*1.6, r);
  // 은은한 성간 가스
  col += vec3(.06,.05,.12) * fbm(sq*2. + t*.02) * smoothstep(rs, rs*2.5, r);
  // 원반: 앞쪽(아래) + 지평선 너머로 휘어 올라온 뒤쪽 상(위)
  vec3 front = disk(q, 1.);
  vec3 back = disk(vec2(q.x, -abs(q.y)*.55 - rs*.15), 1.) * smoothstep(rs, rs*1.9, r) * .85;
  float above = smoothstep(-.02, .06, q.y);
  col += mix(front, back, above * step(rs*1.1, r) * .9) + front * (1. - above) * .2;
  // 광자 고리 — 지평선 바로 밖의 얇고 밝은 링
  float ring = exp(-pow((r - rs*1.28)*38., 2.));
  col += ring * mix(vec3(1.,.8,.5), accent, .35) * 1.4;
  // 지평선 안은 검다
  col *= smoothstep(rs*.98, rs*1.06, r);
  col = col / (1. + col*.6);
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 블랙홀 — 사건의 지평선 주위로 빛이 휘어(중력 렌즈) 별밭이 일그러지고, 강착 원반은 다가오는 쪽이
 * 도플러로 더 밝다. 지평선 너머의 원반이 휘어 올라와 위쪽 호로 보이고, 바로 밖에 광자 고리가 맺힌다.
 * 포인터가 시선을 살짝 옮긴다.
 */
export function BlackHole({ className }: BlackHoleProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1.5, still: !!reduce, name: 'BlackHole' })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#02030a]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
