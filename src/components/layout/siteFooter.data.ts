import type { SiteFooterColumn } from './SiteFooter'

/** Mom-Work 기본 컬럼 — efface 공통 회사/연락/채널 정보 */
export const SITE_FOOTER_COLUMNS: readonly SiteFooterColumn[] = [
  {
    title: 'COMPANY',
    rows: [
      { label: '상호', value: 'efface' },
      { label: '대표', value: '서지완 ↗', href: 'https://www.linkedin.com/in/xixn2' },
      { label: '소재지', value: '서울, 대한민국' },
    ],
  },
  {
    title: 'CONTACT',
    rows: [
      { label: '비즈니스', value: 'sales@efface.dev', href: 'mailto:sales@efface.dev' },
      { label: '일반 문의', value: 'contact@efface.dev', href: 'mailto:contact@efface.dev' },
      { label: '고객 지원', value: 'support@efface.dev', href: 'mailto:support@efface.dev' },
    ],
  },
  {
    title: 'CHANNEL',
    rows: [
      { label: '카카오톡', value: '@efface', href: 'https://pf.kakao.com/_zxmWKX/chat' },
      { label: 'GitHub', value: 'efface-studio', href: 'https://github.com/efface-studio' },
      { label: '응답', value: '평일 24시간 내' },
    ],
  },
  {
    title: 'SERVICE',
    rows: [
      { label: '외주 제작', value: 'efface.dev', href: 'https://efface.dev/' },
      { label: '스튜디오', value: 'v2.efface.dev', href: 'https://v2.efface.dev/' },
      { label: '근무 카드', value: 'mom.efface.dev', href: 'https://mom.efface.dev/' },
    ],
  },
]

