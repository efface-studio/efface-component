import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { reloadOnceForStaleChunk } from '@/lib/chunkRecovery'

// Vite 가 청크(또는 그 CSS) 를 못 받으면 이 이벤트를 쏜다 — 옛 index.html 문제면 새로고침으로 해결된다
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnceForStaleChunk()) e.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
