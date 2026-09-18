/** 터치 기기(정밀 포인터 없음) — 무거운 시뮬레이션의 해상도·개체 수를 낮추는 기준 */
export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
}
