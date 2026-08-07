// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { fixMistyped, bindPaste } from './paste'
import { observe } from './dom'

function makeInput(): HTMLInputElement {
  const el = document.createElement('input')
  document.body.appendChild(el)
  return el
}

function paste(el: HTMLElement, text: string): Event {
  const e = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(e, 'clipboardData', {
    value: { getData: () => text }
  })
  el.dispatchEvent(e)
  return e
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('fixMistyped', () => {
  it('fixes Korean typed in English mode', () => {
    expect(fixMistyped('dkssudgktpdy')).toBe('안녕하세요')
    expect(fixMistyped('dkssud gktpdy')).toBe('안녕 하세요')
  })

  it('fixes English typed in Korean mode', () => {
    expect(fixMistyped('ㅗ디ㅣㅐ')).toBe('hello')
    expect(fixMistyped('ㅗㅐㅈ ㅁㄱㄷ ㅛㅐㅕ')).toBe('how are you')
  })

  it('leaves real English alone', () => {
    expect(fixMistyped('hello')).toBeNull()
    expect(fixMistyped('the quick brown fox')).toBeNull()
    // short words that happen to compose ("world" → 재깅) are rejected by
    // the ≥3-syllable single-token gate
    expect(fixMistyped('world')).toBeNull()
    expect(fixMistyped('sos')).toBeNull()
    expect(fixMistyped('dkssud')).toBeNull() // 안녕 — same gate, known miss
  })

  it('leaves real Korean alone, including jamo laughter', () => {
    expect(fixMistyped('안녕하세요')).toBeNull()
    expect(fixMistyped('ㅋㅋㅋ')).toBeNull()
    expect(fixMistyped('ㅠㅠ')).toBeNull()
    expect(fixMistyped('안녕 ㅎㅎ')).toBeNull()
  })

  it('ignores non-Korean scripts and non-letter text', () => {
    expect(fixMistyped('привет')).toBeNull()
    expect(fixMistyped('12345 !?')).toBeNull()
    expect(fixMistyped('')).toBeNull()
  })
})

describe('bindPaste', () => {
  it('replaces a gibberish paste and fires input', () => {
    const el = makeInput()
    bindPaste(el)
    let inputs = 0
    el.addEventListener('input', () => {
      inputs += 1
    })
    const e = paste(el, 'dkssudgktpdy')
    expect(e.defaultPrevented).toBe(true)
    expect(el.value).toBe('안녕하세요')
    expect(el.selectionStart).toBe('안녕하세요'.length)
    expect(inputs).toBe(1)
  })

  it('inserts at the caret, replacing the selection', () => {
    const el = makeInput()
    bindPaste(el)
    el.value = 'AB'
    el.setSelectionRange(1, 1)
    paste(el, 'ㅗ디ㅣㅐ')
    expect(el.value).toBe('AhelloB')
    expect(el.selectionStart).toBe(6)
  })

  it('lets clean pastes through untouched', () => {
    const el = makeInput()
    bindPaste(el)
    const e = paste(el, 'hello')
    expect(e.defaultPrevented).toBe(false)
  })

  it('can be vetoed via the cancelable kokey-paste event', () => {
    const el = makeInput()
    bindPaste(el)
    el.addEventListener('kokey-paste', (e) => {
      expect((e as CustomEvent).detail).toEqual({
        pasted: 'dkssudgktpdy',
        fixed: '안녕하세요'
      })
      e.preventDefault()
    })
    const e = paste(el, 'dkssudgktpdy')
    expect(e.defaultPrevented).toBe(false)
    expect(el.value).toBe('')
  })

  it('unbinds', () => {
    const el = makeInput()
    const unbind = bindPaste(el)
    unbind()
    const e = paste(el, 'dkssudgktpdy')
    expect(e.defaultPrevented).toBe(false)
  })
})

describe('observe with data-kokey-paste', () => {
  it('binds existing and later-added inputs', async () => {
    const el = makeInput()
    el.setAttribute('data-kokey-paste', '')
    const stop = observe()

    paste(el, 'dkssudgktpdy')
    expect(el.value).toBe('안녕하세요')

    const later = document.createElement('input')
    later.setAttribute('data-kokey-paste', '')
    document.body.appendChild(later)
    await Promise.resolve() // let the MutationObserver run
    await new Promise((r) => setTimeout(r, 0))
    paste(later, 'ㅗ디ㅣㅐ')
    expect(later.value).toBe('hello')
    stop()
  })
})
