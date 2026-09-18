/**
 * 태양계 천체 — 실제 물리량(사실 카드)과 화면용 배치.
 * 화면 반지름·궤도는 실제 비율이 아니다(실제 비율이면 행성이 점으로 보인다). 순서·상대 크기·색·자전축 기울기·자전 방향은 실제를 따른다.
 * 텍스처: NASA(Blue Marble · Black Marble · three.js 지구 맵) · Solar System Scope(CC BY 4.0) · 국경/나라 이름은 Natural Earth.
 */
export interface SolarMoon {
  name: string
  r: number
  orbit: number
  /** 공전 주기(일) */
  period: number
  color: string
}

export interface SolarBody {
  id: string
  name: string
  en: string
  /** 화면 반지름 */
  r: number
  /** 화면 궤도 반지름(0 = 태양) */
  orbit: number
  /** 공전 주기(일) */
  period: number
  /** 자전 주기(시간, 음수 = 역행) */
  day: number
  /** 자전축 기울기(도) */
  tilt: number
  /** 텍스처 파일(public/space). 태양은 절차적 셰이더라 없음 */
  tex?: string
  /** 텍스처가 오기 전 색 */
  color: string
  /** 위성 — 이 천체 주위를 돈다 */
  parent?: string
  /** 고리 — tex 가 없으면 절차적(가는 고리) */
  ring?: { inner: number; outer: number; tex?: string }
  /** 대기 림 — 색·세기. back 은 뒷면 후광 세기 */
  atmo?: { color: string; strength: number; back: number }
  /** 가까이 갔을 때 덧입히는 미세 디테일 노이즈 — scale(빈도)·strength(세기)·stretch(가로로 늘림, 가스 행성 띠) */
  detail?: { scale: number; strength: number; stretch?: number }
  /** 장식 위성(칩 없음) */
  moons?: SolarMoon[]
  facts: { dist: string; diameter: string; day: string; year: string; moons: string; note: string }
}

