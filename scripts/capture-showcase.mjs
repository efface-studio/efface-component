/**
 * 쇼케이스 스크린샷 캡처 — 세 프로젝트의 모든 페이지를 풀페이지 JPEG 로 저장한다.
 *
 *   node scripts/capture-showcase.mjs            # 전부
 *   node scripts/capture-showcase.mjs hinest      # 프로젝트 하나만
 *
 * 결과: public/showcase/<project>/<slug>[-mobile].jpg + src/docs/showcase.manifest.json
 * HiNest 는 로컬 미리보기 모드(http://localhost:1000/preview)로 캡처한다 — 데모 사용자의
 * 권한은 sessionStorage 'hinest:preview:role' 로 바꾼다(HiNest 쪽 임시 패치 필요).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = path.resolve('public/showcase')
const MANIFEST = path.resolve('src/docs/showcase.manifest.json')
const ONLY = process.argv[2]

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 }
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const H = 'http://localhost:1000'
const HINEST_APP = [
  ['dashboard', '/', '대시보드'],
  ['schedule', '/schedule', '일정'],
  ['attendance', '/attendance', '근태'],
  ['journal', '/journal', '업무 일지'],
  ['notice', '/notice', '공지'],
  ['directory', '/directory', '구성원'],
  ['documents', '/documents', '문서'],
  ['approvals', '/approvals', '결재'],
  ['org', '/org', '조직도'],
  ['expense', '/expense', '경비'],
  ['meetings', '/meetings', '회의록'],
  ['meeting-detail', '/meetings/m1', '회의록 상세'],
  ['accounts', '/accounts', '서비스 계정'],
  ['snippets', '/snippets', '스니펫'],
  ['memos', '/memos', '메모'],
  ['payroll', '/payroll', '급여명세서'],
  ['notifications', '/notifications', '알림'],
  ['profile', '/profile', '마이페이지'],
  ['project', '/projects/p1', '프로젝트'],
]

/** @type {{project:string, slug:string, title:string, url:string, viewport?:'desktop'|'mobile', role?:string, group:string, setup?:'hinest'}[]} */
const PAGES = [
  // ── efface.dev (v1) ──
  ...[
    ['home', '/', '홈'], ['home-en', '/en', '홈 (EN)'], ['apply', '/apply', '프로젝트 신청'],
    ['privacy', '/privacy', '개인정보처리방침'], ['terms', '/terms', '이용약관'],
    ['work-efface', '/work/EFFACE', '작업 — efface'], ['work-nest', '/work/NEST', '작업 — HiNest'], ['work-teamharibo', '/work/TEAMHARIBO', '작업 — Team Haribo'],
  ].map(([slug, p, title]) => ({ project: 'efface', slug, title, url: `https://efface.dev${p}`, group: '사이트' })),
  ...[
    ['demo-clinic', '/demo/clinic', '클리닉 — 홈'], ['demo-clinic-doctors', '/demo/clinic/doctors', '클리닉 — 의료진'], ['demo-clinic-reserve', '/demo/clinic/reserve', '클리닉 — 예약'],
    ['demo-restaurant', '/demo/restaurant', '레스토랑 — 홈'], ['demo-restaurant-menu', '/demo/restaurant/menu', '레스토랑 — 메뉴'], ['demo-restaurant-reservations', '/demo/restaurant/reservations', '레스토랑 — 예약'],
    ['demo-shop', '/demo/shop', '쇼핑몰 — 홈'], ['demo-shop-product', '/demo/shop/product/p1', '쇼핑몰 — 상품'], ['demo-shop-best', '/demo/shop/best', '쇼핑몰 — 베스트'],
    ['demo-wedding', '/demo/wedding', '웨딩 초대장'],
  ].map(([slug, p, title]) => ({ project: 'efface', slug, title, url: `https://efface.dev${p}`, group: '데모 사이트' })),
  ...[['home', '/'], ['demo-shop', '/demo/shop'], ['demo-wedding', '/demo/wedding']].map(([slug, p]) => ({ project: 'efface', slug, title: '', url: `https://efface.dev${p}`, group: '모바일', viewport: 'mobile' })),

  // ── v2.efface.dev ──
  ...[['home', '/', '홈'], ['home-en', '/en', '홈 (EN)'], ['policies', '/policies', '정책']].map(([slug, p, title]) => ({ project: 'v2', slug, title, url: `https://v2.efface.dev${p}`, group: '사이트' })),
  ...[['home', '/'], ['policies', '/policies']].map(([slug, p]) => ({ project: 'v2', slug, title: '', url: `https://v2.efface.dev${p}`, group: '모바일', viewport: 'mobile' })),

  // ── HiNest ──
  ...[
    ['login', '/login', '로그인'], ['signup', '/signup', '회원가입'], ['company-signup', '/company-signup', '회사 등록'],
    ['forgot-password', '/forgot-password', '비밀번호 찾기'], ['download', '/download', '앱 다운로드'], ['privacy', '/privacy', '개인정보처리방침'], ['terms', '/terms', '이용약관'],
  ].map(([slug, p, title]) => ({ project: 'hinest', slug, title, url: `${H}${p}`, group: '공개 페이지' })),
  ...HINEST_APP.map(([slug, p, title]) => ({ project: 'hinest', slug: `member-${slug}`, title, url: `${H}${p}`, group: '사원', role: 'MEMBER', setup: 'hinest' })),
  ...[['dashboard', '/'], ['approvals', '/approvals'], ['attendance', '/attendance'], ['payroll', '/payroll'], ['directory', '/directory'], ['schedule', '/schedule']]
    .map(([slug, p]) => ({ project: 'hinest', slug: `manager-${slug}`, title: HINEST_APP.find((x) => x[1] === p)?.[2] ?? slug, url: `${H}${p}`, group: '팀장', role: 'MANAGER', setup: 'hinest' })),
  ...[['dashboard', '/'], ['admin', '/admin'], ['approvals', '/approvals'], ['attendance', '/attendance'], ['payroll', '/payroll'], ['directory', '/directory'], ['expense', '/expense']]
    .map(([slug, p]) => ({ project: 'hinest', slug: `admin-${slug}`, title: p === '/admin' ? '관리자 설정' : (HINEST_APP.find((x) => x[1] === p)?.[2] ?? slug), url: `${H}${p}`, group: '관리자', role: 'ADMIN', setup: 'hinest' })),
  ...[['super-admin', '/super-admin', '운영 콘솔'], ['platform', '/platform', '플랫폼 관리'], ['design-system', '/design-system', '디자인 시스템']]
    .map(([slug, p, title]) => ({ project: 'hinest', slug: `super-${slug}`, title, url: `${H}${p}`, group: '운영 콘솔', role: 'SUPER', setup: 'hinest' })),
  ...[['dashboard', '/'], ['menu', '/menu'], ['schedule', '/schedule'], ['attendance', '/attendance'], ['meetings', '/meetings'], ['notifications', '/notifications'], ['profile', '/profile']]
    .map(([slug, p]) => ({ project: 'hinest', slug: `mobile-${slug}`, title: p === '/menu' ? '전체 메뉴' : (HINEST_APP.find((x) => x[1] === p)?.[2] ?? slug), url: `${H}${p}`, group: '모바일', role: 'MEMBER', setup: 'hinest', viewport: 'mobile' })),
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 지연 로드·IntersectionObserver 애니메이션이 다 뜨도록 끝까지 스크롤했다가 돌아온다 */
async function settle(page) {
  await page.evaluate(async () => {
    const sc = window.__capScroller ?? document.scrollingElement
    const h = () => sc.scrollHeight
    for (let y = 0; y < h(); y += 600) {
      sc.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    sc.scrollTo(0, h())
    await new Promise((r) => setTimeout(r, 400))
    sc.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 300))
  })
  await sleep(900)
}

