/**
 * component.efface.dev Worker
 *  - 기본 호스트: dist 정적 자산(문서 사이트) 서빙
 *  - live-*.efface.dev: 실제 서비스를 같은 경로로 프록시하면서 검사 스크립트(inspect.js)를 주입한다.
 *    iframe 에 넣을 수 있게 X-Frame-Options / CSP 는 떼고, 리다이렉트는 우리 호스트로 되돌린다.
 */
export interface Env {
  ASSETS: Fetcher
}

const UPSTREAMS: Record<string, string> = {
  'live-efface.efface.dev': 'https://efface.dev',
  'live-v2.efface.dev': 'https://v2.efface.dev',
  'live-hinest.efface.dev': 'https://nest.hi-vits.com',
}

/** 프록시된 응답에서 떼는 헤더 — 프레이밍/격리 정책은 우리가 다시 세팅한다 */
const STRIP_HEADERS = [
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
const DOCS_ORIGINS = new Set(['https://component.efface.dev', 'http://localhost:5190', 'http://127.0.0.1:5190'])
const FRAME_ANCESTORS = `frame-ancestors 'self' ${[...DOCS_ORIGINS].join(' ')}`

/** 문서 호스트 CSP — 인라인 스크립트는 index.html 의 테마 부트스트랩 하나뿐(해시). 바꾸면 해시도 갱신할 것 */
const THEME_SCRIPT_HASH = 'sha256-Mh7GIM5q6yB1OPepcOsDkUxzh2f6hMmdi6VWBSlUSNA='
const DOCS_CSP = [
  "default-src 'self'",
  `script-src 'self' '${THEME_SCRIPT_HASH}'`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-src https://live-efface.efface.dev https://live-v2.efface.dev https://live-hinest.efface.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
}

/** 정적 자산 응답(불변)에 보안 헤더를 얹는다 */
function withDocsHeaders(res: Response, url: URL): Response {
  const h = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v)
  const html = (h.get('content-type') ?? '').includes('text/html')
  if (html) {
    h.set('content-security-policy', DOCS_CSP)
    h.set('x-frame-options', 'DENY')
  }
  void url
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
}

let inspectSrc: string | null = null

async function inspectScript(env: Env, origin: string): Promise<string> {
  if (inspectSrc) return inspectSrc
  const res = await env.ASSETS.fetch(new Request(`${origin}/inspect.js`))
  inspectSrc = res.ok ? await res.text() : ''
  return inspectSrc
}

function rewriteLocation(loc: string, upstream: string, self: URL): string {
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    // 평문 HTTP 는 HTTPS 로 (로컬 wrangler dev 는 제외)
    if (url.protocol === 'http:' && url.hostname.endsWith('efface.dev')) {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }
    const upstream = UPSTREAMS[url.hostname]
    if (!upstream) return withDocsHeaders(await env.ASSETS.fetch(request), url)

    // 요청 출처 — 프레임 자신(live-* origin) 또는 문서 호스트만 신뢰한다.
    // 그 밖의 사이트에서 온 상태 변경 요청은 여기서 끊는다(업스트림 CSRF 방어를 우리가 대신 무너뜨리지 않게).
    const origin = request.headers.get('origin')
    const site = request.headers.get('sec-fetch-site')
    const trusted = origin === url.origin || (origin != null && DOCS_ORIGINS.has(origin)) || (origin == null && (site == null || site === 'same-origin' || site === 'none'))
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !trusted) {
      return new Response('forbidden', { status: 403, headers: { 'cache-control': 'no-store', 'x-ef-upstream-status': '0' } })
    }

    const target = new URL(url.pathname + url.search, upstream)
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.set('accept-encoding', 'identity')
    headers.set('x-forwarded-host', url.host)
    // 업스트림 API 가 Origin 허용 목록을 보는 경우(HiNest "origin not allowed") — 신뢰하는 출처일 때만 원래 호스트로 바꿔 준다
    if (origin && trusted) headers.set('origin', upstream)
    const referer = headers.get('referer')
    if (referer) {
      try {
        const r = new URL(referer)
        if (r.host === url.host) headers.set('referer', new URL(r.pathname + r.search, upstream).toString())
      } catch {
        /* 이상한 referer — 그대로 */
      }
    }

    let res: Response
    try {
      res = await fetch(target.toString(), {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
        // 쿠키가 실린 요청은 절대 공유 캐시에 남기지 않는다
        ...(request.headers.has('cookie') || request.method !== 'GET' ? { cache: 'no-store' as const } : {}),
      })
    } catch {
      return new Response('upstream unavailable', { status: 502, headers: { 'cache-control': 'no-store', 'x-ef-upstream-status': '0', ...SECURITY_HEADERS } })
    }

    const out = new Headers(res.headers)
    for (const h of STRIP_HEADERS) out.delete(h)
    // 프레이밍은 문서 호스트에서만 — 업스트림 XFO/CSP 를 뗀 자리에 우리 정책을 세운다
    out.set('content-security-policy', FRAME_ANCESTORS)
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.set(k, v)
    const loc = res.headers.get('location')
    if (loc) out.set('location', rewriteLocation(loc, upstream, url))
    // iframe 안에서 세션(로그인 · HiNest 미리보기 플래그)이 유지되도록 쿠키 도메인을 뗀다.
    // component.efface.dev 와 live-*.efface.dev 는 같은 사이트(efface.dev)라 SameSite=Lax 로도 프레임 안에서 전송된다 —
    // 업스트림이 준 SameSite 는 그대로 두고 Secure 만 보장한다.
    const cookies = res.headers.getSetCookie?.() ?? []
    if (cookies.length) {
      out.delete('set-cookie')
      for (const c of cookies) {
        let v = c.replace(/;\s*domain=[^;]+/i, '')
        if (!/;\s*secure/i.test(v)) v += '; Secure'
        out.append('set-cookie', v)
      }
    }
    // 부모(문서 사이트)가 상태를 읽을 수 있게 업스트림 상태를 헤더로도 남긴다
    out.set('x-ef-upstream-status', String(res.status))

    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('text/html')) {
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out })
    }

    const script = await inspectScript(env, `https://${url.host.replace(/^live-[^.]+\./, 'component.')}`)
    // 주입 스크립트가 바뀌면 바로 반영되도록 프록시된 HTML 은 캐시하지 않는다
    out.set('cache-control', 'no-store')
    const injected = new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(`<script data-ef-ignore>${script}</script>`, { html: true })
        },
      })
      .transform(new Response(res.body, { status: res.status, statusText: res.statusText, headers: out }))
    return injected
  },
} satisfies ExportedHandler<Env>