export const SOLAR_BODIES: SolarBody[] = [
  { id: 'sun', name: '태양', en: 'Sun', r: 3.4, orbit: 0, period: 0, day: 609, tilt: 7.25, color: '#ffb340', facts: { dist: '—', diameter: '1,392,700 km', day: '25.4일(적도)', year: '—', moons: '행성 8', note: '표면 5,500 °C · 대류 세포와 흑점이 흐른다 · 태양계 질량의 99.86%' } },
  { id: 'mercury', name: '수성', en: 'Mercury', r: 0.3, orbit: 6.2, period: 88, day: 1407.6, tilt: 0.03, tex: 'mercury.jpg', color: '#8d8a84', detail: { scale: 60, strength: 0.35 }, facts: { dist: '5,790만 km', diameter: '4,879 km', day: '58.6일', year: '88일', moons: '0', note: '낮 430 °C · 밤 −180 °C · 크레이터로 뒤덮인 표면' } },
  { id: 'venus', name: '금성', en: 'Venus', r: 0.52, orbit: 8.4, period: 224.7, day: -5832.5, tilt: 177.4, tex: 'venus.jpg', color: '#d9b57a', atmo: { color: '#f1d9a6', strength: 0.7, back: 1.1 }, detail: { scale: 22, strength: 0.14, stretch: 3 }, facts: { dist: '1억 820만 km', diameter: '12,104 km', day: '243일(역행)', year: '225일', moons: '0', note: '두꺼운 이산화탄소 구름 · 표면 465 °C · 거꾸로 돈다' } },
  { id: 'earth', name: '지구', en: 'Earth', r: 0.55, orbit: 11, period: 365.25, day: 23.93, tilt: 23.44, tex: 'earth-day.jpg', color: '#3b6fd3', atmo: { color: '#6fb4ff', strength: 0.55, back: 0.95 }, detail: { scale: 70, strength: 0.16 }, facts: { dist: '1억 4,960만 km', diameter: '12,742 km', day: '23시간 56분', year: '365.25일', moons: '1', note: '낮 · 밤의 도시 불빛 · 구름 · 바다 반사 · 대기 · 국경과 나라 이름' } },
  { id: 'moon', name: '달', en: 'Moon', r: 0.15, orbit: 1.1, period: 27.3, day: 655.7, tilt: 6.7, tex: 'moon.jpg', color: '#b8b5ae', parent: 'earth', detail: { scale: 80, strength: 0.4 }, facts: { dist: '지구에서 384,400 km', diameter: '3,474 km', day: '27.3일(동주기)', year: '27.3일(지구 공전)', moons: '—', note: '언제나 같은 면이 지구를 본다 · 바다(mare)와 크레이터' } },
  { id: 'mars', name: '화성', en: 'Mars', r: 0.38, orbit: 13.8, period: 687, day: 24.62, tilt: 25.19, tex: 'mars.jpg', color: '#c1623c', atmo: { color: '#f0a070', strength: 0.22, back: 0.35 }, detail: { scale: 60, strength: 0.3 }, moons: [
    { name: 'Phobos', r: 0.018, orbit: 0.62, period: 0.32, color: '#8b8078' },
    { name: 'Deimos', r: 0.012, orbit: 0.9, period: 1.26, color: '#9a9088' },
  ], facts: { dist: '2억 2,790만 km', diameter: '6,779 km', day: '24시간 37분', year: '687일', moons: '2', note: '올림푸스 몬스 21 km · 마리네리스 협곡 · 극관' } },
  { id: 'jupiter', name: '목성', en: 'Jupiter', r: 1.7, orbit: 19.5, period: 4332.6, day: 9.93, tilt: 3.13, tex: 'jupiter.jpg', color: '#c9a77c', atmo: { color: '#e8d2b0', strength: 0.2, back: 0.3 }, detail: { scale: 40, strength: 0.14, stretch: 6 }, moons: [
    { name: 'Io', r: 0.07, orbit: 2.6, period: 1.77, color: '#e2c77a' },
    { name: 'Europa', r: 0.06, orbit: 3.2, period: 3.55, color: '#d9cfc0' },
    { name: 'Ganymede', r: 0.1, orbit: 3.9, period: 7.15, color: '#a8998a' },
    { name: 'Callisto', r: 0.09, orbit: 4.8, period: 16.7, color: '#7d7368' },
  ], facts: { dist: '7억 7,850만 km', diameter: '139,820 km', day: '9시간 56분', year: '11.9년', moons: '95', note: '대적점 — 지구보다 큰 폭풍 · 갈릴레이 위성 4개' } },
  { id: 'saturn', name: '토성', en: 'Saturn', r: 1.45, orbit: 26.5, period: 10759, day: 10.56, tilt: 26.73, tex: 'saturn.jpg', color: '#d8c38e', ring: { inner: 1.25, outer: 2.35, tex: 'saturn-ring.png' }, atmo: { color: '#f0e2b8', strength: 0.18, back: 0.25 }, detail: { scale: 40, strength: 0.12, stretch: 6 }, moons: [
    { name: 'Titan', r: 0.09, orbit: 3.4, period: 15.9, color: '#d8a44a' },
    { name: 'Rhea', r: 0.04, orbit: 2.75, period: 4.5, color: '#cfcac0' },
  ], facts: { dist: '14억 3,400만 km', diameter: '116,460 km', day: '10시간 33분', year: '29.5년', moons: '146', note: '고리 — 얼음 조각, 두께는 겨우 수십 m · 고리 그림자가 행성에 진다' } },
  { id: 'uranus', name: '천왕성', en: 'Uranus', r: 0.9, orbit: 33, period: 30687, day: -17.24, tilt: 97.77, tex: 'uranus.jpg', color: '#9fd8e6', ring: { inner: 1.6, outer: 2.0 }, atmo: { color: '#bdf0ff', strength: 0.35, back: 0.5 }, detail: { scale: 30, strength: 0.08, stretch: 5 }, facts: { dist: '28억 7,100만 km', diameter: '50,724 km', day: '17시간 14분(역행)', year: '84년', moons: '28', note: '누워서 돈다 — 자전축 98° · 가는 고리 13개' } },
  { id: 'neptune', name: '해왕성', en: 'Neptune', r: 0.87, orbit: 38.5, period: 60190, day: 16.11, tilt: 28.32, tex: 'neptune.jpg', color: '#3f6fe0', atmo: { color: '#7fa4ff', strength: 0.35, back: 0.5 }, detail: { scale: 30, strength: 0.12, stretch: 5 }, moons: [{ name: 'Triton', r: 0.06, orbit: 2.2, period: -5.88, color: '#d8cfc4' }], facts: { dist: '44억 9,500만 km', diameter: '49,244 km', day: '16시간 6분', year: '164.8년', moons: '16', note: '시속 2,000 km 바람 · 트리톤은 거꾸로 돈다' } },
]

/** 칩 순서 — 전체 보기 다음 안쪽부터 */
export const SOLAR_STOPS = ['overview', ...SOLAR_BODIES.map((b) => b.id)] as const
