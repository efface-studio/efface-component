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
      lead="커서를 따라가는 것들. 외곽선 텍스트 스포트라이트(v1 CTA), 자석 버튼(v1), 3D 기울기(v2 카드), 워드마크 스포트라이트(Mom-Work). 모두 마우스에만 반응하고 터치에서는 정지 상태가 곧 디자인이다. 커서 글로우 + 점 격자는 Recipes 의 v1 히어로에서 볼 수 있다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="SpotlightText" desc="외곽선만 있는 거대 텍스트 위에, 커서 주변 마스크 안에서만 그라데이션 채움이 드러난다. 세 레이어: 외곽선 · 마스크된 채움 · 글로우. 짝수 줄은 왼쪽, 홀수 줄은 오른쪽으로 3% 어긋난다." sources={['v1']}>
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
              <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">프로젝트, 시작해 볼까요?</h2>
              <MagneticButton className="mt-8 inline-block">
                <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />} className="shadow-[0_8px_30px_rgba(37,99,235,0.18)]">
                  무료 견적 받기
                </ButtonLink>
              </MagneticButton>
            </div>
          </SpotlightText>
        </Preview>
      </Section>

      <Section title="TiltCard" desc="커서 위치로 3D 기울기 + 하이라이트. 원본(v2)은 rAF 루프가 transform 을 직접 썼고, 여기서는 motion 스프링. Capabilities 는 10°, AppCards 는 yaw 11° / pitch 7°." sources={['v2']}>
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
                <h3 className="mt-2 text-xl font-medium tracking-tight">AI 엔지니어링</h3>
                <p className="mt-2 text-sm text-fg-dim">LLM 기능을 설계하고, 만들고, 배포까지.</p>
              </div>
            </TiltCard>
            <TiltCard tiltX={10} tiltY={10} glare={false}>
              <div className="w-72 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)' }}>
                <p className="text-sm font-medium text-white/90">사내 관리의 새로운 시작</p>
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

      <Section title="FooterWordmark (CSS 스포트라이트)" desc="거대 EFFACE 를 가로로만 늘려(scaleX) 폭을 채우고, 그라데이션이 옅게 깔린 위에 포인터 주변 창 안에서만 선명해진다. 포인터가 없으면 7초 주기로 스스로 스윕. 부모에 container-type: inline-size 가 필요하다." sources={['mom']}>
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
        <Note>v2 원본은 캔버스에 그리고 커서 트레일이 꼬리를 남긴다 — Footer 페이지에서 볼 수 있다. 이 CSS 버전은 캔버스 없이 같은 인상을 내는 경량 대안이다.</Note>
      </Section>
    </DocPage>
  )
}
