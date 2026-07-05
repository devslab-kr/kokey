import { describe, expect, it } from 'vitest'
import { koToEn } from './koToEn'

describe('koToEn', () => {
  it('converts complete syllables', () => {
    expect(koToEn('안녕')).toBe('dkssud')
    expect(koToEn('한글')).toBe('gksrmf')
    expect(koToEn('월요일')).toBe('dnjfdydlf')
  })

  it('converts compound trailing consonants (겹받침)', () => {
    expect(koToEn('값')).toBe('rkqt')
    expect(koToEn('않다')).toBe('dksgek')
    expect(koToEn('닭')).toBe('ekfr')
    expect(koToEn('없어')).toBe('djqtdj')
  })

  it('converts compound vowels (겹모음)', () => {
    expect(koToEn('와')).toBe('dhk')
    expect(koToEn('의사')).toBe('dmltk')
    expect(koToEn('원')).toBe('dnjs')
  })

  it('maps shifted jamo to uppercase keys', () => {
    expect(koToEn('뛰다')).toBe('Enlek')
    expect(koToEn('쓰다')).toBe('Tmek')
    expect(koToEn('있어')).toBe('dlTdj')
    expect(koToEn('얘기')).toBe('dOrl')
  })

  it('converts standalone jamo', () => {
    expect(koToEn('ㄱ')).toBe('r')
    expect(koToEn('ㄲ')).toBe('R')
    expect(koToEn('ㅘ')).toBe('hk')
    expect(koToEn('ㄳ')).toBe('rt')
    expect(koToEn('ㅢ')).toBe('ml')
  })

  it('passes through unmapped characters', () => {
    expect(koToEn('abc XYZ 123!')).toBe('abc XYZ 123!')
    expect(koToEn('')).toBe('')
  })

  it('handles mixed jamo + digits (scanner wedge input)', () => {
    // EDS barcode scanned with Korean IME on: 'DSATY2068601' arrives broken
    expect(koToEn('ㅇㄴㅁ쇼2068601').toUpperCase()).toBe('DSATY2068601')
  })
})
