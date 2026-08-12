// @vitest-environment jsdom
// Integration test for the REAL shipped extension scripts: the content-
// script world is simulated by stubbing the `kokey` global (with the same
// module the CDN bundle wraps) and `chrome.runtime.onMessage`.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

type FixMessage = { type: string }
let handler: (msg: FixMessage) => void
const writeText = vi.fn<(t: string) => Promise<void>>(() => Promise.resolve())

const store: Record<string, unknown> = {}
let onChanged: (() => void) | null = null

beforeAll(async () => {
  ;(globalThis as Record<string, unknown>).kokey = await import('../src/browser')
  ;(globalThis as Record<string, unknown>).chrome = {
    runtime: {
      onMessage: {
        addListener: (fn: (msg: FixMessage) => void) => {
          handler = fn
        }
      }
    },
    storage: {
      sync: {
        get: (defaults: Record<string, unknown>) =>
          Promise.resolve({ ...defaults, ...store }),
        set: (patch: Record<string, unknown>) => {
          Object.assign(store, patch)
          onChanged?.()
          return Promise.resolve()
        }
      },
      onChanged: {
        addListener: (fn: () => void) => {
          onChanged = fn
        }
      }
    }
  }
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText },
    configurable: true
  })
  // @ts-expect-error side-effect script, no declarations
  await import('./settings.js')
  // @ts-expect-error side-effect script, no declarations
  await import('./convert.js')
  // @ts-expect-error side-effect script, no declarations
  await import('./content.js')
  // @ts-expect-error side-effect script, no declarations
  await import('./theme.js')
  // @ts-expect-error side-effect script, no declarations
  await import('./suggest.js')
})

afterEach(() => {
  document.body.innerHTML = ''
  writeText.mockClear()
})

function makeInput(value = ''): HTMLInputElement {
  const el = document.createElement('input')
  el.value = value
  document.body.appendChild(el)
  el.focus()
  return el
}

describe('kokeyExt.decide', () => {
  const decide = () =>
    (globalThis as unknown as { kokeyExt: { decide: (t: string) => string | null } })
      .kokeyExt.decide

  it('explicit action converts without the paste-heuristic gate', () => {
    expect(decide()('dkssud')).toBe('안녕') // bare 안녕 — fixMistyped rejects, enToKo fallback fires
    expect(decide()('привет')).toBe('ghbdtn')
    expect(decide()('ㅗ디ㅣㅐ')).toBe('hello')
    expect(decide()('dkssudgktpdy')).toBe('안녕하세요')
  })

  it('returns null when nothing would change', () => {
    expect(decide()('')).toBeNull()
    expect(decide()('123 !?')).toBeNull()
  })
})

describe('content script message handling', () => {
  it('fixes the whole focused input and fires input', () => {
    const el = makeInput('dkssudgktpdy')
    let inputs = 0
    el.addEventListener('input', () => {
      inputs += 1
    })
    handler({ type: 'kokey-fix' })
    expect(el.value).toBe('안녕하세요')
    expect(el.selectionStart).toBe('안녕하세요'.length)
    expect(inputs).toBe(1)
  })

  it('fixes only the selected range', () => {
    const el = makeInput('hello привет')
    el.setSelectionRange(6, 12) // привет
    handler({ type: 'kokey-fix' })
    expect(el.value).toBe('hello ghbdtn')
  })

  it('shows the nothing-to-convert toast without touching the value', () => {
    const el = makeInput('123')
    handler({ type: 'kokey-fix' })
    expect(el.value).toBe('123')
    const toast = document.querySelector('[role="status"]')
    expect(toast?.textContent).toContain('kokey')
  })

  it('copies the conversion for a non-editable selection', () => {
    const div = document.createElement('div')
    div.textContent = 'привет'
    document.body.appendChild(div)
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    const range = document.createRange()
    range.selectNodeContents(div)
    const sel = document.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    handler({ type: 'kokey-fix' })
    expect(writeText).toHaveBeenCalledWith('ghbdtn')
  })

  it('ignores unrelated messages', () => {
    const el = makeInput('dkssud')
    handler({ type: 'other' })
    expect(el.value).toBe('dkssud')
  })
})

