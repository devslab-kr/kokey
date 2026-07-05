// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { bind, observe } from './dom'
import { register } from './registry'
import { ru } from './layouts/ru'

function makeInput(mode: string): HTMLInputElement {
  const el = document.createElement('input')
  el.setAttribute('data-hangul', mode)
  document.body.appendChild(el)
  return el
}

function type(el: HTMLInputElement, char: string): void {
  el.value += char
  el.setSelectionRange(el.value.length, el.value.length)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('bind — en mode', () => {
  it('restores Hangul wedge-scanner input to QWERTY', () => {
    const el = makeInput('en')
    bind(el)
    el.value = 'ㅇㄴㅁ쇼2068601'
    el.setSelectionRange(el.value.length, el.value.length)
    el.dispatchEvent(new Event('input'))
    expect(el.value).toBe('dsaty2068601')
  })

  it('leaves plain ASCII untouched', () => {
    const el = makeInput('en')
    bind(el)
    type(el, 'a')
    expect(el.value).toBe('a')
  })
})

describe('bind — ko mode', () => {
  it('composes progressively like an IME', () => {
    const el = makeInput('ko')
    bind(el)
    const steps: Array<[string, string]> = [
      ['d', 'ㅇ'],
      ['k', '아'],
      ['s', '안'],
      ['s', '안ㄴ'],
      ['u', '안녀'],
      ['d', '안녕']
    ]
    for (const [key, expected] of steps) {
      type(el, key)
      expect(el.value).toBe(expected)
    }
  })

  it('keeps the caret at the converted position', () => {
    const el = makeInput('ko')
    bind(el)
    type(el, 'd')
    type(el, 'k')
    expect(el.selectionStart).toBe(1)
  })
})

describe('bind — composition safety', () => {
  it('does not convert while the IME is composing', () => {
    const el = makeInput('en')
    bind(el)
    el.dispatchEvent(new CompositionEvent('compositionstart'))
    el.value = '안'
    el.dispatchEvent(new Event('input'))
    expect(el.value).toBe('안')
    el.dispatchEvent(new CompositionEvent('compositionend'))
    expect(el.value).toBe('dks')
  })
})

describe('bind — lifecycle', () => {
  it('is idempotent and unbind stops converting', () => {
    const el = makeInput('en')
    const unbind = bind(el)
    expect(bind(el)).toBe(unbind)
    unbind()
    el.value = '안'
    el.dispatchEvent(new Event('input'))
    expect(el.value).toBe('안')
  })

  it('reads mode from the attribute at event time', () => {
    const el = makeInput('en')
    bind(el)
    el.removeAttribute('data-hangul')
    el.value = '안'
    el.dispatchEvent(new Event('input'))
    expect(el.value).toBe('안')
  })
})

describe('bind — data-kokey layouts', () => {
  it('enforces a registered non-Korean layout', () => {
    register(ru)
    const el = document.createElement('input')
    el.setAttribute('data-kokey', 'ru')
    document.body.appendChild(el)
    bind(el)
    for (const key of 'ghbdtn') type(el, key)
    expect(el.value).toBe('привет')
  })

  it('en mode restores any registered script', () => {
    register(ru)
    const el = document.createElement('input')
    el.setAttribute('data-kokey', 'en')
    document.body.appendChild(el)
    bind(el)
    el.value = 'привет안녕'
    el.setSelectionRange(el.value.length, el.value.length)
    el.dispatchEvent(new Event('input'))
    expect(el.value).toBe('ghbdtndkssud')
  })

  it('ignores unregistered layout ids', () => {
    const el = document.createElement('input')
    el.setAttribute('data-kokey', 'zz')
    document.body.appendChild(el)
    bind(el)
    type(el, 'a')
    expect(el.value).toBe('a')
  })
})

describe('observe', () => {
  it('binds existing and later-added inputs', async () => {
    const first = makeInput('ko')
    const stop = observe(document)
    type(first, 'd')
    expect(first.value).toBe('ㅇ')

    const later = document.createElement('input')
    later.setAttribute('data-hangul', 'en')
    document.body.appendChild(later)
    await new Promise((r) => setTimeout(r, 0))
    later.value = '안'
    later.dispatchEvent(new Event('input'))
    expect(later.value).toBe('dks')
    stop()
  })

  it('binds when the attribute is added later', async () => {
    const el = document.createElement('input')
    document.body.appendChild(el)
    const stop = observe(document)
    el.setAttribute('data-hangul', 'ko')
    await new Promise((r) => setTimeout(r, 0))
    type(el, 'd')
    expect(el.value).toBe('ㅇ')
    stop()
  })
})
