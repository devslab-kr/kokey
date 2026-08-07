// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createRoot, createSignal } from 'solid-js'
import { kokey as svelteKokey, kokeyPaste as sveltePaste } from './svelte'
import {
  kokey as solidKokey,
  kokeyPaste as solidPaste,
  useKokey
} from './solid'

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

describe('kokey (Svelte action)', () => {
  it('binds, updates the mode, destroys', () => {
    const el = makeInput()
    const action = svelteKokey(el, 'en')
    feed(el, '안')
    expect(el.value).toBe('dks')

    action.update('ko')
    feed(el, 'dks')
    expect(el.value).toBe('안')

    action.destroy()
    feed(el, 'dks')
    expect(el.value).toBe('dks')
  })

  it('without a mode falls back to the data-kokey attribute', () => {
    const el = makeInput()
    el.setAttribute('data-kokey', 'ko')
    const action = svelteKokey(el)
    feed(el, 'gksrmf')
    expect(el.value).toBe('한글')
    action.destroy()
  })

  it('resyncs so an earlier-registered listener (bind:value) sees the converted value', () => {
    const el = makeInput()
    // Svelte registers bind:value's input listener before the action runs
    let bound = ''
    el.addEventListener('input', () => {
      bound = el.value
    })
    const action = svelteKokey(el, 'ko')
    feed(el, 'dkssud')
    expect(el.value).toBe('안녕')
    expect(bound).toBe('안녕') // picked up via the re-dispatched event
    action.destroy()
  })

  it('kokeyPaste action corrects pastes until destroyed', () => {
    const el = makeInput()
    const action = sveltePaste(el)
    paste(el, 'dkssudgktpdy')
    expect(el.value).toBe('안녕하세요')

    action.destroy()
    el.value = ''
    const e = paste(el, 'dkssudgktpdy')
    expect(e.defaultPrevented).toBe(false)
  })
})

describe('kokey (Solid directive)', () => {
  it('binds reactively to a mode signal and cleans up on dispose', () => {
    const el = makeInput()
    // set up inside the root, drive from outside it — updates inside the
    // createRoot callback are batched and would not re-run the effect yet
    let setMode!: (m: 'ko' | 'en') => 'ko' | 'en'
    let dispose!: () => void
    createRoot((d) => {
      dispose = d
      const [mode, set] = createSignal<'ko' | 'en'>('en')
      setMode = set
      solidKokey(el, mode)
    })

    feed(el, '안')
    expect(el.value).toBe('dks')

    setMode('ko')
    feed(el, 'dks')
    expect(el.value).toBe('안')

    dispose()
    feed(el, 'dks')
    expect(el.value).toBe('dks')
  })

  it('useKokey returns a ref binder', () => {
    const el = makeInput()
    useKokey('ko')(el)
    feed(el, 'gksrmf')
    expect(el.value).toBe('한글')
  })

  it('kokeyPaste directive corrects pastes until disposed', () => {
    const el = makeInput()
    createRoot((dispose) => {
      solidPaste(el, () => true)
      paste(el, 'dkssudgktpdy')
      expect(el.value).toBe('안녕하세요')

      dispose()
      el.value = ''
      const e = paste(el, 'dkssudgktpdy')
      expect(e.defaultPrevented).toBe(false)
    })
  })
})
