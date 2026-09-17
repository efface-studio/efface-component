import type { SiteFooterColumn } from './SiteFooter'

/** Mom-Work 기본 컬럼 — efface 공통 회사/연락/채널 정보 */
export const SITE_FOOTER_COLUMNS: readonly SiteFooterColumn[] = [
  {
    title: 'COMPANY',
    rows: [
      { label: 'Company', value: 'efface' },
      { label: 'CEO', value: 'Jiwan Seo ↗', href: 'https://www.linkedin.com/in/xixn2' },
      { label: 'Based in', value: 'Seoul, Korea' },
    ],
  },
  {
    title: 'CONTACT',
    rows: [
      { label: 'Business', value: 'sales@efface.dev', href: 'mailto:sales@efface.dev' },
      { label: 'General', value: 'contact@efface.dev', href: 'mailto:contact@efface.dev' },
      { label: 'Support', value: 'support@efface.dev', href: 'mailto:support@efface.dev' },
    ],
  },
  {
    title: 'CHANNEL',
    rows: [
      { label: 'KakaoTalk', value: '@efface', href: 'https://pf.kakao.com/_zxmWKX/chat' },
      { label: 'GitHub', value: 'efface-studio', href: 'https://github.com/efface-studio' },
      { label: 'Response', value: 'Within 24h, weekdays' },
    ],
  },
  {
    title: 'SERVICE',
    rows: [
      { label: 'Studio', value: 'efface.dev', href: 'https://efface.dev/' },
      { label: 'Company', value: 'v2.efface.dev', href: 'https://v2.efface.dev/' },
      { label: 'Mom-Work', value: 'mom.efface.dev', href: 'https://mom.efface.dev/' },
    ],
  },
]

