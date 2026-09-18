import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind 클래스 조건부 결합 + 충돌 병합.
 * `clsx`가 조건을 풀고, `twMerge`가 뒤에 온 유틸리티로 앞의 것을 덮어쓴다 —
 * base가 `px-6`인 컴포넌트에 `className="px-8"`을 넘기면 실제로 `px-8`이 이긴다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
