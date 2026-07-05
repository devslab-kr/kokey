// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createRefBinder } from './dom'
import { vHangul } from './vue'

function makeInput(): HTMLInputElement {
  const el = document.createElement('input')
  document.body.appendChild(el)
  return el
}

function feed(el: HTMLInputElement, value: string): void {
  el.value = value
  el.setSelectionRange(value.length, value.length)
  el.dispatchEvent(new Event('input'))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createRefBinder (React useHangul core)', () => {
  it('binds on element, unbinds on null', () => {
    const ref = createRefBinder('en')
    const el = makeInput()
    ref(el)
    feed(el, '안')
    expect(el.value).toBe('dks')

    ref(null)
    feed(el, '안')
    expect(el.value).toBe('안')
  })

  it('moves the binding when the element changes', () => {
    const ref = createRefBinder('ko')
    const first = makeInput()
    const second = makeInput()
    ref(first)
    ref(second)

    feed(first, 'd')
    expect(first.value).toBe('d') // old element released
    feed(second, 'd')
    expect(second.value).toBe('ㅇ')
  })
})

describe('vHangul (Vue directive)', () => {
  type Hooks = {
    mounted: (el: HTMLInputElement, b: Record<string, unknown>) => void
    updated: (el: HTMLInputElement, b: Record<string, unknown>) => void
    unmounted: (el: HTMLInputElement) => void
  }
  const dir = vHangul as unknown as Hooks

  it('mounted binds with the directive value', () => {
    const el = makeInput()
    dir.mounted(el, { value: 'en' })
    feed(el, '안')
    expect(el.value).toBe('dks')
    dir.unmounted(el)
  })

  it('mounted without value falls back to data-hangul attribute', () => {
    const el = makeInput()
    el.setAttribute('data-hangul', 'ko')
    dir.mounted(el, { value: undefined })
    feed(el, 'd')
    expect(el.value).toBe('ㅇ')
    dir.unmounted(el)
  })

  it('updated rebinds when the mode changes', () => {
    const el = makeInput()
    dir.mounted(el, { value: 'en' })
    dir.updated(el, { value: 'ko', oldValue: 'en' })
    feed(el, 'd')
    expect(el.value).toBe('ㅇ')
    dir.unmounted(el)
  })

  it('unmounted stops converting', () => {
    const el = makeInput()
    dir.mounted(el, { value: 'en' })
    dir.unmounted(el)
    feed(el, '안')
    expect(el.value).toBe('안')
  })
})
