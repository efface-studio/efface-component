import { clamp } from '@/lib/motion'

export const DISPLAY = "'Space Grotesk', 'Pretendard Variable', sans-serif"
export const WORDMARK_DIM = '#18181E'
export const WORDMARK_GRADIENT: ReadonlyArray<readonly [number, string]> = [
  [0, '#3B82F6'],
  [0.36, '#8B5CF6'],
  [0.68, '#14B8B0'],
  [1, '#F59E0B'],
]

/** 페인터가 밝은 워드마크를 드러내는 커서 샘플. */
export interface PointerSample {
  x: number
  y: number
  /** 마지막 실제 이동의 `performance.now()` — 오래된 샘플은 자동 드리프트로 돌아간다. */
  t: number
}

export interface WordmarkPainter {
  /** 캔버스의 현재 박스 크기로 오프스크린 레이어를 다시 만든다. */
  setup(): void
  /** 트레일을 진행시키고 한 프레임을 합성한다. */
  paint(pointer: PointerSample, now: number): void
}

const WORD = 'EFFACE'

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[wordmarkCanvas] 2D context unavailable')
  return ctx
}

/**
 * 거대 푸터 워드마크 (v2). 오프스크린 레이어 셋이 일을 한다: 항상 보이는 흐린 사본,
 * 그라데이션 사본, 그리고 커서가 지나간 곳에서만 그라데이션을 드러내는 트레일 마스크.
 * reduced-motion이면 트레일을 한 번 가득 채워 워드마크가 그냥 풀컬러로 읽힌다.
 */
export function createWordmarkPainter(canvas: HTMLCanvasElement, reduced: boolean): WordmarkPainter {
  let cw = 0
  let ch = 0
  let ctx: CanvasRenderingContext2D | null = null
  let trail: HTMLCanvasElement
  let work: HTMLCanvasElement
  let dimSrc: HTMLCanvasElement
  let brightSrc: HTMLCanvasElement

  const setup = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cw = w
    ch = h
    const mk = () => {
      const cv = document.createElement('canvas')
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      context2d(cv).setTransform(dpr, 0, 0, dpr, 0, 0)
      return cv
    }
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx = context2d(canvas)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    trail = mk()
    work = mk()
    dimSrc = mk()
    brightSrc = mk()

    // 단어를 양 끝까지 늘려 그린다. fill + stroke로 글자를 두껍게 만든다.
    const fitDraw = (cv: HTMLCanvasElement, fill: string | CanvasGradient) => {
      const x = context2d(cv)
      const fs = h * 1.04
      x.font = `700 ${fs}px ${DISPLAY}`
      const tw = Math.max(1, x.measureText(WORD).width)
      const sx = w / tw
      x.save()
      x.scale(sx, 1)
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillStyle = fill
      x.strokeStyle = fill
      x.lineWidth = fs * 0.045
      x.lineJoin = 'miter'
      x.miterLimit = 4
      x.fillText(WORD, w / sx / 2, h * 0.56)
      x.strokeText(WORD, w / sx / 2, h * 0.56)
      x.restore()
    }
    fitDraw(dimSrc, WORDMARK_DIM)
    const g = context2d(brightSrc).createLinearGradient(0, 0, w, 0)
    for (const [stop, color] of WORDMARK_GRADIENT) g.addColorStop(stop, color)
    fitDraw(brightSrc, g)
    if (reduced) {
      const tc = context2d(trail)
      tc.fillStyle = '#fff'
      tc.fillRect(0, 0, w, h)
    }
  }

  const paint = (pointer: PointerSample, now: number) => {
    if (!ctx) return
    if (canvas.clientWidth && canvas.clientWidth !== cw) setup()
    if (!ctx) return
    const r = canvas.getBoundingClientRect()
    const vh = window.innerHeight
    if (r.bottom < -80 || r.top > vh + 80) return

    const tctx = context2d(trail)
    if (!reduced) {
      // 트레일을 천천히 지워 꼬리를 남긴다
      tctx.save()
      tctx.globalCompositeOperation = 'destination-out'
      tctx.globalAlpha = 0.05
      tctx.fillStyle = '#000'
      tctx.fillRect(0, 0, cw, ch)
      tctx.restore()

      // 혼자 떠다니다가, 커서가 최근에 근처에 있으면 커서를 따른다
      const time = now / 1000
      let px = cw * (0.5 + 0.44 * Math.sin(time * 0.32))
      let py = ch * (0.5 + 0.14 * Math.sin(time * 1.05))
      if (now - pointer.t < 1400 && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top - 50 && pointer.y <= r.bottom + 50) {
        px = pointer.x - r.left
        py = clamp(pointer.y - r.top, -10, ch + 10)
      }
      const R = ch * 0.62
      const gr = tctx.createRadialGradient(px, py, 0, px, py, R)
      gr.addColorStop(0, 'rgba(255,255,255,0.5)')
      gr.addColorStop(0.7, 'rgba(255,255,255,0.18)')
      gr.addColorStop(1, 'rgba(255,255,255,0)')
      tctx.save()
      tctx.fillStyle = gr
      tctx.beginPath()
      tctx.arc(px, py, R, 0, 7)
      tctx.fill()
      tctx.restore()
    }

    // 밝은 사본을 트레일이 지나간 곳으로만 마스킹
    const wctx = context2d(work)
    wctx.save()
    wctx.setTransform(1, 0, 0, 1, 0, 0)
    wctx.clearRect(0, 0, work.width, work.height)
    wctx.restore()
    wctx.drawImage(brightSrc, 0, 0, cw, ch)
    wctx.save()
    wctx.globalCompositeOperation = 'destination-in'
    wctx.drawImage(trail, 0, 0, cw, ch)
    wctx.restore()

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    ctx.drawImage(dimSrc, 0, 0, cw, ch)
    ctx.drawImage(work, 0, 0, cw, ch)
  }

  return { setup, paint }
}
