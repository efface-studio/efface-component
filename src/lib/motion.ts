import type { Variants } from 'motion/react'

/* ── Easing ──────────────────────────────────────────────────────
   앱의 모든 진입/전환이 공유하는 한 곡선. 대칭 스윕(링크 밑줄)은 CSS 전용이라
   `index.css`의 `--ease-in-out-symmetric`에 있다. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const EASE_OUT_BACK = [0.16, 1, 0.3, 1] as const

/** 초 단위. 애니메이션은 리터럴 대신 이 중 하나를 고른다. */
export const DURATION = {
  /** 오버레이 페이드, 마이크로 인터랙션 */
  fast: 0.4,
  /** 메뉴 항목, 중간 전환 */
  base: 0.6,
  /** 섹션 등장 */
  slow: 0.7,
} as const

/** 스태거 목록에서 항목당 더해지는 지연. */
export const STAGGER = {
  tight: 0.06,
  base: 0.07,
  word: 0.05,
} as const

/** v1 스프링 프리셋 — 자석 버튼, 스크롤 프로그레스, 아이콘 호버 */
export const SPRING = {
  magnetic: { stiffness: 220, damping: 18, mass: 0.4 },
  progress: { stiffness: 220, damping: 28, mass: 0.4 },
  cursor: { stiffness: 140, damping: 24, mass: 0.6 },
  icon: { type: 'spring', stiffness: 300, damping: 14 },
} as const

/* ── Framer Motion variants ─────────────────────────────────────── */

/** 떠오르며 나타남 — `Reveal`이 모든 섹션 진입에 쓴다. */
export const fadeUp = (y = 20, delay = 0, scale = 1): Variants => ({
  hidden: { opacity: 0, y, scale },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, delay, ease: EASE_OUT_EXPO },
  },
})

/** 전체 화면 오버레이 배경. */
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO } },
}

/** 메뉴 행이 자기 클립 박스 안에서 위로 밀려 올라옴, 인덱스로 스태거. */
export const menuItem = (index: number): Variants => ({
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION.base, delay: 0.08 + index * STAGGER.base, ease: EASE_OUT_EXPO },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: DURATION.base, delay: 0.08 + index * STAGGER.base, ease: EASE_OUT_EXPO },
  },
})

/* ── Scalar easing ──────────────────────────────────────────────
   rAF 씬은 직접 보간하므로 곡선을 베지어 제어점이 아니라 함수로 쓴다. */

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

/** 1을 넘겼다가 돌아온다 — 앱 카드가 "딜 인" 되는 스냅. */
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** 두 경계 사이의 Hermite smoothstep. */
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** 소수부. `sin`과 짝지어 결정적 의사난수 산포를 만든다. */
export const fract = (n: number): number => n - Math.floor(n)

/** 선형 보간. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
