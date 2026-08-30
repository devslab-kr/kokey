import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = 'https://devslab.kr/brand/open-source/';
const release = 'https://github.com/devslab-kr/oss-brand/releases/tag/v0.2.0';
const rootReadmes = [
  'README.md', 'README.ko.md', 'README.ru.md', 'README.uk.md', 'README.he.md',
  'README.el.md', 'README.th.md', 'README.ar.md', 'README.ka.md',
];

const assets = {
  'docs/assets/brand/readme-header.png': 'eaadf90e41edbb3ef93d273b4d2f8b39ee39e47eed98f8d96eac6b22d97e5e20',
  'docs/assets/brand/project-mark.svg': '94099fee08e79c23c076aefc38ed1f2eb60f45d34f798bf3f3d98935bbc2df22',
  'docs/assets/brand/project-lockup.svg': '3bbae4d656bd29d0d15aa9f59640a25d2edccf5a2b3a31be3bb58c09111cc402',
  'site/favicon.svg': '94099fee08e79c23c076aefc38ed1f2eb60f45d34f798bf3f3d98935bbc2df22',
  'site/favicon.ico': '0b6c665a7fe8d699a50d5f0d0796a3ced157ed855ecbeb7bf5b70c5bc6c250c2',
  'site/apple-touch-icon.png': 'd104abcdd579313d02f40c6fe56d27e46e30797eca3d652a1c385fbdbf4549ed',
  'site/og.png': '33172c28ad3606ccecc0a79d13ee181999bcdaa2923e2f18fe3bd3ca59449116',
  'extension/icons/icon16.png': '5e523142cdbe63692fdefa9c9f45fe6035a06868df33ee7c20c4f54b90329b5b',
  'extension/icons/icon48.png': '2cd50f405b433c8db4d9c10ad74cf2fd2cb131c830f5c7f91b8cee74c65b10af',
  'extension/icons/icon128.png': '4224e9107730fd3a5883d8a67e9fd154fc75abde9c21283d5b9f35b7802ea51e',
  'extension/store/promo-marquee.png': 'd39ef57d058e307acdce8accdf538cf1343cbbac9ce6d6a465237b401a47f991',
  'extension/store/promo-small.png': 'f4633845bbb709234975c9fb91c869961c3450b25e9f9ac55c4845296e5f6cd0',
};

const preserved = {
  'docs/preview.png': '8f7ca2f4d178df5ba02b2b455b7ce7bd0e779e9830be74b40edbafb06fca30ce',
  'extension/store/screenshot-1.png': '0afc7fc033618d40dd20a403f6ffd716c909650796aa691f33ead4f19917250e',
  'extension/store/screenshot-2.png': '9db058101a7c4e6d5734444406229624fc5b1c16cea7cddd0f35d8a0f7862b93',
};

const preservedText = {
  'site/privacy.html': '5d5e52dc9b19b5751692d5c9275b4bc25c6c4366cbe3181a96f8c2e1b9d2176a',
  'extension/manifest.json': 'ef42e8e4d160daf27a24d96623a96952f1a22e2f910b4aba70dd4f77910eb520',
};

function fail(message) {
  console.error(`Brand check failed: ${message}`);
  process.exitCode = 1;
}

async function bytes(relativePath) {
  return readFile(path.join(root, relativePath));
}

async function hash(relativePath) {
  return createHash('sha256').update(await bytes(relativePath)).digest('hex');
}

