import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DOC_NAV } from '@/docs/nav'
import { canonicalPath, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from './seo.constants'

export interface SeoProps {
  title: string
  description?: string
  /** 검색에 넣지 않는 페이지 — 404, 오류, 라이브 프레임 */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertJsonLd(data: unknown) {
  const id = 'ef-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/** 라우트의 그룹·라벨 — 빵부스러기(JSON-LD)용 */
function breadcrumb(path: string) {
  for (const g of DOC_NAV) for (const l of g.links) if (l.to === path) return { group: g.title, label: l.label }
  return null
}

/**
 * 라우트별 title · description · canonical · Open Graph · robots · JSON-LD 를 <head> 에 써 넣는다.
 * index.html 의 정적 태그를 찾아 갱신하므로(없으면 만든다) 링크 미리보기 봇은 정적 값을, 검색 봇은 렌더된 값을 본다.
 */
export function Seo({ title, description, noindex = false }: SeoProps) {
  const { pathname } = useLocation()
  useEffect(() => {
    const path = canonicalPath(pathname)
    const url = SITE_ORIGIN + path
    const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} — ${SITE_NAME}`
    const desc = (description ?? SITE_DESCRIPTION).slice(0, 155)
    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', url)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)

    const crumb = breadcrumb(path)
    const graph: unknown[] = [{ '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, name: SITE_NAME, url: `${SITE_ORIGIN}/`, inLanguage: 'ko' }]
    if (crumb && path !== '/') {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Overview', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: crumb.group },
          { '@type': 'ListItem', position: 3, name: crumb.label, item: url },
        ],
      })
    }
    upsertJsonLd({ '@context': 'https://schema.org', '@graph': graph })
  }, [pathname, title, description, noindex])
  return null
}
