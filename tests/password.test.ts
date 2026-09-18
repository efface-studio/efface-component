import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PASSWORD_RULES, passwordScore } from '../src/components/form/passwordScore.ts'

test('비밀번호 규칙 — 길이 · 대소문자 · 숫자 · 기호', () => {
  const [len, cases, digit, symbol] = PASSWORD_RULES
  assert.ok(len.test('12345678') && !len.test('1234567'))
  assert.ok(cases.test('aB') && !cases.test('ab'))
  assert.ok(digit.test('a1') && !digit.test('a'))
  assert.ok(symbol.test('a!') && !symbol.test('a1'))
})

test('강도 점수는 통과한 규칙 수와 같다', () => {
  assert.equal(passwordScore(''), 0)
  assert.equal(passwordScore('abcdefgh'), 1)
  assert.equal(passwordScore('Efface!2026'), 4)
})
