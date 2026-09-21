export const SITE_NAME = 'efface design system'
export const SITE_ORIGIN = 'https://ds.efface.dev'
export const SITE_DESCRIPTION = 'efface 제품들이 함께 쓰는 색, 글꼴, 간격, 모션을 한곳에 모았어요. 바로 미리 보고, 코드는 복사해서 쓰면 됩니다.'

/** 끝 슬래시·대소문자·쿼리를 정리한 canonical 경로 */
export function canonicalPath(pathname: string): string {
  const p = pathname.toLowerCase().replace(/\/+$/, '')
  return p === '' ? '/' : p
}
