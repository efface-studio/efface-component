export interface TypeStyle {
  name: string
  classes: string
  sample: string
  where: string
}

/** 실제 섹션에서 쓰인 타입 스케일. 클래스는 그대로 복사해 쓴다. */
export const TYPE_SCALE: TypeStyle[] = [
  { name: 'Display / Hero (v2)', classes: 'text-[2.75rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl', sample: 'Erase the complexity,', where: 'v2 Hero h1' },
  { name: 'Display / Hero (v1)', classes: 'text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl', sample: 'Website outsourcing, minus the headache.', where: 'v1 Hero h1' },
  { name: 'Title / Section XL', classes: 'text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl', sample: 'Ready to build together?', where: 'v2 Contact · v1 CTA' },
  { name: 'Title / Section', classes: 'text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl', sample: 'Less, but precise.', where: 'v2 About/Approach · v1 섹션' },
  { name: 'Title / Card', classes: 'text-xl font-medium tracking-tight md:text-2xl', sample: 'Design that keeps the essence', where: 'v2 Approach 항목 · Capability 카드' },
  { name: 'Title / Small', classes: 'text-lg font-semibold', sample: 'Landing page', where: 'v1 Services/Process 카드' },
  { name: 'Body / Lead', classes: 'text-base leading-relaxed text-fg-dim md:text-lg', sample: 'A team that builds AI, web and apps. We go deep on the tech and ship products that simply work.', where: '섹션 리드' },
  { name: 'Body', classes: 'text-sm leading-relaxed text-fg-dim md:text-base', sample: 'Clarity over flair. We cut until only what matters is left.', where: '카드 본문' },
  { name: 'Body / Compact', classes: 'text-[15px] leading-relaxed text-fg-dim', sample: 'Tools that last, not tools that trend.', where: 'v1 Manifesto · FAQ 답' },
  { name: 'Label / Eyebrow', classes: 'label', sample: '// capabilities', where: '섹션 제목 위 모노 라벨' },
  { name: 'Label / Kicker', classes: 'font-mono text-[11px] tracking-[0.26em] text-fg-faint uppercase', sample: 'POLICY', where: 'v2 푸터 컬럼 라벨' },
  { name: 'Label / Badge', classes: 'font-mono text-[10px] tracking-[0.18em] text-fg-dim uppercase', sample: 'project · sales', where: 'v1 연락처 카드 라벨' },
  { name: 'Mono / Number', classes: 'font-mono text-sm text-accent', sample: '01', where: '번호 매긴 목록' },
  { name: 'Mono / Code', classes: 'font-mono text-[13px] leading-[1.7]', sample: 'const project = { type: "landing" }', where: 'v1 TerminalCard' },
]

export const FONT_STACKS = [
  { name: 'sans', value: "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif", note: '본문·제목. 한/영 모두. dynamic-subset으로 필요한 글리프만 받는다.' },
  { name: 'mono', value: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", note: '라벨·번호·코드. 가변 파일 하나(400–700)만 로드.' },
  { name: 'display', value: "'Space Grotesk', 'Pretendard Variable', sans-serif", note: 'v2 푸터 워드마크(캔버스에 그린다).' },
  { name: 'black', value: "'Archivo Black', 'Pretendard Variable', sans-serif", note: 'v2 앱 카드 뒤 거대 워드.' },
]
