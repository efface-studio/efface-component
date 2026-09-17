import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { FloatingCTA } from '@/components/layout/FloatingCTA'
import { Modal } from '@/components/layout/Modal'
import { Button, ButtonLink } from '@/components/ui/Button'

export function OverlayPage() {
  const [open, setOpen] = useState(false)
  return (
    <DocPage
      eyebrow="layout"
      title="Overlay"
      lead="화면 위에 떠 있는 것들이에요. 오른쪽 아래 플로팅 버튼과 거기서 펼쳐지는 패널, 그리고 모달. 둘 다 v1에서 가져왔고 밝은 테마 기준으로 만들어졌어요."
      sources={['v1']}
    >
      <Section title="FloatingCTA" desc="알약 버튼을 누르면 위로 패널이 펼쳐져요. v1에서는 300px 이상 스크롤한 뒤에야 나타났어요." sources={['v1']}>
        <Preview
          theme="light"
          bleed
          minHeight={420}
          code={`import { FloatingCTA } from '@/components/layout'

<FloatingCTA
  visible={scrolled}
  bubble="Talk to us"
  title="Let's talk about your project"
  actions={[
    { label: 'Start a project', href: '/apply' },
    { label: 'Chat on KakaoTalk', href: KAKAO_URL, variant: 'kakao', external: true },
    { label: 'Send an email', href: 'mailto:sales@efface.dev', variant: 'outline' },
  ]}
  note="Replies within 1 business day"
/>`}
        >
          <div className="relative h-[420px] p-8">
            <p className="text-sm text-fg-dim">Press the button in the bottom-right corner.</p>
            <FloatingCTA
              contained
              bubble="Talk to us"
              title="Let's talk about your project"
              actions={[
                { label: 'Start a project', href: '#' },
                { label: 'Chat on KakaoTalk', href: '#', variant: 'kakao' },
                { label: 'Send an email', href: '#', variant: 'outline' },
              ]}
              note="Replies within 1 business day"
            />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'bubble', type: 'string', desc: '버튼 텍스트. 열리면 × 로 바뀌어요' },
            { name: 'actions', type: "{ label; href; variant?: 'primary' | 'kakao' | 'outline'; external? }[]", desc: '패널 항목' },
            { name: 'visible', type: 'boolean', default: 'true', desc: 'false 면 아래로 사라져요' },
            { name: 'contained', type: 'boolean', default: 'false', desc: 'fixed 대신 absolute' },
          ]}
        />
      </Section>

      <Section title="Modal" desc="반투명한 검정 배경에 블러가 깔리고, 카드는 아래에서 살짝 올라오며 커져요. 위쪽 그라데이션 선과 오른쪽 위 파란 글로우가 장식이에요. ESC나 배경 클릭으로 닫혀요. v1에서는 마우스가 창 밖으로 나갈 때 한 번 띄웠어요." sources={['v1']}>
        <Preview
          theme="light"
          bleed
          minHeight={420}
          code={`import { Modal } from '@/components/layout'

<Modal open={open} onClose={() => setOpen(false)}>
  <p className="label">before you go</p>
  <h3 className="mt-3 text-2xl font-semibold tracking-tight">A quote costs nothing.</h3>
  <p className="mt-3 text-sm text-fg-dim">…</p>
  <ButtonLink href="/apply" size="lg" className="mt-6 w-full">Get a free quote <ArrowRight size={16} /></ButtonLink>
</Modal>`}
        >
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden">
            <Button onClick={() => setOpen(true)}>Open modal</Button>
            <Modal open={open} onClose={() => setOpen(false)} contained>
              <p className="label">before you go</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">A quote costs nothing.</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-dim">Send your requirements and we reply with a quote and schedule within one business day. Compare freely.</p>
              <ButtonLink href="#" size="lg" className="mt-6 w-full" trailing={<ArrowRight size={16} />} onClick={(e) => { e.preventDefault(); setOpen(false) }}>
                Get a free quote
              </ButtonLink>
            </Modal>
          </div>
        </Preview>
        <Note>모달과 오버레이 메뉴는 useBodyScrollLock을 같이 써요. 겹쳐 열려도 개수를 세고 있어서 마지막 하나가 닫힐 때 뒤 스크롤이 돌아와요.</Note>
      </Section>
    </DocPage>
  )
}
