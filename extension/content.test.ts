// @vitest-environment jsdom
// Integration test for the REAL shipped extension scripts: the content-
// script world is simulated by stubbing the `kokey` global (with the same
// module the CDN bundle wraps) and `chrome.runtime.onMessage`.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

type FixMessage = { type: string }
let handler: (msg: FixMessage) => void
const writeText = vi.fn<(t: string) => Promise<void>>(() => Promise.resolve())

beforeAll(async () => {
  ;(globalThis as Record<string, unknown>).kokey = await import('../src/browser')
  ;(globalThis as Record<string, unknown>).chrome = {
    runtime: {
      onMessage: {
        addListener: (fn: (msg: FixMessage) => void) => {
          handler = fn
        }
      }
    }
  }
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText },
    configurable: true
  })
  // @ts-expect-error side-effect script, no declarations
  await import('./convert.js')
  // @ts-expect-error side-effect script, no declarations
  await import('./content.js')
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
