import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { DOC_NAV } from './src/docs/nav.ts'

const port = Number(process.env.PORT) || 5190

/** 라우트 목록(src/docs/nav.ts)에서 sitemap.xml 을 만든다. Live 는 서드파티 iframe 이라 noindex — 제외 */
function sitemap(): Plugin {
  return {
    name: 'ef-sitemap',
    apply: 'build',
    generateBundle() {
      const urls = DOC_NAV.filter((g) => g.title !== 'Live').flatMap((g) => g.links.map((l) => l.to))
      const body = urls.map((u) => `  <url><loc>https://ds.efface.dev${u === '/' ? '/' : u}</loc></url>`).join('\n')
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n` })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port },
  preview: { port },
  build: {
    // 벤더를 따로 묶어 배포마다 다시 받지 않게(해시가 바뀌지 않는다). three 는 동적 import 라 이미 분리.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'motion-vendor', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/, priority: 20 },
            // 아이콘이 100~200B 청크 수십 개로 쪼개져 요청만 늘어난다 — 한 파일로
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/, priority: 25 },
            // 여러 라우트가 같이 쓰는 앱 모듈(UI·문서 조각·lib·hooks)이 수십 개의 1~3KB 청크로 흩어져 요청 폭포가 생긴다 — 한 파일로.
            // fx 데모는 카드마다 따로 lazy 로 받으므로 제외
            { name: 'app', test: /[\\/]src[\\/](?:components[\\/](?!fx[\\/])|docs[\\/]components[\\/]|lib[\\/]|hooks[\\/])/, minShareCount: 2, priority: 10 },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
