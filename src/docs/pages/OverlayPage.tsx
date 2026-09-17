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
      lead="화면 위에 떠 있는 것들. 우하단 플로팅 CTA 와 그 패널, 그리고 exit-intent 모달. 둘 다 v1 에서 왔고 라이트 기준으로 설계됐다."
      sources={['v1']}
    >
      <Section title="FloatingCTA" desc="알약 버튼(메시지 아이콘 + 텍스트 + 화살표 원)을 누르면 위로 280px 패널이 펼쳐진다. v1 은 300px 이상 스크롤했을 때만 보였다." sources={['v1']}>
        <Preview
          theme="light"
          bleed
          minHeight={420}
          code={`import { FloatingCTA } from '@/components/layout'

<FloatingCTA
  visible={scrolled}
  bubble="상담하기"
  title="프로젝트, 이야기해 볼까요?"
  actions={[
    { label: '프로젝트 신청', href: '/apply' },
    { label: '카카오톡 상담', href: KAKAO_URL, variant: 'kakao', external: true },
    { label: '이메일 보내기', href: 'mailto:sales@efface.dev', variant: 'outline' },
  ]}
  note="1영업일 내 회신"
/>`}
        >
          <div className="relative h-[420px] p-8">
            <p className="text-sm text-fg-dim">우하단 버튼을 누른다.</p>
            <FloatingCTA
              contained
              bubble="상담하기"
              title="프로젝트, 이야기해 볼까요?"
              actions={[
                { label: '프로젝트 신청', href: '#' },
                { label: '카카오톡 상담', href: '#', variant: 'kakao' },
                { label: '이메일 보내기', href: '#', variant: 'outline' },
              ]}
              note="1영업일 내 회신"
            />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'bubble', type: 'string', desc: '버튼 텍스트. 열리면 × 로 바뀐다' },
            { name: 'actions', type: "{ label; href; variant?: 'primary' | 'kakao' | 'outline'; external? }[]", desc: '패널 항목' },
            { name: 'visible', type: 'boolean', default: 'true', desc: 'false 면 아래로 사라진다' },
            { name: 'contained', type: 'boolean', default: 'false', desc: 'fixed 대신 absolute' },
          ]}
        />
      </Section>

      <Section title="Modal" desc="반투명 잉크 배경 + 블러. 카드는 아래에서 24px 올라오며 0.97 → 1 로 커진다. 상단 그라데이션 선과 우상단 블루 글로우가 장식. ESC · 배경 클릭으로 닫힌다. v1 은 데스크톱에서 마우스가 창 위로 나갈 때 한 번 띄웠다(exit-intent)." sources={['v1']}>
        <Preview
          theme="light"
          bleed
          minHeight={420}
          code={`import { Modal } from '@/components/layout'

<Modal open={open} onClose={() => setOpen(false)}>
  <p className="label">before you go</p>
  <h3 className="mt-3 text-2xl font-semibold tracking-tight">견적만 받아 보셔도 됩니다.</h3>
  <p className="mt-3 text-sm text-fg-dim">…</p>
  <ButtonLink href="/apply" size="lg" className="mt-6 w-full">무료 견적 받기 <ArrowRight size={16} /></ButtonLink>
</Modal>`}
        >
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden">
            <Button onClick={() => setOpen(true)}>모달 열기</Button>
            <Modal open={open} onClose={() => setOpen(false)} contained>
              <p className="label">before you go</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">견적만 받아 보셔도 됩니다.</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-dim">요구사항을 적어 보내주시면 1영업일 내 견적과 일정을 회신드립니다. 부담 없이 비교해 보세요.</p>
              <ButtonLink href="#" size="lg" className="mt-6 w-full" trailing={<ArrowRight size={16} />} onClick={(e) => { e.preventDefault(); setOpen(false) }}>
                무료 견적 받기
              </ButtonLink>
            </Modal>
          </div>
        </Preview>
        <Note>모달과 오버레이 메뉴는 useBodyScrollLock 을 공유한다 — 중첩되어도 카운트로 관리되어 마지막 하나가 닫힐 때 배경 스크롤이 돌아온다.</Note>
      </Section>
    </DocPage>
  )
}
