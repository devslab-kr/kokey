import { describe, expect, it } from 'vitest'
import { enToKo } from './enToKo'
import { koToEn } from './koToEn'

describe('enToKo', () => {
  it('composes complete syllables', () => {
    expect(enToKo('dkssud')).toBe('안녕')
    expect(enToKo('gksrmf')).toBe('한글')
    expect(enToKo('dnjfdydlf')).toBe('월요일')
  })

  it('composes compound trailing consonants (겹받침)', () => {
    expect(enToKo('rkqt')).toBe('값')
    expect(enToKo('dksgek')).toBe('않다')
    expect(enToKo('ekfr')).toBe('닭')
    expect(enToKo('djqtdj')).toBe('없어')
  })

  it('composes compound vowels (겹모음)', () => {
    expect(enToKo('dhk')).toBe('와')
    expect(enToKo('dmltk')).toBe('의사')
    expect(enToKo('dnjs')).toBe('원')
  })

  it('handles 받침 넘김 — vowel steals the trailing consonant', () => {
    expect(enToKo('gksrnr')).toBe('한국')
    expect(enToKo('dkswk')).toBe('안자')
    // compound trailing consonant splits: 달 keeps ㄹ, ㄱ moves on
    expect(enToKo('ekfrl')).toBe('달기')
  })

  it('is case-sensitive for shifted jamo', () => {
    expect(enToKo('Enlek')).toBe('뛰다')
    expect(enToKo('Tm')).toBe('쓰')
    expect(enToKo('dlTdj')).toBe('있어')
    expect(enToKo('dlTj')).toBe('이써')
    // uppercase without a shifted jamo falls back to the plain one
    expect(enToKo('DKSSUD')).toBe('안녕')
  })

  it('emits incomplete input as standalone jamo', () => {
    expect(enToKo('r')).toBe('ㄱ')
    expect(enToKo('rt')).toBe('ㄱㅅ')
    expect(enToKo('k')).toBe('ㅏ')
    expect(enToKo('ml')).toBe('ㅢ')
    expect(enToKo('hk')).toBe('ㅘ')
    expect(enToKo('kk')).toBe('ㅏㅏ')
  })

  it('flushes on unmapped characters and passes them through', () => {
    expect(enToKo('dkssud gktpdy')).toBe('안녕 하세요')
    expect(enToKo('rkqt: 123')).toBe('값: 123')
    expect(enToKo('')).toBe('')
  })

  it('round-trips with koToEn for Korean text', () => {
    const samples = [
      '안녕하세요',
      '한글과 컴퓨터',
      '값없는 닭갈비',
      '띄어쓰기 있는 문장',
      '월요일에 만나요',
      '의의를 잃지 않았다'
    ]
    for (const s of samples) {
      expect(enToKo(koToEn(s))).toBe(s)
    }
  })
})
