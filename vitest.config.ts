import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // vitest resolves solid-js to its node/SSR build, which has no
      // reactivity — the Solid directive tests need the browser runtime
      'solid-js': 'solid-js/dist/dev.js'
    }
  }
})
