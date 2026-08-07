// Copies the freshly built CDN bundle into extension/ — run via
// `npm run build:extension` (which builds first). The copy is gitignored;
// the extension folder is loadable unpacked right after this.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/kokey.global.js', 'extension/kokey.global.js')
console.log('extension/kokey.global.js updated')
