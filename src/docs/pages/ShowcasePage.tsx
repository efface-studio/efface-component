import { useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Lightbox } from '@/docs/components/Lightbox'
import { SHOWCASE_PROJECTS, shotsFor, type ShowcaseProjectId, type ShowcaseShot } from '@/docs/showcase.data'
import { TrafficLights } from '@/components/ui/Card'
import { RevealCSS } from '@/components/motion/RevealCSS'

const IDS: ShowcaseProjectId[] = ['efface', 'v2', 'hinest']

/** 브라우저 창 프레임 안에 페이지 상단을 보여주고, 마우스를 올리면 아래로 천천히 스크롤된다. */
function ShotCard({ shot, host, onOpen }: { shot: ShowcaseShot; host: string; onOpen: () => void }) {
  const mobile = shot.viewport === 'mobile'
  // 카드 창의 비율에 맞춰 이미지가 얼마나 더 내려갈 수 있는지 (긴 페이지는 -70% 까지만)
  const travel = Math.min(70, Math.max(0, (1 - (mobile ? 0.5 : 0.625) * (shot.w / shot.h)) * 100))
  return (
    <button type="button" onClick={onOpen} className="group block w-full text-left" aria-label={`${shot.title || shot.path} 크게 보기`}>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-line bg-surface transition-all duration-500 group-hover:-translate-y-1 group-hover:border-line-strong',
          'shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)]',
        )}
      >
        {!mobile && (
          <div className="flex h-8 items-center gap-2.5 border-b border-line bg-bg-soft px-3">
            <TrafficLights />
            <div className="mx-auto flex h-5 max-w-[70%] min-w-0 flex-1 items-center truncate rounded border border-line bg-surface px-2 font-mono text-[10px] text-fg-dim">
              {host}
              {shot.path}
            </div>
            <div className="w-8 shrink-0" />
          </div>
        )}
        <div className={cn('relative overflow-hidden bg-surface', mobile ? 'aspect-[1/2]' : 'aspect-[16/10]')}>
          <motion.img
            src={shot.file}
            alt={shot.title}
            width={shot.w}
            height={shot.h}
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 top-0 block w-full select-none"
            initial={false}
            whileHover={{ y: `-${travel}%` }}
            transition={{ duration: 2.6 + travel / 30, ease: EASE_OUT_EXPO }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
        <span className="text-[14px] font-medium">{shot.title || shot.path}</span>
        <span className="shrink-0 font-mono text-[10.5px] text-fg-faint">{shot.path}</span>
      </div>
    </button>
  )
}

export function ShowcasePage() {
  const { project } = useParams<{ project: string }>()
  const proj = SHOWCASE_PROJECTS.find((p) => p.id === project)
  const firstGroup = proj?.groups[0] ?? ''
  const [group, setGroup] = useState(firstGroup)
  const [seenProject, setSeenProject] = useState(proj?.id)
  const [open, setOpen] = useState<number | null>(null)
  if (proj && seenProject !== proj.id) {
    setSeenProject(proj.id)
    setGroup(proj.groups[0] ?? '')
    setOpen(null)
  }
  const shots = useMemo(() => (proj ? shotsFor(proj.id, group) : []), [proj, group])

  if (!proj || !IDS.includes(proj.id)) return <Navigate to="/showcase/efface" replace />

  const counts = Object.fromEntries(proj.groups.map((g) => [g, shotsFor(proj.id, g).length]))
  const mobileGroup = group === '모바일'

  return (
    <DocPage
      eyebrow={`showcase · ${proj.host}`}
      title={proj.name}
      lead={proj.tagline}
    >
      <div className="-mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-fg-dim">
        <span className="font-mono text-[12px]">{proj.stack}</span>
        <a href={proj.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg-dim hover:text-fg">
          {proj.host} <ArrowUpRight size={13} />
        </a>
        <span className="font-mono text-[11px] text-fg-faint uppercase">{proj.theme}</span>
      </div>

      <Section title="페이지" desc={proj.id === 'hinest' ? '권한에 따라 보이는 메뉴와 화면이 달라요. 탭을 바꿔 가며 비교해 보세요. 카드에 마우스를 올리면 아래로 스크롤되고, 누르면 전체 페이지를 볼 수 있어요.' : '카드에 마우스를 올리면 페이지가 아래로 스크롤되고, 누르면 전체를 볼 수 있어요.'}>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="화면 종류">
          {proj.groups.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors',
                group === g ? 'border-fg bg-fg text-bg' : 'border-line bg-surface text-fg-dim hover:border-line-strong hover:text-fg',
              )}
            >
              {g}
              <span className={cn('font-mono text-[10.5px]', group === g ? 'text-bg/60' : 'text-fg-faint')}>{counts[g]}</span>
            </button>
          ))}
        </div>
        {proj.groupNotes?.[group] && <Note>{proj.groupNotes[group]}</Note>}

        {shots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong p-8 text-center text-sm text-fg-dim">아직 캡처된 화면이 없어요.</p>
        ) : (
          <ul key={group} className={cn('grid gap-x-6 gap-y-8', mobileGroup ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3')}>
            {shots.map((s, i) => (
              <RevealCSS as="li" key={s.file} delay={(i % 6) * 50}>
                <ShotCard shot={s} host={proj.host} onOpen={() => setOpen(i)} />
              </RevealCSS>
            ))}
          </ul>
        )}
      </Section>

      <Lightbox shots={shots} index={open} onClose={() => setOpen(null)} onIndex={setOpen} host={proj.host} />
    </DocPage>
  )
}
