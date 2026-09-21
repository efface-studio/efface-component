import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { SPLASH_ASSEMBLED, type SplashVariant } from './splash.constants'

export interface SplashLogoProps {
  /** 마크가 만들어지는 방식 */
  variant?: SplashVariant
  /** 마크 한 변(px). 글자는 비례한다 */
  size?: number
  /** 끝나면 처음부터 다시 */
  loop?: boolean
  /** 다 맞물린 뒤 머무는 시간(ms) */
  hold?: number
  /** 퇴장이 끝났을 때 — 실제 앱에선 여기서 첫 화면으로 */
  onDone?: () => void
  /** "efface" 워드마크 */
  wordmark?: boolean
  className?: string
}

const ACCENT = '#3b62e5'
/* 32 뷰박스의 마크 — 뒤 사각(흰) · 앞 사각(블루). LogoMark 와 같은 좌표 */
const SQ = 13
const RX = 3.6
const SQUARES = [
  { x: 5.5, y: 5.5, fill: '#ffffff' },
  { x: 13.5, y: 13.5, fill: ACCENT },
] as const
const QUADS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
] as const
const SPRING = { type: 'spring', stiffness: 230, damping: 21, mass: 0.9 } as const

/**
 * 스플래시 — efface 마크가 만들어지는 여섯 가지 방식. 완성되는 순간 광휘가 피고,
 * 워드마크가 글자마다 떠오른 뒤 전체가 살짝 줄며 사라진다(포털은 흰 판 속으로 들어간다).
 */