type Suggest = {
  setEnabled: (on: boolean) => void
  setTheme: (mode: string) => void
  _evaluate: (el: Element | null) => void
  _button: () => HTMLButtonElement | null
}
const suggest = () => (globalThis as unknown as { kokeySuggest: Suggest }).kokeySuggest

describe('kokeyExt.suggestFix — what may be offered unasked', () => {
  const fn = () =>
    (globalThis as unknown as { kokeyExt: { suggestFix: (t: string) => string | null } })
      .kokeyExt.suggestFix

  it('offers only the conservative heuristic, never the Latin→Korean guess', () => {
    expect(fn()('dkssudgktpdy')).toBe('안녕하세요')
    expect(fn()('ㅗ디ㅣㅐ')).toBe('hello')
    // `decide` would compose these into Hangul; an uninvited button must not
    expect(fn()('dkssud')).toBeNull()
    expect(fn()('hello')).toBeNull()
    expect(fn()('')).toBeNull()
  })
})

describe('in-field suggest button', () => {
  function field(type = 'text', value = ''): HTMLInputElement {
    const el = document.createElement('input')
    el.type = type
    el.value = value
    document.body.appendChild(el)
    // jsdom does no layout, so every rect is zeros — which the "field went
    // away" guard in place() correctly reads as gone. Give it a real box.
    el.getBoundingClientRect = () =>
      ({ top: 10, left: 10, right: 210, bottom: 34, width: 200, height: 24,
         x: 10, y: 10, toJSON: () => ({}) }) as DOMRect
    return el
  }

  it('appears for a mistyped value and converts on click', () => {
    const el = field('text', 'dkssudgktpdy')
    suggest()._evaluate(el)
    const btn = suggest()._button()!
    expect(btn.style.display).toBe('block')

    let inputs = 0
    el.addEventListener('input', () => {
      inputs += 1
    })
    btn.click()
    expect(el.value).toBe('안녕하세요')
    expect(inputs).toBe(1)
    expect(btn.style.display).toBe('none') // hides after applying
  })

  it('stays hidden for text that looks fine', () => {
    const el = field('text', 'hello there')
    suggest()._evaluate(el)
    expect(suggest()._button()!.style.display).toBe('none')
  })

  it('never attaches to a password field', () => {
    const el = field('password', 'dkssudgktpdy')
    suggest()._evaluate(el)
    expect(suggest()._button()!.style.display).toBe('none')
  })

  it('does not steal focus from the field', () => {
    const el = field('text', 'dkssudgktpdy')
    el.focus()
    suggest()._evaluate(el)
    const btn = suggest()._button()!
    const e = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    btn.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
  })

  it('can be switched off, and switching off hides a shown button', () => {
    const el = field('text', 'dkssudgktpdy')
    suggest()._evaluate(el)
    expect(suggest()._button()!.style.display).toBe('block')

    suggest().setEnabled(false)
    expect(suggest()._button()!.style.display).toBe('none')
    suggest()._evaluate(el)
    expect(suggest()._button()!.style.display).toBe('none')

    suggest().setEnabled(true)
  })
})

