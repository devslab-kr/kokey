import { describe, expect, it } from 'vitest'
import { fromEn, register, toEn } from '../registry'
import { enToRu, ru, ruToEn } from './ru'
import { enToUk, uk, ukToEn } from './uk'
import { enToHe, he, heToEn } from './he'
import { el, elToEn, enToEl } from './el'
import { enToTh, th, thToEn } from './th'
import { ar, arToEn, enToAr } from './ar'
import { enToKa, ka, kaToEn } from './ka'

register(ru, uk, he, el, th, ar, ka)

describe('ru — ЙЦУКЕН', () => {
  it('converts the classic ghbdtn', () => {
    expect(ruToEn('привет')).toBe('ghbdtn')
    expect(enToRu('ghbdtn')).toBe('привет')
  })

  it('honors shift', () => {
    expect(enToRu('Ghbdtn')).toBe('Привет')
    expect(ruToEn('Москва')).toBe('Vjcrdf')
  })

  it('maps the moved punctuation faithfully', () => {
    expect(enToRu('`')).toBe('ё')
    expect(enToRu('/')).toBe('.')
    expect(enToRu('?')).toBe(',')
    expect(enToRu('#')).toBe('№')
  })

  it('round-trips Russian text', () => {
    for (const s of ['съешь ещё этих мягких французских булок', 'Ёлка, №5']) {
      expect(enToRu(ruToEn(s))).toBe(s)
    }
  })
})

describe('uk — Ukrainian Enhanced', () => {
  it('converts привіт (і distinguishes uk from ru)', () => {
    expect(ukToEn('привіт')).toBe('ghbdsn')
    expect(enToUk('ghbdsn')).toBe('привіт')
  })

  it('maps the Ukrainian-specific letters', () => {
    expect(enToUk("']s")).toBe('єїі')
    expect(enToUk('`')).toBe("'")
  })

  it('maps AltGr-only ґ in the reverse direction', () => {
    expect(ukToEn('ґанок')).toBe('ufyjr')
  })

  it('round-trips Ukrainian text', () => {
    const s = 'Щастя — це коли тебе розуміють'
    expect(enToUk(ukToEn(s))).toBe(s)
  })
})

describe('he — Hebrew standard', () => {
  it('converts שלום', () => {
    expect(heToEn('שלום')).toBe('akuo')
    expect(enToHe('akuo')).toBe('שלום')
  })

  it('maps final forms and moved punctuation', () => {
    expect(enToHe('l;')).toBe('ךף')
    expect(enToHe(',./')).toBe('תץ.')
  })

  it('is caps-lock safe', () => {
    expect(enToHe('AKUO')).toBe('שלום')
  })

  it('round-trips Hebrew text', () => {
    const s = 'עברית קשה שפה'
    expect(enToHe(heToEn(s))).toBe(s)
  })
})

describe('el — Greek', () => {
  it('converts καλημέρα with the tonos dead key', () => {
    expect(elToEn('καλημέρα')).toBe('kalhm;era')
    expect(enToEl('kalhm;era')).toBe('καλημέρα')
  })

  it('handles final sigma and the q → ; key', () => {
    expect(elToEn('ές')).toBe(';ew')
    expect(enToEl('q')).toBe(';')
    expect(elToEn(';')).toBe('q')
  })

  it('handles dialytika', () => {
    expect(enToEl(':i')).toBe('ϊ')
    expect(elToEn('ϋ')).toBe(':u')
  })

  it('round-trips Greek text', () => {
    for (const s of ['ξεσκεπάζω την ψυχοφθόρα βδελυγμία', 'Ώρα, ΐ']) {
      expect(enToEl(elToEn(s))).toBe(s)
    }
  })
})

describe('th — Kedmanee', () => {
  it('converts สวัสดี (home row is ฟหกด)', () => {
    expect(thToEn('สวัสดี')).toBe('l;ylfu')
    expect(enToTh('l;ylfu')).toBe('สวัสดี')
    expect(enToTh('asdf')).toBe('ฟหกด')
  })

  it('rescues digits typed while the Thai layout was on', () => {
    expect(thToEn('ค้าขาย2068601')).toBe('8hk-kp2068601')
    expect(enToTh('12345')).toBe('ๅ/-ภถ')
  })

  it('round-trips Thai text', () => {
    const s = 'ภาษาไทยนั้นง่ายนิดเดียว'
    expect(enToTh(thToEn(s))).toBe(s)
  })
})

describe('ar — Arabic (101)', () => {
  it('converts مرحبا', () => {
    expect(arToEn('مرحبا')).toBe('lvpfh')
    expect(enToAr('lvpfh')).toBe('مرحبا')
  })

  it('treats lam-alef as the b key', () => {
    expect(enToAr('b')).toBe('لا')
    expect(arToEn('لا')).toBe('b')
    expect(arToEn('السلام')).toBe('hgsbl')
    expect(enToAr('hgsbl')).toBe('السلام')
  })

  it('maps ذ on backtick and Arabic punctuation back to Latin', () => {
    expect(enToAr('`')).toBe('ذ')
    expect(arToEn('؟')).toBe('?')
  })

  it('round-trips Arabic text', () => {
    const s = 'أهلاً وسهلاً'
    expect(enToAr(arToEn(s))).toBe(s)
  })
})

describe('ka — Georgian QWERTY', () => {
  it('is near-phonetic', () => {
    expect(kaToEn('გამარჯობა')).toBe('gamarjoba')
    expect(enToKa('gamarjoba')).toBe('გამარჯობა')
  })

  it('maps the shift-layer letters', () => {
    expect(enToKa('Tbilisi')).toBe('თბილისი')
    expect(kaToEn('ჭაჭა')).toBe('WaWa')
  })

  it('round-trips Georgian text', () => {
    const s = 'შენ ხარ ვენახი'
    expect(enToKa(kaToEn(s))).toBe(s)
  })
})

describe('registry — toEn / fromEn', () => {
  it('auto-detects the script per run, mixed strings included', () => {
    expect(toEn('привет')).toBe('ghbdtn')
    expect(toEn('안녕 привет שלום')).toBe('dkssud ghbdtn akuo')
  })

  it('disambiguates layouts sharing a script by coverage', () => {
    expect(toEn('привіт')).toBe('ghbdsn') // uk beats ru because of і
    expect(toEn('привет')).toBe('ghbdtn') // pure-ru text still converts as ru
  })

  it('leaves Latin, digits and punctuation untouched', () => {
    expect(toEn('hello, 123!')).toBe('hello, 123!')
  })

  it('fromEn dispatches by layout id and throws on unknown ids', () => {
    expect(fromEn('dkssud', 'ko')).toBe('안녕')
    expect(fromEn('ghbdtn', 'ru')).toBe('привет')
    expect(() => fromEn('x', 'nope')).toThrow(/unknown layout/)
  })
})
