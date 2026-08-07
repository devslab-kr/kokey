/**
 * Solid adapters.
 *
 * `useKokey` — ref factory (Solid refs are called once with the element;
 * listeners die with the element, so no explicit cleanup is needed):
 *
 *   import { useKokey } from '@devslab/kokey/solid'
 *   <input ref={useKokey('ko')} />       // or 'ru', 'en', …
 *
 * `kokey` / `kokeyPaste` — `use:` directives, reactive to a mode signal:
 *
 *   <input use:kokey={mode()} />
 *   <input use:kokeyPaste />
 *
 * Solid's signal handlers work without extra plumbing: Solid delegates
 * `input` at the document level, so the element-level conversion listener
 * runs first and `onInput` already reads the converted value.
 */
import { createRenderEffect, onCleanup } from 'solid-js'
import { bind, createRefBinder, type KokeyMode } from './dom'
import { bindPaste } from './paste'

type Bindable = HTMLInputElement | HTMLTextAreaElement

export function useKokey(mode?: KokeyMode): (el: Bindable) => void {
  return createRefBinder(mode)
}

export function kokey(
  el: Bindable,
  mode: () => KokeyMode | undefined
): void {
  createRenderEffect(() => {
    onCleanup(bind(el, mode()))
  })
}

export function kokeyPaste(el: Bindable, enabled: () => boolean): void {
  createRenderEffect(() => {
    if (enabled() === false) return
    onCleanup(bindPaste(el))
  })
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      kokey: KokeyMode | undefined
      kokeyPaste: boolean
    }
  }
}
