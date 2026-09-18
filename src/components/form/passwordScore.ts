/** 비밀번호 규칙 — 체크리스트와 점수가 같은 기준을 쓴다 */
export const PASSWORD_RULES = [
  { label: '8자 이상', test: (v: string) => v.length >= 8 },
  { label: '대문자와 소문자', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: '숫자 하나 이상', test: (v: string) => /\d/.test(v) },
  { label: '기호 하나 이상', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

/** 0~4 */
export function passwordScore(v: string): number {
  if (!v) return 0
  return PASSWORD_RULES.reduce((n, r) => n + (r.test(v) ? 1 : 0), 0)
}
