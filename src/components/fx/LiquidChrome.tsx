import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { mountShader } from './shaderCanvas'

export interface LiquidChromeProps {
  className?: string
}

const FRAG = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; uniform vec2 mouse; uniform vec3 accent; uniform vec3 bg;
float smin(float a, float b, float k){ float h = clamp(.5 + .5*(b-a)/k, 0., 1.); return mix(b, a, h) - k*h*(1.-h); }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c,-s,s,c); }
float map(vec3 p){
  p.xz *= rot(mouse.x*1.4 + t*.2); p.yz *= rot(-mouse.y*.9);
  float d = length(p) - .9;
  // 표면이 천천히 출렁인다
  d += .06*sin(p.x*4. + t*1.7)*sin(p.y*3.5 - t*1.3)*sin(p.z*3. + t);
  d = smin(d, length(p - vec3(sin(t*1.1)*1.1, cos(t*.8)*.7, sin(t*.6)*.6)) - .42, .45);
  d = smin(d, length(p - vec3(cos(t*.9)*.9, sin(t*1.4)*.9, cos(t*1.1)*.8)) - .34, .45);
  d = smin(d, length(p - vec3(sin(t*.7)*.5, -cos(t*1.2)*1.0, sin(t*1.5)*.7)) - .28, .4);
  return d;
}
vec3 nrm(vec3 p){ vec2 e = vec2(.0015, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
// 절차적 환경 — 어두운 스튜디오에 긴 소프트박스 창 몇 개. 크롬은 이걸 비춘다
vec3 env(vec3 d){
  float y = d.y;
  // 밝은 스튜디오 — 위는 밝은 회백, 아래는 어두운 바닥, 수평선에 한 줄 하이라이트
  vec3 c = mix(vec3(.08,.085,.10), vec3(.62,.64,.70), smoothstep(-.6, .9, y));
  c += vec3(.9,.92,.96) * smoothstep(.12, 0., abs(y - .05)) * .5;
  float a = atan(d.z, d.x);
  // 소프트박스 세 개 — 넓고 부드럽게
  c += vec3(1.,.99,.97) * smoothstep(.22, 0., abs(y - .5)) * smoothstep(1., .15, abs(sin(a*1.5 + .4))) * 1.3;
  c += vec3(.95,.97,1.) * smoothstep(.16, 0., abs(y + .25)) * smoothstep(1., .35, abs(sin(a*2. + 2.))) * .9;
  c += accent * smoothstep(.3, 0., abs(y - .12)) * smoothstep(1., .55, abs(sin(a - 1.2))) * 1.1;
  c += vec3(.7,.75,.85) * pow(max(0., y), 3.) * .6;
  return c;
}
void main(){
  vec2 q = uv * vec2(res.x/res.y, 1.);
  vec3 ro = vec3(0., 0., 3.6); vec3 rd = normalize(vec3(q, -2.));
  float d = 0., dist; vec3 p;
  for (int i = 0; i < 90; i++){ p = ro + rd*d; dist = map(p); if (dist < .001 || d > 10.) break; d += dist*.9; }
  vec3 col = bg;
  if (d < 10.){
    vec3 n = nrm(p);
    vec3 R = reflect(rd, n);
    vec3 refl = env(R);
    float fres = pow(1. - max(0., dot(n, -rd)), 2.5);
    col = refl * (0.85 + 0.25*fres) + fres*.18;
    // 크롬은 자기 색이 거의 없다 — 살짝 차가운 틴트
    col *= vec3(.96, .98, 1.02);
  } else {
    // 바닥 그림자
    col += bg * 0.;
  }
  col = col / (1. + col*.35);
  gl_FragColor = vec4(col, 1.);
}`

/**
 * 액체 크롬 — 레이마칭한 덩어리가 녹아 붙으며 출렁이고, 표면은 절차적 스튜디오 환경(소프트박스·액센트 빛)을
 * 그대로 비춘다. 크롬은 자기 색이 없어 반사만으로 형태가 읽힌다. 포인터가 카메라를 돌린다.
 */
export function LiquidChrome({ className }: LiquidChromeProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    return mountShader(c, FRAG, { dpr: 1, still: !!reduce, name: 'LiquidChrome' })
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-[#08090c]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
