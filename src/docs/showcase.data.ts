import manifest from './showcase.manifest.json'

export type ShowcaseProjectId = 'efface' | 'v2' | 'hinest'

export interface ShowcaseShot {
  project: ShowcaseProjectId
  slug: string
  title: string
  /** 탭 이름 — 사이트 · 데모 · 모바일 · 사원 · 팀장 · 관리자 · 운영 콘솔 · 공개 페이지 */
  group: string
  role: string | null
  viewport: 'desktop' | 'mobile'
  path: string
  file: string
  w: number
  h: number
}

export interface ShowcaseProject {
  id: ShowcaseProjectId
  name: string
  url: string
  host: string
  tagline: string
  stack: string
  theme: 'light' | 'dark'
  /** 탭 순서 */
  groups: string[]
  /** 탭별 짧은 설명 */
  groupNotes?: Record<string, string>
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'efface',
    name: 'efface.dev',
    url: 'https://efface.dev',
    host: 'efface.dev',
    tagline: '외주 제작 소개 사이트. 서비스·가격·프로세스와 함께 클리닉·레스토랑·쇼핑몰·웨딩 데모 사이트까지 한 도메인에 있어요.',
    stack: 'Next.js 16 · Tailwind v4 · motion · next-intl',
    theme: 'light',
    groups: ['사이트', '데모 사이트', '모바일'],
    groupNotes: {
      '데모 사이트': '외주 문의용으로 만든 가상 브랜드 데모예요. 업종별로 레이아웃과 톤이 달라요.',
    },
  },
  {
    id: 'v2',
    name: 'v2.efface.dev',
    url: 'https://v2.efface.dev',
    host: 'v2.efface.dev',
    tagline: '스튜디오 소개 사이트. 다크 테마에 3D 유리 로고, 스크롤에 고정된 씬 세 개가 이어져요.',
    stack: 'Next.js 16 · Tailwind v4 · motion · three.js',
    theme: 'dark',
    groups: ['사이트', '모바일'],
    groupNotes: {
      사이트: '스크롤에 고정되는 씬은 진행 상태가 순서대로 이어 붙어 있어요 — 실제로는 한 화면에서 바뀌는 장면이에요.',
    },
  },
  {
    id: 'hinest',
    name: 'HiNest',
    url: 'https://nest.hi-vits.com',
    host: 'nest.hi-vits.com',
    tagline: '사내 관리 도구. 일정·근태·결재·회의록·급여까지 한곳에서. 권한에 따라 보이는 메뉴와 화면이 달라요.',
    stack: 'React · Vite · Tailwind · Capacitor · Express · Prisma',
    theme: 'dark',
    groups: ['사원', '팀장', '관리자', '운영 콘솔', '공개 페이지', '모바일'],
    groupNotes: {
      사원: '일반 구성원(MEMBER)이 보는 화면이에요. 미리보기 데모 데이터 기준.',
      팀장: '팀장(MANAGER)은 결재·근태에서 팀원 항목을 함께 봐요.',
      관리자: '회사 관리자(ADMIN)는 관리자 설정 메뉴가 추가되고, 급여·경비를 전체 관리해요.',
      '운영 콘솔': 'HiNest 개발자·플랫폼 운영자만 들어가는 별도 셸이에요. 회사 사이드바에는 보이지 않아요.',
      '공개 페이지': '로그인 전에 볼 수 있는 페이지예요.',
      모바일: '하단 탭 바와 전체 메뉴 페이지가 있는 모바일 레이아웃이에요.',
    },
  },
]

export const SHOWCASE_SHOTS = manifest as ShowcaseShot[]

export function shotsFor(project: ShowcaseProjectId, group: string): ShowcaseShot[] {
  return SHOWCASE_SHOTS.filter((s) => s.project === project && s.group === group)
}
