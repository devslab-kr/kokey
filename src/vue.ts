/**
 * Vue 3 adapters.
 *
 * `vKokey` — directive for plain (non-v-model) inputs:
 *
 *   <input v-kokey="'ko'">           <!-- or 'ru', 'en', … -->
 *   <input v-kokey data-kokey="en">  <!-- mode from the attribute -->
 *
 * `KokeyInput` — component that converts before emitting, so `v-model`
 * works: the bound ref always receives the converted value (the directive
 * mutates the DOM after v-model reads it, which fights the binding).
 *
 *   <KokeyInput v-model="value" mode="en" />
 *   <KokeyInput v-model="memo" mode="ru" as="textarea" />
 *
 * `vHangul` is the legacy alias of `vKokey`, limited to the Korean modes.
 */
import { defineComponent, h, type Directive, type PropType } from 'vue'
import {
  applyToInput,
  bind,
  type HangulMode,
  type KokeyMode
} from './dom'

type Bindable = HTMLInputElement | HTMLTextAreaElement

const unbinds = new WeakMap<Bindable, () => void>()

export const vKokey: Directive<Bindable, KokeyMode | undefined> = {
  mounted(el, binding) {
    unbinds.set(el, bind(el, binding.value))
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      unbinds.get(el)?.()
      unbinds.set(el, bind(el, binding.value))
    }
  },
  unmounted(el) {
    unbinds.get(el)?.()
    unbinds.delete(el)
  }
}

/** Legacy alias of `vKokey`, limited to the Korean modes. */
export const vHangul = vKokey as Directive<Bindable, HangulMode | undefined>

export const KokeyInput = defineComponent({
  name: 'KokeyInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    /** 'en' to restore QWERTY, or a registered layout id. */
    mode: { type: String as PropType<KokeyMode>, default: 'en' },
    /** Render an `<input>` (default) or a `<textarea>`. */
    as: {
      type: String as PropType<'input' | 'textarea'>,
      default: 'input'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    let composing = false

    const convertAndEmit = (e: Event): void => {
      const el = e.target as Bindable
      applyToInput(el, props.mode)
      emit('update:modelValue', el.value)
    }

    return () =>
      h(props.as, {
        ...attrs,
        value: props.modelValue,
        onCompositionstart: () => {
          composing = true
        },
        onCompositionend: (e: Event) => {
          composing = false
          convertAndEmit(e)
        },
        onInput: (e: Event) => {
          if (!composing) convertAndEmit(e)
        }
      })
  }
})
