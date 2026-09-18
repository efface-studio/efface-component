import { useEffect } from 'react'
import { loadDisplayFonts } from '@/lib/fonts'

/** 마운트 시 디스플레이 폰트(Space Grotesk · Archivo Black)를 붙인다 — 첫 화면 렌더를 막지 않게 지연 로드 */
export function useDisplayFonts() {
  useEffect(() => {
    void loadDisplayFonts()
  }, [])
}
