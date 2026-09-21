# efface design system

efface 가 만드는 모든 화면이 공유하는 색·서체·여백·움직임을 한 벌의 토큰과 컴포넌트로 묶은 디자인 시스템 문서 사이트.
efface.dev(v1) · v2.efface.dev(v2) · mom.efface.dev(배너·푸터) 소스에서 직접 추출했다.

- React 19 · TypeScript · Tailwind CSS v4 · Vite
- motion (Framer Motion) — 뷰포트 진입·스크롤 연동 모션
- three.js — 유리 로고 씬 · 3D 앱 아이콘 (동적 import)

## 개발

```bash
npm install
npm run dev        # http://localhost:5190
```

## 검증

```bash
npm run typecheck   # tsc -b (app · worker · node · tests)
npm run lint        # oxlint src worker tests
npm test            # node --test tests/*.test.ts — 의존성 없이 Node 내장 러너 (타입 스트리핑)
npm run build       # sitemap.xml 생성 포함
```

테스트는 순수 함수(이메일 도메인 완성 · 비밀번호 규칙 · 코드 토크나이저 · cn · canonical · 색 파싱)와
Worker 라우팅(404 · 301 · 보안 헤더 · 프록시 robots · Origin 게이트 · 테마 스크립트 CSP 해시)을 다룬다.
`tests/worker.test.ts` 는 Cloudflare 전역 타입이 DOM 과 충돌해 tsc 검사에서 빼고 node 가 그대로 돌린다.


```bash
npm run typecheck
npm run lint
npm run build
```

## 구조

```
src/
  index.css               # 토큰 (라이트/다크 듀얼 테마 · @theme inline) · 키프레임
  lib/motion.ts           # 이징 · duration · stagger · 스프링 · variants · 스칼라 이징
  hooks/                  # useMediaQuery · usePresence · useBodyScrollLock · useScrolledPast · useInViewOnce
  tokens/                 # 문서용 토큰 데이터 (colors · typography · motion)
  components/
    brand/                # LogoMark · Logo(v1) · LogoMarkGlass · LogoTile · LogoScene3D · AppIcon3D · EffaceLogo · Wordmark
    ui/                   # Button · Chip · Badge · Label · Card 계열 · Accordion · Counter · NumberedRow · IconTile · LinkUnderline
    motion/               # Reveal · RevealCSS · WordReveal · LetterReveal · Marquee · MagneticButton · ScrollProgress · ScrollLine
                          # CursorGlow · SpotlightText · TiltCard · Strike · TypeWriter · EffaceSentence
    layout/               # Nav(v2) · Header(v1) · Footer(v2 캔버스 워드마크) · SiteFooter(mom) · FooterV1 · FloatingCTA · Modal · LanguageToggle
    banner/               # EffaceBanner(1600×500 캐러셀) · EffaceBannerMobile
    three/                # glassScene · appIcon3d (v2 에서 이식)
  docs/                   # 문서 사이트 셸 · 페이지 · live.data.ts(라이브 페이지 목록)
worker/index.ts           # Cloudflare Worker — 정적 자산 + live-* 프록시
public/inspect.js         # Figma 식 요소 검사 오버레이
```

## 라이브 검사 (Live)

`/live/*` 페이지는 실제 서비스를 iframe 으로 띄우고 Figma Dev Mode 처럼 요소를 잰다.
스크린샷이 아니라 살아 있는 페이지라 화질 손실이 없고, 뷰포트를 바꿔 가며 볼 수 있다.

- `worker/index.ts` — `live-efface.efface.dev` · `live-v2.efface.dev` · `live-hinest.efface.dev` 로 들어온 요청을
  각각 efface.dev · v2.efface.dev · nest.hi-vits.com 으로 프록시하면서 `X-Frame-Options`/CSP 를 떼고
  `public/inspect.js` 를 `<head>` 에 인라인 주입한다. 그 외 호스트는 dist 정적 자산(문서 사이트).
- `public/inspect.js` — 검사 오버레이. 마우스를 올리면 content · padding · margin 박스와 크기, 누르면 고정(선택),
  선택한 채로 다른 요소에 올리면 둘 사이 거리. 8px 그리드. iframe 밖과는 `postMessage`, 같은 창에서는 `CustomEvent('ef-inspect')`.
- **활동** 탭 — `inspect.js` 가 프레임 안의 `fetch`/XHR 을 감싸 메서드 · 상태코드 · 소요시간 · 크기 · 요청/응답 본문(4KB)을
  기록하고, 정적 자산은 `PerformanceObserver(resource)`(교차 출처는 상태를 모르므로 `—`), 라우트 이동과 `console.error/warn`
  도 함께 보낸다. 최근 300건을 프레임이 버퍼로 들고 있어 패널을 나중에 열어도 `net:replay` 로 받아온다.
