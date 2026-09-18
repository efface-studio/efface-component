/** v2 Capabilities — 열별 액센트. CSS 변수용 hex, 글로우용 rgb 삼중항. */
export const CAPABILITY_ACCENTS = [
  { hex: '#3B82F6', rgb: '59,130,246' },
  { hex: '#8B5CF6', rgb: '139,92,246' },
  { hex: '#14B8B0', rgb: '20,184,176' },
  { hex: '#F59E0B', rgb: '245,158,11' },
] as const

/** v2 도구 점 색 순환. */
export const DOT_COLORS = ['#6366F1', '#22D3EE', '#FBBF24', '#34D399'] as const

/** v2 AppCards — 카드별 그라데이션·하이라이트 세기·아이콘 색. */
export const APP_CARDS = [
  { key: 'hinest', gradient: 'linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)', sheen: 0.16, icon: '#F6F7FA' },
  { key: 'muru', gradient: 'linear-gradient(160deg, #34E0D8 0%, #14B8B0 60%, #0C9A93 100%)', sheen: 0.16, icon: '#FFFDF8' },
  { key: 'qto', gradient: 'linear-gradient(160deg, #34343C 0%, #1D1D23 60%, #141418 100%)', sheen: 0.1, icon: '#EF6553' },
  { key: 'goms', gradient: 'linear-gradient(160deg, #9D6BFF 0%, #7C3AED 55%, #6425D0 100%)', sheen: 0.16, icon: '#FFA600' },
] as const
