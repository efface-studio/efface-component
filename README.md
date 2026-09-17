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
- 문서 헤더의 **검사** 버튼은 같은 스크립트를 문서 페이지 자체에 로드해 모든 컴포넌트 프리뷰를 잴 수 있게 한다.
- HiNest 는 `/preview`(미리보기 데모)로 들어간다. 권한별 화면은 `/preview?role=manager|admin|super|platform` 파라미터를
  HiNest 쪽이 지원해야 보인다 (HiNest-Client PR 참고).

## 테마

두 테마를 한 벌의 시맨틱 토큰으로 다룬다. `[data-theme="light" | "dark"]` 로 범위를 정하므로
문서 안에서 프리뷰마다 다른 테마를 중첩할 수 있다. 유틸리티는 `bg-bg` · `text-fg` · `border-line` · `text-accent` 처럼 토큰 이름을 그대로 쓴다.

## 배포 (Cloudflare Workers · component.efface.dev)

`dist` 를 Workers Static Assets 로 서빙하고, `worker/index.ts` 가 live-* 호스트만 프록시한다 (`wrangler.jsonc`).

```bash
npm run deploy         # build + wrangler deploy → https://component.efface.dev
```

- 커스텀 도메인(component · live-efface · live-v2 · live-hinest)은 `wrangler.jsonc` 의 `routes` 로 배포 시 DNS 까지 연결된다 (efface.dev 존과 같은 계정)
- 자동 배포: 리포지토리 변수 `CF_DEPLOY=true`, 시크릿 `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` 설정 시 `main` push 마다 `.github/workflows/deploy.yml` 실행
