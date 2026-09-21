/* 데모 코드 패널이 보여줄 소스 — 필요할 때만 받는 raw 청크 */
export const REPO_URL = 'https://github.com/efface-studio/efface-component'

/* 소스는 필요할 때만 받는다 — 파일마다 raw 청크. 빌드에 포함되지만 패널을 열 때 하나씩 내려온다 */
const SOURCES = import.meta.glob(['/src/components/**/*.tsx', '/src/components/**/*.ts', '/src/docs/components/AuthMovie.tsx', '/src/docs/components/auth/*.tsx', '/src/lib/*.ts', '/src/hooks/*.ts', '/src/index.css'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

export function hasSource(file: string) {
  return `/${file}` in SOURCES
}

export function loadSource(file: string) {
  return SOURCES[`/${file}`]?.() ?? Promise.reject(new Error(`no source: ${file}`))
}

export interface SourceInfo {
  /** export 이름 */
  name: string
  /** 리포 상대 경로 — src/components/fx/FluidInk.tsx */
  file: string
  /** 사용 예시(JSX). 없으면 기본 틀 */
  usage?: string
}

/** 기본 사용 예시 — 높이만 주면 되는 데모 컴포넌트 */
export function defaultUsage(name: string, importPath: string, height = 320) {
  return `import { ${name} } from '${importPath}'

export function Demo() {
  return (
    <div className="h-[${height}px] w-full">
      <${name} />
    </div>
  )
}`
}
