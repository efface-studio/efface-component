/**
 * Space Grotesk · Archivo Black (Google Fonts) — 첫 화면엔 안 쓰이고 fx·푸터 워드마크·타이포 페이지에서만 쓴다.
 * index.html 에 두면 렌더를 막는 교차 출처 CSS 라, 필요한 컴포넌트가 마운트될 때 한 번만 붙인다.
 */
const HREF = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&display=swap'
const ID = 'ef-display-fonts'
let pending: Promise<void> | null = null

export function loadDisplayFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  if (pending) return pending
  pending = new Promise<void>((resolve) => {
    const existing = document.getElementById(ID) as HTMLLinkElement | null
    const link = existing ?? document.createElement('link')
    if (!existing) {
      link.id = ID
      link.rel = 'stylesheet'
      link.href = HREF
      document.head.appendChild(link)
    }
    const done = () => {
      // 캔버스 글자(워드마크)는 DOM 사용이 없어 폰트 파일을 안 받아오니 직접 요청한다
      const loads = ["700 16px 'Space Grotesk'", "500 16px 'Space Grotesk'", "400 16px 'Archivo Black'"].map((f) => document.fonts?.load(f).catch(() => []) ?? Promise.resolve([]))
      Promise.all(loads).then(() => resolve(), () => resolve())
    }
    if (existing && existing.sheet) done()
    else {
      link.addEventListener('load', done, { once: true })
      link.addEventListener('error', () => resolve(), { once: true })
    }
  })
  return pending
}
