import { defineLayout } from '../layout'

/**
 * Russian ЙЦУКЕН (Windows "Russian", KBDRU).
 *
 * Beyond the letters, the layout moves punctuation: `.` lives on the `/` key
 * (comma on its shift), ё on backtick, and the shifted digit row differs
 * (№ on 3, etc.). Those keys are mapped faithfully, so `ruToEn('привет, мир')`
 * returns exactly the keystrokes that produced it.
 */
export const ru = defineLayout({
  id: 'ru',
  script: [[0x0400, 0x04ff]],
  fromKey: {
    // letter rows
    q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш',
    o: 'щ', p: 'з', '[': 'х', ']': 'ъ',
    a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л',
    l: 'д', ';': 'ж', "'": 'э',
    z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь',
    ',': 'б', '.': 'ю', '/': '.',
    // shifted letter rows
    Q: 'Й', W: 'Ц', E: 'У', R: 'К', T: 'Е', Y: 'Н', U: 'Г', I: 'Ш',
    O: 'Щ', P: 'З', '{': 'Х', '}': 'Ъ',
    A: 'Ф', S: 'Ы', D: 'В', F: 'А', G: 'П', H: 'Р', J: 'О', K: 'Л',
    L: 'Д', ':': 'Ж', '"': 'Э',
    Z: 'Я', X: 'Ч', C: 'С', V: 'М', B: 'И', N: 'Т', M: 'Ь',
    '<': 'Б', '>': 'Ю', '?': ',',
    // backtick and the shifted digit row where it differs from US
    '`': 'ё', '~': 'Ё',
    '@': '"', '#': '№', $: ';', '^': ':', '&': '?'
  }
})

/** Russian text → the QWERTY keystrokes that produced it. */
export const ruToEn = (text: string): string => ru.toLatin(text)
/** QWERTY keystrokes → the Russian text a ЙЦУКЕН layout produces. */
export const enToRu = (text: string): string => ru.fromLatin(text)
