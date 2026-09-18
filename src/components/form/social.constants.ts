export type SocialProvider = 'google' | 'apple' | 'kakao' | 'naver' | 'github'

/** 표시 순서 — 글로벌(구글 · 애플 · 깃허브) 다음 국내(카카오 · 네이버) */
export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ['google', 'apple', 'github', 'kakao', 'naver']
