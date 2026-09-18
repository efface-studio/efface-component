export interface DocLink {
  label: string
  to: string
  /** 출처 배지 */
  src?: ('v1' | 'v2' | 'mom')[]
}

export interface DocGroup {
  title: string
  links: DocLink[]
}

export const DOC_NAV: DocGroup[] = [
  {
    title: 'Overview',
    links: [{ label: 'Overview', to: '/' }],
  },
  {
    title: 'Foundations',
    links: [
      { label: 'Colors', to: '/foundations/colors', src: ['v1', 'v2', 'mom'] },
      { label: 'Typography', to: '/foundations/typography', src: ['v1', 'v2'] },
      { label: 'Layout', to: '/foundations/layout', src: ['v1', 'v2'] },
      { label: 'Motion tokens', to: '/foundations/motion', src: ['v1', 'v2', 'mom'] },
    ],
  },
  {
    title: 'Components',
    links: [
      { label: 'Brand', to: '/components/brand', src: ['v1', 'v2', 'mom'] },
      { label: 'Buttons', to: '/components/buttons', src: ['v1', 'mom'] },
      { label: 'Chips & Badges', to: '/components/chips', src: ['v1', 'v2'] },
      { label: 'Cards', to: '/components/cards', src: ['v1', 'v2'] },
      { label: 'Lists & Data', to: '/components/lists', src: ['v1', 'v2'] },
      { label: 'Skeleton', to: '/components/skeleton' },
      { label: 'Inputs', to: '/components/inputs' },
    ],
  },
  {
    title: 'Motion',
    links: [
      { label: 'Showcase', to: '/motion/showcase' },
      { label: 'Reveal', to: '/motion/reveal', src: ['v1', 'v2', 'mom'] },
      { label: 'Scroll', to: '/motion/scroll', src: ['v1', 'v2'] },
      { label: 'Cursor', to: '/motion/cursor', src: ['v1', 'v2'] },
      { label: 'Text', to: '/motion/text', src: ['v2', 'mom'] },
    ],
  },
  {
    title: 'Layout',
    links: [
      { label: 'Navigation', to: '/layout/navigation', src: ['v1', 'v2'] },
      { label: 'Footer', to: '/layout/footer', src: ['v1', 'v2', 'mom'] },
      { label: 'Overlay', to: '/layout/overlay', src: ['v1'] },
    ],
  },
  {
    title: 'Banner',
    links: [{ label: 'efface Banner', to: '/banner', src: ['mom'] }],
  },
  {
    title: 'Recipes',
    links: [
      { label: 'Sections', to: '/recipes', src: ['v1', 'v2'] },
      { label: 'Auth', to: '/recipes/auth' },
    ],
  },
  {
    title: 'Live',
    links: [
      { label: 'efface.dev', to: '/live/efface', src: ['v1'] },
      { label: 'v2.efface.dev', to: '/live/v2', src: ['v2'] },
      { label: 'HiNest', to: '/live/hinest' },
    ],
  },
]

export const SOURCE_META = {
  v1: { label: 'efface.dev', short: 'v1', color: '#2563eb' },
  v2: { label: 'v2.efface.dev', short: 'v2', color: '#3b62e5' },
  mom: { label: 'mom.efface.dev', short: 'mom', color: '#0B1220' },
} as const
