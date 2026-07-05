import { defineLayout } from '../layout'

/**
 * Arabic (Windows "Arabic (101)", KBDA1).
 *
 * ذ sits on backtick (shadda on its shift), the `b` key types the lam-alef
 * sequence لا (two code points — multi-character values are supported), and
 * the shift layer carries hamza forms and tashkeel. Arabic punctuation
 * (؛ ، ؟) is mapped back to its Latin counterpart in the reverse direction.
 */
export const ar = defineLayout({
  id: 'ar',
  script: [[0x0600, 0x06ff]],
  fromKey: {
    '`': 'ذ', '~': 'ّ',
    q: 'ض', w: 'ص', e: 'ث', r: 'ق', t: 'ف', y: 'غ', u: 'ع', i: 'ه',
    o: 'خ', p: 'ح', '[': 'ج', ']': 'د',
    a: 'ش', s: 'س', d: 'ي', f: 'ب', g: 'ل', h: 'ا', j: 'ت', k: 'ن',
    l: 'م', ';': 'ك', "'": 'ط',
    z: 'ئ', x: 'ء', c: 'ؤ', v: 'ر', b: 'لا', n: 'ى', m: 'ة',
    ',': 'و', '.': 'ز', '/': 'ظ',
    // shift layer — tashkeel and hamza forms
    Q: 'َ', W: 'ً', E: 'ُ', R: 'ٌ', A: 'ِ', S: 'ٍ', X: 'ْ',
    T: 'لإ', Y: 'إ', U: "'", G: 'لأ', H: 'أ', J: 'ـ', B: 'لآ', N: 'آ',
    I: '÷', O: '×'
  },
  toKeyOverrides: { '؛': ';', '،': ',', '؟': '?' }
})

/** Arabic text → the QWERTY keystrokes that produced it. */
export const arToEn = (text: string): string => ar.toLatin(text)
/** QWERTY keystrokes → the Arabic text the layout produces. */
export const enToAr = (text: string): string => ar.fromLatin(text)
