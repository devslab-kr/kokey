/**
 * Svelte adapters — actions for `use:`. Dependency-free: Svelte actions are
 * plain functions, so nothing here imports the `svelte` package and no
 * peer dependency is needed.
 *
 *   <input use:kokey={'ko'} />           <!-- or 'ru', 'en', … -->
 *   <input use:kokey data-kokey="en" />  <!-- mode from the attribute -->
 *   <input use:kokeyPaste />             <!-- paste auto-correction -->
 *
 * `bind:value` works: Svelte attaches its own `input` listener before the
 * action runs, so the action binds with `resync` — after a conversion
 * changes the value it re-dispatches `input`, and the second (idempotent)
 * pass lets `bind:value` read the converted text.
 */
import { bind, type KokeyMode } from './dom'
import { bindPaste } from './paste'

type Bindable = HTMLInputElement | HTMLTextAreaElement

/** Structural match for svelte's ActionReturn — no svelte import needed. */
export interface KokeyActionReturn {
  update: (mode?: KokeyMode) => void
  destroy: () => void
}

export function kokey(node: Bindable, mode?: KokeyMode): KokeyActionReturn {
  let unbind = bind(node, mode, { resync: true })
  return {
    update(next?: KokeyMode) {
      unbind()
      unbind = bind(node, next, { resync: true })
    },
    destroy() {
      unbind()
    }
  }
}

export function kokeyPaste(node: Bindable): { destroy: () => void } {
  return { destroy: bindPaste(node) }
}
