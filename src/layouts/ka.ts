import { defineLayout } from '../layout'

/**
 * Georgian QWERTY (Windows "Georgian (QWERTY)", KBDGEOQW).
 *
 * Near-phonetic: most keys type the matching mkhedruli letter
 * (გამარჯობა ↔ gamarjoba). Seven letters live on the shift layer
 * (თ შ ღ ჭ ჟ ძ ჩ); the remaining shifted keys repeat the base letter.
 */
export const ka = defineLayout({
  id: 'ka',
  script: [[0x10a0, 0x10ff]],
  fromKey: {
    a: 'ა', b: 'ბ', c: 'ც', d: 'დ', e: 'ე', f: 'ფ', g: 'გ', h: 'ჰ',
    i: 'ი', j: 'ჯ', k: 'კ', l: 'ლ', m: 'მ', n: 'ნ', o: 'ო', p: 'პ',
    q: 'ქ', r: 'რ', s: 'ს', t: 'ტ', u: 'უ', v: 'ვ', w: 'წ', x: 'ხ',
    y: 'ყ', z: 'ზ',
    // distinct shift-layer letters
    W: 'ჭ', R: 'ღ', T: 'თ', S: 'შ', J: 'ჟ', Z: 'ძ', C: 'ჩ',
    // the rest of the shift layer repeats the base letter
    A: 'ა', B: 'ბ', D: 'დ', E: 'ე', F: 'ფ', G: 'გ', H: 'ჰ', I: 'ი',
    K: 'კ', L: 'ლ', M: 'მ', N: 'ნ', O: 'ო', P: 'პ', Q: 'ქ', U: 'უ',
    V: 'ვ', X: 'ხ', Y: 'ყ'
  }
})

/** Georgian text → the QWERTY keystrokes that produced it. */
export const kaToEn = (text: string): string => ka.toLatin(text)
/** QWERTY keystrokes → the Georgian text the layout produces. */
export const enToKa = (text: string): string => ka.fromLatin(text)
