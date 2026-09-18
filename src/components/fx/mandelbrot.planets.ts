/** 이름 붙은 명소 — "행성". 좌표는 JS double 로 들고 셰이더엔 섭동(perturbation)으로 넘긴다 */
export const MANDELBROT_PLANETS: { id: string; name: string; x: number; y: number; zoom: number }[] = [
  { id: 'home', name: '전체', x: -0.6, y: 0, zoom: 1.35 },
  { id: 'seahorse', name: '해마 골짜기', x: -0.743643887037151, y: 0.13182590420533, zoom: 4e-6 },
  { id: 'elephant', name: '코끼리 골짜기', x: 0.2549870375144766, y: -0.0005679790528465, zoom: 1.5e-5 },
  { id: 'spiral', name: '삼중 나선', x: -0.088, y: 0.654, zoom: 0.004 },
  { id: 'mini', name: '미니 만델브로트', x: -1.7687788333, y: -0.0017389964, zoom: 3e-6 },
  { id: 'antenna', name: '안테나', x: -1.6, y: 0, zoom: 0.06 },
  { id: 'misiurewicz', name: '미시우레비치 점', x: -0.10109636384562, y: 0.95628651080914, zoom: 1e-5 },
  { id: 'dendrite', name: '번개 나무', x: -0.235125, y: 0.827215, zoom: 5e-4 },
  { id: 'deep', name: '심우주', x: -0.74364388703715, y: 0.13182590420533, zoom: 2e-10 },
]