export function SplashLogo({ variant = 'assemble', size = 176, loop = false, hold = 1400, onDone, wordmark = true, className }: SplashLogoProps) {
  const reduce = useReducedMotion()
  // 회차와 퇴장 여부를 한 상태로 — 새 회차의 첫 렌더가 퇴장 상태로 그려지는 깜빡임을 막는다
  const [phase, setPhase] = useState({ run: 0, out: false })
  const { run, out } = phase
  const at = reduce ? 300 : SPLASH_ASSEMBLED[variant]

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase((p) => ({ ...p, out: true })), at + hold)
    const t2 = window.setTimeout(
      () => {
        onDone?.()
        if (loop) setPhase((p) => ({ run: p.run + 1, out: false }))
      },
      at + hold + 450 + (loop ? 350 : 0),
    )
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // onDone 은 최신 것을 쓰되 타이머는 회차마다 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, at, hold, loop])

  const t = at / 1000
  const letters = 'efface'.split('')
  const portal = variant === 'portal'
  const exit = portal ? { scale: 14, opacity: 0, filter: 'blur(3px)' } : { scale: 0.92, opacity: 0, filter: 'blur(6px)' }
  // 포털은 흰 판 속으로 들어간다 — 원점을 흰 판 중심(마크 영역 기준)에
  const white = ((SQUARES[0].x + SQ / 2) / 32) * 100

  return (
    <div className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b0c10] text-white', className)} role="img" aria-label="efface">
      {/* 자체 presence — 바깥의 AnimatePresence initial={false}(장면·라우트 전환용) 가 남긴 컨텍스트를 끊어 마운트 애니메이션이 늘 돌게 */}
      <AnimatePresence>
        <motion.div
          key={run}
          className="relative flex flex-col items-center"
          style={{ gap: size * 0.16, transformOrigin: portal ? `${white}% ${(white * size) / (size * (wordmark ? 1.62 : 1))}%` : 'center' }}
          initial={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          animate={out ? exit : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: portal ? 0.6 : 0.45, ease: portal ? [0.7, 0, 0.84, 0] : EASE_OUT_EXPO }}
        >
          {/* 뒤 광휘 — 완성될 때 피었다가 가라앉는다 */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{ width: size * 2.6, height: size * 2.6, marginLeft: -size * 1.3, marginTop: -size * 1.3 - (wordmark ? size * 0.3 : 0), background: `radial-gradient(circle, ${ACCENT}55 0%, ${ACCENT}22 30%, transparent 62%)` }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.9, 0.45], scale: [0.6, 1.05, 1] }}
            transition={{ delay: reduce ? 0 : t - 0.12, duration: 1.1, ease: 'easeOut' }}
          />
          <motion.div className="relative" style={{ width: size, height: size }} animate={reduce ? {} : { scale: [1, 1.06, 0.985, 1] }} transition={{ delay: t - 0.08, duration: 0.5, times: [0, 0.3, 0.7, 1] }}>
            {!reduce && (
              <motion.span aria-hidden className="pointer-events-none absolute inset-[18%] rounded-full border border-white/50" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 2.6], opacity: [0.55, 0] }} transition={{ delay: t - 0.06, duration: 0.95, ease: 'easeOut' }} />
            )}
            {reduce ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <Mark />
              </motion.div>
            ) : variant === 'assemble' ? (
              <Assemble size={size} run={run} />
            ) : variant === 'liquid' ? (
              <Liquid run={run} />
            ) : variant === 'particles' ? (
              <Particles size={size} run={run} />
            ) : variant === 'draw' ? (
              <Draw run={run} />
            ) : variant === 'fold' ? (
              <Fold size={size} />
            ) : (
              <Portal />
            )}
          </motion.div>
          {wordmark && (
            <div className="relative flex flex-col items-center" style={{ gap: size * 0.05 }}>
              <div className="flex font-semibold lowercase tracking-tight" style={{ fontSize: size * 0.34, lineHeight: 1 }} aria-hidden>
                {variant === 'draw' && !reduce
                  ? letters.map((ch, i) => (
                      <motion.span key={i} className="inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t + 0.1 + i * 0.075, duration: 0.01 }}>
                        {ch}
                      </motion.span>
                    ))
                  : letters.map((ch, i) => (
                      <motion.span key={i} className="inline-block" initial={{ y: '0.55em', opacity: 0, filter: 'blur(8px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={{ delay: reduce ? 0.2 : t + 0.18 + i * 0.055, duration: 0.55, ease: EASE_OUT_EXPO }}>
                        {ch}
                      </motion.span>
                    ))}
                {variant === 'draw' && !reduce && (
                  <motion.span aria-hidden className="ml-[0.06em] inline-block w-[0.07em] bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0, 1, 0, 1, 0] }} transition={{ delay: t + 0.05, duration: 1.6, times: [0, 0.02, 0.35, 0.45, 0.6, 0.7, 0.85, 1] }} />
                )}
              </div>
              <motion.span className="font-mono uppercase text-white/45" style={{ fontSize: Math.max(9, size * 0.062), letterSpacing: '0.32em' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0.3 : t + 0.6, duration: 0.6, ease: EASE_OUT_EXPO }} aria-hidden>
                design system
              </motion.span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── 완성된 마크(SVG) ─────────────────────────────────────── */
function Mark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-full w-full', className)} style={style} aria-hidden>
      {SQUARES.map((sq) => (
        <rect key={sq.x} x={sq.x} y={sq.y} width={SQ} height={SQ} rx={RX} fill={sq.fill} />
      ))}
    </svg>
  )
}

/** 빛 훑기 — 마크 모양으로만 */
function LightSweep({ run, delay }: { run: number; delay: number }) {
  return (
    <svg viewBox="0 0 32 32" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <clipPath id={`sp-mask-${run}`}>
          {SQUARES.map((sq) => (
            <rect key={sq.x} x={sq.x} y={sq.y} width={SQ} height={SQ} rx={RX} />
          ))}
        </clipPath>
        <linearGradient id={`sp-light-${run}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#sp-mask-${run})`}>
        <motion.g initial={{ x: -14, opacity: 0 }} animate={{ x: 44, opacity: [0, 1, 1, 0] }} transition={{ delay, duration: 0.7, ease: 'easeInOut' }}>
          <rect x="-6" y="-8" width="12" height="48" fill={`url(#sp-light-${run})`} transform="skewX(-20)" />
        </motion.g>
      </g>
    </svg>
  )
}

/* ── 1. 조립 — 사분면 조각이 사방에서 스프링으로 맞물리고 빛이 훑는다 ── */
function Assemble({ size, run }: { size: number; run: number }) {
  const px = size / 32
  const shards = SQUARES.flatMap((sq, si) =>
    QUADS.map(([qx, qy], qi) => {
      const i = si * 4 + qi
      const half = SQ / 2
      const cx = sq.x + qx * half + half / 2
      const cy = sq.y + qy * half + half / 2
      const dx = cx - 16
      const dy = cy - 16
      const len = Math.hypot(dx, dy) || 1
      const jitter = (((i * 37) % 7) - 3) * 1.1
      return {
        key: i,
        fill: sq.fill,
        // 살짝 겹쳐 잘라 이음새가 비치지 않게
        clip: { x: sq.x + qx * half - (qx ? 0.08 : 0), y: sq.y + qy * half - (qy ? 0.08 : 0), w: half + 0.08, h: half + 0.08 },
        rect: sq,
        origin: `${cx * px}px ${cy * px}px`,
        from: { x: ((dx / len) * 15 + (-dy / len) * jitter) * px, y: ((dy / len) * 15 + (dx / len) * jitter) * px, rotate: (i % 2 ? 1 : -1) * (26 + ((i * 13) % 22)), scale: 0.55, opacity: 0, filter: 'blur(10px)' },
        delay: si * 0.14 + qi * 0.045,
      }
    }),
  )
  return (
    <>
      {shards.map((s) => (
        <motion.div key={s.key} className="absolute inset-0" style={{ transformOrigin: s.origin }} initial={s.from} animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }} transition={{ ...SPRING, delay: s.delay, opacity: { duration: 0.4, delay: s.delay }, filter: { duration: 0.55, delay: s.delay } }} aria-hidden>
          <svg viewBox="0 0 32 32" className="h-full w-full">
            <defs>
              <clipPath id={`sp-${run}-${s.key}`}>
                <rect x={s.clip.x} y={s.clip.y} width={s.clip.w} height={s.clip.h} />
              </clipPath>
            </defs>
            <rect x={s.rect.x} y={s.rect.y} width={SQ} height={SQ} rx={RX} fill={s.fill} clipPath={`url(#sp-${run}-${s.key})`} />
          </svg>
        </motion.div>
      ))}
      <LightSweep run={run} delay={0.98} />
    </>
  )
}

