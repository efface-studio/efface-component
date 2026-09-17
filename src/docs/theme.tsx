import { createContext, useContext } from 'react'

export type DocsTheme = 'light' | 'dark'

export interface DocsThemeContextValue {
  theme: DocsTheme
  setTheme: (t: DocsTheme) => void
}

export const DocsThemeContext = createContext<DocsThemeContextValue>({ theme: 'dark', setTheme: () => {} })

/** 문서 전체 테마. 프리뷰는 이 값을 따르다가 자기 토글을 누르면 그때만 따로 논다. */
export function useDocsTheme() {
  return useContext(DocsThemeContext)
}
