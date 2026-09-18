import 'react'

/* style={{ '--x': … }} 에 CSS 사용자 속성을 캐스트 없이 쓰기 위한 확장 */
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined
  }
}
