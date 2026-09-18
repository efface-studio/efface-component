import { ArrowRight } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { SpotlightText } from '@/components/motion/SpotlightText'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { TiltCard } from '@/components/motion/TiltCard'
import { ButtonLink } from '@/components/ui/Button'
import { FooterWordmark } from '@/components/layout/FooterWordmark'

export function MotionCursorPage() {
  return (
    <DocPage
      eyebrow="motion"
      title="Cursor"
      lead="마우스를 따라 움직이는 것들이에요. 외곽선 글자 스포트라이트, 자석 버튼, 3D 기울기 카드, 워드마크 스포트라이트. 터치 기기에서는 멈춰 있는 상태 자체가 디자인이에요. 커서 글로우와 점 격자는 Recipes의 v1 히어로에서 볼 수 있어요."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="SpotlightText" desc="외곽선만 있는 커다란 글자 위에, 마우스 주변에서만 그라데이션이 채워져요. 외곽선, 마스크된 채움, 글로우 세 겹으로 되어 있고 줄마다 좌우로 3%씩 어긋나 있어요." sources={['v1']}>
        <Preview
          theme="light"
          bleed
          code={`import { SpotlightText } from '@/components/motion'

<SpotlightText lines={['EFFACE', 'BUILT IN SEOUL', 'EFFACE', 'READY TO SHIP', 'EFFACE']} className="py-24">
  <div className="relative mx-auto max-w-page-v1 px-5">…CTA…</div>
</SpotlightText>`}
        >
          <SpotlightText lines={['EFFACE', 'BUILT IN SEOUL', 'EFFACE']} className="px-8 py-16">
            <div className="max-w-md">
              <p className="mb-4 font-mono text-xs text-fg-dim">{'// contact'}</p>
              <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">Ready to start a project?</h2>
              <MagneticButton className="mt-8 inline-block">
                <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />} className="shadow-[0_8px_30px_rgba(37,99,235,0.18)]">
                  Get a free quote
                </ButtonLink>
              </MagneticButton>
            </div>
          </SpotlightText>
        </Preview>
      </Section>

      <Section title="TiltCard" desc="마우스 위치에 따라 카드가 3D로 기울고 하이라이트가 따라 움직여요. v2에서는 rAF로 직접 그렸고 여기서는 motion 스프링을 썼어요. 역량 카드는 10°, 서비스 카드는 좌우 11° / 상하 7°." sources={['v2']}>
        <Preview
          theme="dark"
          center
          minHeight={320}
          code={`import { TiltCard } from '@/components/motion'

<TiltCard tiltX={7} tiltY={11} glare>
  <div className="w-72 rounded-2xl border border-line bg-surface p-6">…</div>
</TiltCard>`}
        >
          <div className="flex flex-wrap justify-center gap-8">
            <TiltCard tiltX={7} tiltY={11}>
              <div className="w-72 rounded-2xl border border-line bg-surface p-6">
                <span className="font-mono text-sm text-[#3B82F6]">01</span>
                <h3 className="mt-2 text-xl font-medium tracking-tight">AI engineering</h3>
                <p className="mt-2 text-sm text-fg-dim">Design, build and ship LLM features.</p>
              </div>
            </TiltCard>
            <TiltCard tiltX={10} tiltY={10} glare={false}>
              <div className="w-72 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)' }}>
                <p className="text-sm font-medium text-white/90">A new start for team ops</p>
                <h3 className="mt-1 text-3xl font-extrabold tracking-tight">HiNest</h3>
              </div>
            </TiltCard>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'tiltX / tiltY', type: 'number', default: '7 / 11', desc: '최대 pitch / yaw (도)' },
            { name: 'glare', type: 'boolean', default: 'true', desc: '기울기를 따라가는 하이라이트' },
            { name: 'perspective', type: 'number', default: '1200', desc: 'px. 낮을수록 광각·강한 기울기' },
          ]}
        />
      </Section>

      <Section title="FooterWordmark (CSS 스포트라이트)" desc="커다란 EFFACE를 가로로만 늘려 폭을 꽉 채우고, 옅은 그라데이션 위에 마우스 주변만 선명하게 밝혀요. 마우스가 없으면 7초에 한 번씩 스스로 훑고 지나가요. 부모에 container-type: inline-size가 필요해요." sources={['mom']}>
        <Preview
          theme="dark"
          bleed
          lockTheme
          code={`import { FooterWordmark } from '@/components/layout'

<div className="[container-type:inline-size]">
  <FooterWordmark active />
</div>`}
        >
          <div className="[container-type:inline-size] px-6 py-10" style={{ background: '#0B1220' }}>
            <FooterWordmark active />
          </div>
        </Preview>
        <Note>v2 원본은 캔버스에 그리고 마우스가 지나간 자리에 꼬리가 남아요. Footer 페이지에서 볼 수 있어요. 이 CSS 버전은 캔버스 없이 비슷한 인상을 내는 가벼운 대안이에요.</Note>
      </Section>
    </DocPage>
  )
}
