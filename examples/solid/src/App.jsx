import { createSignal } from 'solid-js'
// `kokey` / `kokeyPaste` are used by the use: directives below — Solid
// compiles `use:x` to a reference to `x`, so these imports must stay even
// though they never appear as values.
import { kokey, kokeyPaste, useKokey } from '@devslab/kokey/solid'
import { register } from '@devslab/kokey'
import { ru } from '@devslab/kokey/ru'

register(ru) // opt in to the Russian layout for the "en" restore field

const styles = `
body { font-family: system-ui, sans-serif; max-width: 560px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; }
label { display: block; margin: 1.1rem 0 0.25rem; font-size: 0.9rem; color: #555; }
input { display: block; font-size: 1.1rem; padding: 0.4rem 0.6rem; width: 18rem; margin-top: 0.25rem; }
code { background: #f4f4f4; padding: 0.1rem 0.3rem; border-radius: 3px; }
`

export default function App() {
  const [mode, setMode] = createSignal('en')
  const [value, setValue] = createSignal('')

  return (
    <main>
      <style>{styles}</style>
      <h1>kokey · Solid</h1>

      <label>
        <code>use:kokey</code> bound to a signal — mode: <code>{mode()}</code>
        <input
          use:kokey={mode()}
          onInput={(e) => setValue(e.currentTarget.value)}
          placeholder="ㅇㄴㅁ쇼 → dsaty · dkssud → 안녕"
        />
      </label>
      <p>
        value: <code>"{value()}"</code>{' '}
        <button onClick={() => setMode(mode() === 'en' ? 'ko' : 'en')}>
          switch to {mode() === 'en' ? 'ko' : 'en'}
        </button>
      </p>

      <label>
        <code>useKokey</code> ref factory — compose Hangul
        <input ref={useKokey('ko')} placeholder="gksrmf → 한글" />
      </label>

      <label>
        <code>use:kokeyPaste</code> — paste <code>dkssudgktpdy</code> here
        <input use:kokeyPaste placeholder="auto-corrects a mistyped paste" />
      </label>
    </main>
  )
}
