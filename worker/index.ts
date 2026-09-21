/**
 * ds.efface.dev Worker — 엔트리. Workers 런타임은 엔트리 모듈에서 handler 외의 named export 를 거부하므로
 * 로직은 ./lib.ts 에 있고 여기선 fetch 핸들러만 내보낸다.
 */
import { DOCS_HOST, DOCS_ORIGINS, FRAME_ANCESTORS, LEGACY_DOCS_HOSTS, SECURITY_HEADERS, STRIP_HEADERS, UPSTREAMS, inspectScript, rewriteLocation, rewriteSetCookie, serveDocs, withDocsHeaders, type Env } from './lib.ts'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    // 평문 HTTP 는 HTTPS 로 — 방문자 스킴은 Cloudflare 가 cf-visitor 로 알려준다 (로컬 wrangler dev 엔 없어 건너뛴다)
    if ((request.headers.get('cf-visitor') ?? '').includes('"scheme":"http"')) {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }
    // 옛 문서 주소는 새 주소로 — 경로·쿼리 그대로
    if (LEGACY_DOCS_HOSTS.has(url.hostname)) {
      url.hostname = DOCS_HOST
      return Response.redirect(url.toString(), 301)
    }
    const upstream = UPSTREAMS[url.hostname]
    if (!upstream) {
      // 끝 슬래시는 한 형태로 — 같은 페이지가 두 URL 로 색인되지 않게
      if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.replace(/\/+$/, '')
        return Response.redirect(url.toString(), 301)
      }
      return withDocsHeaders(await serveDocs(env, request, url), url)
    }

    // 프록시 호스트는 검색에 넣지 않는다 — 원본 사이트의 복사본이다
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400', ...SECURITY_HEADERS } })
    }
    if (url.pathname === '/sitemap.xml') return new Response('not found', { status: 404, headers: { 'cache-control': 'no-store', ...SECURITY_HEADERS } })

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
    out.set('x-robots-tag', 'noindex, nofollow, noarchive')
    const loc = res.headers.get('location')
    if (loc) out.set('location', rewriteLocation(loc, upstream, url))
    // iframe 안에서 세션(로그인 · HiNest 미리보기 플래그)이 유지되도록 쿠키 도메인을 뗀다.
    // ds.efface.dev 와 live-*.efface.dev 는 같은 사이트(efface.dev)라 SameSite=Lax 로도 프레임 안에서 전송된다 —
    // 업스트림이 준 SameSite 는 그대로 두고 Secure 만 보장한다.
    const cookies = res.headers.getSetCookie?.() ?? []
    if (cookies.length) {
      out.delete('set-cookie')
      for (const c of cookies) out.append('set-cookie', rewriteSetCookie(c))
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
          el.append('<meta name="robots" content="noindex, nofollow">', { html: true })
          el.append(`<script data-ef-ignore>${script}</script>`, { html: true })
        },
      })
      .transform(new Response(res.body, { status: res.status, statusText: res.statusText, headers: out }))
    return injected
  },
} satisfies ExportedHandler<Env>
