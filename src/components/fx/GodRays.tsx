import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface GodRaysProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform vec3 accent;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a*noise(p); p = p*2.03 + 1.3; a *= .5; } return s; }
// 가림막 — 흔들리는 나뭇잎 덩어리(노이즈 문턱)
float occluder(vec2 p){
  float n = fbm(p*2.6 + vec2(t*.05, sin(t*.2)*.1));
  float leaves = smoothstep(.48, .56, n);
  // 아래쪽엔 긴 줄기
  float trunk = smoothstep(.02, 0., abs(p.x + .35 + sin(p.y*3.)*.05)) * step(p.y, .1);
  return max(leaves, trunk);
}
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.);
  vec2 sun = vec2(.55 + mouse.x*.35, .5 + mouse.y*.25);
  vec3 col = mix(vec3(.02,.03,.05), vec3(.05,.07,.10), q.y*.5+.5);
  // 빛줄기 — 태양에서 픽셀로 오는 길 위의 가림막을 적분(방사형 블러)
  vec2 d = (q - sun);
  float ray = 0.;
  const int N = 36;
  for (int i = 0; i < N; i++){
    float k = float(i)/float(N);
    vec2 sp = sun + d*k;
    ray += (1. - occluder(sp)) * (1. - k*.6);
  }
  ray /= float(N);
  float dist = length(d);
  float glow = exp(-dist*2.2);
  vec3 sunCol = mix(vec3(1.,.9,.7), accent, .2);
  col += sunCol * ray * ray * (0.55 + glow*1.6);
  col += sunCol * smoothstep(.08, .0, dist) * 1.5;
  // 앞의 가림막은 검게, 가장자리는 빛이 새어 나온다
  float oc = occluder(q);
  col = mix(col, vec3(.01,.015,.02), oc * .92);
  col += sunCol * oc * exp(-dist*1.5) * .12;
  // 공기 중 먼지
  col += sunCol * ray * noise(q*40. + t*.3) * .12;
  gl_FragColor = vec4(col / (1. + col*.4), 1.);
}`

/**
 * 빛줄기(God rays) — 해에서 각 픽셀로 오는 길 위에 가림막(흔들리는 잎)이 얼마나 있는지 적분해
 * 방사형으로 새어 나오는 빛을 그린다. 가장자리로 빛이 번지고 공기 중 먼지가 반짝인다. 포인터가 해를 옮긴다.
 */
export function GodRays({ className }: GodRaysProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1, still: !!reduce, name: 'GodRays', ease: 0.05 })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#050709]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
