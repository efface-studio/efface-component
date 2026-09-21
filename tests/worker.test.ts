import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import worker from '../worker/index.ts'
import { KNOWN_ROUTES, rewriteLocation, rewriteSetCookie, THEME_SCRIPT_HASH, withDocsHeaders } from '../worker/lib.ts'

type Env = { ASSETS: { fetch: (r: Request) => Promise<Response> } }
const html = (status = 200) => new Response('<!doctype html><title>x</title>', { status, headers: { 'content-type': 'text/html; charset=utf-8' } })
const assets: Env['ASSETS'] = {
  fetch: async (r) => {
    const p = new URL(r.url).pathname
    if (p === '/index.html' || p === '/') return html()
    if (p.startsWith('/assets/real')) return new Response('js', { headers: { 'content-type': 'text/javascript' } })
    return new Response(null, { status: 404 })
  },
}
const run = (url: string, init?: RequestInit) => worker.fetch(new Request(url, init), { ASSETS: assets } as never)

test('index.html 의 테마 스크립트 해시가 CSP 의 해시와 같다', () => {
  const src = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const m = src.match(/<script>([^<]+)<\/script>/)
  assert.ok(m, 'inline theme script')
  const hash = createHash('sha256').update(m[1]).digest('base64')
  assert.equal(THEME_SCRIPT_HASH, `sha256-${hash}`)
})

test('Set-Cookie 재작성 — Domain 제거, Secure 보장, SameSite 유지', () => {
  assert.equal(rewriteSetCookie('a=1; Domain=.nest.hi-vits.com; Path=/; HttpOnly; SameSite=Lax'), 'a=1; Path=/; HttpOnly; SameSite=Lax; Secure')
  assert.equal(rewriteSetCookie('a=1; Secure'), 'a=1; Secure')
})

test('Location 재작성 — 업스트림 origin 만 우리 호스트로', () => {
  const self = new URL('https://live-v2.efface.dev/x')
  assert.equal(rewriteLocation('https://v2.efface.dev/login', 'https://v2.efface.dev', self), 'https://live-v2.efface.dev/login')
  assert.equal(rewriteLocation('/rel', 'https://v2.efface.dev', self), 'https://live-v2.efface.dev/rel')
  assert.equal(rewriteLocation('https://other.example/', 'https://v2.efface.dev', self), 'https://other.example/')
})

test('문서 호스트 — 아는 경로 200 · 모르는 경로 404 · 보안 헤더', async () => {
  assert.ok(KNOWN_ROUTES.has('/foundations/colors'))
  const ok = await run('https://ds.efface.dev/foundations/colors')
  assert.equal(ok.status, 200)
  assert.match(ok.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/)
  assert.equal(ok.headers.get('x-frame-options'), 'DENY')
  assert.equal(ok.headers.get('x-content-type-options'), 'nosniff')
  const nf = await run('https://ds.efface.dev/nope')
  assert.equal(nf.status, 404)
  assert.match(nf.headers.get('content-type') ?? '', /text\/html/)
})

test('문서 호스트 — 끝 슬래시 301, 평문 HTTP 301, 자산 immutable', async () => {
  const slash = await run('https://ds.efface.dev/foundations/colors/')
  assert.equal(slash.status, 301)
  assert.equal(slash.headers.get('location'), 'https://ds.efface.dev/foundations/colors')
  const http = await run('https://ds.efface.dev/x', { headers: { 'cf-visitor': '{"scheme":"http"}' } })
  assert.equal(http.status, 301)
  assert.equal(http.headers.get('location'), 'https://ds.efface.dev/x')
  const asset = await run('https://ds.efface.dev/assets/real-abc.js')
  assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable')
})

test('프록시 호스트 — robots 차단 · sitemap 404 · 다른 출처의 POST 403', async () => {
  const robots = await run('https://live-hinest.efface.dev/robots.txt')
  assert.equal(robots.status, 200)
  assert.match(await robots.text(), /Disallow: \//)
  assert.equal((await run('https://live-hinest.efface.dev/sitemap.xml')).status, 404)
  const evil = await run('https://live-hinest.efface.dev/api/x', { method: 'POST', headers: { origin: 'https://evil.example' } })
  assert.equal(evil.status, 403)
})

test('해시 없는 정적 파일은 하루 캐시, HTML 은 그대로', () => {
  const img = withDocsHeaders(new Response('x', { headers: { 'content-type': 'image/webp' } }), new URL('https://ds.efface.dev/space/earth-day.webp'))
  assert.equal(img.headers.get('cache-control'), 'public, max-age=86400, stale-while-revalidate=604800')
  const html = withDocsHeaders(new Response('<html>', { headers: { 'content-type': 'text/html' } }), new URL('https://ds.efface.dev/'))
  assert.equal(html.headers.get('cache-control'), null)
  assert.match(html.headers.get('content-security-policy') ?? '', /static\.cloudflareinsights\.com/)
})

test('옛 주소 component.efface.dev 는 경로·쿼리를 유지한 채 ds.efface.dev 로 301', async () => {
  const res = await run('https://component.efface.dev/foundations/colors?x=1')
  assert.equal(res.status, 301)
  assert.equal(res.headers.get('location'), 'https://ds.efface.dev/foundations/colors?x=1')
})