/* ── 2. 액체 — 방울 두 개가 다가와 끈적하게 합쳐지고(goo 필터) 굳으며 각진 마크가 된다 ── */
function Liquid({ run }: { run: number }) {
  const drops = [
    { key: 'w', fill: SQUARES[0].fill, to: SQUARES[0], from: { x: -22, y: -14 }, delay: 0 },
    { key: 'b', fill: SQUARES[1].fill, to: SQUARES[1], from: { x: 22, y: 16 }, delay: 0.08 },
  ]
  const droplets = [
    { fill: SQUARES[0].fill, from: { x: -14, y: 4 }, r: 1.3, delay: 0.25 },
    { fill: SQUARES[1].fill, from: { x: 18, y: -6 }, r: 1.1, delay: 0.32 },
    { fill: SQUARES[0].fill, from: { x: 2, y: -18 }, r: 0.9, delay: 0.4 },
  ]
  return (
    <>
      {/* 끈적한 층 — 굳을 때 사라진다 */}
      <motion.svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.25 }} aria-hidden>
        <defs>
          <filter id={`goo-${run}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
        <g filter={`url(#goo-${run})`}>
          {drops.map((d) => (
            <motion.rect
              key={d.key}
              width={SQ}
              height={SQ}
              fill={d.fill}
              style={{ transformOrigin: `${d.to.x + SQ / 2}px ${d.to.y + SQ / 2}px` }}
              initial={{ attrX: d.to.x + d.from.x, attrY: d.to.y + d.from.y, rx: SQ / 2, scale: 0.9 }}
              animate={{ attrX: d.to.x, attrY: d.to.y, rx: RX, scale: 1 }}
              transition={{ attrX: { type: 'spring', stiffness: 60, damping: 14, delay: d.delay }, attrY: { type: 'spring', stiffness: 60, damping: 14, delay: d.delay }, rx: { delay: 0.95, duration: 0.35, ease: EASE_OUT_EXPO }, scale: { delay: 0.95, duration: 0.35 } }}
            />
          ))}
          {droplets.map((d, i) => (
            <motion.circle key={i} r={d.r} fill={d.fill} initial={{ cx: 16 + d.from.x, cy: 16 + d.from.y, opacity: 1 }} animate={{ cx: 16 + (i % 2 ? 4 : -3), cy: 16 + (i % 2 ? 4 : -3), opacity: [1, 1, 0] }} transition={{ delay: d.delay, duration: 0.75, ease: 'easeIn' }} />
          ))}
        </g>
      </motion.svg>
      {/* 굳은 마크 */}
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.2 }}>
        <Mark />
      </motion.div>
      <LightSweep run={run} delay={1.4} />
    </>
  )
}

