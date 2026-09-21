export type SplashVariant = 'assemble' | 'liquid' | 'particles' | 'draw' | 'fold' | 'portal'

export const SPLASH_VARIANTS: { id: SplashVariant; name: string; desc: string }[] = [
  { id: 'assemble', name: '조립', desc: '여덟 조각이 사방에서 날아와 맞물린다' },
  { id: 'liquid', name: '액체', desc: '두 방울이 다가와 끈적하게 합쳐지고 굳어 마크가 된다' },
  { id: 'particles', name: '입자', desc: '먼지처럼 흩어진 점들이 소용돌이치며 모여 마크로 응축된다' },
  { id: 'draw', name: '드로잉', desc: '선이 그려지고 아래서 색이 차오르며 네온처럼 빛난다' },
  { id: 'fold', name: '접기', desc: '종이처럼 접혀 있던 두 판이 펼쳐져 내려앉는다' },
  { id: 'portal', name: '포털', desc: '블루 안에서 시작해 빠져나오며 마크가 드러나고, 흰 판 속으로 들어가며 끝난다' },
]

/** 마크가 완성되는 시각(ms) — 워드마크·퇴장이 여기에 맞춰진다 */
export const SPLASH_ASSEMBLED: Record<SplashVariant, number> = { assemble: 900, liquid: 1350, particles: 1600, draw: 1450, fold: 1050, portal: 1250 }

/** 총 길이(ms) — 시연 스크립트가 기다릴 시간 */
export function splashDuration(variant: SplashVariant = 'assemble', hold = 1400) {
  return SPLASH_ASSEMBLED[variant] + hold + 450
}
