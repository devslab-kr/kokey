import { defineLayout } from '../layout'

/**
 * Ukrainian (Windows "Ukrainian (Enhanced)", KBDUR1).
 *
 * The ЙЦУКЕН pattern with і/є/ї in place of Russian ы/э/ъ, the apostrophe on
 * backtick (₴ on its shift), and ґ only reachable via AltGr — so ґ has no
 * Latin keystroke of its own and is mapped back to `u` (its base key) in the
 * reverse direction only.
 */
export const uk = defineLayout({
  id: 'uk',
  script: [[0x0400, 0x04ff]],
  fromKey: {
    // letter rows
    q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш',
    o: 'щ', p: 'з', '[': 'х', ']': 'ї',
    a: 'ф', s: 'і', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л',
    l: 'д', ';': 'ж', "'": 'є',
    z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь',
    ',': 'б', '.': 'ю', '/': '.',
    // shifted letter rows
    Q: 'Й', W: 'Ц', E: 'У', R: 'К', T: 'Е', Y: 'Н', U: 'Г', I: 'Ш',
    O: 'Щ', P: 'З', '{': 'Х', '}': 'Ї',
    A: 'Ф', S: 'І', D: 'В', F: 'А', G: 'П', H: 'Р', J: 'О', K: 'Л',
    L: 'Д', ':': 'Ж', '"': 'Є',
    Z: 'Я', X: 'Ч', C: 'С', V: 'М', B: 'И', N: 'Т', M: 'Ь',
    '<': 'Б', '>': 'Ю', '?': ',',
    // backtick and the shifted digit row where it differs from US
    '`': "'", '~': '₴',
    '@': '"', '#': '№', $: ';', '^': ':', '&': '?'
  },
  toKeyOverrides: { ґ: 'u', Ґ: 'U' }
})

/** Ukrainian text → the QWERTY keystrokes that produced it. */
export const ukToEn = (text: string): string => uk.toLatin(text)
/** QWERTY keystrokes → the Ukrainian text the layout produces. */
export const enToUk = (text: string): string => uk.fromLatin(text)
