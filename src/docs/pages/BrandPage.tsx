import { useState } from 'react'
import { DocPage, Note, Section, SubTitle } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { LogoMark } from '@/components/brand/LogoMark'
import { Logo } from '@/components/brand/Logo'
import { LogoMarkGlass } from '@/components/brand/LogoMarkGlass'
import { LogoTile, type LogoTileSurface } from '@/components/brand/LogoTile'
import { LogoScene3D } from '@/components/brand/LogoScene3D'
import { AppIcon3D } from '@/components/brand/AppIcon3D'
import { APP_ICONS } from '@/components/brand/appIcons'
import { EffaceLogo } from '@/components/brand/EffaceLogo'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'
import { Toggle, ToggleGroup } from '@/docs/components/Toggle'

const MARK_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill="currentColor"/>
  <rect x="13.5" y="13.5" width="13" height="13" rx="3.6" fill="#3b62e5"/>
</svg>`

const TILES: LogoTileSurface[] = ['ink', 'paper', 'brand', 'glass', 'outline']

export function BrandPage() {
  const [animate, setAnimate] = useState(true)
  const [scene, setScene] = useState<{ transparent: boolean; centered: boolean; still: boolean }>({ transparent: false, centered: false, still: false })

  return (
    <DocPage
      eyebrow="components"
      title="Brand"
      lead="efface 마크는 겹친 둥근 사각형 두 개다. 뒤는 잉크(다크에서는 흰색), 앞은 로고 블루 #3B62E5. 무배경 SVG, 배경 타일, 유리 질감, 그리고 WebGL 3D 씬까지 — 같은 마크의 모든 표현을 모았다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="마크 — 무배경" desc="가장 기본. 뒤 사각형이 currentColor 라 text-* 로 배경에 맞춘다. 크기는 className 으로." sources={['v2']}>
        <Preview
          theme="dark"
          center
          minHeight={220}
          code={`import { LogoMark } from '@/components/brand'

<LogoMark className="h-6 w-6 text-fg" />
<LogoMark className="h-12 w-12 text-fg" />
<LogoMark className="h-24 w-24 text-fg" />
{/* 앞 사각형 색 바꾸기 */}
<LogoMark className="h-12 w-12 text-fg" accent="#F59E0B" />`}
        >
          <div className="flex flex-wrap items-end justify-center gap-10">
            <LogoMark className="h-6 w-6 text-fg" />
            <LogoMark className="h-12 w-12 text-fg" />
            <LogoMark className="h-24 w-24 text-fg" />
            <LogoMark className="h-12 w-12 text-fg" accent="#F59E0B" />
            <LogoMark className="h-12 w-12 text-fg-faint" />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'className', type: 'string', default: "'h-6 w-6'", desc: '크기·색. text-* 가 뒤 사각형 색.' },
            { name: 'accent', type: 'string', default: "'#3b62e5'", desc: '앞 사각형 색' },
            { name: 'style', type: 'CSSProperties', desc: '인라인 크기 지정용' },
          ]}
        />
        <SubTitle>SVG 원본</SubTitle>
        <CodeBlock lang="svg" code={MARK_SVG} />
      </Section>

      <Section title="마크 — v1 (efface.dev)" desc="v1 은 앞뒤가 반대다: 블루가 뒤, 잉크가 앞. 라이트 배경 전용이며 viewBox 100." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          center
          minHeight={180}
          code={`import { Logo } from '@/components/brand'

<Logo size={24} />
<Logo size={48} />
<Logo size={96} />`}
        >
          <div className="flex flex-wrap items-end justify-center gap-10">
            <Logo size={24} />
            <Logo size={48} />
            <Logo size={96} />
          </div>
        </Preview>
      </Section>

      <Section title="마크 — 유리 질감" desc="Mom-Work 배너의 마크. 뒤에 어두운 사본 두 장을 깔아 두께를 만들고 앞면은 그라데이션으로 빛을 받는다. SVG 만으로 3D 느낌을 낸다. 다크 배경 전용." sources={['mom']}>
        <Preview
          theme="dark"
          lockTheme
          center
          minHeight={200}
          code={`import { LogoMarkGlass } from '@/components/brand'

