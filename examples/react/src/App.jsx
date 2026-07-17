import { useState } from 'react'
import { KokeyInput, useKokey } from '@devslab/kokey/react'

const styles = `
body { font-family: system-ui, sans-serif; max-width: 560px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; }
label { display: block; margin: 1.1rem 0 0.25rem; font-size: 0.9rem; color: #555; }
input { display: block; font-size: 1.1rem; padding: 0.4rem 0.6rem; width: 18rem; margin-top: 0.25rem; }
code { background: #f4f4f4; padding: 0.1rem 0.3rem; border-radius: 3px; }
`

export default function App() {
  const [name, setName] = useState('') // always receives the converted value

  return (
    <main>
      <style>{styles}</style>
      <h1>kokey · React</h1>

      <label>
        <code>&lt;KokeyInput /&gt;</code> controlled — restore QWERTY (type <code>ㅇㄴㅁ쇼</code> or paste it)
        <KokeyInput
          mode="en"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ㅇㄴㅁ쇼 → dsaty"
        />
      </label>
      <p>state: <code>"{name}"</code></p>

      <label>
        <code>useKokey</code> ref hook — compose Hangul (type <code>dkssud</code>)
        <input ref={useKokey('ko')} placeholder="dkssud → 안녕" />
      </label>
    </main>
  )
}
