import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cn } from '../src/lib/cn.ts'
import { isChunkLoadError } from '../src/lib/chunkRecovery.ts'
import { isInspectMessage } from '../src/lib/inspectBridge.ts'
import { canonicalPath } from '../src/docs/components/seo.constants.ts'
import { DOC_NAV } from '../src/docs/nav.ts'
import { hexToRgb01, cssColorToRgb } from '../src/lib/color.ts'

test('cn — 충돌하는 tailwind 클래스는 뒤가 이긴다', () => {
  assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4')
  const off = Math.random() > 2
  assert.equal(cn('a', off && 'b', undefined, 'c'), 'a c')
})

test('청크 로드 오류 감지', () => {
  assert.ok(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/x.js')))
  assert.ok(isChunkLoadError(new Error('Importing a module script failed.')))
  assert.ok(isChunkLoadError('Loading chunk 12 failed'))
  assert.ok(!isChunkLoadError(new Error('boom')))
})

test('inspect 메시지 판별', () => {
  assert.ok(isInspectMessage({ source: 'ef-inspect', type: 'ready' }))
  assert.ok(!isInspectMessage({ source: 'other' }))
  assert.ok(!isInspectMessage(null))
})

test('canonical 경로 — 소문자 · 끝 슬래시 제거', () => {
  assert.equal(canonicalPath('/'), '/')
  assert.equal(canonicalPath('/Foundations/Colors/'), '/foundations/colors')
  assert.equal(canonicalPath(''), '/')
})

test('문서 라우트 — 슬래시로 시작하고 중복이 없다', () => {
  const tos = DOC_NAV.flatMap((g) => g.links.map((l) => l.to))
  assert.ok(tos.every((t) => t.startsWith('/')))
  assert.equal(new Set(tos).size, tos.length)
  assert.ok(tos.includes('/'))
})

test('색 파싱', () => {
  assert.deepEqual(hexToRgb01('#ffffff'), [1, 1, 1])
  assert.deepEqual(hexToRgb01('#000'), [0, 0, 0])
  assert.deepEqual(hexToRgb01('nope', [0.5, 0.5, 0.5]), [0.5, 0.5, 0.5])
  assert.deepEqual(cssColorToRgb('rgb(10, 20, 30)'), [10, 20, 30])
})
