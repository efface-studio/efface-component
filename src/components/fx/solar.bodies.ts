/**
 * 태양계 천체 — 실제 물리량(사실 카드)과 화면용 배치.
 * 화면 반지름·궤도는 실제 비율이 아니다(실제 비율이면 행성이 점으로 보인다). 순서·상대 크기·색·자전축 기울기는 실제를 따른다.
 * 텍스처: NASA(Blue Marble · Black Marble · three.js 지구 맵) · Solar System Scope(CC BY 4.0).
 */
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
  /** 텍스처 파일(public/space) */
  tex: string
  /** 텍스처가 오기 전 색 */
  color: string
  /** 위성 — 이 천체 주위를 돈다 */
  parent?: string
  ring?: { inner: number; outer: number; tex: string }
  facts: { dist: string; diameter: string; day: string; year: string; moons: string; note: string }
}

export const SOLAR_BODIES: SolarBody[] = [
  { id: 'sun', name: '태양', en: 'Sun', r: 3.4, orbit: 0, period: 0, day: 609, tilt: 7.25, tex: 'sun.jpg', color: '#ffb340', facts: { dist: '—', diameter: '1,392,700 km', day: '25.4일(적도)', year: '—', moons: '행성 8', note: '표면 5,500 °C · 태양계 질량의 99.86%' } },
  { id: 'mercury', name: '수성', en: 'Mercury', r: 0.3, orbit: 6.2, period: 88, day: 1407.6, tilt: 0.03, tex: 'mercury.jpg', color: '#8d8a84', facts: { dist: '5,790만 km', diameter: '4,879 km', day: '58.6일', year: '88일', moons: '0', note: '낮 430 °C · 밤 −180 °C' } },
  { id: 'venus', name: '금성', en: 'Venus', r: 0.52, orbit: 8.4, period: 224.7, day: -5832.5, tilt: 177.4, tex: 'venus.jpg', color: '#d9b57a', facts: { dist: '1억 820만 km', diameter: '12,104 km', day: '243일(역행)', year: '225일', moons: '0', note: '두꺼운 이산화탄소 구름 · 표면 465 °C' } },
  { id: 'earth', name: '지구', en: 'Earth', r: 0.55, orbit: 11, period: 365.25, day: 23.93, tilt: 23.44, tex: 'earth-day.jpg', color: '#3b6fd3', facts: { dist: '1억 4,960만 km', diameter: '12,742 km', day: '23시간 56분', year: '365.25일', moons: '1', note: '낮 · 밤의 도시 불빛 · 구름 · 바다 반사 · 대기' } },
  { id: 'moon', name: '달', en: 'Moon', r: 0.15, orbit: 1.1, period: 27.3, day: 655.7, tilt: 6.7, tex: 'moon.jpg', color: '#b8b5ae', parent: 'earth', facts: { dist: '지구에서 384,400 km', diameter: '3,474 km', day: '27.3일(동주기)', year: '27.3일(지구 공전)', moons: '—', note: '언제나 같은 면이 지구를 본다' } },
  { id: 'mars', name: '화성', en: 'Mars', r: 0.38, orbit: 13.8, period: 687, day: 24.62, tilt: 25.19, tex: 'mars.jpg', color: '#c1623c', facts: { dist: '2억 2,790만 km', diameter: '6,779 km', day: '24시간 37분', year: '687일', moons: '2', note: '올림푸스 몬스 21 km · 마리네리스 협곡' } },
  { id: 'jupiter', name: '목성', en: 'Jupiter', r: 1.7, orbit: 19.5, period: 4332.6, day: 9.93, tilt: 3.13, tex: 'jupiter.jpg', color: '#c9a77c', facts: { dist: '7억 7,850만 km', diameter: '139,820 km', day: '9시간 56분', year: '11.9년', moons: '95', note: '대적점 — 지구보다 큰 폭풍' } },
  { id: 'saturn', name: '토성', en: 'Saturn', r: 1.45, orbit: 26.5, period: 10759, day: 10.56, tilt: 26.73, tex: 'saturn.jpg', color: '#d8c38e', ring: { inner: 1.25, outer: 2.35, tex: 'saturn-ring.png' }, facts: { dist: '14억 3,400만 km', diameter: '116,460 km', day: '10시간 33분', year: '29.5년', moons: '146', note: '고리 — 얼음 조각, 두께는 겨우 수십 m' } },
  { id: 'uranus', name: '천왕성', en: 'Uranus', r: 0.9, orbit: 33, period: 30687, day: -17.24, tilt: 97.77, tex: 'uranus.jpg', color: '#9fd8e6', facts: { dist: '28억 7,100만 km', diameter: '50,724 km', day: '17시간 14분(역행)', year: '84년', moons: '28', note: '누워서 돈다 — 자전축 98°' } },
  { id: 'neptune', name: '해왕성', en: 'Neptune', r: 0.87, orbit: 38.5, period: 60190, day: 16.11, tilt: 28.32, tex: 'neptune.jpg', color: '#3f6fe0', facts: { dist: '44억 9,500만 km', diameter: '49,244 km', day: '16시간 6분', year: '164.8년', moons: '16', note: '시속 2,000 km 바람' } },
]

/** 칩 순서 — 전체 보기 다음 안쪽부터 */
export const SOLAR_STOPS = ['overview', ...SOLAR_BODIES.map((b) => b.id)] as const
