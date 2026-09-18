import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { Seo } from '@/docs/components/Seo'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 py-20">
      <Seo title="404" noindex />
      <LogoMark className="h-10 w-10 text-fg-faint" />
      <p className="label">
        <span className="text-accent">//</span> 404
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">Nothing here.</h1>
      <p className="max-w-md text-fg-dim">The page was erased, or the address is wrong.</p>
      <Link to="/" className="link-underline text-sm text-fg-dim hover:text-fg">
        Back to overview →
      </Link>
    </div>
  )
}
