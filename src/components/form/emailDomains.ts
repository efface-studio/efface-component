/**
 * 이메일 도메인 자동완성 후보 — 앞글자 매칭이라 순서가 곧 우선순위.
 * g→gmail.com · n→naver.com · k→kakao.com · d→daum.net · h→hanmail.net · e→efface.dev …
 */
export const EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'naver.com',
  'kakao.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  'icloud.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'yahoo.co.kr',
  'efface.dev',
  'proton.me',
  'protonmail.com',
  'me.com',
  'live.com',
  'msn.com',
  'aol.com',
]

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

/** `@` 뒤에 친 글자로 가장 먼저 맞는 도메인의 나머지를 돌려준다. 없으면 null */
export function completeDomain(value: string, domains: readonly string[] = EMAIL_DOMAINS): { domain: string; rest: string } | null {
  const at = value.indexOf('@')
  if (at <= 0) return null
  const typed = value.slice(at + 1)
  if (typed.includes('@') || /\s/.test(typed)) return null
  const lower = typed.toLowerCase()
  const domain = domains.find((d) => d.startsWith(lower) && d !== lower)
  return domain ? { domain, rest: domain.slice(typed.length) } : null
}
