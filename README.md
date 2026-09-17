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
  docs/                   # 문서 사이트 셸 · 페이지
```

## 테마

두 테마를 한 벌의 시맨틱 토큰으로 다룬다. `[data-theme="light" | "dark"]` 로 범위를 정하므로
문서 안에서 프리뷰마다 다른 테마를 중첩할 수 있다. 유틸리티는 `bg-bg` · `text-fg` · `border-line` · `text-accent` 처럼 토큰 이름을 그대로 쓴다.

## 배포 (Cloudflare Workers · component.efface.dev)

정적 SPA 라 `dist` 를 Workers Static Assets 로 서빙한다 (`wrangler.jsonc`).

```bash
npm run deploy         # build + wrangler deploy → https://component.efface.dev
```

- 커스텀 도메인은 `wrangler.jsonc` 의 `routes` 로 배포 시 DNS 까지 연결된다 (efface.dev 존과 같은 계정)
- 자동 배포: 리포지토리 변수 `CF_DEPLOY=true`, 시크릿 `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` 설정 시 `main` push 마다 `.github/workflows/deploy.yml` 실행
