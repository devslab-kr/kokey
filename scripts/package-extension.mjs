// Builds the store-submission zip. The file list is DERIVED FROM THE
// MANIFEST rather than hardcoded — a hardcoded list silently shipped a zip
// missing the options page and its scripts once, and a store zip that is
// missing a file it references is a rejected review at best.
// Run via `npm run package:extension`.
// Output: extension/kokey-extension-v<version>.zip (gitignored).
import { readFileSync, existsSync } from 'node:fs'
import AdmZip from 'adm-zip'

const DIR = 'extension'
const manifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, 'utf8'))

const files = new Set(['manifest.json'])

// background: Chrome's service_worker and Firefox's scripts[]
if (manifest.background?.service_worker) {
  files.add(manifest.background.service_worker)
}
for (const s of manifest.background?.scripts ?? []) files.add(s)

// every content script, in the order the manifest declares them
for (const entry of manifest.content_scripts ?? []) {
  for (const js of entry.js ?? []) files.add(js)
  for (const css of entry.css ?? []) files.add(css)
}

for (const icon of Object.values(manifest.icons ?? {})) files.add(icon)

// the options page plus anything it <script src=>s
const page = manifest.options_ui?.page
if (page) {
  files.add(page)
  const html = readFileSync(`${DIR}/${page}`, 'utf8')
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    files.add(m[1].replace(/^\.\//, ''))
  }
}

const missing = [...files].filter((f) => !existsSync(`${DIR}/${f}`))
if (missing.length) {
  console.error(
    'Referenced by the manifest but not present:\n  ' + missing.join('\n  ') +
      (missing.includes('kokey.global.js')
        ? '\n(run npm run build:extension first)'
        : '')
  )
  process.exit(1)
}

const zip = new AdmZip()
for (const f of files) {
  const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : ''
  zip.addLocalFile(`${DIR}/${f}`, dir)
}

const out = `${DIR}/kokey-extension-v${manifest.version}.zip`
zip.writeZip(out)
console.log(`${out} written — ${files.size} files:`)
for (const f of files) console.log('  ' + f)
