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
      lead="mom.efface.dev 맨 위에 있는 efface 홍보 배너예요. 1600×500 크기에 여섯 가지 배너가 돌아가고, 각 배너 안에서도 장면이 12초마다 바뀌어요. 화면이 좁으면 비율을 지키며 줄어들고, 모바일에서는 세로형을 써요."
      sources={['mom']}
    >
      <Section title="EffaceBanner (데스크톱)" desc="8초마다 자동으로 넘어가고, 화살표·점·키보드·스와이프로도 넘길 수 있어요. 슬라이드는 스크롤 위치로 옮기고 전환 모션은 CSS 키프레임이 맡아요. 안쪽 모션은 --dur, --play 변수 두 개로 한꺼번에 조절돼요.">
        <ToggleGroup title="options">
          <Toggle label="Animate" hint="off stops cuts and autoplay" checked={animate} onChange={setAnimate} />
          <Toggle label="Built-in controls" hint="control bar inside the 1600px stage" checked={controls} onChange={setControls} />
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
          여섯 배너의 카피와 레이아웃은 컴포넌트 안에 인라인 스타일로 고정돼 있어요. 1600×500 디자인 보드를 그대로 코드로 옮긴 거라 토큰 대신 절대값을 써요. 문구를 바꾸려면 컴포넌트 안의 슬라이드 JSX를 직접 고치면 돼요.
        </Note>
      </Section>

      <Section title="EffaceBannerMobile" desc="같은 여섯 배너를 세로형(470px)으로 다시 배치했어요. 가로로 스냅 스크롤되고 자동으로도 넘어가요. 격자, 글로우, 반짝임과 장면 전환은 데스크톱과 같은 키프레임을 써요.">
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

      <Section title="키프레임" desc="배너 전용 ef* 키프레임이에요. 장면 순환은 첫 장면만 A 변형(처음부터 보이는 상태)을 쓰고, 나머지는 delay로 시간을 나눠 가져요.">
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
