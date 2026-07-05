/**
 * React adapters.
 *
 * `useKokey` — ref-callback hook for uncontrolled inputs:
 *
 *   import { useKokey } from '@devslab/kokey/react'
 *   <input ref={useKokey('ko')} />        // or 'ru', 'en', …
 *
 * `KokeyInput` — component that converts inside the React data flow, so
 * CONTROLLED inputs work: your onChange always receives the converted value
 * (the ref-based hook mutates the DOM after React reads it, which fights
 * `value=`/`setState`).
 *
 *   <KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
 *   <KokeyInput mode="ru" as="textarea" defaultValue="" />
 *
 * `useHangul` is the legacy alias of `useKokey`, limited to the Korean modes.
 */
import {
  createElement,
  forwardRef,
  useMemo,
  useRef,
  type ChangeEvent,
  type CompositionEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type Ref,
  type TextareaHTMLAttributes
} from 'react'
import {
  applyToInput,
  convert,
  createRefBinder,
  type HangulMode,
  type KokeyMode
} from './dom'

type Bindable = HTMLInputElement | HTMLTextAreaElement

export function useKokey(
  mode?: KokeyMode
): (el: Bindable | null) => void {
  return useMemo(() => createRefBinder(mode), [mode])
}

export function useHangul(
  mode?: HangulMode
): (el: Bindable | null) => void {
  return useKokey(mode)
}

type OverriddenHandlers = 'onChange' | 'onCompositionStart' | 'onCompositionEnd'

export type KokeyInputProps = {
  /** 'en' to restore QWERTY, or a registered layout id. Default 'en'. */
  mode?: KokeyMode
  /** Render an `<input>` (default) or a `<textarea>`. */
  as?: 'input' | 'textarea'
  onChange?: (e: ChangeEvent<Bindable>) => void
  onCompositionStart?: (e: CompositionEvent<Bindable>) => void
  onCompositionEnd?: (e: CompositionEvent<Bindable>) => void
} & Omit<
  InputHTMLAttributes<HTMLInputElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement>,
  OverriddenHandlers
>

/**
 * Set the value through the prototype setter so React's internal value
 * tracker sees the change and the dispatched `input` event isn't deduped.
 */
function setValueNative(el: Bindable, value: string): void {
  const proto =
    el.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (setter) setter.call(el, value)
  else el.value = value
}

export const KokeyInput = forwardRef(function KokeyInput(
  {
    mode = 'en',
    as = 'input',
    onChange,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  }: KokeyInputProps,
  ref: Ref<Bindable>
): ReactElement {
  const composing = useRef(false)

  return createElement(as, {
    ...rest,
    ref,
    onCompositionStart: (e: CompositionEvent<Bindable>) => {
      composing.current = true
      onCompositionStart?.(e)
    },
    onCompositionEnd: (e: CompositionEvent<Bindable>) => {
      composing.current = false
      const el = e.currentTarget
      const next = convert(el.value, mode)
      if (next !== el.value) {
        const caret = el.selectionStart
        setValueNative(el, next)
        if (caret !== null) {
          const pos = convert(el.value.slice(0, caret), mode).length
          el.setSelectionRange(pos, pos)
        }
        // re-fire so controlled state picks up the converted value
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      onCompositionEnd?.(e)
    },
    onChange: (e: ChangeEvent<Bindable>) => {
      // convert before the consumer reads e.target.value
      if (!composing.current) applyToInput(e.currentTarget, mode)
      onChange?.(e)
    }
  })
})
