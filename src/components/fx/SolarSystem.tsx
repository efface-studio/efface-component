import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { isCoarsePointer } from '@/lib/device'
import { SOLAR_BODIES, SOLAR_STOPS, type SolarBody } from './solar.bodies'

export interface SolarSystemProps {
  /** 가만히 두면 행성들을 차례로 찾아간다 */
  auto?: boolean
  className?: string
}

type Three = typeof import('three')
type Stop = (typeof SOLAR_STOPS)[number]
type Mesh = import('three').Mesh
type Object3D = import('three').Object3D
type Vector3 = import('three').Vector3
type StdMat = import('three').MeshStandardMaterial
type ShaderMat = import('three').ShaderMaterial

interface Api {
  flyTo: (id: Stop) => void
  zoomBy: (f: number) => void
  reset: () => void
}

const TEX = '/space/'
/** 시뮬레이션 시간 — 1초에 며칠. 지구가 한 바퀴 도는 데 약 90초 */
const DAYS_PER_SEC = 4
const IDLE_MS = 7000
const TOUR_MS = 9000

/* ── GLSL 조각 ─────────────────────────────────────────── */
/** 3D 심플렉스 노이즈(Ashima) — 구 표면에서 이음새 없이 쓴다 */
const SNOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<OCT;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }`

/** 태양 — 절차적 광구: 도메인 워핑한 fbm 대류 세포 + 알갱이 + 흑점 + 주변 감광. 확대해도 디테일이 유지된다 */
const SUN_VERT = `varying vec3 vObj; varying vec3 vN; varying vec3 vV;
void main(){ vObj = normalize(position); vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`
const SUN_FRAG = `uniform float time; varying vec3 vObj; varying vec3 vN; varying vec3 vV;
${SNOISE}
void main(){
  vec3 p = vObj * 3.2; float t = time * 0.045;
  vec3 q = vec3(fbm(p + t), fbm(p + vec3(5.2, 1.3, 2.8) - t * 0.7), fbm(p + vec3(1.7, 9.2, 6.1) + t * 0.4));
  float n = fbm(p + 1.7 * q + t * 0.3);
  float grain = fbm(p * 5.0 + q * 2.0 - t * 0.9);
  float v = clamp(0.5 + n * 0.58 + grain * 0.28, 0.0, 1.0);
  float spots = smoothstep(0.58, 0.8, fbm(p * 0.8 + vec3(3.3) + t * 0.08)) * smoothstep(0.35, 0.55, abs(vObj.y) < 0.6 ? 1.0 : 0.0);
  v *= 1.0 - spots * 0.9;
  vec3 col = mix(vec3(0.5, 0.04, 0.0), vec3(1.0, 0.42, 0.04), smoothstep(0.0, 0.5, v));
  col = mix(col, vec3(1.0, 0.84, 0.42), smoothstep(0.5, 0.84, v));
  col = mix(col, vec3(1.0, 0.98, 0.88), smoothstep(0.84, 1.0, v));
  float mu = max(dot(normalize(vN), normalize(vV)), 0.0);
  col *= 0.5 + 0.5 * pow(mu, 0.55);
  gl_FragColor = vec4(col * 1.32, 1.0);
}`
/** 코로나 — 뒷면 구, 안쪽에서 밝고 바깥으로 흩어지며 노이즈 줄기가 흐른다 */
const CORONA_FRAG = `uniform float time; uniform float strength; varying vec3 vObj; varying vec3 vN; varying vec3 vV;
${SNOISE}
void main(){
  vec3 V = normalize(vV); float d = abs(dot(normalize(vN), V));
  float fall = pow(clamp(d / 0.7, 0.0, 1.0), 2.4);
  float n = fbm(vObj * 2.6 + vec3(0.0, time * 0.05, time * 0.02));
  vec3 col = mix(vec3(1.0, 0.3, 0.04), vec3(1.0, 0.75, 0.35), fall);
  gl_FragColor = vec4(col, fall * (0.55 + 0.45 * n) * strength);
}`

/* 대기 — 뒷면(후광)과 앞면(림 안개)을 같은 셰이더로. 햇빛 방향 쪽이 더 밝다 */
const ATMO_VERT = `varying vec3 vN; varying vec3 vP;
void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`
const ATMO_FRAG = `uniform vec3 color; uniform vec3 sunDir; uniform float strength; uniform float back;
varying vec3 vN; varying vec3 vP;
void main(){
  vec3 V = normalize(-vP); float d = dot(vN, V);
  float rim = back > 0.5 ? pow(clamp(abs(d) / 0.34, 0.0, 1.0), 1.6) : pow(1.0 - max(d, 0.0), 3.2);
  float lit = clamp(dot(vN, sunDir) * 0.7 + 0.45, 0.0, 1.0);
  gl_FragColor = vec4(color, rim * strength * lit);
}`

/* 국경·나라 이름 — 밝기 마스크(흰 선/글자 · 회색 테두리) 를 지구 위에 얹는다. 밤 쪽은 은은하게 */
const BORDER_VERT = `varying vec2 vUv; varying vec3 vWN;
void main(){ vUv = uv; vWN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const BORDER_FRAG = `uniform sampler2D map; uniform vec3 sunDir; uniform float fade; varying vec2 vUv; varying vec3 vWN;
void main(){
  float l = texture2D(map, vUv).r;
  float line = smoothstep(0.5, 0.85, l);
  float shade = smoothstep(0.12, 0.38, l) * (1.0 - line);
  float lit = 0.4 + 0.6 * clamp(dot(normalize(vWN), sunDir) * 1.6 + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(vec3(line) * lit, max(line * 0.95, shade * 0.75) * fade);
}`

/** 값 노이즈 — 표준 재질에 끼워 넣는 근접 미세 디테일 */
const VNOISE = `
float hash3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z); }`

function glowTexture(THREE: Three, inner: string, outer: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, inner)
  grad.addColorStop(0.25, outer)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** 천왕성 식 가는 고리 — 절차적 한 줄 텍스처 */
function thinRingTexture(THREE: Three) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 4
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 1024, 4)
  for (const [u, w, a] of [
    [0.08, 3, 0.35],
    [0.17, 2, 0.25],
    [0.26, 2, 0.3],
    [0.4, 3, 0.4],
    [0.52, 2, 0.28],
    [0.7, 4, 0.55],
    [0.84, 2, 0.3],
    [0.95, 6, 0.85],
  ] as const) {
    g.fillStyle = `rgba(210,235,245,${a})`
    g.fillRect(u * 1024, 0, w, 4)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * 태양계 — three.js. 실제 텍스처(NASA · Solar System Scope)로 행성·달·고리를, 태양은 절차적 셰이더로 그린다.
 *  - 지구: 낮 지도 + 밤 불빛(어두운 쪽에만) + 법선 + 바다 반사 + 구름 층 + 대기 후광 + 국경·나라 이름(Natural Earth)
 *  - 토성: 고리 그림자가 행성에, 행성 그림자가 고리에 진다(셰이더에서 광선 교차). 천왕성: 가는 고리. 목성·토성·화성·해왕성: 위성
 *  - 모든 행성: 가까이 가면 미세 디테일 노이즈가 덧입혀져 텍스처가 뭉개지지 않는다. 대기 림 색은 행성마다
 *  - 끌어서 궤도 회전, 휠·핀치로 거리, 클릭/더블클릭/칩으로 천체에 비행(따라간다), 화살표·+/-·숫자 키
 *  - auto 면 가만히 있을 때 행성을 차례로 찾아가고, 화면 밖이면 그리지 않는다
 */
export function SolarSystem({ auto = true, className }: SolarSystemProps) {
  const host = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<Api | null>(null)
  const autoRef = useRef(auto)
  const reduce = useReducedMotion()
  const [stop, setStop] = useState<Stop>('overview')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    autoRef.current = auto
  })

  useEffect(() => {
    const el = host.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    const coarse = isCoarsePointer()
    let disposed = false
    let cleanup = () => {}

    void import('three').then((THREE) => {
      if (disposed) return
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(coarse ? 1 : 1.5, window.devicePixelRatio || 1))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#02030a')
      const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 400)
      const aniso = Math.min(coarse ? 2 : 8, renderer.capabilities.getMaxAnisotropy())
      const SEG = coarse ? [48, 32] : [96, 64]
      const OCT = coarse ? 4 : 5
      const loader = new THREE.TextureLoader()
      const textures: import('three').Texture[] = []
      const geos: import('three').BufferGeometry[] = []
      const mats: import('three').Material[] = []
      const load = (file: string, srgb = true) =>
        loader.loadAsync(TEX + file).then((t) => {
          if (disposed) {
            t.dispose()
            throw new Error('disposed')
          }
          if (srgb) t.colorSpace = THREE.SRGBColorSpace
          t.anisotropy = aniso
          textures.push(t)
          return t
        })
      const quiet = () => {}
      const sphere = (r: number) => {
        const g = new THREE.SphereGeometry(r, SEG[0]!, SEG[1]!)
        geos.push(g)
        return g
      }
      const keep = <T extends import('three').Material>(m: T) => {
        mats.push(m)
        return m
      }

      // ── 빛: 태양(점광원, 원점) + 아주 약한 환경광(밤 쪽이 완전히 검지 않게)
      scene.add(new THREE.PointLight(0xfff1d6, 2.6, 0, 0))
      scene.add(new THREE.AmbientLight(0x223052, 0.35))

      // ── 별 배경: 점 별 + 은하수(등장방형)
      const starGeo = new THREE.BufferGeometry()
      const starN = coarse ? 900 : 2200
      const sp = new Float32Array(starN * 3)
      for (let i = 0; i < starN; i++) {
        const u = Math.random() * 2 - 1
        const th = Math.random() * Math.PI * 2
        const r = 170 + Math.random() * 60
        const s = Math.sqrt(1 - u * u)
        sp[i * 3] = r * s * Math.cos(th)
        sp[i * 3 + 1] = r * u
        sp[i * 3 + 2] = r * s * Math.sin(th)
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
      geos.push(starGeo)
      scene.add(new THREE.Points(starGeo, keep(new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false }))))
      load('milkyway.jpg')
        .then((t) => {
          t.mapping = THREE.EquirectangularReflectionMapping
          scene.background = t
          scene.backgroundIntensity = 0.5
          scene.backgroundRotation = new THREE.Euler(0, 0, 0.42)
        })
        .catch(quiet)

      /* ── 표준 재질 확장: 근접 디테일 노이즈 · (지구) 밤 불빛/바다 · (토성) 고리 그림자 · (고리) 행성 그림자 */
      type Enh = { detail?: { scale: number; strength: number; stretch?: number }; earth?: boolean; ringShadow?: boolean; planetShadow?: boolean }
      const uSunDir = { value: new THREE.Vector3(0, 0, 1) }
      const uRingAxis = { value: new THREE.Vector3(0, 1, 0) }
      const uRingCenter = { value: new THREE.Vector3() }
      const uRingTex = { value: null as import('three').Texture | null }
      const uRingR = { value: new THREE.Vector2(1, 2) }
      const uPlanetR = { value: 1 }
      const enhance = (mat: StdMat, key: string, o: Enh) => {
        const uDetail = { value: 0 }
        mat.userData.uDetail = uDetail
        const st = o.detail?.stretch ?? 1
        mat.customProgramCacheKey = () => `ss-${key}`
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uDetail = uDetail
          shader.uniforms.uDetailScale = { value: new THREE.Vector3((o.detail?.scale ?? 1) / st, o.detail?.scale ?? 1, (o.detail?.scale ?? 1) / st) }
          shader.uniforms.sunDir = uSunDir
          shader.uniforms.uRingAxis = uRingAxis
          shader.uniforms.uRingCenter = uRingCenter
          shader.uniforms.uRingTex = uRingTex
          shader.uniforms.uRingR = uRingR
          shader.uniforms.uPlanetR = uPlanetR
          shader.vertexShader = `varying vec3 vObjP; varying vec3 vWP; varying vec3 vWN;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvObjP = normalize(position); vWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * normal);')
          let inject = ''
          if (o.detail) inject += `\nfloat dn = vnoise(vObjP * uDetailScale) * 0.62 + vnoise(vObjP * uDetailScale * 2.9 + 7.0) * 0.38; diffuseColor.rgb *= 1.0 + (dn - 0.5) * uDetail;`
          if (o.ringShadow)
            inject += `\n{ vec3 S = normalize(-vWP); float den = dot(S, uRingAxis); if (abs(den) > 1e-4) { float t = dot(uRingCenter - vWP, uRingAxis) / den; if (t > 0.0) { float rr = length(vWP + S * t - uRingCenter); float u = (rr - uRingR.x) / (uRingR.y - uRingR.x); if (u > 0.0 && u < 1.0) { float a = texture2D(uRingTex, vec2(u, 0.5)).a; diffuseColor.rgb *= 1.0 - a * 0.88; } } } }`
          if (o.planetShadow)
            inject += `\n{ vec3 S = normalize(-vWP); vec3 oc = vWP - uRingCenter; float b = dot(oc, S); float c = dot(oc, oc) - uPlanetR * uPlanetR; float disc = b * b - c; if (disc > 0.0 && -b - sqrt(disc) > 0.0) diffuseColor.rgb *= 0.1; }`
          shader.fragmentShader = `varying vec3 vObjP; varying vec3 vWP; varying vec3 vWN; uniform float uDetail; uniform vec3 uDetailScale; uniform vec3 sunDir; uniform vec3 uRingAxis; uniform vec3 uRingCenter; uniform sampler2D uRingTex; uniform vec2 uRingR; uniform float uPlanetR;\n${VNOISE}\n${shader.fragmentShader}`.replace('#include <map_fragment>', `#include <map_fragment>${inject}`)
          if (o.earth)
            shader.fragmentShader = shader.fragmentShader
              .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat ndl = dot(normalize(vWN), sunDir); totalEmissiveRadiance *= smoothstep(0.12, -0.18, ndl);')
              .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\nroughnessFactor *= 1.0 - texture2D(roughnessMap, vRoughnessMapUv).g * 0.82;\n#endif')
        }
        return mat
      }

      // ── 천체 트리: anchor(궤도 위 위치) → tilt(자전축 기울기) → mesh(자전). 위성은 anchor 에 붙어 기울기와 무관하게 돈다
      type Node = { body: SolarBody; anchor: Object3D; tilt: Object3D; mesh: Mesh; spin: number; angle: number; extras: Mesh[]; moons: { mesh: Mesh; orbit: number; period: number; angle: number }[] }
      const nodes = new Map<string, Node>()
      const meshes: Mesh[] = []
      const timed: ShaderMat[] = []
      const atmos: ShaderMat[] = []
      let borderMat: ShaderMat | null = null
      let saturn: Node | null = null

      for (const body of SOLAR_BODIES) {
        const isSun = body.id === 'sun'
        const geo = sphere(body.r)
        let mat: import('three').Material
        if (isSun) {
          const sm = keep(new THREE.ShaderMaterial({ vertexShader: SUN_VERT, fragmentShader: SUN_FRAG, uniforms: { time: { value: 0 } }, defines: { OCT } }))
          timed.push(sm)
          mat = sm
          setReady(true)
        } else {
          mat = keep(enhance(new THREE.MeshStandardMaterial({ color: body.color, roughness: 1, metalness: 0 }), body.id, { detail: body.detail, earth: body.id === 'earth', ringShadow: body.id === 'saturn' }))
        }
        const mesh = new THREE.Mesh(geo, mat)
        mesh.userData.id = body.id
        meshes.push(mesh)
        const tilt = new THREE.Object3D()
        tilt.rotation.z = THREE.MathUtils.degToRad(body.tilt)
        tilt.add(mesh)
        const anchor = new THREE.Object3D()
        anchor.add(tilt)
        const parent = body.parent ? nodes.get(body.parent)?.anchor : scene
        ;(parent ?? scene).add(anchor)
        // 자전 — 지구 기준 약 50초에 한 바퀴(실제 비율은 너무 빨라 보인다). 역행은 음수
        const spin = THREE.MathUtils.clamp((0.125 * 24) / Math.abs(body.day), 0.008, 0.4) * Math.sign(body.day)
        const node: Node = { body, anchor, tilt, mesh, spin, angle: (SOLAR_BODIES.indexOf(body) * 2.4) % (Math.PI * 2), extras: [], moons: [] }
        nodes.set(body.id, node)
        if (body.id === 'saturn') saturn = node

        if (body.tex && !isSun) {
          const sm = mat as StdMat
          load(body.tex)
            .then((t) => {
              sm.map = t
              sm.color.set('#ffffff')
              sm.needsUpdate = true
            })
            .catch(quiet)
        }

        if (isSun) {
          // 코로나(뒷면 구) + 부드러운 후광 스프라이트 두 겹
          const cm = keep(new THREE.ShaderMaterial({ vertexShader: SUN_VERT, fragmentShader: CORONA_FRAG, uniforms: { time: { value: 0 }, strength: { value: 0.9 } }, defines: { OCT: 3 }, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending }))
          timed.push(cm)
          const corona = new THREE.Mesh(sphere(body.r * 1.5), cm)
          mesh.add(corona)
          const glow = glowTexture(THREE, 'rgba(255,236,190,1)', 'rgba(255,150,60,0.55)')
          textures.push(glow)
          for (const [scale, op] of [
            [body.r * 6, 0.5],
            [body.r * 2.9, 0.8],
          ] as const) {
            const sprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })))
            sprite.scale.setScalar(scale)
            mesh.add(sprite)
          }
        }

        if (body.id === 'earth') {
          const em = mat as StdMat
          em.emissive = new THREE.Color('#ffd9a0')
          em.emissiveIntensity = 1.6
          em.normalScale = new THREE.Vector2(0.6, 0.6)
          Promise.all([load('earth-night.jpg'), load('earth-normal.jpg', false), load('earth-spec.jpg', false)])
            .then(([night, normal, spec]) => {
              em.emissiveMap = night
              em.normalMap = normal
              em.roughnessMap = spec
              em.needsUpdate = true
            })
            .catch(quiet)
          // 국경·나라 이름
          const bm = keep(new THREE.ShaderMaterial({ vertexShader: BORDER_VERT, fragmentShader: BORDER_FRAG, uniforms: { map: { value: null }, sunDir: uSunDir, fade: { value: 0 } }, transparent: true, depthWrite: false }))
          borderMat = bm
          const borders = new THREE.Mesh(sphere(body.r * 1.004), bm)
          mesh.add(borders)
          load('earth-borders.jpg', false)
            .then((t) => {
              bm.uniforms.map!.value = t
            })
            .catch(quiet)
          // 구름 — 조금 큰 구, 알파로만. 지구보다 살짝 빨리 돈다
          const cm = keep(new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, roughness: 1 }))
          const clouds = new THREE.Mesh(sphere(body.r * 1.016), cm)
          mesh.add(clouds)
          node.extras.push(clouds)
          load('earth-clouds.jpg', false)
            .then((t) => {
              cm.alphaMap = t
              cm.opacity = 0.9
              cm.needsUpdate = true
            })
            .catch(quiet)
        }

        if (body.atmo) {
          for (const [scale, back, strength] of [
            [1.075, 1, body.atmo.back],
            [1.0, 0, body.atmo.strength],
          ] as const) {
            const am = keep(new THREE.ShaderMaterial({ vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, uniforms: { color: { value: new THREE.Color(body.atmo.color) }, sunDir: { value: new THREE.Vector3() }, strength: { value: strength }, back: { value: back } }, transparent: true, depthWrite: false, side: back ? THREE.BackSide : THREE.FrontSide, blending: THREE.AdditiveBlending }))
            am.userData.node = node
            atmos.push(am)
            mesh.add(new THREE.Mesh(sphere(body.r * scale), am))
          }
        }

        if (body.ring) {
          const { inner, outer, tex } = body.ring
          const rg = new THREE.RingGeometry(body.r * inner, body.r * outer, 192, 1)
          // 고리 텍스처는 안쪽→바깥쪽 한 줄: UV 를 반지름 방향으로 다시 편다
          const pos = rg.attributes.position!
          const uv = rg.attributes.uv!
          for (let i = 0; i < pos.count; i++) {
            const rr = Math.hypot(pos.getX(i), pos.getY(i))
            uv.setXY(i, (rr - body.r * inner) / (body.r * (outer - inner)), 0.5)
          }
          geos.push(rg)
          const rm = keep(enhance(new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: tex ? 0 : 1, side: THREE.DoubleSide, roughness: 0.9, metalness: 0, depthWrite: false }), `ring-${body.id}`, { planetShadow: body.id === 'saturn' }))
          const ring = new THREE.Mesh(rg, rm)
          ring.rotation.x = -Math.PI / 2
          tilt.add(ring)
          if (tex) {
            load(tex)
              .then((t) => {
                rm.map = t
                rm.opacity = 1
                rm.needsUpdate = true
                if (body.id === 'saturn') uRingTex.value = t
              })
              .catch(quiet)
          } else {
            const t = thinRingTexture(THREE)
            textures.push(t)
            rm.map = t
            rm.needsUpdate = true
          }
          if (body.id === 'saturn') {
            uRingR.value.set(body.r * inner, body.r * outer)
            uPlanetR.value = body.r
          }
        }

        for (const m of body.moons ?? []) {
          const mm = new THREE.Mesh(sphere(m.r), keep(new THREE.MeshStandardMaterial({ color: m.color, roughness: 1 })))
          anchor.add(mm)
          node.moons.push({ mesh: mm, orbit: body.r * m.orbit, period: Math.max(Math.abs(m.period), 2) * Math.sign(m.period), angle: Math.random() * Math.PI * 2 })
        }

        if (body.orbit > 0 && !body.parent) {
          const n = 256
          const op = new Float32Array(n * 3)
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2
            op[i * 3] = Math.cos(a) * body.orbit
            op[i * 3 + 2] = Math.sin(a) * body.orbit
          }
          const og = new THREE.BufferGeometry()
          og.setAttribute('position', new THREE.BufferAttribute(op, 3))
          geos.push(og)
          scene.add(new THREE.LineLoop(og, keep(new THREE.LineBasicMaterial({ color: 0x8fa6ff, transparent: true, opacity: 0.16 }))))
        }
      }

      // ── 카메라: 목표 주위 궤도(yaw·pitch·dist). 따라가는 천체가 있으면 목표가 매 프레임 그 위치
      const cam = { yaw: 0.9, pitch: 0.42, dist: 62, target: new THREE.Vector3() }
      const goal = { yaw: 0.9, pitch: 0.42, dist: 62, target: new THREE.Vector3() }
      let follow: Node | null = null
      const tmp = new THREE.Vector3()
      const q = new THREE.Quaternion()
      const distFor = (b: SolarBody) => (b.id === 'sun' ? b.r * 4.2 : Math.max(b.r * 4.6, 1.4))
      let lastInteraction = performance.now()
      let lastTour = performance.now()
      let tourIdx = 0
      const stops = SOLAR_STOPS

      const flyTo = (id: Stop, byUser = true) => {
        if (byUser) lastInteraction = performance.now()
        setStop(id)
        if (id === 'overview') {
          follow = null
          goal.target.set(0, 0, 0)
          goal.dist = 62
          goal.pitch = 0.42
          return
        }
        const node = nodes.get(id)
        if (!node) return
        follow = node
        goal.dist = distFor(node.body)
        goal.pitch = 0.22
        goal.yaw = cam.yaw + 0.9
      }
      const zoomBy = (f: number) => {
        lastInteraction = performance.now()
        goal.dist = THREE.MathUtils.clamp(goal.dist * f, follow ? follow.body.r * 1.3 : 1.2, 140)
      }
      api.current = { flyTo, zoomBy, reset: () => flyTo('overview') }

      // ── 입력
      const pointers = new Map<number, { x: number; y: number }>()
      let pinch = 0
      let dragged = false
      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const pick = (x: number, y: number) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        const hit = raycaster.intersectObjects(meshes, false)[0]
        return hit ? (hit.object.userData.id as Stop) : null
      }
      const ignore = (e: Event) => !!(e.target as HTMLElement).closest('[data-ef-ignore]')
      const onDown = (e: PointerEvent) => {
        if (ignore(e)) return
        lastInteraction = performance.now()
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        dragged = false
        el.setPointerCapture(e.pointerId)
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          pinch = Math.hypot(a!.x - b!.x, a!.y - b!.y)
        }
      }
      const onMove = (e: PointerEvent) => {
        const p = pointers.get(e.pointerId)
        if (!p) return
        lastInteraction = performance.now()
        if (pointers.size === 2) {
          p.x = e.clientX
          p.y = e.clientY
          const [a, b] = [...pointers.values()]
          const d = Math.hypot(a!.x - b!.x, a!.y - b!.y)
          if (pinch > 0) zoomBy(pinch / d)
          pinch = d
          return
        }
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true
        goal.yaw -= dx * 0.006
        goal.pitch = THREE.MathUtils.clamp(goal.pitch + dy * 0.005, -1.35, 1.35)
        p.x = e.clientX
        p.y = e.clientY
      }
      const onUp = (e: PointerEvent) => {
        pointers.delete(e.pointerId)
        pinch = 0
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      }
      const onWheel = (e: WheelEvent) => {
        if (ignore(e)) return
        e.preventDefault()
        zoomBy(Math.exp(e.deltaY * 0.0012))
      }
      const onDbl = (e: MouseEvent) => {
        if (ignore(e)) return
        const id = pick(e.clientX, e.clientY)
        if (id) flyTo(id)
      }
      const onClick = (e: MouseEvent) => {
        if (dragged || ignore(e)) return
        const id = pick(e.clientX, e.clientY)
        if (id) flyTo(id)
      }
      const onKey = (e: KeyboardEvent) => {
        const k = e.key
        if (k === 'ArrowLeft') goal.yaw -= 0.18
        else if (k === 'ArrowRight') goal.yaw += 0.18
        else if (k === 'ArrowUp') goal.pitch = Math.min(1.35, goal.pitch + 0.12)
        else if (k === 'ArrowDown') goal.pitch = Math.max(-1.35, goal.pitch - 0.12)
        else if (k === '+' || k === '=') zoomBy(0.7)
        else if (k === '-' || k === '_') zoomBy(1 / 0.7)
        else if (k === '0') flyTo('overview')
        else if (/^[1-9]$/.test(k)) {
          const id = stops[Number(k)]
          if (id) flyTo(id)
        } else return
        e.preventDefault()
        lastInteraction = performance.now()
      }
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointercancel', onUp)
      el.addEventListener('wheel', onWheel, { passive: false })
      el.addEventListener('dblclick', onDbl)
      el.addEventListener('click', onClick)
      el.addEventListener('keydown', onKey)

      // ── 크기 · 가시성
      const resize = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(el)
      let visible = true
      let raf = 0
      const io = new IntersectionObserver(([en]) => {
        visible = !!en?.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      })
      io.observe(el)

      // ── 루프
      let last = performance.now()
      let time = 0
      const tick = (now: number) => {
        raf = 0
        if (disposed) return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const days = reduce ? 0 : dt * DAYS_PER_SEC
        if (!reduce) time += dt
        for (const m of timed) m.uniforms.time!.value = time

        // 공전·자전·위성
        for (const node of nodes.values()) {
          const { body, anchor, mesh } = node
          if (body.orbit > 0) {
            node.angle += (days / body.period) * Math.PI * 2
            anchor.position.set(Math.cos(node.angle) * body.orbit, body.parent ? Math.sin(node.angle) * body.orbit * 0.09 : 0, Math.sin(node.angle) * body.orbit)
          }
          if (!reduce) mesh.rotation.y += node.spin * dt
          for (const ex of node.extras) ex.rotation.y += node.spin * dt * 0.18
          for (const m of node.moons) {
            m.angle += (days / m.period) * Math.PI * 2
            m.mesh.position.set(Math.cos(m.angle) * m.orbit, 0, Math.sin(m.angle) * m.orbit)
          }
        }
        // 햇빛 방향(태양은 원점): 지구용 월드 방향 · 대기 셰이더용 카메라 공간
        const earth = nodes.get('earth')
        if (earth) {
          earth.anchor.getWorldPosition(tmp)
          uSunDir.value.copy(tmp).multiplyScalar(-1).normalize()
        }
        for (const am of atmos) {
          const n = am.userData.node as Node
          n.anchor.getWorldPosition(tmp)
          ;(am.uniforms.sunDir!.value as Vector3).copy(tmp).multiplyScalar(-1).normalize().transformDirection(camera.matrixWorldInverse)
        }
        // 토성 고리 그림자 — 고리 축(기울기 그룹의 Y)과 중심
        if (saturn) {
          saturn.anchor.getWorldPosition(uRingCenter.value)
          saturn.tilt.getWorldQuaternion(q)
          uRingAxis.value.set(0, 1, 0).applyQuaternion(q)
        }

        // 유휴 투어
        if (autoRef.current && !reduce && now - lastInteraction > IDLE_MS && now - lastTour > TOUR_MS) {
          lastTour = now
          tourIdx = (tourIdx + 1) % stops.length
          flyTo(stops[tourIdx]!, false)
        }
        if (follow && now - lastInteraction > 1500) goal.yaw += 0.07 * dt // 천체를 천천히 한 바퀴

        // 카메라 부드럽게
        if (follow) follow.anchor.getWorldPosition(goal.target)
        cam.target.lerp(goal.target, 1 - Math.pow(0.0025, dt))
        const k = 1 - Math.pow(0.012, dt)
        cam.yaw += (goal.yaw - cam.yaw) * k
        cam.pitch += (goal.pitch - cam.pitch) * k
        cam.dist += (goal.dist - cam.dist) * k
        camera.position.set(cam.target.x + Math.cos(cam.pitch) * Math.sin(cam.yaw) * cam.dist, cam.target.y + Math.sin(cam.pitch) * cam.dist, cam.target.z + Math.cos(cam.pitch) * Math.cos(cam.yaw) * cam.dist)
        camera.lookAt(cam.target)

        // 근접 디테일 — 따라가는 천체에 가까울수록 미세 노이즈를 켠다. 국경은 지구 근처에서만 또렷하게
        const near = follow ? THREE.MathUtils.clamp((9 - cam.dist / follow.body.r) / 6, 0, 1) : 0
        for (const node of nodes.values()) {
          const u = (node.mesh.material as StdMat).userData.uDetail as { value: number } | undefined
          if (u && node.body.detail) u.value = (node === follow ? near : 0) * node.body.detail.strength
        }
        if (borderMat) borderMat.uniforms.fade!.value = follow?.body.id === 'earth' || follow?.body.id === 'moon' ? 0.35 + 0.65 * near : 0.25

        renderer.render(scene, camera)
        if (visible) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(raf)
        raf = 0
        ro.disconnect()
        io.disconnect()
        api.current = null
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
        el.removeEventListener('pointercancel', onUp)
        el.removeEventListener('wheel', onWheel)
        el.removeEventListener('dblclick', onDbl)
        el.removeEventListener('click', onClick)
        el.removeEventListener('keydown', onKey)
        geos.forEach((g) => g.dispose())
        mats.forEach((m) => m.dispose())
        textures.forEach((t) => t.dispose())
        renderer.dispose()
        window.setTimeout(() => {
          if (!canvas.isConnected) renderer.forceContextLoss()
        }, 0)
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [reduce])

  const body = stop === 'overview' ? null : SOLAR_BODIES.find((b) => b.id === stop)

  return (
    <div ref={host} tabIndex={0} aria-label="태양계 — 끌어서 돌리고, 휠로 다가가고, 행성을 누르면 날아가요. 화살표·+/-·숫자 키" className={cn('group/ss relative h-full w-full cursor-grab touch-none overflow-hidden bg-[#02030a] outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-inset active:cursor-grabbing', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
      {!ready && <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[11px] text-white/40">행성 불러오는 중…</div>}
      {/* 천체 칩 */}
      <div data-ef-ignore className="absolute inset-x-0 top-0 flex gap-1.5 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onPointerDown={(e) => e.stopPropagation()}>
        {SOLAR_STOPS.map((id) => {
          const b = SOLAR_BODIES.find((x) => x.id === id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => api.current?.flyTo(id)}
              aria-pressed={stop === id}
              className={cn('shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10.5px] backdrop-blur-sm transition-colors', stop === id ? 'border-accent bg-accent text-white' : 'border-white/15 bg-black/40 text-white/75 hover:border-white/40 hover:text-white')}
            >
              {b ? b.name : '전체'}
            </button>
          )
        })}
      </div>
      {/* 사실 카드 · 조작 */}
      <div data-ef-ignore className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-2 text-white/75">
        <div className="max-w-[min(100%,300px)] rounded-md bg-black/45 px-2.5 py-2 backdrop-blur-sm">
          {body ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-semibold text-white">{body.name}</span>
                <span className="font-mono text-[10px] tracking-wider text-white/45 uppercase">{body.en}</span>
              </div>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[10.5px]">
                {[
                  [body.id === 'moon' ? '거리' : '태양까지', body.facts.dist],
                  ['지름', body.facts.diameter],
                  ['하루', body.facts.day],
                  ['1년', body.facts.year],
                  [body.id === 'sun' ? '행성' : '위성', body.facts.moons],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="text-white/85">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-1 text-[10.5px] text-white/55">{body.facts.note}</p>
            </>
          ) : (
            <>
              <div className="text-[13px] font-semibold text-white">태양계</div>
              <p className="mt-0.5 font-mono text-[10.5px] text-white/55">1초 = {DAYS_PER_SEC}일 · 크기·거리는 보기 좋게 압축 · 자전축·방향·순서는 실제</p>
            </>
          )}
        </div>
        <div className="pointer-events-auto flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => api.current?.zoomBy(0.7)} aria-label="다가가기" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            +
          </button>
          <button type="button" onClick={() => api.current?.zoomBy(1 / 0.7)} aria-label="물러나기" className="h-8 w-8 rounded-md border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm hover:text-white">
            −
          </button>
          <button type="button" onClick={() => api.current?.reset()} aria-label="전체 보기" className="h-8 rounded-md border border-white/15 bg-black/40 px-2.5 text-white/80 backdrop-blur-sm hover:text-white">
            전체
          </button>
        </div>
      </div>
    </div>
  )
}
