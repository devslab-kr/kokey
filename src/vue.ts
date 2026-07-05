/**
 * Vue 3 directive — `v-hangul` / `v-hangul="'en'"`.
 *
 *   <script setup>
 *   import { vHangul } from 'kokey/vue'
 *   </script>
 *   <template>
 *     <input v-hangul="'ko'">          <!-- explicit mode -->
 *     <input v-hangul data-hangul="en"> <!-- or mode from the attribute -->
 *   </template>
 */
import type { Directive } from 'vue'
import { bind, type HangulMode } from './dom'

type Bindable = HTMLInputElement | HTMLTextAreaElement

const unbinds = new WeakMap<Bindable, () => void>()

export const vHangul: Directive<Bindable, HangulMode | undefined> = {
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
