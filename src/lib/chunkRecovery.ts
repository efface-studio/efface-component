/**
 * 배포 뒤 브라우저가 옛 index.html 로 새 배포에 없는 청크를 요청하면
 * "Failed to fetch dynamically imported module" 로 죽는다. 그럴 땐 한 번만
 * 새로고침해서 최신 index.html 을 받게 한다. 같은 URL 에서 짧은 시간 안에
 * 두 번째 실패면(진짜 네트워크 문제) 무한 새로고침을 막고 에러 화면에 맡긴다.
 */
const KEY = 'efface-ds-chunk-reload'
const WINDOW_MS = 30_000

export function reloadOnceForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < WINDOW_MS) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* 저장소를 못 쓰면 그냥 한 번 새로고침 */
  }
  window.location.reload()
  return true
}

export function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /dynamically imported module|Importing a module script failed|Failed to fetch|Loading chunk|Loading CSS chunk/i.test(msg)
}

/** 동적 import 가 청크를 못 받으면 새로고침을 시도하고, 아니면 에러를 그대로 던진다. */
export function withChunkRecovery<T>(load: () => Promise<T>): () => Promise<T> {
  return () =>
    load().catch((err: unknown) => {
      if (isChunkLoadError(err) && reloadOnceForStaleChunk()) {
        // 새로고침이 걸렸으니 영원히 pending — 에러 화면이 잠깐 번쩍이지 않게
        return new Promise<T>(() => {})
      }
      throw err
    })
}
