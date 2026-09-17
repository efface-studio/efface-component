export type LiveProjectId = 'efface' | 'v2' | 'hinest'

export interface LivePage {
  title: string
  path: string
  /** 페이지를 열기 전에 먼저 거쳐야 하는 경로 (HiNest 미리보기 부트스트랩) */
  via?: string
  note?: string
}

export interface LiveGroup {
  title: string
  note?: string
  pages: LivePage[]
}

export interface LiveProject {
  id: LiveProjectId
  name: string
  /** 프록시 호스트 — 검사 스크립트가 주입된 사본 */
  liveOrigin: string
  /** 실제 서비스 */
  siteUrl: string
  host: string
  tagline: string
  stack: string
  theme: 'light' | 'dark'
  groups: LiveGroup[]
}

const HINEST_APP: [string, string][] = [
  ['대시보드', '/'],
  ['일정', '/schedule'],
  ['근태', '/attendance'],
  ['업무 일지', '/journal'],
  ['공지', '/notice'],
  ['구성원', '/directory'],
  ['문서', '/documents'],
  ['결재', '/approvals'],
  ['조직도', '/org'],
  ['경비', '/expense'],
  ['회의록', '/meetings'],
  ['회의록 상세', '/meetings/m1'],
  ['프로젝트', '/projects/p1'],
  ['서비스 계정', '/accounts'],
  ['스니펫', '/snippets'],
  ['메모', '/memos'],
  ['급여명세서', '/payroll'],
  ['알림', '/notifications'],
  ['마이페이지', '/profile'],
]

/** HiNest 는 /preview 로 들어가야 미리보기(데모) 모드가 켜진다. role 은 미리보기 역할 전환 파라미터. */
const hinestPages = (role: string | null, paths: [string, string][]): LivePage[] =>
  paths.map(([title, path]) => ({ title, path, via: role ? `/preview?role=${role}` : '/preview' }))

export const LIVE_PROJECTS: LiveProject[] = [
  {
    id: 'efface',
    name: 'efface.dev',
    liveOrigin: 'https://live-efface.efface.dev',
    siteUrl: 'https://efface.dev',
    host: 'efface.dev',
    tagline: '외주 제작 소개 사이트. 서비스·가격·프로세스와 함께 클리닉·레스토랑·쇼핑몰·웨딩 데모 사이트까지 한 도메인에 있어요.',
    stack: 'Next.js 16 · Tailwind v4 · motion · next-intl',
    theme: 'light',
    groups: [
      {
        title: '사이트',
        pages: [
          { title: '홈', path: '/' },
          { title: '홈 (EN)', path: '/en' },
          { title: '프로젝트 신청', path: '/apply' },
          { title: '작업 — efface', path: '/work/EFFACE' },
          { title: '작업 — HiNest', path: '/work/NEST' },
          { title: '작업 — Team Haribo', path: '/work/TEAMHARIBO' },
          { title: '개인정보처리방침', path: '/privacy' },
          { title: '이용약관', path: '/terms' },
        ],
      },
      {
        title: '데모 사이트',
        note: '외주 문의용으로 만든 가상 브랜드 데모예요. 업종별로 레이아웃과 톤이 달라요.',
        pages: [
          { title: '클리닉 — 홈', path: '/demo/clinic' },
          { title: '클리닉 — 진료과', path: '/demo/clinic/departments' },
          { title: '클리닉 — 의료진', path: '/demo/clinic/doctors' },
          { title: '클리닉 — 건강검진', path: '/demo/clinic/checkup' },
          { title: '클리닉 — 예약', path: '/demo/clinic/reserve' },
          { title: '레스토랑 — 홈', path: '/demo/restaurant' },
          { title: '레스토랑 — 메뉴', path: '/demo/restaurant/menu' },
          { title: '레스토랑 — 예약', path: '/demo/restaurant/reservations' },
          { title: '레스토랑 — 프라이빗', path: '/demo/restaurant/private-events' },
          { title: '쇼핑몰 — 홈', path: '/demo/shop' },
          { title: '쇼핑몰 — 상품', path: '/demo/shop/product/p1' },
          { title: '쇼핑몰 — 베스트', path: '/demo/shop/best' },
          { title: '쇼핑몰 — 특가', path: '/demo/shop/deal' },
          { title: '웨딩 초대장', path: '/demo/wedding' },
        ],
      },
    ],
  },
  {
    id: 'v2',
    name: 'v2.efface.dev',
    liveOrigin: 'https://live-v2.efface.dev',
    siteUrl: 'https://v2.efface.dev',
    host: 'v2.efface.dev',
    tagline: '스튜디오 소개 사이트. 다크 테마에 3D 유리 로고, 스크롤에 고정된 씬 세 개가 이어져요.',
    stack: 'Next.js 16 · Tailwind v4 · motion · three.js',
    theme: 'dark',
    groups: [
      {
        title: '사이트',
        pages: [
          { title: '홈', path: '/' },
          { title: '홈 (EN)', path: '/en' },
          { title: '정책', path: '/policies' },
        ],
      },
    ],
  },
  {
    id: 'hinest',
    name: 'HiNest',
    liveOrigin: 'https://live-hinest.efface.dev',
    siteUrl: 'https://nest.hi-vits.com',
    host: 'nest.hi-vits.com',
    tagline: '사내 관리 도구. 일정·근태·결재·회의록·급여까지 한곳에서. 권한에 따라 보이는 메뉴와 화면이 달라요. 미리보기 데모 데이터로 열려요.',
    stack: 'React · Vite · Tailwind · Capacitor · Express · Prisma',
    theme: 'dark',
    groups: [
      { title: '사원', note: '일반 구성원(MEMBER)이 보는 화면이에요.', pages: hinestPages(null, HINEST_APP) },
      {
        title: '팀장',
        note: '팀장(MANAGER)은 결재·근태에서 팀원 항목을 함께 봐요.',
        pages: hinestPages('manager', HINEST_APP.filter(([, p]) => ['/', '/approvals', '/attendance', '/payroll', '/directory', '/schedule'].includes(p))),
      },
      {
        title: '관리자',
        note: '회사 관리자(ADMIN)는 관리자 설정 메뉴가 추가되고 급여·경비를 전체 관리해요.',
        pages: [...hinestPages('admin', HINEST_APP.filter(([, p]) => ['/', '/approvals', '/attendance', '/payroll', '/directory', '/expense'].includes(p))), { title: '관리자 설정', path: '/admin', via: '/preview?role=admin' }],
      },
      {
        title: '운영 콘솔',
        note: 'HiNest 개발자·플랫폼 운영자만 들어가는 별도 셸이에요. 회사 사이드바에는 보이지 않아요.',
        pages: [
          { title: '운영 콘솔', path: '/super-admin', via: '/preview?role=super' },
          { title: '플랫폼 관리', path: '/platform', via: '/preview?role=platform' },
          { title: '디자인 시스템', path: '/design-system', via: '/preview?role=super' },
        ],
      },
      {
        title: '공개 페이지',
        note: '로그인 전에 볼 수 있는 페이지예요.',
        pages: [
          { title: '로그인', path: '/login' },
          { title: '회원가입', path: '/signup' },
          { title: '회사 등록', path: '/company-signup' },
          { title: '비밀번호 찾기', path: '/forgot-password' },
          { title: '앱 다운로드', path: '/download' },
          { title: '개인정보처리방침', path: '/privacy' },
          { title: '이용약관', path: '/terms' },
        ],
      },
    ],
  },
]

export const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
  { id: 'laptop', label: 'Laptop', width: 1280, height: 800 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const
export type ViewportId = (typeof VIEWPORTS)[number]['id']
