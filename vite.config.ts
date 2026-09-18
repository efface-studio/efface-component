import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const port = Number(process.env.PORT) || 5190

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
          ],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
