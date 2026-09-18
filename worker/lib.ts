/**
 * component.efface.dev Worker — 순수 로직 (엔트리 worker/index.ts 는 default handler 만 내보낸다:
 * Workers 런타임은 엔트리의 다른 named export 를 거부한다)
 *  - 기본 호스트: dist 정적 자산(문서 사이트) 서빙
 *  - live-*.efface.dev: 실제 서비스를 같은 경로로 프록시하면서 검사 스크립트(inspect.js)를 주입한다.
 *    iframe 에 넣을 수 있게 X-Frame-Options / CSP 는 떼고, 리다이렉트는 우리 호스트로 되돌린다.
 */
import { DOC_NAV } from '../src/docs/nav.ts'
import { LIVE_PROJECTS } from '../src/docs/live.data.ts'

export interface Env {
  ASSETS: Fetcher
}

/** SPA 가 그릴 수 있는 경로 — 그 밖의 HTML 응답은 404 로 내려 soft-404 를 막는다 */
export const KNOWN_ROUTES = new Set<string>([...DOC_NAV.flatMap((g) => g.links.map((l) => l.to)), '/live', ...LIVE_PROJECTS.map((p) => `/live/${p.id}`)])

export const UPSTREAMS: Record<string, string> = {
  'live-efface.efface.dev': 'https://efface.dev',
  'live-v2.efface.dev': 'https://v2.efface.dev',
  'live-hinest.efface.dev': 'https://nest.hi-vits.com',
}

/** 프록시된 응답에서 떼는 헤더 — 프레이밍/격리 정책은 우리가 다시 세팅한다 */
export const STRIP_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  // 업스트림 인프라 정보 — 밖에 알릴 이유가 없다
  'x-vercel-id',
  'x-vercel-cache',
  'server',
  'x-powered-by',
]

/** live-* 프레임을 임베드할 수 있는 문서 호스트 — inspect.js 의 PARENT_ORIGINS 와 같아야 한다 */
export const DOCS_ORIGINS = new Set(['https://component.efface.dev', 'http://localhost:5190', 'http://127.0.0.1:5190'])
export const FRAME_ANCESTORS = `frame-ancestors 'self' ${[...DOCS_ORIGINS].join(' ')}`

/** 문서 호스트 CSP — 인라인 스크립트는 index.html 의 테마 부트스트랩 하나뿐(해시). 바꾸면 해시도 갱신할 것 */
export const THEME_SCRIPT_HASH = 'sha256-Mh7GIM5q6yB1OPepcOsDkUxzh2f6hMmdi6VWBSlUSNA='
export const DOCS_CSP = [
  "default-src 'self'",
  // Cloudflare 가 존(zone) 설정으로 자동 삽입하는 Web Analytics 비콘 — 막히면 콘솔 오류만 남는다
  `script-src 'self' '${THEME_SCRIPT_HASH}' https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src https://live-efface.efface.dev https://live-v2.efface.dev https://live-hinest.efface.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
}

/** 자산이 있으면 그대로, 없으면 SPA 의 index.html (라우트를 모르면 404 상태로 — withDocsHeaders 가 정한다) */
export async function serveDocs(env: Env, request: Request, url: URL): Promise<Response> {
  const res = await env.ASSETS.fetch(request)
  if (res.status !== 404) return res
  const wantsHtml = (request.headers.get('accept') ?? '').includes('text/html') || !url.pathname.includes('.')
  if (!wantsHtml) return res
  return env.ASSETS.fetch(new Request(new URL('/index.html', url.origin), { headers: request.headers }))
}

/** 정적 자산 응답(불변)에 보안 헤더를 얹는다. 모르는 경로의 SPA 폴백은 404 로 */
const STATIC_FILE = /\.(?:webp|png|jpe?g|gif|svg|ico|woff2?|mp4|webm|json|txt|xml)$/i

export function withDocsHeaders(res: Response, url: URL): Response {
  const h = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v)
  const html = (h.get('content-type') ?? '').includes('text/html')
  let status = res.status
  if (html) {
    h.set('content-security-policy', DOCS_CSP)
    h.set('x-frame-options', 'DENY')
    if (status === 200 && !KNOWN_ROUTES.has(url.pathname.toLowerCase())) status = 404
  }
  // 해시 자산이 Worker 를 거쳐 온 경우(폴백)에도 같은 캐시 정책. 해시 없는 정적 파일(행성 텍스처·아이콘·폰트)은 하루 캐시 + 재검증
  if (url.pathname.startsWith('/assets/') && res.ok) h.set('cache-control', 'public, max-age=31536000, immutable')
  else if (res.ok && !html && STATIC_FILE.test(url.pathname)) h.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800')
  return new Response(res.body, { status, statusText: status === 404 ? 'Not Found' : res.statusText, headers: h })
}

let inspectSrc: string | null = null

export async function inspectScript(env: Env, origin: string): Promise<string> {
  if (inspectSrc) return inspectSrc
  const res = await env.ASSETS.fetch(new Request(`${origin}/inspect.js`))
  inspectSrc = res.ok ? await res.text() : ''
  return inspectSrc
}

/** 업스트림 Set-Cookie 를 프록시 호스트용으로 — Domain 제거, Secure 보장, SameSite 는 그대로 */
export function rewriteSetCookie(c: string): string {
  let v = c.replace(/;\s*domain=[^;]+/i, '')
  if (!/;\s*secure/i.test(v)) v += '; Secure'
  return v
}

export function rewriteLocation(loc: string, upstream: string, self: URL): string {
  try {
    const u = new URL(loc, upstream)
    if (u.origin === upstream) {
      u.protocol = self.protocol
      u.host = self.host
      return u.toString()
    }
  } catch {
    /* 상대 경로가 아닌 이상한 값 — 그대로 */
  }
  return loc
}

