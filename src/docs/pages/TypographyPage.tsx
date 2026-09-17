import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { Preview } from '@/docs/components/Preview'
import { FONT_STACKS, TYPE_SCALE } from '@/tokens/typography'

export function TypographyPage() {
  return (
    <DocPage
      eyebrow="foundations"
      title="Typography"
      lead="본문과 제목은 Pretendard Variable, 라벨·번호·코드는 JetBrains Mono. 제목은 항상 tracking-tight, 리드는 leading-relaxed + fg-dim. 세 사이트가 같은 타입 스케일을 공유한다."
      sources={['v1', 'v2']}
    >
      <Section title="서체">
        <ul className="grid gap-4 md:grid-cols-2">
          {FONT_STACKS.map((f) => (
            <li key={f.name} className="rounded-lg border border-line p-5">
              <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">font-{f.name}</p>
              <p className="text-3xl tracking-tight" style={{ fontFamily: f.value, fontWeight: f.name === 'black' ? 400 : 600 }}>
                efface Erase Aa 0123
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed break-all text-fg-faint">{f.value}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-fg-dim">{f.note}</p>
            </li>
          ))}
        </ul>
        <CodeBlock
          lang="html"
          code={`<!-- Pretendard: npm 패키지의 dynamic-subset — 필요한 유니코드 범위만 받는다 -->
@import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

<!-- Space Grotesk · Archivo Black: Google Fonts (v2 워드마크·배경 워드) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&display=swap" />`}
        />
        <Note>
          본문에는 <code className="font-mono">font-feature-settings: 'ss01', 'ss02', 'cv01'</code> 을 켠다 — Pretendard의 대체 글리프로 숫자·영문이 조금 더 정돈된다. 숫자가 자릿수마다 흔들리면 <code className="font-mono">tabular-nums</code>.
        </Note>
      </Section>

      <Section title="타입 스케일" desc="실제 섹션에서 쓰는 클래스 조합 그대로. 반응형 접미가 붙어 있으니 복사해서 쓴다.">
        <div className="space-y-px overflow-hidden rounded-xl border border-line bg-line">
          {TYPE_SCALE.map((t) => (
            <div key={t.name} className="grid gap-3 bg-bg p-5 md:grid-cols-[180px_1fr]">
              <div>
                <p className="text-[12.5px] font-medium">{t.name}</p>
                <p className="mt-1 text-[11px] text-fg-faint">{t.where}</p>
              </div>
              <div className="min-w-0">
                <p className={t.classes}>{t.sample}</p>
                <p className="mt-3 font-mono text-[11px] break-all text-fg-faint">{t.classes}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="섹션 헤더 관용구" desc="모노 라벨 → 제목 → 리드. v1은 라벨을 muted 색으로, v2는 슬래시만 액센트로 칠한다.">
        <Preview
          theme="dark"
          code={`<p className="label"><span className="text-accent">//</span> approach</p>
<h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Less, but precise.</h2>
<p className="mt-6 max-w-md text-fg-dim">efface means "to erase". We solve problems by taking things away.</p>`}
        >
          <p className="label">
            <span className="text-accent">//</span> approach
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Less, but precise.</h2>
          <p className="mt-6 max-w-md text-fg-dim">efface means "to erase". We solve problems by taking things away.</p>
        </Preview>
        <Preview
          theme="light"
          code={`<p className="mb-3 font-mono text-xs text-fg-dim">{"// services"}</p>
<h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
  What we build.<br />
  <span className="text-fg-dim">Only what matters, precisely.</span>
</h2>`}
        >
          <p className="mb-3 font-mono text-xs text-fg-dim">{'// services'}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            What we build.
            <br />
            <span className="text-fg-dim">Only what matters, precisely.</span>
          </h2>
        </Preview>
      </Section>
    </DocPage>
  )
}
