import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokenize, tokenizeTsx } from '../src/docs/components/highlight.ts'

const kinds = (src: string, lang = 'tsx') => tokenize(src, lang).map((t) => t.kind)

test('tsx — 키워드 · 문자열 · 주석 · 태그를 나눈다', () => {
  const ks = kinds("const a = 'x' // hi\n<Button size=\"sm\" />")
  assert.ok(ks.includes('keyword'))
  assert.ok(ks.includes('string'))
  assert.ok(ks.includes('comment'))
  assert.ok(ks.includes('tag'))
})

test('토큰을 이어 붙이면 원문이 그대로 나온다', () => {
  const cases: [string, string][] = [
    ['function f() { return `a${b}` }', 'tsx'],
    ['.a { color: red; } /* c */', 'css'],
    ['<div class="x">hi</div>', 'html'],
  ]
  for (const [src, lang] of cases) assert.equal(tokenize(src, lang).map((t) => t.text).join(''), src)
})

test('빈 입력', () => {
  assert.deepEqual(tokenizeTsx(''), [])
})