<LogoMarkGlass size={28} />
<LogoMarkGlass size={64} />
<LogoMarkGlass size={120} />`}
        >
          <div className="flex flex-wrap items-end justify-center gap-10">
            <LogoMarkGlass size={28} />
            <LogoMarkGlass size={64} />
            <LogoMarkGlass size={120} />
          </div>
        </Preview>
      </Section>

      <Section title="마크 — 배경 타일" desc="파비콘·앱 아이콘·아바타 용도. 마크는 타일의 62%, 모서리는 iOS 아이콘 비율(0.22). 다섯 가지 표면.">
        <Preview
          theme="dark"
          center
          minHeight={220}
          code={`import { LogoTile } from '@/components/brand'

<LogoTile surface="ink" size={64} />
<LogoTile surface="paper" size={64} />
<LogoTile surface="brand" size={64} />
<LogoTile surface="glass" size={64} />
<LogoTile surface="outline" size={64} />`}
        >
          <div className="flex flex-wrap items-end justify-center gap-6">
            {TILES.map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <LogoTile surface={s} size={72} />
                <span className="font-mono text-[10.5px] text-fg-faint">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-end justify-center gap-4">
            <LogoTile surface="ink" size={16} />
            <LogoTile surface="ink" size={24} />
            <LogoTile surface="ink" size={32} />
            <LogoTile surface="ink" size={48} />
            <LogoTile surface="ink" size={96} radius={0.22} />
            <LogoTile surface="ink" size={96} radius={0.5} />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'surface', type: "'ink' | 'paper' | 'brand' | 'glass' | 'outline'", default: "'ink'", desc: '타일 바탕' },
            { name: 'size', type: 'number', default: '64', desc: 'px' },
            { name: 'radius', type: 'number', default: '0.22', desc: '모서리 반경 비율. 0.5 면 원.' },
          ]}
        />
      </Section>

      <Section
        title="3D — 유리 사각형 씬"
        desc="v2 히어로 배경. 유리판 두 장과 파란 슬래브가 흩어졌다 모여 한 바퀴 돌며 자리를 바꾼다(11초 루프). three.js 로 실시간 렌더 — 영상과 달리 어느 해상도에서도 선명하다. 세 옵션을 켜고 끄며 확인한다."
        sources={['v2']}
      >
        <ToggleGroup title="옵션">
          <Toggle label="무배경" hint="스튜디오 배경 없이 투명하게" checked={scene.transparent} onChange={(v) => setScene((s) => ({ ...s, transparent: v }))} />
          <Toggle label="가운데 정렬" hint="히어로 기본은 오른쪽 치우침" checked={scene.centered} onChange={(v) => setScene((s) => ({ ...s, centered: v }))} />
          <Toggle label="정지 프레임" hint="reduced-motion 과 같은 상태" checked={scene.still} onChange={(v) => setScene((s) => ({ ...s, still: v }))} />
        </ToggleGroup>
        <Preview
          theme="dark"
          bleed
          code={`import { LogoScene3D } from '@/components/brand'

{/* 히어로 배경 — 스튜디오 배경 포함, 마크는 오른쪽 */}
<div className="absolute inset-0 bg-[#0b0c10]">
  <LogoScene3D />
</div>

{/* 무배경 · 가운데 — 로고 단독 표현 */}
<LogoScene3D transparent centered className="h-[360px]" />

