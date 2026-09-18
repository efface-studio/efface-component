export interface ColorToken {
  name: string
  /** Tailwind 유틸리티 접미 (`bg-{token}`, `text-{token}`) */
  utility: string
  light: string
  dark: string
  role: string
}

/** 테마에 따라 바뀌는 시맨틱 컬러. */
export const SEMANTIC_COLORS: ColorToken[] = [
  { name: 'bg', utility: 'bg', light: '#ffffff', dark: '#0a0a0b', role: '페이지 바탕' },
  { name: 'bg-soft', utility: 'bg-soft', light: '#fafafa', dark: '#101013', role: '교차 섹션 바탕 (v1 paper-2 / v2 bg-soft)' },
  { name: 'surface', utility: 'surface', light: '#ffffff', dark: '#141418', role: '카드·패널' },
  { name: 'surface-2', utility: 'surface-2', light: '#f5f5f5', dark: '#1b1b21', role: '카드 안의 타일·칩' },
  { name: 'fg', utility: 'fg', light: '#0a0a0a', dark: '#f6f6f7', role: '본문 (v1 ink / v2 fg)' },
  { name: 'fg-2', utility: 'fg-2', light: '#171717', dark: '#ededef', role: '호버 시 본문' },
  { name: 'fg-dim', utility: 'fg-dim', light: '#525252', dark: '#9b9ba4', role: '보조 텍스트 (v1 muted)' },
  { name: 'fg-faint', utility: 'fg-faint', light: '#a3a3a3', dark: '#6a6a73', role: '라벨·힌트 (v1 muted-2)' },
  { name: 'line', utility: 'line', light: '#e5e5e5', dark: 'rgba(255,255,255,0.09)', role: '구분선·카드 테두리' },
  { name: 'line-soft', utility: 'line-soft', light: '#f0f0f0', dark: 'rgba(255,255,255,0.05)', role: '옅은 선' },
  { name: 'line-strong', utility: 'line-strong', light: '#d4d4d4', dark: 'rgba(255,255,255,0.16)', role: '강조 선' },
  { name: 'accent', utility: 'accent', light: '#2563eb', dark: '#3b62e5', role: '액센트 (v1 blue-600 / v2 로고 블루)' },
  { name: 'accent-hover', utility: 'accent-hover', light: '#1d4ed8', dark: '#6183ff', role: '액센트 호버' },
  { name: 'accent-soft', utility: 'accent-soft', light: 'rgba(37,99,235,0.08)', dark: 'rgba(59,98,229,0.16)', role: '액센트 배경 틴트' },
  { name: 'success', utility: 'success', light: '#16a34a', dark: '#22c55e', role: '상태 점·확인' },
]

export interface FixedColor {
  name: string
  utility: string
  value: string
  role: string
}

/** 테마와 무관한 브랜드 고정 컬러. */
export const BRAND_COLORS: FixedColor[] = [
  { name: 'brand', utility: 'brand', value: '#3b62e5', role: '로고 블루 — 마크 앞 사각형, 배너 CTA' },
  { name: 'brand-bright', utility: 'brand-bright', value: '#6183ff', role: '로고 블루 호버' },
  { name: 'brand-deep', utility: 'brand-deep', value: '#1a2a72', role: '유리 마크 그라데이션 끝' },
  { name: 'ink', utility: 'ink', value: '#0a0a0a', role: 'v1 잉크 — 항상 검정이어야 할 곳' },
  { name: 'paper', utility: 'paper', value: '#ffffff', role: '항상 흰색이어야 할 곳' },
  { name: 'kakao', utility: 'kakao', value: '#fee500', role: '카카오 채널 버튼' },
]

/** v2 Capabilities 열 액센트와 Footer 워드마크 그라데이션이 공유하는 4색. */
export const SPECTRUM = [
  { name: 'blue', value: '#3B82F6', role: 'AI 엔지니어링 · 워드마크 0%' },
  { name: 'violet', value: '#8B5CF6', role: '웹 엔지니어링 · 워드마크 36%' },
  { name: 'teal', value: '#14B8B0', role: '앱·인터랙션 · 워드마크 68%' },
  { name: 'amber', value: '#F59E0B', role: '인프라·데이터 · 워드마크 100%' },
]

/** v2 AppCards 그라데이션. */
export const APP_GRADIENTS = [
  { name: 'HiNest', value: 'linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)' },
  { name: 'Muru', value: 'linear-gradient(160deg, #34E0D8 0%, #14B8B0 60%, #0C9A93 100%)' },
  { name: 'QTO', value: 'linear-gradient(160deg, #34343C 0%, #1D1D23 60%, #141418 100%)' },
  { name: 'GOMS', value: 'linear-gradient(160deg, #9D6BFF 0%, #7C3AED 55%, #6425D0 100%)' },
]

/** Mom-Work 푸터 네이비 톤. */
export const NAVY = [
  { name: 'navy-bg', value: '#0B1220', role: '푸터 바탕' },
  { name: 'navy-fg', value: '#E5E9F0', role: '푸터 본문' },
  { name: 'navy-dim', value: '#A9B1C2', role: '푸터 보조' },
  { name: 'navy-faint', value: '#6E7A90', role: '푸터 라벨·취소 단어' },
  { name: 'navy-word', value: '#1c2536', role: '워드마크 바탕 글자' },
]