async function normalizedTextHash(relativePath) {
  const text = await readFile(path.join(root, relativePath), 'utf8');
  return createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

async function verifyHashes(entries, label) {
  for (const [relativePath, expected] of Object.entries(entries)) {
    try {
      if (await hash(relativePath) !== expected) fail(`${relativePath} ${label} checksum mismatch`);
    } catch {
      fail(`missing ${relativePath}`);
    }
  }
}

function pngDimensions(data) {
  if (data.toString('ascii', 1, 4) !== 'PNG') throw new Error('not a PNG');
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

try {
  const manifest = JSON.parse(await readFile(path.join(root, 'docs/assets/brand/oss-brand.json'), 'utf8'));
  if (manifest.registryId !== 'O05' || manifest.project !== 'kokey' || manifest.release !== 'v0.2.0') {
    fail('O05 manifest must identify kokey and oss-brand v0.2.0');
  }
  if (manifest.source !== release || manifest.guide !== guide) fail('O05 manifest source or guide is incorrect');
} catch {
  fail('missing or invalid docs/assets/brand/oss-brand.json');
}

await verifyHashes(assets, 'oss-brand v0.2.0');
await verifyHashes(preserved, 'preserved surface');
for (const [relativePath, expected] of Object.entries(preservedText)) {
  try {
    if (await normalizedTextHash(relativePath) !== expected) {
      fail(`${relativePath} normalized preserved surface checksum mismatch`);
    }
  } catch {
    fail(`missing ${relativePath}`);
  }
}

for (const relativePath of rootReadmes) {
  try {
    const text = await readFile(path.join(root, relativePath), 'utf8');
    if (!text.includes('readme-header.png') || !text.includes(guide) || !text.includes('Registry O05')) {
      fail(`${relativePath} must carry the O05 header and guide`);
    }
  } catch {
    fail(`missing ${relativePath}`);
  }
}

for (const relativePath of ['extension/README.md', 'extension/README.ko.md']) {
  try {
    const text = await readFile(path.join(root, relativePath), 'utf8');
    if (!text.includes(guide) || !text.includes('O05')) fail(`${relativePath} must link to the O05 guide`);
  } catch {
    fail(`missing ${relativePath}`);
  }
}

for (const [relativePath, dimensions] of Object.entries({
  'extension/icons/icon16.png': [16, 16],
  'extension/icons/icon48.png': [48, 48],
  'extension/icons/icon128.png': [128, 128],
})) {
  try {
    const actual = pngDimensions(await bytes(relativePath));
    if (actual[0] !== dimensions[0] || actual[1] !== dimensions[1]) {
      fail(`${relativePath} must be ${dimensions[0]}×${dimensions[1]}`);
    }
  } catch {
    fail(`could not inspect ${relativePath}`);
  }
}

try {
  const site = await readFile(path.join(root, 'site/index.html'), 'utf8');
  for (const marker of [
    'data-atmosphere="project"', 'hero-atmosphere__glow', guide,
    'og:image:alt', 'twitter:image:alt', '@media (forced-colors: active), print',
  ]) if (!site.includes(marker)) fail(`site/index.html is missing ${marker}`);
  for (const marker of [
    'class="project-hero hero-atmosphere"',
    '.hero-atmosphere {',
    '.hero-atmosphere > [aria-hidden="true"].hero-atmosphere__glow',
    '[data-atmosphere="project"] > [aria-hidden="true"].hero-atmosphere__glow::after',
    '.hero-atmosphere > :not([aria-hidden="true"].hero-atmosphere__glow)',
  ]) if (!site.includes(marker)) fail(`site/index.html must use the canonical hero atmosphere selector: ${marker}`);
} catch {
  fail('missing site/index.html');
}

try {
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  if (!packageJson.scripts?.verify?.includes('npm run check:brand')) {
    fail('package.json verify must include npm run check:brand');
  }
  if (packageJson.scripts?.prepublishOnly !== 'npm run verify') {
    fail('package.json prepublishOnly must delegate to the non-recursive verify script');
  }
} catch {
  fail('missing or invalid package.json');
}

for (const workflow of ['.github/workflows/ci.yml', '.github/workflows/pages.yml', '.github/workflows/publish.yml']) {
  try {
    const source = await readFile(path.join(root, workflow), 'utf8');
    if (!source.includes('npm run verify')) fail(`${workflow} must gate work with npm run verify`);
  } catch {
    fail(`missing ${workflow}`);
  }
}

if (!process.exitCode) console.log('Brand check passed: kokey O05 surfaces match oss-brand v0.2.0.');
