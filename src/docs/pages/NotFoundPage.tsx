import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 py-20">
      <LogoMark className="h-10 w-10 text-fg-faint" />
      <p className="label">
        <span className="text-accent">//</span> 404
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">여기엔 아무것도 없습니다.</h1>
      <p className="max-w-md text-fg-dim">지워진 페이지거나 주소가 잘못됐습니다.</p>
      <Link to="/" className="link-underline text-sm text-fg-dim hover:text-fg">
        처음으로 →
      </Link>
    </div>
  )
}
