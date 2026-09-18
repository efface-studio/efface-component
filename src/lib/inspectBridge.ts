/** inspect.js 와 주고받는 메시지 타입. iframe 밖(postMessage)과 같은 창(CustomEvent) 모두 이 형태. */

export interface InspectFont {
  family: string
  size: string
  weight: string
  lineHeight: string
  letterSpacing: string
}

/** 스타일시트에서 찾은 상태별 규칙 한 줄 */
export interface InspectStateRule {
  state: 'hover' | 'focus' | 'focus-visible' | 'focus-within' | 'active' | 'disabled' | 'checked' | 'open'
  css: string
  selector: string
  /** 조상 상태(group-hover 등)에 걸리는 규칙 */
  group: boolean
}

export interface InspectInfo {
  tag: string
  id: string
  classes: string[]
  rect: { x: number; y: number; w: number; h: number }
  margin: [number, number, number, number]
  padding: [number, number, number, number]
  border: [number, number, number, number]
  radius: string
  display: string
  position: string
  gap: string
  flex: string
  grid: string
  font: InspectFont
  color: string
  background: string
  borderColor: string
  shadow: string
  opacity: string
  text: string
  /** 선택(클릭)했을 때만 채워진다 */
  states: InspectStateRule[]
  css: string
}

/** 두 요소 사이 거리 한 줄. dir: 안쪽 요소 기준 바깥 변(top/bottom/left/right) 또는 떨어진 요소 사이 v/h */
export interface InspectDistance {
  d: number
  dir: 'top' | 'bottom' | 'left' | 'right' | 'v' | 'h'
}

/** 프레임 안에서 일어난 일 한 건 — 요청(fetch/xhr/asset/document) · 라우트 이동 · 콘솔 오류 */
export interface NetEntry {
  id: number
  ts: number
  kind: 'fetch' | 'xhr' | 'asset' | 'document' | 'route' | 'console'
  method?: string
  url?: string
  path?: string
  status?: number | null
  statusText?: string
  ok?: boolean | null
  ms?: number | null
  size?: number | null
  type?: string | null
  req?: string | null
  res?: string | null
  error?: string
  pending?: boolean
  level?: 'error' | 'warn'
  text?: string
}

export type InspectMessage =
  | { source: 'ef-inspect'; type: 'ready'; path: string; title: string; inspect: boolean }
  | { source: 'ef-inspect'; type: 'net'; entry: NetEntry }
  | { source: 'ef-inspect'; type: 'net:batch'; entries: NetEntry[] }
  | { source: 'ef-inspect'; type: 'route'; path: string; title: string }
  | { source: 'ef-inspect'; type: 'state'; on: boolean; grid: boolean }
  | { source: 'ef-inspect'; type: 'hover'; info: InspectInfo | null; distances: InspectDistance[] | null }
  | { source: 'ef-inspect'; type: 'select'; info: InspectInfo | null }

export type InspectCommand =
  | { cmd: 'enable' }
  | { cmd: 'disable' }
  | { cmd: 'toggle' }
  | { cmd: 'grid'; value: boolean }
  | { cmd: 'goto'; path: string }
  | { cmd: 'clear' }
  | { cmd: 'ping' }
  | { cmd: 'net:replay' }
  | { cmd: 'net:clear' }

export function isInspectMessage(data: unknown): data is InspectMessage {
  return !!data && typeof data === 'object' && (data as { source?: string }).source === 'ef-inspect'
}

/** iframe 안의 inspect.js 에 명령을 보낸다 — 프레임의 출처를 지정해 다른 곳으로 이동한 프레임엔 닿지 않게 */
export function sendToFrame(frame: HTMLIFrameElement | null, cmd: InspectCommand, targetOrigin: string) {
  frame?.contentWindow?.postMessage({ source: 'ef-inspect-cmd', ...cmd }, targetOrigin)
}

declare global {
  interface Window {
    __efInspect?: {
      enable: () => void
      disable: () => void
      toggle: () => void
      grid: (v: boolean) => void
      isOn: () => boolean
      command: (msg: unknown) => void
    }
  }
}

/** 같은 창에 inspect.js 를 (한 번만) 로드하고 API 를 돌려준다 */
let loading: Promise<void> | null = null
export function loadInspectScript(): Promise<void> {
  if (window.__efInspect) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = '/inspect.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('inspect.js 를 불러오지 못했어요'))
    document.head.appendChild(s)
  })
  return loading
}
