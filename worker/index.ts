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

const STRIP_HEADERS = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'cross-origin-resource-policy',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'strict-transport-security',
]

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
    const upstream = UPSTREAMS[url.hostname]
    if (!upstream) return env.ASSETS.fetch(request)

    const target = new URL(url.pathname + url.search, upstream)
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.set('accept-encoding', 'identity')
    headers.set('x-forwarded-host', url.host)
    // 업스트림 API 가 Origin 허용 목록을 보는 경우(HiNest "origin not allowed") — 우리 호스트 대신 원래 호스트로
    if (headers.has('origin')) headers.set('origin', upstream)
    const referer = headers.get('referer')
    if (referer) {
      try {
        const r = new URL(referer)
        if (r.host === url.host) headers.set('referer', new URL(r.pathname + r.search, upstream).toString())
      } catch {
        /* 이상한 referer — 그대로 */
      }
    }

    const res = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    })

    const out = new Headers(res.headers)
    for (const h of STRIP_HEADERS) out.delete(h)
    const loc = res.headers.get('location')
    if (loc) out.set('location', rewriteLocation(loc, upstream, url))
    // iframe 안에서 세션(로그인 · HiNest 미리보기 플래그)이 유지되도록 쿠키 도메인을 떼고,
    // 서드파티 컨텍스트(iframe)에서도 저장되게 SameSite=None; Secure 로 맞춘다
    const cookies = res.headers.getSetCookie?.() ?? []
    if (cookies.length) {
      out.delete('set-cookie')
      for (const c of cookies) {
        let v = c.replace(/;\s*domain=[^;]+/i, '').replace(/;\s*samesite=[^;]+/i, '')
        if (!/;\s*secure/i.test(v)) v += '; Secure'
        out.append('set-cookie', v + '; SameSite=None')
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