describe('options page', () => {
  it('guards [hidden] on the shortcut rows', async () => {
    // .shortcut sets display:flex, which beats the UA [hidden] rule — without
    // an explicit guard BOTH the editor and the deep-link button render and
    // the Firefox/Chrome split silently stops working. Caught in a rendered
    // screenshot, pinned here.
    // @ts-expect-error @types/node isn't a devDependency here; this test
    // body runs in node under vitest, where the module resolves fine
    const fs = await import('node:fs/promises')
    const html: string = await fs.readFile('extension/options.html', 'utf8')
    expect(html).toMatch(/\.shortcut\[hidden\]\s*\{\s*display:\s*none/)
  })
})

describe('extension scripts use the promise-based API namespace', () => {
  it('never calls chrome.* directly outside comments', async () => {
    // Firefox's `chrome` alias is callback-style, so `await chrome.storage
    // .sync.get(...)` resolves to undefined there and every setting silently
    // reads as its default. Each script must go through
    // `globalThis.browser ?? globalThis.chrome`.
    // @ts-expect-error @types/node isn't a devDependency here
    const fs = await import('node:fs/promises')
    const files = [
      'background.js',
      'settings.js',
      'content.js',
      'options.js',
      'suggest.js'
    ]
    for (const f of files) {
      const src: string = await fs.readFile(`extension/${f}`, 'utf8')
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .replace(/(^|[^:])\/\/.*$/gm, '$1') // line comments
      // `globalThis.chrome` in the alias itself has no trailing `.member`,
      // so it is not matched and needs no special case
      const offenders = [...code.matchAll(/\bchrome\.\w+/g)].map((m) => m[0])
      expect(
        offenders,
        `${f} should use the api alias, not ${offenders.join(', ')}`
      ).toEqual([])
    }
  })
})

type Theme = {
  paletteFor: (el: Element, mode: string) => { bg: string; fg: string }
  luminance: (rgb: number[]) => number
  contrast: (a: number, b: number) => number
  surfaceColor: (el: Element) => number[]
  ON_LIGHT: { bg: string }
  ON_DARK: { bg: string }
}
const theme = () => (globalThis as unknown as { kokeyTheme: Theme }).kokeyTheme

describe('button theming', () => {
  it('computes WCAG luminance and contrast', () => {
    expect(theme().luminance([255, 255, 255])).toBeCloseTo(1, 3)
    expect(theme().luminance([0, 0, 0])).toBeCloseTo(0, 3)
    // black on white is the maximum 21:1
    expect(
      theme().contrast(theme().luminance([0, 0, 0]), theme().luminance([255, 255, 255]))
    ).toBeCloseTo(21, 0)
  })

  it('resolves the surface through transparent ancestors', () => {
    // an input carries an opaque UA background by default, which is why the
    // walk normally stops at the field itself — the surface the button sits
    // on. Sites that clear it are the case this walk exists for.
    const outer = document.createElement('div')
    outer.style.backgroundColor = 'rgb(17, 17, 17)'
    const inner = document.createElement('div') // transparent
    const input = document.createElement('input')
    input.style.backgroundColor = 'transparent'
    outer.appendChild(inner)
    inner.appendChild(input)
    document.body.appendChild(outer)
    expect(theme().surfaceColor(input).slice(0, 3)).toEqual([17, 17, 17])
  })

  it('reads the field\'s own background when it has one', () => {
    const outer = document.createElement('div')
    outer.style.backgroundColor = 'rgb(17, 17, 17)'
    const input = document.createElement('input')
    input.style.backgroundColor = 'rgb(255, 255, 255)'
    outer.appendChild(input)
    document.body.appendChild(outer)
    // a white field on a dark page still gets the light-surface palette
    expect(theme().paletteFor(input, 'auto').bg).toBe(theme().ON_LIGHT.bg)
  })

  it('picks the dark-surface palette on a dark field and vice versa', () => {
    const dark = document.createElement('input')
    dark.style.backgroundColor = 'rgb(20, 20, 24)'
    const light = document.createElement('input')
    light.style.backgroundColor = 'rgb(255, 255, 255)'
    document.body.append(dark, light)

    expect(theme().paletteFor(dark, 'auto').bg).toBe(theme().ON_DARK.bg)
    expect(theme().paletteFor(light, 'auto').bg).toBe(theme().ON_LIGHT.bg)
  })

  it('honours a pinned mode over the measurement', () => {
    const dark = document.createElement('input')
    dark.style.backgroundColor = 'rgb(20, 20, 24)'
    document.body.appendChild(dark)
    expect(theme().paletteFor(dark, 'light').bg).toBe(theme().ON_LIGHT.bg)
  })

  it('themes the button when it is shown', () => {
    const el = document.createElement('input')
    el.type = 'text'
    el.value = 'dkssudgktpdy'
    el.style.backgroundColor = 'rgb(18, 18, 18)'
    document.body.appendChild(el)
    el.getBoundingClientRect = () =>
      ({ top: 10, left: 10, right: 210, bottom: 34, width: 200, height: 24,
         x: 10, y: 10, toJSON: () => ({}) }) as DOMRect

    suggest().setTheme('auto')
    suggest()._evaluate(el)
    const btn = suggest()._button()!
    expect(btn.style.display).toBe('block')
    // jsdom normalises hex to rgb()
    expect(btn.style.background).toContain('94, 234, 212') // #5eead4
  })
})
