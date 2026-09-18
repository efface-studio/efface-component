import { useRouteError } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { Button } from '@/components/ui/Button'
import { isChunkLoadError } from '@/lib/chunkRecovery'
import { Seo } from '@/docs/components/Seo'

/** 라우트 안에서 터진 에러. 청크 문제면 새로고침을 권하고, 아니면 메시지를 보여준다. */
export function RouteErrorPage() {
  const err = useRouteError()
  const stale = isChunkLoadError(err)
  const message = err instanceof Error ? err.message : String(err)
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[1280px] flex-col items-start justify-center gap-6 px-5 py-20 md:px-10">
      <Seo title={stale ? 'update' : 'error'} noindex />
      <LogoMark className="h-10 w-10 text-fg-faint" />
      <p className="label">
        <span className="text-accent">//</span> {stale ? 'update' : 'error'}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{stale ? '새 버전이 배포됐어요.' : '문제가 생겼어요.'}</h1>
      <p className="max-w-md text-fg-dim">{stale ? '열어둔 페이지가 이전 버전이라 새 파일을 못 찾았어요. 새로고침하면 바로 이어서 볼 수 있어요.' : '페이지를 그리는 중에 오류가 났어요. 새로고침해도 계속되면 알려주세요.'}</p>
      <Button onClick={() => window.location.reload()}>새로고침</Button>
      {!stale && <pre className="max-w-full overflow-x-auto rounded-lg border border-line bg-bg-soft p-4 font-mono text-[12px] text-fg-faint">{message}</pre>}
    </div>
  )
}