/* ── 3. 입자 — 흩어진 점들이 소용돌이치며 모여 마크로 응축된다(canvas) ── */
function Particles({ size, run }: { size: number; run: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const px = size / 32
    // 목표점 — 둥근 사각 안에서 고르게. 뒤(흰) 먼저, 앞(블루) 나중(위에 그려진다)
    const inside = (u: number, v: number) => {
      const cx = Math.min(Math.max(u, RX), SQ - RX)
      const cy = Math.min(Math.max(v, RX), SQ - RX)
      return Math.hypot(u - cx, v - cy) <= RX
    }
    type P = { sx: number; sy: number; tx: number; ty: number; delay: number; swirl: number; color: string; r: number }
    const ps: P[] = []
    const n = size > 150 ? 420 : 300
    for (const sq of SQUARES) {
      let k = 0
      while (k < n) {
        const u = Math.random() * SQ
        const v = Math.random() * SQ
        if (!inside(u, v)) continue
        k++
        const a = Math.random() * Math.PI * 2
        const rad = size * (0.6 + Math.random() * 0.5)
        ps.push({ sx: size / 2 + Math.cos(a) * rad, sy: size / 2 + Math.sin(a) * rad, tx: (sq.x + u) * px, ty: (sq.y + v) * px, delay: Math.random() * 0.45, swirl: (Math.random() - 0.5) * size * 0.5, color: sq.fill, r: 0.9 + Math.random() * 0.9 })
      }
    }
    const ease = (x: number) => 1 - Math.pow(1 - x, 3)
    const t0 = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const t = (now - t0) / 1000
      ctx.fillStyle = 'rgba(11,12,16,0.32)'
      ctx.fillRect(0, 0, size, size)
      for (const p of ps) {
        const k = Math.min(1, Math.max(0, (t - p.delay) / 1.05))
        const e = ease(k)
        const dx = p.tx - p.sx
        const dy = p.ty - p.sy
        const len = Math.hypot(dx, dy) || 1
        const s = Math.sin(k * Math.PI) * p.swirl
        const x = p.sx + dx * e + (-dy / len) * s
        const y = p.sy + dy * e + (dx / len) * s
        ctx.globalAlpha = 0.25 + 0.75 * k
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      // 응축 순간의 섬광
      if (t > 1.45 && t < 1.85) {
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7)
        const a = 1 - (t - 1.45) / 0.4
        g.addColorStop(0, `rgba(255,255,255,${0.55 * a})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, size, size)
      }
      if (t < 2.3) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [size, run])
  return (
    <>
      <motion.canvas ref={ref} className="absolute inset-0 h-full w-full" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.7, duration: 0.5 }} aria-hidden />
      <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.45, duration: 0.35, ease: EASE_OUT_EXPO }}>
        <Mark />
      </motion.div>
    </>
  )
}

/* ── 4. 드로잉 — 윤곽이 그려지고, 아래서 색이 차오르며, 네온처럼 한 번 빛난다 ── */
function Draw({ run }: { run: number }) {
  return (
    <>
      <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <filter id={`neon-${run}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`flood-${run}`}>
            <motion.rect x="0" width="32" height="32" initial={{ attrY: 32 }} animate={{ attrY: 0 }} transition={{ delay: 0.95, duration: 0.5, ease: EASE_OUT_EXPO }} />
          </clipPath>
        </defs>
        {/* 채움 — 아래서 위로 */}
        <g clipPath={`url(#flood-${run})`}>
          {SQUARES.map((sq) => (
            <rect key={sq.x} x={sq.x} y={sq.y} width={SQ} height={SQ} rx={RX} fill={sq.fill} />
          ))}
        </g>
        {/* 윤곽 — 그려진다 */}
        {SQUARES.map((sq, i) => (
          <motion.rect
            key={sq.x}
            x={sq.x}
            y={sq.y}
            width={SQ}
            height={SQ}
            rx={RX}
            fill="none"
            stroke={sq.fill}
            strokeWidth={0.7}
            strokeLinecap="round"
            filter={`url(#neon-${run})`}
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: [1, 1, 0] }}
            transition={{ pathLength: { delay: i * 0.18, duration: 0.85, ease: 'easeInOut' }, opacity: { delay: 1.25, duration: 0.35, times: [0, 0.2, 1] } }}
          />
        ))}
      </svg>
      {/* 네온 펄스 — 완성 순간 한 번 */}
      <motion.div className="absolute inset-0" style={{ filter: 'blur(10px)' }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ delay: 1.3, duration: 0.7 }}>
        <Mark />
      </motion.div>
    </>
  )
}

