import { useCallback } from 'react'
import { useFooterMotion } from './useFooterMotion'

export interface FooterRow {
  k: string
  v: string
  href?: string
}
export interface FooterGroup {
  label: string
  rows: FooterRow[]
}
export interface FooterPolicy {
  t: string
  href: string
  strong?: boolean
}
export interface FooterBottomLink {
  t: string
  href: string
}

export interface FooterProps {
  /** `~단어~`가 취소선 단어 */
  tagline: string
  groups: FooterGroup[]
  policies: FooterPolicy[]
  policyLabel?: string
  rights: string
  bottomLinks: FooterBottomLink[]
  toTopLabel?: string
  /** 문서 프리뷰처럼 스크롤 컨테이너 안에 있으면 맨 위로 버튼이 컨테이너를 올린다 */
  onToTop?: () => void
}

const MONO = "'JetBrains Mono', ui-monospace, monospace"
const DISPLAY = "'Space Grotesk', 'Pretendard Variable', sans-serif"

function parseTagline(tagline: string) {
  const m = tagline.match(/^(.*?)~(.+?)~(.*)$/)
  return m ? { before: m[1] ?? '', struck: m[2] ?? '', after: m[3] ?? '' } : { before: tagline, struck: '', after: '' }
}

function RowValue({ row }: { row: FooterRow }) {
  if (!row.href) return <span style={{ color: '#A9A9B2' }}>{row.v}</span>
  const external = row.href.startsWith('http')
  return (
    <a href={row.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="footer-link" style={{ color: '#A9A9B2' }}>
      {row.v}
      <span className="footer-hl" aria-hidden />
    </a>
  )
}

/**
 * v2 푸터 — 다크 전용. 대각선 와이프 진입, 스태거 메타 컬럼, 취소선 태그라인,
 * 캔버스 워드마크(커서 트레일). 데이터는 전부 props로 받는다.
 */
export function Footer({ tagline, groups, policies, policyLabel = 'POLICY', rights, bottomLinks, toTopLabel = '맨 위로 ↑', onToTop }: FooterProps) {
  const t = parseTagline(tagline)
  const { rootRef, wipeRef, headRef, metaRef, strikeRef, barRef, canvasRef, cwrapRef } = useFooterMotion()

  const toTop = useCallback(() => {
    if (onToTop) return onToTop()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [onToTop])

  return (
    <footer
      ref={rootRef}
      data-theme="dark"
      style={{ position: 'relative', background: '#0a0a0b', color: '#EDEDEF', borderTop: '1px solid #1B1B22', overflow: 'hidden' }}
    >
      <div
        ref={wipeRef}
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '72px 24px 0',
          boxSizing: 'border-box',
          maskImage: 'linear-gradient(115deg, rgba(0,0,0,1) -15%, rgba(0,0,0,0) 0%)',
          willChange: 'mask-image',
        }}
      >
        <div
          ref={headRef}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22, opacity: 0, transform: 'translateY(14px)', filter: 'blur(8px)', willChange: 'transform, opacity, filter' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span style={{ position: 'relative', width: 26, height: 26, display: 'inline-block' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, width: 17, height: 17, borderRadius: 5, background: '#3B82F6' }} />
              <span style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 4, background: '#E8E8EC' }} />
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: '-0.035em' }}>efface</span>
          </div>

          <p style={{ margin: 0, fontSize: 'clamp(19px, 2vw, 26px)', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.4, color: '#C9C9D1', textWrap: 'pretty' }}>
            {t.before}
            {t.struck && (
              <span style={{ position: 'relative', display: 'inline-block', color: '#6E6E78' }}>
                {t.struck}
                <span
                  ref={strikeRef}
                  aria-hidden
                  style={{ position: 'absolute', left: '-3%', right: '-3%', top: '53%', height: '0.07em', borderRadius: 2, background: '#3B82F6', transform: 'scaleX(0)', transformOrigin: 'left' }}
                />
              </span>
            )}
            {t.after}
          </p>

          {/* 메타 컬럼 — 직계 자식 하나가 컬럼 하나. 시퀀스가 DOM 순서로 스태거하므로 이 레벨에 다른 것을 끼우면 안 된다. */}
          <div ref={metaRef} className="footer-meta" style={{ opacity: 0 }}>
            {groups.map((g) => (
              <div key={g.label} className="footer-col">
                <div className="footer-col__label" style={{ fontFamily: MONO }}>
                  {g.label}
                </div>
                {g.rows.map((row) => (
                  <div key={row.k} style={{ display: 'flex', gap: 14, fontSize: 13.5 }}>
                    <span style={{ color: '#55555E', width: 66, flex: 'none' }}>{row.k}</span>
                    <RowValue row={row} />
                  </div>
                ))}
              </div>
            ))}
            <div className="footer-col footer-col--policy">
              <div className="footer-col__label" style={{ fontFamily: MONO }}>
                {policyLabel}
              </div>
              {policies.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  className="footer-link"
                  style={{ width: 'fit-content', fontSize: 13.5, fontWeight: p.strong ? 600 : undefined, color: p.strong ? '#D8D8DE' : '#A9A9B2' }}
                >
                  {p.t}
                  <span className="footer-hl" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div ref={cwrapRef} style={{ position: 'relative', marginTop: 96, height: 'clamp(130px, 15vw, 240px)' }}>
          <canvas ref={canvasRef} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
        </div>

        <div
          ref={barRef}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', borderTop: '1px solid #1B1B22', marginTop: 26, padding: '24px 0 30px', opacity: 0 }}
        >
          <div style={{ fontSize: 13, color: '#55555E' }}>{rights}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {bottomLinks.map((l) => (
              <a key={l.href} href={l.href} className="footer-link" style={{ fontSize: 13, color: '#6E6E78' }}>
                {l.t}
                <span className="footer-hl" aria-hidden />
              </a>
            ))}
            <button type="button" onClick={toTop} className="footer-totop" style={{ fontFamily: MONO }}>
              {toTopLabel}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
