interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  c: string
  life: number
}

export interface ConfettiEngine {
  /** 그 자리(호스트 좌표)에서 터뜨린다 — 생략하면 가운데 */
  burst: (x?: number, y?: number) => void
  dispose: () => void
}

/**
 * 색종이 폭죽 — host 위에 canvas 를 깔고 조각들을 중력으로 떨어뜨린다.
 * 색은 앱 카드 토큰(블루 · 틸 · 바이올렛 · 앰버) + 액센트를 host 의 computed style 에서 읽는다.
 */
export function createConfetti(host: HTMLElement): ConfettiEngine {
  const canvas = document.createElement('canvas')
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' })
  host.appendChild(canvas)
  const pieces: Piece[] = []
  let raf = 0

  function frame() {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx.clearRect(0, 0, w, h)
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i]
      if (!p) continue
      p.vy += 0.22
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 1
      if (p.life <= 0 || p.y > h + 20) {
        pieces.splice(i, 1)
        continue
      }
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.min(1, p.life / 30)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.7)))
      ctx.restore()
    }
    raf = pieces.length ? requestAnimationFrame(frame) : 0
  }

  return {
    burst(x, y) {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      const cs = getComputedStyle(host)
      const colors = ['--accent', '--color-app-blue', '--color-app-teal', '--color-app-violet', '--color-app-amber'].map((v) => cs.getPropertyValue(v).trim()).filter(Boolean)
      const cx = x ?? r.width / 2
      const cy = y ?? r.height / 2
      for (let i = 0; i < 90; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 4 + Math.random() * 9
        pieces.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, w: 5 + Math.random() * 5, h: 6 + Math.random() * 8, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length] ?? '#2563eb', life: 90 + Math.random() * 50 })
      }
      if (!raf) raf = requestAnimationFrame(frame)
    },
    dispose() {
      cancelAnimationFrame(raf)
      canvas.remove()
    },
  }
}