/** 실제로 스크롤되는 요소를 찾는다 — 문서가 아니면(앱 셸의 내부 스크롤) 가장 큰 overflow 컨테이너. */
async function findScroller(page) {
  return page.evaluate(() => {
    const doc = document.scrollingElement ?? document.documentElement
    if (doc.scrollHeight > doc.clientHeight + 10) {
      window.__capScroller = doc
      return { inner: false, total: doc.scrollHeight, vh: doc.clientHeight }
    }
    let best = null
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el)
      if (!/(auto|scroll)/.test(cs.overflowY)) continue
      if (el.scrollHeight <= el.clientHeight + 10) continue
      const r = el.getBoundingClientRect()
      if (!best || r.width * r.height > best.area) best = { el, area: r.width * r.height }
    }
    if (best) {
      window.__capScroller = best.el
      return { inner: true, total: best.el.scrollHeight, vh: best.el.clientHeight }
    }
    window.__capScroller = doc
    return { inner: false, total: doc.scrollHeight, vh: doc.clientHeight }
  })
}

/**
 * 뷰포트 단위로 스크롤하며 찍은 프레임을 세로로 이어 붙인다. fullPage 는 100svh·sticky 씬에서
 * 깨지지만 이 방식은 sticky 씬의 진행 상태가 순서대로 남고, 내부 스크롤 컨테이너도 잡는다.
 * 두 번째 프레임부터는 상단 고정 헤더를 숨겨 반복되지 않게 한다.
 */