{/* 정지 프레임 (reduced-motion 이면 자동) */}
<LogoScene3D still />`}
        >
          <div className="h-[420px] w-full" style={{ background: scene.transparent ? 'radial-gradient(ellipse at 50% 40%, #1b1b21, #0a0a0b 70%)' : '#0b0c10' }}>
            <LogoScene3D key={`${scene.transparent}-${scene.centered}-${scene.still}`} transparent={scene.transparent} centered={scene.centered} still={scene.still} />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'transparent', type: 'boolean', default: 'false', desc: '스튜디오 배경 텍스처와 블룸 없이 투명 캔버스로 그린다' },
            { name: 'centered', type: 'boolean', default: 'false', desc: '마크를 가운데 놓는다 (히어로 기본은 오른쪽 치우침)' },
            { name: 'still', type: 'boolean', default: 'reduced-motion', desc: '락업 포즈 한 프레임만 그린다' },
          ]}
        />
        <Note>
          three.js 는 동적 import 라 이 컴포넌트를 쓰는 페이지에서만 로드된다(~600KB gz 150KB). 씬은 뷰포트를 벗어나면 렌더를 멈추고 탭이 숨겨지면 쉰다. 언마운트 시 지오메트리·머티리얼·텍스처·환경맵을 모두 해제한다.
        </Note>
      </Section>

      <Section title="3D — 앱 아이콘 타일" desc="v2 서비스 카드의 아이콘. 둥근 상자 위에 SVG 글리프를 돋을새김한다. 한 번만 렌더하는 정적 이미지. SVG 의 각 path 에 fill 과 data-d(돌출 높이)를 준다." sources={['v2']}>
        <Preview
          theme="dark"
          center
          minHeight={320}
          code={`import { AppIcon3D, APP_ICONS } from '@/components/brand'

{/* efface 마크를 타일로 */}
<AppIcon3D src="/logos/efface.svg" color="#141418" rx={12} ry={-22} rz={7} size={200} />

{/* 서비스 아이콘 네 개 */}
{APP_ICONS.map((i) => <AppIcon3D key={i.key} {...i} size={160} />)}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            {APP_ICONS.map((i) => (
              <div key={i.key} className="flex flex-col items-center gap-2">
                <AppIcon3D src={i.src} color={i.color} rx={i.rx} ry={i.ry} rz={i.rz} size={150} />
                <span className="font-mono text-[10.5px] text-fg-faint">{i.key}</span>
              </div>
            ))}
          </div>
        </Preview>
        <CodeBlock
          lang="svg"
          code={`<!-- public/logos/efface.svg — data-d 가 클수록 높이 솟는다 -->
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(256,256) scale(11)">
    <rect x="-18.5" y="-18.5" width="20" height="20" rx="5.5" fill="#F2F2F5" data-d="14"/>
    <rect x="-1.5"  y="-1.5"  width="20" height="20" rx="5.5" fill="#3B62E5" data-d="22"/>
  </g>
</svg>`}
        />
      </Section>

      <Section title="워드마크 락업" desc="마크 + 소문자 efface. v2 Nav 는 링크로 감싸 호버 시 마크가 -8° 기운다. Mom-Work 푸터는 CSS 사각형에 글자가 순서대로 들어온다." sources={['v2', 'mom']}>
        <Preview
          theme="dark"
          center
          minHeight={200}
          code={`import { Wordmark, EffaceLogo } from '@/components/brand'

<Wordmark href="/" />           {/* v2 Nav */}
<Wordmark size={40} />

<EffaceLogo dark animate />      {/* Mom-Work 푸터 — animate 가 true 가 되면 글자 등장 */}
<EffaceLogo />                   {/* 라이트 */}`}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-wrap items-center justify-center gap-10">
              <Wordmark href="#" />
              <Wordmark size={40} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10">
              <EffaceLogo dark animate={animate} />
              <span data-theme="light" className="rounded-lg bg-bg px-4 py-2">
                <EffaceLogo animate={animate} />
              </span>
              <Button size="sm" variant="secondary" onClick={() => setAnimate((v) => !v)}>
                {animate ? '숨기기' : '등장'}
              </Button>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="여백과 최소 크기">
        <ul className="grid gap-3 text-[13.5px] text-fg-dim md:grid-cols-2">
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">최소 크기</b> — 마크 단독 16px, 워드마크 락업 20px(마크 기준). 그 아래에서는 배경 타일(ink)을 쓴다.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">여백</b> — 마크 한 변의 1/4 이상. 타일 안에서는 마크가 62%를 차지하는 것으로 이미 확보된다.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">색</b> — 뒤 사각형은 배경 대비 잉크/흰색, 앞은 항상 로고 블루. 단색이 필요하면 둘 다 currentColor 로.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">하지 말 것</b> — 회전, 그림자 추가, 사각형 비율 변경, 앞뒤 색 뒤집기(v1 마크와 혼용 금지).
          </li>
        </ul>
      </Section>
    </DocPage>
  )
}
