import { useState } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { EffaceBanner } from '@/components/banner/EffaceBanner'
import { EffaceBannerMobile } from '@/components/banner/EffaceBannerMobile'
import { Toggle, ToggleGroup } from '@/docs/components/Toggle'

export function BannerPage() {
  const [animate, setAnimate] = useState(true)
  const [controls, setControls] = useState(false)
  return (
    <DocPage
      eyebrow="banner"
      title="efface Banner"
      lead="mom.efface.dev 상단의 efface 홍보 배너. 1600×500 스테이지에 6종(브랜드 · 가격 · 속도 · AI 엔지니어링 · 인수인계 · 모집)이 캐러셀로 돌고, 각 배너 안에서 컷이 12초 주기로 순환한다. 폭이 좁으면 비율을 유지한 채 축소되고, 모바일은 세로형 변형을 쓴다."
      sources={['mom']}
    >
      <Section title="EffaceBanner (데스크톱)" desc="자동 전환 8초 + 수동(← → · 점 · 방향키 · Home · 스와이프). 슬라이드는 transform 대신 스크롤 위치로 옮기고, 전환 모션은 CSS 키프레임(efSlideR/L)이 맡는다. 모든 내부 모션은 --dur / --play 변수로 한 번에 조절된다.">
        <ToggleGroup title="옵션">
          <Toggle label="애니메이션" hint="끄면 컷 순환·자동 전환 정지" checked={animate} onChange={setAnimate} />
          <Toggle label="내장 컨트롤 바" hint="1600px 스테이지 안의 조작부" checked={controls} onChange={setControls} />
        </ToggleGroup>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { EffaceBanner } from '@/components/banner'

<section className="mx-auto w-full max-w-[1600px] px-4 sm:px-6">
  <EffaceBanner animate={!reducedMotion} />
</section>

{/* 1600px 스테이지 안의 내장 컨트롤 바 (좁은 화면에서는 축소되어 읽기 어렵다) */}
<EffaceBanner showControls accent="#3b62e5" cycleSeconds={12} autoplaySeconds={8} />`}
        >
          <div className="bg-[#f9fafb] p-4 sm:p-6">
            <EffaceBanner animate={animate} showControls={controls} />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'accent', type: 'string', default: "'#3b62e5'", desc: '액센트 컬러 — CTA, 점, 마크 그라데이션' },
            { name: 'cycleSeconds', type: 'number', default: '12', desc: '배너 안 컷 순환 1사이클' },
            { name: 'autoplaySeconds', type: 'number', default: '8', desc: '자동 전환 간격' },
            { name: 'animate', type: 'boolean', default: 'true', desc: 'false 면 모든 애니메이션 정지 (reduced-motion 연동)' },
            { name: 'showControls', type: 'boolean', default: 'false', desc: '스테이지 안 컨트롤 바. 기본은 스테이지 밖 작은 컨트롤' },
          ]}
        />
        <Note>
          배너 6종의 카피와 레이아웃은 컴포넌트 안에 인라인 스타일로 고정되어 있다 — 디자인 핸드오프(1600×500 보드)를 그대로 코드로 옮긴 것이라 토큰 대신 절대값을 쓴다. 문구를 바꾸려면 컴포넌트 안의 각 슬라이드 JSX 를 직접 고친다.
        </Note>
      </Section>

      <Section title="EffaceBannerMobile" desc="6종의 카피를 세로형(470px)으로 재배치. snap-x 가로 스크롤 + 자동 전환, 점 인디케이터. 격자 · 글로우 · 시트 장식과 컷 순환은 같은 키프레임을 쓴다.">
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { EffaceBannerMobile } from '@/components/banner'

const isNarrow = useMediaQuery('(max-width: 767px)')
{isNarrow ? <EffaceBannerMobile animate={!reducedMotion} /> : <EffaceBanner animate={!reducedMotion} />}`}
        >
          <div className="mx-auto max-w-[400px] bg-[#f9fafb] px-4 py-6">
            <EffaceBannerMobile animate={animate} />
          </div>
        </Preview>
      </Section>

      <Section title="키프레임 체계" desc="배너 전용 ef* 키프레임. 컷 순환은 첫 컷만 A 변형(0% 에서 보이는 상태로 시작)을 쓰고 나머지는 delay 로 배분한다.">
        <CodeBlock
          lang="css"
          code={`/* 3컷 순환 — 첫 컷 */
@keyframes efCut3A { 0%, 28% { opacity: 1; } 30.34% { opacity: 0; } 95% { opacity: 0; } 97% { opacity: 1; } 100% { opacity: 1; } }
/* 3컷 순환 — 나머지 컷 (delay = dur * index / count) */
@keyframes efCut3  { 0% { opacity: 0; } 1% { opacity: 1; } 31% { opacity: 1; } 33.34% { opacity: 0; } 100% { opacity: 0; } }

/* 제목은 클립 박스 안에서 올라오고(efRise), 부제는 블러와 함께 떠오른다(efPop) */
@keyframes efRise { 0% { transform: translateY(115%); } 3.4% { transform: translateY(0); } 100% { transform: translateY(0); } }
@keyframes efPop  { 0% { opacity: 0; transform: translateY(26px) scale(0.96); filter: blur(10px); } 2.8% { opacity: 1; transform: none; filter: blur(0); } 100% { opacity: 1; } }

/* 장식 */
@keyframes efSheen { 0% { transform: translateX(-45%); opacity: 0; } 12% { opacity: 1; } 78% { opacity: 1; } 100% { transform: translateX(150%); opacity: 0; } }
@keyframes efGlow  { 0%, 100% { opacity: 0.35; transform: scale(0.94); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes efDot   { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.25; transform: scale(0.8); } }
@keyframes efNudge { 0%, 60%, 100% { transform: translateX(0); } 72% { transform: translateX(7px); } 84% { transform: translateX(0); } }

/* 슬라이드 전환 — 같은 이름을 두 개 두고 번갈아 써서 재시작을 강제한다 */
@keyframes efSlideR1 { 0% { transform: translateX(0); opacity: 1; } 0.5% { transform: translateX(110px); opacity: 0.25; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes efSlideR2 { /* 동일 */ }`}
        />
        <CodeBlock
          code={`// 컷마다 재생 상태와 길이를 CSS 변수로 물려받는다
const stageVars = { '--dur': \`\${cycleSeconds}s\`, '--play': animate ? 'running' : 'paused' }

function cutStyle(index, count, dur) {
  if (count === 1) return {}
  return index === 0
    ? { animation: \`efCut3A \${dur}s linear infinite both\`, animationPlayState: 'var(--play)' }
    : { animation: \`efCut3 \${dur}s linear infinite both\`, animationDelay: \`\${(dur * index) / count}s\`, animationPlayState: 'var(--play)' }
}`}
        />
      </Section>
    </DocPage>
  )
}