- 프록시는 `Origin`/`Referer` 를 업스트림 호스트로 바꿔 보낸다(업스트림 API 의 origin 허용 목록 통과) 그리고
  `Set-Cookie` 의 `Domain` 을 떼고 `SameSite=None; Secure` 로 맞춰 iframe 안에서도 로그인 세션이 유지된다.
- 문서 헤더의 **Dev** 버튼은 같은 스크립트를 문서 페이지 자체에 로드해 모든 컴포넌트 프리뷰를 잴 수 있게 한다.
- HiNest 는 `/preview`(미리보기 데모)로 들어간다. 권한별 화면은 `/preview?role=manager|admin|super|platform` 파라미터를
  HiNest 쪽이 지원해야 보인다 (HiNest-Client PR 참고).

## SEO · 보안 · 성능

- 라우트별 `<title>` · description · canonical · Open Graph · robots · JSON-LD 는 `src/docs/components/Seo.tsx` 가 `<head>` 에 써 넣는다
  (`DocPage` 가 `title`/`lead` 로 자동 호출). 링크 미리보기 봇용 정적 값과 `og.png` 는 `index.html` — 이미지는 `npm run og` 로 다시 만든다.
- `robots.txt` 는 `public/`, `sitemap.xml` 은 빌드 시 `vite.config.ts` 의 플러그인이 `src/docs/nav.ts` 에서 만든다 (Live 페이지 제외).
- Worker: 모르는 경로는 404 상태로 index.html, 끝 슬래시 301, HTTP→HTTPS 301, 문서 호스트에 CSP/HSTS/nosniff/Referrer/Permissions 헤더,
  `/assets/*` 는 immutable 캐시. live-* 프록시는 `X-Robots-Tag: noindex` + `frame-ancestors`(문서 호스트만) + 비-GET 은 신뢰 출처만.
- `index.html` 의 인라인 테마 스크립트는 CSP 해시로 허용된다 — 내용을 바꾸면 `worker/index.ts` 의 `THEME_SCRIPT_HASH` 도 바꿔야 하고, 테스트가 이를 검사한다.
- 디스플레이 폰트(Space Grotesk · Archivo Black)는 첫 화면에 없어 `src/lib/fonts.ts` 로 필요한 컴포넌트에서 지연 로드한다.

## 테마

두 테마를 한 벌의 시맨틱 토큰으로 다룬다. `[data-theme="light" | "dark"]` 로 범위를 정하므로
문서 안에서 프리뷰마다 다른 테마를 중첩할 수 있다. 유틸리티는 `bg-bg` · `text-fg` · `border-line` · `text-accent` 처럼 토큰 이름을 그대로 쓴다.

## 배포 (Cloudflare Workers · ds.efface.dev)

`dist` 를 Workers Static Assets 로 서빙하고, `worker/index.ts` 가 live-* 호스트만 프록시한다 (`wrangler.jsonc`).

```bash
npm run deploy         # build + wrangler deploy → https://ds.efface.dev
```

- 커스텀 도메인(component · live-efface · live-v2 · live-hinest)은 `wrangler.jsonc` 의 `routes` 로 배포 시 DNS 까지 연결된다 (efface.dev 존과 같은 계정)
- 자동 배포: 리포지토리 변수 `CF_DEPLOY=true`, 시크릿 `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` 설정 시 `main` push 마다 `.github/workflows/deploy.yml` 실행

## 사용하기 · 라이선스

MIT. 패키지가 아니라 **복사해서 쓰는** 방식이다 — 컴포넌트 파일 하나 + `src/lib/cn.ts`·`src/lib/motion.ts` + `src/index.css` 의 토큰. 사이트의 각 데모 카드 "코드" 버튼에서 사용 예시·실제 소스·같이 복사할 파일을 볼 수 있고, `/usage` 에 순서가 있다.

## 자료 출처

- `public/space/*` 행성 텍스처 — NASA(Blue Marble · Black Marble, three.js 예제의 지구 법선·반사 맵) 및 [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0). 화면용으로 1k–2k WebP 로 줄여 담았다(태양은 절차적 셰이더). 국경·나라 이름은 Natural Earth 50m 을 그려 넣었다.
- `public/macos/*` 앱 아이콘 — 시연 영상 전용. 각 앱 소유자의 상표.
