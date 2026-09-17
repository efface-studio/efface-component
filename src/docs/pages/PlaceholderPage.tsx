import { DocPage } from '@/docs/components/Doc'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <DocPage eyebrow="wip" title={title} lead="작성 중.">
      <p className="text-sm text-fg-dim">곧 채워집니다.</p>
    </DocPage>
  )
}
