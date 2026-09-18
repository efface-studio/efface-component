export const EASINGS = [
  { name: 'ease-out-expo', value: 'cubic-bezier(0.22, 1, 0.36, 1)', where: '모든 진입·전환의 기본 (v1·v2)' },
  { name: 'ease-out-quart', value: 'cubic-bezier(0.25, 1, 0.5, 1)', where: 'CSS 전용 Reveal · 취소선 (Mom-Work)' },
  { name: 'ease-out-back', value: 'cubic-bezier(0.16, 1, 0.3, 1)', where: '배너 슬라이드·컷 전환' },
  { name: 'ease-in-out-symmetric', value: 'cubic-bezier(0.65, 0, 0.35, 1)', where: '푸터 링크 밑줄 스윕' },
]

export const DURATIONS = [
  { name: 'fast', value: '0.4s', where: '오버레이 페이드, 마이크로 인터랙션' },
  { name: 'base', value: '0.6s', where: '메뉴 항목, 중간 전환, v1 Reveal' },
  { name: 'slow', value: '0.7s', where: '섹션 등장, WordReveal' },
]

export const STAGGERS = [
  { name: 'tight', value: '0.06s', where: '단락·목록 항목' },
  { name: 'base', value: '0.07s', where: '메뉴 항목' },
  { name: 'word', value: '0.05s', where: 'WordReveal 단어' },
]

export const SPRINGS = [
  { name: 'magnetic', value: '{ stiffness: 220, damping: 18, mass: 0.4 }', where: 'MagneticButton' },
  { name: 'progress', value: '{ stiffness: 220, damping: 28, mass: 0.4 }', where: 'ScrollProgress' },
  { name: 'cursor', value: '{ stiffness: 140, damping: 24, mass: 0.6 }', where: 'CursorGlow 글로우 위치' },
  { name: 'icon', value: "{ type: 'spring', stiffness: 300, damping: 14 }", where: 'IconTile 호버 회전' },
]

export const KEYFRAMES = [
  { name: 'rise-in', classes: '.rise-in .rise-d1 … .rise-d5', desc: 'above-the-fold 진입. 14px 아래에서 0.7s. 딜레이 5단.' },
  { name: 'scroll-bob', classes: '.scroll-bob', desc: '스크롤 큐 상하 6px, 1.8s 반복.' },
  { name: 'marquee', classes: '.animate-marquee', desc: '0 → -50%, 38s 선형 반복. `marquee-reverse`도 있다.' },
  { name: 'caret-blink', classes: '.caret-blink', desc: '커서 깜빡임 1.1s steps(1).' },
  { name: 'bob', classes: '.animate-bob', desc: '부유 -6 → 8px, 5.6s.' },
  { name: 'ef*', classes: '(배너 전용)', desc: 'efCut/efRise/efPop/efSheen/efGlow/efSlide… 배너 6종의 컷 순환과 슬라이드.' },
]
