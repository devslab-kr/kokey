/**
 * Vue 3 directives — `v-kokey` / `v-kokey="'ru'"` (and the legacy `v-hangul`).
 *
 *   <script setup>
 *   import { vKokey } from '@devslab/kokey/vue'
 *   </script>
 *   <template>
 *     <input v-kokey="'ko'">           <!-- explicit mode -->
 *     <input v-kokey data-kokey="en">  <!-- or mode from the attribute -->
 *   </template>
 */
import type { Directive } from 'vue'
import { bind, type HangulMode, type KokeyMode } from './dom'

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
