/** inspect.js 와 주고받는 메시지 타입. iframe 밖(postMessage)과 같은 창(CustomEvent) 모두 이 형태. */

export interface InspectFont {
  family: string
  size: string
  weight: string
  lineHeight: string
  letterSpacing: string
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
}

export type InspectMessage =
  | { source: 'ef-inspect'; type: 'ready'; path: string; title: string; inspect: boolean }
  | { source: 'ef-inspect'; type: 'route'; path: string; title: string }
  | { source: 'ef-inspect'; type: 'state'; on: boolean; grid: boolean }
  | { source: 'ef-inspect'; type: 'hover'; info: InspectInfo | null; distances: number[] | null }
  | { source: 'ef-inspect'; type: 'select'; info: InspectInfo | null }

export type InspectCommand =
  | { cmd: 'enable' }
  | { cmd: 'disable' }
  | { cmd: 'toggle' }
  | { cmd: 'grid'; value: boolean }
  | { cmd: 'goto'; path: string }
  | { cmd: 'clear' }
  | { cmd: 'ping' }

export function isInspectMessage(data: unknown): data is InspectMessage {
  return !!data && typeof data === 'object' && (data as { source?: string }).source === 'ef-inspect'
}

/** iframe 안의 inspect.js 에 명령을 보낸다 */
export function sendToFrame(frame: HTMLIFrameElement | null, cmd: InspectCommand) {
  frame?.contentWindow?.postMessage({ source: 'ef-inspect-cmd', ...cmd }, '*')
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
