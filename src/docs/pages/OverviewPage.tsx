import { Link } from 'react-router-dom'
import { DocPage, Section } from '@/docs/components/Doc'
import { DOC_NAV } from '@/docs/nav'
import { LogoParticleHero } from '@/docs/components/LogoParticleHero'

export function OverviewPage() {
  return (
    <DocPage
      eyebrow="overview"
      title="efface design system"
      lead="efface 제품들이 함께 쓰는 색, 글꼴, 간격, 모션을 한곳에 모았어요. 바로 미리 보고, 코드는 복사해서 쓰면 됩니다."
    >
      <LogoParticleHero className="mb-20" />

      <Section title="지키는 것들" desc="컴포넌트를 새로 만들거나 고칠 때 이 기준을 따라요.">
        <ol className="grid gap-4 md:grid-cols-2">
          {[
            ['덜어내기', '검정 바탕에 흰 글자, 강조색은 하나면 충분해요. 카드, 그라데이션, 그림자는 꼭 필요할 때만.'],
            ['곡선은 하나', '등장과 전환은 전부 ease-out-expo (0.22, 1, 0.36, 1) 하나로 통일해요. 스태거는 0.06~0.07초.'],
            ['첫 화면은 CSS로', '첫 화면에 바로 보여야 하는 건 CSS 키프레임(rise-in)으로 띄워요. JS를 기다리지 않아도 되니까요. motion은 스크롤에 반응할 때만.'],
            ['움직임 줄이기 존중', '시스템에서 애니메이션 줄이기를 켰다면 모든 모션이 바로 끝 상태로 그려져요.'],
            ['모노 라벨', '섹션 제목 위에는 항상 // 로 시작하는 모노 라벨이 있어요. 번호도 모노 + 강조색.'],
            ['1px 선', '카드 사이 간격은 1px 선으로 나눠요. 테두리는 line 토큰, 강조하고 싶을 땐 fg.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-lg border border-line p-4">
              <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-[15px] font-medium">{t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-dim">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="둘러보기">
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_NAV.filter((g) => g.title !== 'Overview').map((g) => (
            <li key={g.title}>
              <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">{g.title}</p>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="link-underline text-sm text-fg-dim hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>
    </DocPage>
  )
}
