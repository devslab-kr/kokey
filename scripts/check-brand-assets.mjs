import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = 'https://devslab.kr/brand/open-source/';
const release = 'https://github.com/devslab-kr/oss-brand/releases/tag/v0.3.0';
const rootReadmes = [
  'README.md', 'README.ko.md', 'README.ru.md', 'README.uk.md', 'README.he.md',
  'README.el.md', 'README.th.md', 'README.ar.md', 'README.ka.md',
];

const assets = {
  'docs/assets/brand/readme-header.png': '85bc21dda0996e6fdbbc58665067d6c938a25bb35fa6081d9df9d48e49dc9ddb',
  'docs/assets/brand/project-mark.svg': 'c7d8396ce8b966b8e634cd076c9e906c034856ae4be55a72d04ffabf9e6f5483',
  'docs/assets/brand/project-lockup.svg': 'fd5afe3e88dd96a951d037c69ae4b55027b06b693440189d1ae0b1d249edf05e',
  'site/favicon.svg': 'c7d8396ce8b966b8e634cd076c9e906c034856ae4be55a72d04ffabf9e6f5483',
  'site/favicon.ico': '5228eca31770eb9e3b41e21470b525009807524e387473052a5817062874dfa8',
  'site/apple-touch-icon.png': 'c0bc0b764fbb56e775ed808f48c6034bf84ac13f02370e7c2d0bf7f7c5ed0be3',
  'site/og.png': 'f8cd4ac473c5dca4281f2e282cb2f19294cd392c03be3ba6e2d019f60274f28f',
  'extension/icons/icon16.png': '304ab9efb3e248f97ae93db72209628db2139f654fdbbf0b22cc9ab7fd757cda',
  'extension/icons/icon48.png': '57d623a8ee4ae181e3d3ba06b9a21f3ad79e15436d8af869f1673734acd9ad64',
  'extension/icons/icon128.png': '2e639a79d904014c15f8be60f84a9c024872b1a6742e99a003460bbe9906f11d',
  'extension/store/promo-marquee.png': '3b266fd3029edd92ad47dd6231d5fb703daf5a501bf1ae3345dacfdc7786ee5b',
  'extension/store/promo-small.png': '9972a60c209b12f65750a754a386198aedabeeae2e0fb1e8c27c71df02119e86',
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
  if (manifest.registryId !== 'O05' || manifest.project !== 'kokey' || manifest.release !== 'v0.3.0') {
    fail('O05 manifest must identify kokey and oss-brand v0.3.0');
  }
  if (manifest.source !== release || manifest.guide !== guide) fail('O05 manifest source or guide is incorrect');
} catch {
  fail('missing or invalid docs/assets/brand/oss-brand.json');
}

await verifyHashes(assets, 'oss-brand v0.3.0');
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

if (!process.exitCode) console.log('Brand check passed: kokey O05 surfaces match oss-brand v0.3.0.');
