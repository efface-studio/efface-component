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
      lead="efface 마크는 둥근 사각형 두 개가 겹친 모양이에요. 뒤는 잉크(다크에서는 흰색), 앞은 로고 블루 #3B62E5. 무배경 SVG부터 배경 타일, 유리 질감, WebGL 3D 씬까지 같은 마크의 표현을 전부 모아뒀어요."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="마크 — 무배경" desc="가장 기본이 되는 형태예요. 뒤 사각형이 currentColor라서 text-* 클래스로 배경에 맞추면 돼요. 크기도 className으로." sources={['v2']}>
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

      <Section title="마크 — v1 (efface.dev)" desc="v1은 앞뒤가 반대예요. 블루가 뒤, 잉크가 앞. 밝은 배경에서만 쓰고, viewBox는 100이에요." sources={['v1']}>
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

      <Section title="마크 — 유리 질감" desc="Mom-Work 배너에서 쓰는 마크예요. 뒤에 어두운 사본 두 장을 깔아 두께를 만들고, 앞면엔 그라데이션으로 빛을 얹었어요. SVG만으로 3D 느낌을 내요. 어두운 배경 전용." sources={['mom']}>
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

      <Section title="마크 — 배경 타일" desc="파비콘, 앱 아이콘, 아바타에 써요. 마크는 타일의 62% 크기, 모서리는 iOS 아이콘 비율(0.22). 바탕은 다섯 가지예요.">
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
        desc="v2 히어로의 배경이에요. 유리판 두 장과 파란 슬래브가 흩어졌다 모이고, 한 바퀴 돌면서 자리를 바꿔요(11초 루프). three.js로 실시간으로 그리기 때문에 영상과 달리 어떤 해상도에서도 선명해요. 옵션을 켜고 끄면서 확인해 보세요."
        sources={['v2']}
      >
        <ToggleGroup title="options">
          <Toggle label="Transparent" hint="no studio backdrop" checked={scene.transparent} onChange={(v) => setScene((s) => ({ ...s, transparent: v }))} />
          <Toggle label="Centered" hint="hero default sits right" checked={scene.centered} onChange={(v) => setScene((s) => ({ ...s, centered: v }))} />
          <Toggle label="Still frame" hint="same as reduced-motion" checked={scene.still} onChange={(v) => setScene((s) => ({ ...s, still: v }))} />
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

{/* 가로 위치 — 폭의 72% 지점 */}
<LogoScene3D anchor={0.72} />

{/* 정지 프레임 (reduced-motion 이면 자동) */}
<LogoScene3D still />`}
        >
          <div className="h-[420px] w-full" style={{ background: scene.transparent ? 'radial-gradient(ellipse at 50% 40%, #1b1b21, #0a0a0b 70%)' : '#0b0c10' }}>
            <LogoScene3D key={`${scene.transparent}-${scene.centered}-${scene.still}`} transparent={scene.transparent} centered={scene.centered} still={scene.still} />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'transparent', type: 'boolean', default: 'false', desc: '스튜디오 배경 텍스처와 블룸 없이 투명 캔버스로 그려요' },
            { name: 'anchor', type: 'number', default: '0.7', desc: '마크의 가로 위치 — 캔버스 폭의 비율(0…1). 화면 비율이 달라져도 같은 자리에 와요' },
            { name: 'centered', type: 'boolean', default: 'false', desc: 'anchor 0.5와 같아요' },
            { name: 'still', type: 'boolean', default: 'reduced-motion', desc: '락업 포즈 한 프레임만 그려요' },
          ]}
        />
        <Note>
          three.js는 동적 import라 이 컴포넌트가 있는 페이지에서만 내려받아요(gzip 약 150KB). 화면 밖으로 나가면 그리기를 멈추고, 탭을 숨기면 쉬어요. 언마운트될 때 지오메트리·머티리얼·텍스처·환경맵을 전부 정리합니다.
        </Note>
      </Section>

      <Section title="3D — 앱 아이콘 타일" desc="v2 서비스 카드에 올라가는 아이콘이에요. 둥근 상자 위에 SVG 글리프를 돋을새김해요. 한 번만 그리는 정적 이미지고, SVG의 path마다 fill과 data-d(돌출 높이)를 주면 돼요." sources={['v2']}>
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

      <Section title="워드마크" desc="마크에 소문자 efface를 붙인 형태예요. v2 상단 바에서는 링크에 마우스를 올리면 마크가 살짝(-8°) 기울고, Mom-Work 푸터에서는 글자가 한 자씩 들어와요." sources={['v2', 'mom']}>
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
                {animate ? 'Hide' : 'Reveal'}
              </Button>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="쓸 때 주의할 점">
        <ul className="grid gap-3 text-[13.5px] text-fg-dim md:grid-cols-2">
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">최소 크기</b> — 마크만 쓸 땐 16px, 워드마크는 마크 기준 20px까지예요. 그보다 작으면 배경 타일(ink)로 바꿔 쓰세요.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">여백</b> — 마크 한 변의 1/4 이상 비워두세요. 타일은 마크가 62%만 차지하니 이미 확보돼 있어요.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">색</b> — 뒤 사각형은 배경에 따라 잉크나 흰색, 앞은 항상 로고 블루예요. 단색이 필요하면 둘 다 currentColor로.
          </li>
          <li className="rounded-lg border border-line p-4">
            <b className="text-fg">하지 말 것</b> — 돌리거나, 그림자를 붙이거나, 사각형 비율을 바꾸거나, 앞뒤 색을 뒤집지 마세요. v1 마크와 섞어 쓰는 것도 안 돼요.
          </li>
        </ul>
      </Section>
    </DocPage>
  )
}
