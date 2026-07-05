import { defineLayout } from '../layout'

/**
 * Hebrew standard layout (Windows "Hebrew", KBDHEB).
 *
 * No letter case — uppercase keys fall back to the same letter (caps-lock
 * safety, mirroring the Korean tables). Punctuation moves: `,` types ת,
 * `.` types ץ, `.` itself lives on `/`, the comma on the apostrophe key, and
 * the brackets swap (RTL).
 */
export const he = defineLayout({
  id: 'he',
  script: [[0x0590, 0x05ff]],
  fromKey: {
    q: '/', w: "'", e: 'ק', r: 'ר', t: 'א', y: 'ט', u: 'ו', i: 'ן',
    o: 'ם', p: 'פ', '[': ']', ']': '[',
    a: 'ש', s: 'ד', d: 'ג', f: 'כ', g: 'ע', h: 'י', j: 'ח', k: 'ל',
    l: 'ך', ';': 'ף', "'": ',',
    z: 'ז', x: 'ס', c: 'ב', v: 'ה', b: 'נ', n: 'מ', m: 'צ',
    ',': 'ת', '.': 'ץ', '/': '.',
    // caps-lock fallbacks (Hebrew has no shifted letter layer)
    Q: '/', W: "'", E: 'ק', R: 'ר', T: 'א', Y: 'ט', U: 'ו', I: 'ן',
    O: 'ם', P: 'פ',
    A: 'ש', S: 'ד', D: 'ג', F: 'כ', G: 'ע', H: 'י', J: 'ח', K: 'ל',
    L: 'ך',
    Z: 'ז', X: 'ס', C: 'ב', V: 'ה', B: 'נ', N: 'מ', M: 'צ'
  }
})

/** Hebrew text → the QWERTY keystrokes that produced it. */
export const heToEn = (text: string): string => he.toLatin(text)
/** QWERTY keystrokes → the Hebrew text the layout produces. */
export const enToHe = (text: string): string => he.fromLatin(text)
