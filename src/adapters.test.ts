// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { applyToInput, convert, createRefBinder } from './dom'
import { register } from './registry'
import { ru } from './layouts/ru'
import { KokeyInput, vHangul } from './vue'

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

describe('convert / applyToInput (component building blocks)', () => {
  it('convert dispatches by mode', () => {
    register(ru)
    expect(convert('dkssud', 'ko')).toBe('안녕')
    expect(convert('ghbdtn', 'ru')).toBe('привет')
    expect(convert('привет안녕', 'en')).toBe('ghbdtndkssud')
    expect(convert('abc', 'unregistered')).toBe('abc')
  })

  it('applyToInput converts in place, preserves the caret, reports change', () => {
    const el = makeInput()
    el.value = '안x'
    el.setSelectionRange(1, 1) // caret after 안
    expect(applyToInput(el, 'en')).toBe(true)
    expect(el.value).toBe('dksx')
    expect(el.selectionStart).toBe(3) // 안 → dks
    expect(applyToInput(el, 'en')).toBe(false) // already converted
  })
})

describe('KokeyInput (Vue component)', () => {
  function mount(component: ReturnType<typeof defineComponent>) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp(component)
    app.mount(host)
    return { host, app }
  }

  function feedInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
    el.value = value
    el.setSelectionRange(value.length, value.length)
    el.dispatchEvent(new Event('input'))
  }

  it('v-model receives the converted value and the patch keeps it', async () => {
    const model = ref('')
    const { host, app } = mount(
      defineComponent({
        setup: () => () =>
          h(KokeyInput, {
            mode: 'ko',
            modelValue: model.value,
            'onUpdate:modelValue': (v: string) => {
              model.value = v
            }
          })
      })
    )
    const el = host.querySelector('input')!
    feedInput(el, 'dkssud')
    expect(el.value).toBe('안녕')
    expect(model.value).toBe('안녕')
    await nextTick()
    expect(el.value).toBe('안녕') // v-model patch does not revert it
    app.unmount()
  })

  it('waits for the IME composition to end before converting', async () => {
    register(ru)
    const model = ref('')
    const { host, app } = mount(
      defineComponent({
        setup: () => () =>
          h(KokeyInput, {
            mode: 'en',
            modelValue: model.value,
            'onUpdate:modelValue': (v: string) => {
              model.value = v
            }
          })
      })
    )
    const el = host.querySelector('input')!
    el.dispatchEvent(new CompositionEvent('compositionstart'))
    feedInput(el, '안')
    expect(el.value).toBe('안') // untouched mid-composition
    expect(model.value).toBe('')
    el.dispatchEvent(new CompositionEvent('compositionend'))
    expect(el.value).toBe('dks')
    expect(model.value).toBe('dks')
    app.unmount()
  })

  it('renders a textarea via as="textarea"', () => {
    const { host, app } = mount(
      defineComponent({
        setup: () => () => h(KokeyInput, { mode: 'ko', as: 'textarea' })
      })
    )
    const el = host.querySelector('textarea')!
    feedInput(el, 'gksrmf')
    expect(el.value).toBe('한글')
    app.unmount()
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