/* ── 5. 접기 — 종이처럼 접혀 있던 두 판이 펼쳐져 내려앉는다(CSS 3D) ── */
function Fold({ size }: { size: number }) {
  const pct = (v: number) => `${(v / 32) * 100}%`
  const w = pct(SQ)
  return (
    <div className="absolute inset-0" style={{ perspective: size * 3.2 }}>
      {SQUARES.map((sq, i) => (
        <motion.div
          key={sq.x}
          className="absolute overflow-hidden"
          style={{ left: pct(sq.x), top: pct(sq.y), width: w, height: w, borderRadius: `${(RX / SQ) * 100}%`, background: sq.fill, transformOrigin: i === 0 ? 'left center' : 'center top', boxShadow: '0 18px 40px -16px rgba(0,0,0,0.7)' }}
          initial={i === 0 ? { rotateY: -100, x: -size * 0.12, opacity: 0 } : { rotateX: 100, y: -size * 0.12, opacity: 0 }}
          animate={{ rotateX: 0, rotateY: 0, x: 0, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 15, mass: 1, delay: i * 0.28, opacity: { duration: 0.3, delay: i * 0.28 } }}
        >
          {/* 접힌 면의 그늘 — 펼쳐지며 걷힌다 */}
          <motion.span aria-hidden className="absolute inset-0" style={{ background: i === 0 ? 'linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0))' : 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0))' }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: i * 0.28 + 0.15, duration: 0.6 }} />
        </motion.div>
      ))}
    </div>
  )
}

/* ── 6. 포털 — 블루 안에서 시작해 빠져나오며 마크가 드러난다(퇴장은 흰 판 속으로) ── */
function Portal() {
  const c = ((SQUARES[1].x + SQ / 2) / 32) * 100
  return (
    <motion.div className="absolute inset-0" style={{ transformOrigin: `${c}% ${c}%` }} initial={{ scale: 16 }} animate={{ scale: [16, 16, 1] }} transition={{ duration: 1.25, times: [0, 0.22, 1], ease: [0.16, 1, 0.3, 1] }}>
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        {/* 뒤 판은 시차를 두고 뒤에서 미끄러져 온다 */}
        <motion.rect x={SQUARES[0].x} y={SQUARES[0].y} width={SQ} height={SQ} rx={RX} fill={SQUARES[0].fill} initial={{ x: 6, y: 6, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.9, ease: EASE_OUT_EXPO }} />
        <rect x={SQUARES[1].x} y={SQUARES[1].y} width={SQ} height={SQ} rx={RX} fill={SQUARES[1].fill} />
      </svg>
      {/* 빠져나오는 동안 블루 안쪽의 결 — 멀어지며 사라진다 */}
      <motion.span aria-hidden className="pointer-events-none absolute" style={{ left: `${c - 20}%`, top: `${c - 20}%`, width: '40%', height: '40%', borderRadius: '28%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)' }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }} />
    </motion.div>
  )
}
