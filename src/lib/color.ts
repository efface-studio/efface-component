/** `#rrggbb` / `#rgb` → 0..1 RGB. 그 밖의 값은 fallback */
export function hexToRgb01(hex: string, fallback: [number, number, number] = [0.23, 0.38, 0.9]): [number, number, number] {
  const m = hex.trim().replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (!/^[0-9a-f]{6}$/i.test(full)) return fallback
  const n = parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** 아무 CSS 색(rgb() · hex · 이름) → 0..255 RGB. rgb()/rgba() 는 바로 읽고, 나머지는 canvas 가 정규화해 준다 */
export function cssColorToRgb(color: string): [number, number, number] {
  const m = color.match(/[\d.]+/g)
  if (m && m.length >= 3 && !color.startsWith('#')) return [Number(m[0]), Number(m[1]), Number(m[2])]
  if (typeof document === 'undefined') return [0, 0, 0]
  const c = document.createElement('canvas').getContext('2d')
  if (!c) return [0, 0, 0]
  c.fillStyle = color
  const v = c.fillStyle
  return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]
}