async function captureStitched(page, file, dpr) {
  const { total, vh } = await findScroller(page)
  const frames = []
  const maxY = Math.max(0, total - vh)
  let y = 0
  let idx = 0
  for (;;) {
    const target = Math.min(y, maxY)
    await page.evaluate((t) => window.__capScroller.scrollTo(0, t), target)
    await sleep(idx === 0 ? 900 : 550)
    if (idx === 1) {
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el)
          if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
          const r = el.getBoundingClientRect()
          if (r.top <= 4 && r.height < 160 && r.width > innerWidth * 0.5) el.setAttribute('data-cap-hide', '')
        }
        const st = document.createElement('style')
        st.textContent = '[data-cap-hide]{visibility:hidden!important}'
        document.head.appendChild(st)
      })
      await sleep(80)
    }
    const buf = await page.screenshot({ type: 'png' })
    // 마지막 프레임이 maxY 에 걸려 이전 프레임과 겹치면 겹친 만큼 위를 잘라낸다
    const overlap = Math.max(0, y - target)
    frames.push({ buf, crop: Math.round(overlap * dpr) })
    if (y + vh >= total) break
    y += vh
    idx++
    if (idx > 60) break // 안전장치 — 6만px 넘는 페이지는 자른다
  }
  const metas = await Promise.all(frames.map((f) => sharp(f.buf).metadata()))
  const width = metas[0].width
  const parts = frames.map((f, i) => ({ buf: f.buf, top: f.crop, height: metas[i].height - f.crop }))
  const totalH = parts.reduce((s, p) => s + p.height, 0)
  const layers = []
  let off = 0
  for (const p of parts) {
    const b = p.top > 0 ? await sharp(p.buf).extract({ left: 0, top: p.top, width, height: p.height }).png().toBuffer() : p.buf
    layers.push({ input: b, top: off, left: 0 })
    off += p.height
  }
  await sharp({ create: { width, height: totalH, channels: 3, background: '#000' } }).composite(layers).jpeg({ quality: 72, mozjpeg: true }).toFile(file)
  return { w: Math.round(width / dpr), h: Math.round(totalH / dpr), frames: frames.length }
}

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl'] })
  const manifest = []
  const targets = PAGES.filter((p) => !ONLY || p.project === ONLY)
  let hinestReady = false

  for (const t of targets) {
    const page = await browser.newPage()
    const mobile = t.viewport === 'mobile'
    await page.setViewport(mobile ? MOBILE : DESKTOP)
    if (mobile) await page.setUserAgent(MOBILE_UA)
    // 진입 모션·마퀴가 스크린샷을 흔들지 않게 시간을 앞당긴다 (CSS 애니메이션은 그대로 재생)
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])

    try {
      if (t.setup === 'hinest') {
        // 미리보기 모드 부트스트랩 → 역할 지정 → 대상 페이지로
        await page.goto(`${H}/preview`, { waitUntil: 'networkidle0', timeout: 60000 })
        await page.evaluate((role) => {
          sessionStorage.setItem('hinest:preview', '1')
          sessionStorage.setItem('hinest:preview:role', role)
          // 온보딩 카드·설치 배너는 캡처에서 뺀다
          sessionStorage.setItem('hinest:preview-onboarded', '1')
        }, t.role ?? 'MEMBER')
        await page.goto(t.url, { waitUntil: 'networkidle0', timeout: 60000 })
        await sleep(1200)
        hinestReady = true
      } else {
        await page.goto(t.url, { waitUntil: 'networkidle0', timeout: 90000 })
      }
      await findScroller(page)
      await settle(page)

      const dir = path.join(OUT, t.project)
      await mkdir(dir, { recursive: true })
      const file = `${t.slug}${mobile ? '-mobile' : ''}.jpg`
      const full = path.join(dir, file)
      const size = await captureStitched(page, full, mobile ? MOBILE.deviceScaleFactor : DESKTOP.deviceScaleFactor)
      manifest.push({ project: t.project, slug: t.slug, title: t.title, group: t.group, role: t.role ?? null, viewport: mobile ? 'mobile' : 'desktop', path: new URL(t.url).pathname, file: `/showcase/${t.project}/${file}`, w: size.w, h: size.h })
      console.log(`✓ ${t.project}/${file}  ${size.w}×${size.h} (${size.frames} frames)`)
    } catch (err) {
      console.error(`✗ ${t.project}/${t.slug}: ${err.message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  if (!ONLY) {
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  } else {
    // 부분 캡처는 기존 manifest 의 해당 프로젝트만 교체
    let prev = []
    try { prev = JSON.parse(await (await import('node:fs/promises')).readFile(MANIFEST, 'utf8')) } catch {}
    const merged = [...prev.filter((m) => m.project !== ONLY), ...manifest]
    await writeFile(MANIFEST, JSON.stringify(merged, null, 2) + '\n')
  }
  console.log(`manifest: ${manifest.length} pages`)
  void hinestReady
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
