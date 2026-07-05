import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
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
