/**
 * React hook — returns a ref callback that enforces the mode on the element.
 *
 *   import { useKokey } from '@devslab/kokey/react'
 *
 *   function Field() {
 *     return <input ref={useKokey('ko')} />   // or 'ru', 'en', …
 *   }
 *
 * `useHangul` is the legacy alias, limited to the Korean modes.
 */
import { useMemo } from 'react'
import { createRefBinder, type HangulMode, type KokeyMode } from './dom'

export function useKokey(
  mode?: KokeyMode
): (el: HTMLInputElement | HTMLTextAreaElement | null) => void {
  return useMemo(() => createRefBinder(mode), [mode])
}

export function useHangul(
  mode?: HangulMode
): (el: HTMLInputElement | HTMLTextAreaElement | null) => void {
  return useKokey(mode)
}
