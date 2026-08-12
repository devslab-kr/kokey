// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bindSuggest } from './suggest'
import { observe } from './dom'
import { luminance, contrast, surfaceColor, paletteFor, ON_LIGHT, ON_DARK } from './theme'

function makeInput(value = ''): HTMLInputElement {
  const el = document.createElement('input')
  el.value = value
  document.body.appendChild(el)
  // jsdom does no layout, so every rect is zeros — which place() correctly
  // reads as "the field is gone". Give it a real box.
  el.getBoundingClientRect = () =>
    ({
      top: 10, left: 10, right: 210, bottom: 34,
      width: 200, height: 24, x: 10, y: 10, toJSON: () => ({})
    }) as DOMRect
  return el
}

const button = () =>
  document.querySelector('.kokey-suggest') as HTMLButtonElement | null

function typeInto(el: HTMLInputElement, value: string): void {
  el.value = value
  el.dispatchEvent(new Event('input'))
  vi.advanceTimersByTime(400) // past the debounce
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('bindSuggest', () => {
  it('offers a fix for a mistyped value and applies it on click', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)

    typeInto(el, 'dkssudgktpdy')
    const btn = button()!
    expect(btn.hidden).toBe(false)

    let inputs = 0
    el.addEventListener('input', () => {
      inputs += 1
    })
    btn.click()
    expect(el.value).toBe('안녕하세요')
    expect(inputs).toBe(1)
    expect(btn.hidden).toBe(true) // hides once applied
  })

  it('offers nothing for text that looks fine', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)

    typeInto(el, 'hello there')
    expect(button()?.hidden ?? true).toBe(true)
  })

  it('never makes the Latin→Korean guess an explicit action would', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)
    // convert(text, 'ko') would compose this; an uninvited button must not
    typeInto(el, 'dkssud')
    expect(button()?.hidden ?? true).toBe(true)
  })

  it('stays quiet while the IME is composing', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)

    el.dispatchEvent(new CompositionEvent('compositionstart'))
    typeInto(el, 'dkssudgktpdy')
    expect(button()?.hidden ?? true).toBe(true)

    el.dispatchEvent(new CompositionEvent('compositionend'))
    vi.advanceTimersByTime(400)
    expect(button()!.hidden).toBe(false)
  })

  it('applies no colours by default, leaving styling to the site', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)
    typeInto(el, 'dkssudgktpdy')
    const btn = button()!
    expect(btn.className).toBe('kokey-suggest')
    expect(btn.style.background).toBe('')
    expect(btn.style.color).toBe('')
  })

  it('themes itself against the field when asked', () => {
    vi.useFakeTimers()
    const el = makeInput()
    el.style.backgroundColor = 'rgb(18, 18, 18)'
    bindSuggest(el, { theme: 'auto' })
    typeInto(el, 'dkssudgktpdy')
    // jsdom normalises hex to rgb()
    expect(button()!.style.background).toContain('94, 234, 212') // #5eead4
  })

  it('keeps the caret in the field when the button is pressed', () => {
    vi.useFakeTimers()
    const el = makeInput()
    bindSuggest(el)
    typeInto(el, 'dkssudgktpdy')
    const e = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button()!.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
  })

  it('unbinds and removes its button', () => {
    vi.useFakeTimers()
    const el = makeInput()
    const unbind = bindSuggest(el)
    typeInto(el, 'dkssudgktpdy')
    expect(button()).not.toBeNull()

    unbind()
    expect(button()).toBeNull()
    typeInto(el, 'dkssudgktpdy')
    expect(button()).toBeNull()
  })
})

describe('observe with data-kokey-suggest', () => {
  it('binds existing and later-added inputs', async () => {
    vi.useFakeTimers()
    const el = makeInput()
    el.setAttribute('data-kokey-suggest', '')
    const stop = observe()

    typeInto(el, 'dkssudgktpdy')
    expect(button()!.hidden).toBe(false)
    stop()
  })
})

describe('theme measurement', () => {
  it('computes WCAG luminance and contrast', () => {
    expect(luminance([255, 255, 255])).toBeCloseTo(1, 3)
    expect(luminance([0, 0, 0])).toBeCloseTo(0, 3)
    expect(contrast(luminance([0, 0, 0]), luminance([255, 255, 255]))).toBeCloseTo(21, 0)
  })

  it('walks up past transparent ancestors', () => {
    // an <input> carries an opaque UA background, so the walk normally stops
    // at the field itself — the surface the button sits on. Sites that clear
    // it are the case this walk exists for.
    const outer = document.createElement('div')
    outer.style.backgroundColor = 'rgb(17, 17, 17)'
    const inner = document.createElement('div') // transparent
    const el = document.createElement('input')
    el.style.backgroundColor = 'transparent'
    outer.appendChild(inner)
    inner.appendChild(el)
    document.body.appendChild(outer)
    expect(surfaceColor(el).slice(0, 3)).toEqual([17, 17, 17])
  })

  it('picks the palette from the field, not the page', () => {
    const page = document.createElement('div')
    page.style.backgroundColor = 'rgb(10, 10, 10)'
    const el = document.createElement('input')
    el.style.backgroundColor = 'rgb(255, 255, 255)'
    page.appendChild(el)
    document.body.appendChild(page)
    // a white field on a dark page still gets the light-surface palette
    expect(paletteFor(el)).toBe(ON_LIGHT)

    const darkField = document.createElement('input')
    darkField.style.backgroundColor = 'rgb(20, 20, 24)'
    document.body.appendChild(darkField)
    expect(paletteFor(darkField)).toBe(ON_DARK)
  })
})
