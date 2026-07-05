import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      vue: 'src/vue.ts',
      react: 'src/react.ts',
      ru: 'src/layouts/ru.ts',
      uk: 'src/layouts/uk.ts',
      he: 'src/layouts/he.ts',
      el: 'src/layouts/el.ts',
      th: 'src/layouts/th.ts',
      ar: 'src/layouts/ar.ts',
      ka: 'src/layouts/ka.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'es2020',
    sourcemap: true
  },
  {
    entry: { kokey: 'src/browser.ts' },
    format: ['iife'],
    globalName: 'kokey',
    target: 'es2017',
    minify: true,
    sourcemap: true,
    outExtension: () => ({ js: '.global.js' })
  }
])
