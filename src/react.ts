/**
 * React hook — returns a ref callback that enforces the mode on the element.
 *
 *   import { useHangul } from 'kokey/react'
 *
 *   function Field() {
 *     return <input ref={useHangul('ko')} />
 *   }
 */
import { useMemo } from 'react'
import { createRefBinder, type HangulMode } from './dom'

export function useHangul(
  mode?: HangulMode
): (el: HTMLInputElement | HTMLTextAreaElement | null) => void {
  return useMemo(() => createRefBinder(mode), [mode])
}
