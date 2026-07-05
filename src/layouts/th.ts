import { defineLayout } from '../layout'

/**
 * Thai Kedmanee (Windows "Thai Kedmanee", KBDTH0).
 *
 * The whole alphanumeric block is remapped — including the digit row
 * (`8` types ค; Thai digits ๑๒๓… sit on the shifted digit row), so the
 * wedge-scanner rescue works for Thai barcodes too. The home row spells the
 * iconic ฟหกด, Kedmanee's "asdf".
 */
export const th = defineLayout({
  id: 'th',
  script: [[0x0e00, 0x0e7f]],
  fromKey: {
    // digit row
    '`': '_', '1': 'ๅ', '2': '/', '3': '-', '4': 'ภ', '5': 'ถ', '6': 'ุ',
    '7': 'ึ', '8': 'ค', '9': 'ต', '0': 'จ', '-': 'ข', '=': 'ช',
    '~': '%', '!': '+', '@': '๑', '#': '๒', $: '๓', '%': '๔', '^': 'ู',
    '&': '฿', '*': '๕', '(': '๖', ')': '๗', _: '๘', '+': '๙',
    // top row
    q: 'ๆ', w: 'ไ', e: 'ำ', r: 'พ', t: 'ะ', y: 'ั', u: 'ี', i: 'ร',
    o: 'น', p: 'ย', '[': 'บ', ']': 'ล', '\\': 'ฃ',
    Q: '๐', W: '"', E: 'ฎ', R: 'ฑ', T: 'ธ', Y: 'ํ', U: '๊', I: 'ณ',
    O: 'ฯ', P: 'ญ', '{': 'ฐ', '}': ',', '|': 'ฅ',
    // home row — ฟหกด
    a: 'ฟ', s: 'ห', d: 'ก', f: 'ด', g: 'เ', h: '้', j: '่', k: 'า',
    l: 'ส', ';': 'ว', "'": 'ง',
    A: 'ฤ', S: 'ฆ', D: 'ฏ', F: 'โ', G: 'ฌ', H: '็', J: '๋', K: 'ษ',
    L: 'ศ', ':': 'ซ', '"': '.',
    // bottom row
    z: 'ผ', x: 'ป', c: 'แ', v: 'อ', b: 'ิ', n: 'ื', m: 'ท',
    ',': 'ม', '.': 'ใ', '/': 'ฝ',
    Z: '(', X: ')', C: 'ฉ', V: 'ฮ', B: 'ฺ', N: '์', M: '?',
    '<': 'ฒ', '>': 'ฬ', '?': 'ฦ'
  }
})

/** Thai text → the QWERTY keystrokes that produced it. */
export const thToEn = (text: string): string => th.toLatin(text)
/** QWERTY keystrokes → the Thai text a Kedmanee layout produces. */
export const enToTh = (text: string): string => th.fromLatin(text)
