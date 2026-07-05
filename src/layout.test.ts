import { describe, expect, it } from 'vitest'
import { convertByTable, defineLayout, invert } from './layout'

describe('convertByTable', () => {
  const table = { a: 'x', ab: 'Y', c: 'z' }

  it('prefers the longest match (greedy)', () => {
    expect(convertByTable('abc', table, 2)).toBe('Yz')
  })

  it('passes unmapped characters through', () => {
    expect(convertByTable('a-1c', table, 2)).toBe('x-1z')
  })
})

describe('invert', () => {
  it('prefers the shortest, then lowercase, key on collisions', () => {
    expect(invert({ S: 'ㄴ', s: 'ㄴ' })).toEqual({ ㄴ: 's' })
    expect(invert({ s: 'ㄴ', S: 'ㄴ' })).toEqual({ ㄴ: 's' })
    expect(invert({ ';a': 'ά', z: 'ά' })).toEqual({ ά: 'z' })
  })
})

describe('defineLayout', () => {
  const toy = defineLayout({
    id: 'toy',
    script: [[0x0400, 0x04ff]],
    fromKey: { a: 'б', b: 'в', ab: 'г' },
    toKeyOverrides: { д: 'a' }
  })

  it('converts both directions with pass-through', () => {
    expect(toy.fromLatin('ab!')).toBe('г!')
    expect(toy.toLatin('бв!')).toBe('ab!')
  })

  it('applies toKeyOverrides in the reverse direction only', () => {
    expect(toy.toLatin('д')).toBe('a')
    expect(toy.fromLatin('a')).toBe('б')
  })

  it('round-trips native text', () => {
    for (const s of ['б', 'в', 'г', 'вбг']) {
      expect(toy.fromLatin(toy.toLatin(s))).toBe(s)
    }
  })

  it('re-parses multi-key sequences greedily, like a real dead key', () => {
    // б+в decompose to a+b, which the greedy pass recomposes as ab → г —
    // exactly how pressing a dead key then a letter behaves on a real IME.
    expect(toy.fromLatin(toy.toLatin('бв'))).toBe('г')
  })
})
