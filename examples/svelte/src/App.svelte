<script>
  import { kokey, kokeyPaste } from '@devslab/kokey/svelte'
  import { register } from '@devslab/kokey'
  import { ru } from '@devslab/kokey/ru'

  register(ru) // opt in to the Russian layout for the "en" restore field

  let restored = $state('')
  let hangul = $state('')
</script>

<main>
  <h1>kokey · Svelte</h1>

  <label>
    <code>use:kokey={'en'}</code> + <code>bind:value</code> — restore QWERTY
    <input
      use:kokey={'en'}
      bind:value={restored}
      placeholder="ㅇㄴㅁ쇼 → dsaty · привет → privet"
    />
  </label>
  <p>bound: <code>"{restored}"</code></p>

  <label>
    <code>use:kokey={'ko'}</code> — compose Hangul as you type
    <input use:kokey={'ko'} bind:value={hangul} placeholder="dkssud → 안녕" />
  </label>
  <p>bound: <code>"{hangul}"</code></p>

  <label>
    <code>use:kokeyPaste</code> — paste <code>dkssudgktpdy</code> here
    <input use:kokeyPaste placeholder="auto-corrects a mistyped paste" />
  </label>
</main>

<style>
  :global(body) { font-family: system-ui, sans-serif; max-width: 560px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; }
  label { display: block; margin: 1.1rem 0 0.25rem; font-size: 0.9rem; color: #555; }
  input { display: block; font-size: 1.1rem; padding: 0.4rem 0.6rem; width: 18rem; margin-top: 0.25rem; }
  code { background: #f4f4f4; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>
