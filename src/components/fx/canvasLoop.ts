export interface Pointer {
  /** CSS px, 캔버스 기준 */
  x: number
  y: number
  inside: boolean
  down: boolean
}

export interface CanvasScene {
  /** 크기가 정해질 때마다(처음 · 리사이즈) */
  init?: (w: number, h: number) => void
  /** 매 프레임. dt(초) · t(초). 컨텍스트는 CSS px 좌표(DPR 스케일 적용됨) */
  frame: (ctx: CanvasRenderingContext2D, dt: number, t: number, p: Pointer, w: number, h: number) => void
  /** 누름 · 뗌 */
  down?: (x: number, y: number) => void
  up?: (x: number, y: number) => void
}

export interface CanvasOptions {
  dpr?: number
  /** 한 프레임만(감소 모션) */
  still?: boolean
  /** 캔버스에 색 토큰을 넘길 때 쓸 호스트 스타일 */
  alpha?: boolean
}

/** 호스트의 CSS 토큰 색 — canvas 데모가 테마를 따르게 */
export function themeColors(el: Element) {
  const cs = getComputedStyle(el)
  return {
    accent: cs.getPropertyValue('--accent').trim() || '#3b62e5',
    fg: cs.color || '#f5f5f7',
    bg: cs.backgroundColor || '#0b0c10',
    dim: cs.getPropertyValue('--fg-dim').trim() || 'rgba(160,160,170,1)',
  }
}

/**
 * 2D 캔버스 루프. 부모 크기를 따르고(ResizeObserver, DPR 상한 2), 화면 밖이면 멈추고,
 * 포인터(CSS px)와 누름을 넘긴다. 감소 모션이면 한 프레임만 그린다.
 */
export function mountCanvas(canvas: HTMLCanvasElement, make: (host: HTMLElement) => CanvasScene, opts: CanvasOptions = {}): () => void {
  const host = canvas.parentElement ?? canvas
  const ctx = canvas.getContext('2d', { alpha: opts.alpha ?? true })
  if (!ctx) return () => {}
  const scene = make(host)
  const p: Pointer = { x: -1e4, y: -1e4, inside: false, down: false }
  let w = 0
  let h = 0
  const resize = () => {
    const r = host.getBoundingClientRect()
    const dpr = Math.min(opts.dpr ?? 2, window.devicePixelRatio || 1)
    w = Math.max(1, Math.round(r.width))
    h = Math.max(1, Math.round(r.height))
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    scene.init?.(w, h)
    if (opts.still) scene.frame(ctx, 0, 0, p, w, h)
  }
  let t = 0
  let last = performance.now()
  let raf = 0
  let visible = true
  const tick = (now: number) => {
    raf = 0
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    t += dt
    scene.frame(ctx, dt, t, p, w, h)
    if (visible && !opts.still) raf = requestAnimationFrame(tick)
  }
  const local = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    p.x = e.clientX - r.left
    p.y = e.clientY - r.top
  }
  const onMove = (e: PointerEvent) => {
    local(e)
    p.inside = true
  }
  const onLeave = () => {
    p.inside = false
    p.down = false
  }
  const onDown = (e: PointerEvent) => {
    local(e)
    p.inside = true
    p.down = true
    scene.down?.(p.x, p.y)
  }
  const onUp = (e: PointerEvent) => {
    if (!p.down) return
    local(e)
    p.down = false
    scene.up?.(p.x, p.y)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  const io = new IntersectionObserver(([en]) => {
    visible = !!en?.isIntersecting
    if (visible && !raf && !opts.still) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  })
  io.observe(host)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  if (!opts.still) raf = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerleave', onLeave)
    host.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
  }
}

/* ── 작은 수학 도구 ── */
export const rand = (a: number, b: number) => a + Math.random() * (b - a)
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/** 2D 값 노이즈(0~1) — 곱셈 해시, 옥타브 3 */
export function noise2(x: number, y: number) {
  const h = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = h(xi, yi)
  const b = h(xi + 1, yi)
  const c = h(xi, yi + 1)
  const d = h(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export function fbm2(x: number, y: number, oct = 3) {
  let s = 0
  let a = 0.5
  let f = 1
  for (let i = 0; i < oct; i++) {
    s += a * noise2(x * f, y * f)
    a *= 0.5
    f *= 2
  }
  return s
}
