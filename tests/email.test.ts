import { test } from 'node:test'
import assert from 'node:assert/strict'
import { completeDomain, EMAIL_DOMAINS, EMAIL_RE } from '../src/components/form/emailDomains.ts'

test('이메일 도메인 자동완성 — 앞글자로 첫 후보를 고른다', () => {
  assert.deepEqual(completeDomain('me@g'), { domain: 'gmail.com', rest: 'mail.com' })
  assert.deepEqual(completeDomain('me@e'), { domain: 'efface.dev', rest: 'fface.dev' })
  assert.deepEqual(completeDomain('ME@GM'), { domain: 'gmail.com', rest: 'ail.com' })
})

test('이메일 도메인 자동완성 — 없거나 이미 완성이면 null', () => {
  assert.equal(completeDomain('me'), null)
  assert.equal(completeDomain('@g'), null)
  assert.equal(completeDomain('me@gmail.com'), null)
  assert.equal(completeDomain('me@zzz'), null)
  assert.equal(completeDomain('me@g mail'), null)
})

test('사용자 도메인 목록이 우선한다', () => {
  assert.deepEqual(completeDomain('me@c', ['company.com', ...EMAIL_DOMAINS]), { domain: 'company.com', rest: 'ompany.com' })
})

test('이메일 형식', () => {
  assert.ok(EMAIL_RE.test('contact@efface.dev'))
  assert.ok(!EMAIL_RE.test('contact@efface'))
  assert.ok(!EMAIL_RE.test('contact efface.dev'))
})
