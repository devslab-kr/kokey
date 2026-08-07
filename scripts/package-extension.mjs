// Builds the store-submission zip: extension runtime files only (no dev
// harness, tests, or READMEs). Run via `npm run package:extension`.
// Output: extension/kokey-extension-v<version>.zip (gitignored).
import { readFileSync, existsSync } from 'node:fs'
import AdmZip from 'adm-zip'

const manifest = JSON.parse(readFileSync('extension/manifest.json', 'utf8'))

if (!existsSync('extension/kokey.global.js')) {
  console.error('extension/kokey.global.js missing — run npm run build:extension first')
  process.exit(1)
}

const zip = new AdmZip()
const files = [
  'manifest.json',
  'background.js',
  'convert.js',
  'content.js',
  'kokey.global.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png'
]
for (const f of files) {
  const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : ''
  zip.addLocalFile(`extension/${f}`, dir)
}

const out = `extension/kokey-extension-v${manifest.version}.zip`
zip.writeZip(out)
console.log(out, 'written —', files.length, 'files')
