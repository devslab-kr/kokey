<script setup>
import { ref } from 'vue'
import { KokeyInput } from '@devslab/kokey/vue'

const name = ref('') // always receives the converted value
</script>

<template>
  <main>
    <h1>kokey · Vue 3</h1>

    <label>
      <code>&lt;KokeyInput v-model&gt;</code> — restore QWERTY (type <code>ㅇㄴㅁ쇼</code> or paste it)
      <KokeyInput v-model="name" mode="en" placeholder="ㅇㄴㅁ쇼 → dsaty" />
    </label>
    <p>model: <code>"{{ name }}"</code></p>

    <label>
      <code>v-kokey</code> directive — compose Hangul (type <code>dkssud</code>)
      <input v-kokey="'ko'" placeholder="dkssud → 안녕">
    </label>
  </main>
</template>

<style>
body { font-family: system-ui, sans-serif; max-width: 560px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; }
label { display: block; margin: 1.1rem 0 0.25rem; font-size: 0.9rem; color: #555; }
input { display: block; font-size: 1.1rem; padding: 0.4rem 0.6rem; width: 18rem; margin-top: 0.25rem; }
code { background: #f4f4f4; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>
