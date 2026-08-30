import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = 'https://devslab.kr/brand/open-source/';
const release = 'https://github.com/devslab-kr/oss-brand/releases/tag/v0.1.1';
const rootReadmes = [
  'README.md', 'README.ko.md', 'README.ru.md', 'README.uk.md', 'README.he.md',
  'README.el.md', 'README.th.md', 'README.ar.md', 'README.ka.md',
];

const assets = {
  'docs/assets/brand/readme-header.png': 'e6361b3aa57893e15f4f486de5be09a595c795a60c6d5160d6a7018c1942bc55',
  'docs/assets/brand/project-mark.svg': '73c86d6341d3b37132640be132139edd6cd424c4fa4bc214165d8848a4cae263',
  'docs/assets/brand/project-lockup.svg': '0700814ed1bed42238717b386213f97476ea02729fa7a440c64ea8c780efc458',
  'site/favicon.svg': '73c86d6341d3b37132640be132139edd6cd424c4fa4bc214165d8848a4cae263',
  'site/favicon.ico': '21d099bb6ab2bb6fdf09033da984114d87a175fc9f5f0fb60751911096f01092',
  'site/apple-touch-icon.png': '735ed95d43bab030019a8927cc3607b06d57e2a187bf8b0e0b079b9916cb44f5',
  'site/og.png': '3e73a5eee4076daa4b9218ebf69c197aaa7547d2b173dc5582b4f34372aab494',
  'extension/icons/icon16.png': '6d6b8bc981f50b9df16e2822b6912060fae1bdd33f02444f98b20ae455c46b8d',
  'extension/icons/icon48.png': '61f2e3a9b27e39ca1511bb3b497ccc8cfa0480808a54927c64967c3ec1fca84d',
  'extension/icons/icon128.png': '2ff7f08959ad348754b4ca947cef2480dbeaef7972681aadc72c7b9b95229528',
  'extension/store/promo-marquee.png': '03f142ae211aff1cc10fff6fa94be4cd9e6e0974ac7f30c5149aee12db44bd24',
  'extension/store/promo-small.png': '23851063e84e28f4e5341c213919790942b08ea190fc30b18d7901f275da0103',
};

const preserved = {
  'docs/preview.png': '8f7ca2f4d178df5ba02b2b455b7ce7bd0e779e9830be74b40edbafb06fca30ce',
  'extension/store/screenshot-1.png': '0afc7fc033618d40dd20a403f6ffd716c909650796aa691f33ead4f19917250e',
  'extension/store/screenshot-2.png': '9db058101a7c4e6d5734444406229624fc5b1c16cea7cddd0f35d8a0f7862b93',
  'site/privacy.html': '58ebbfe8c577664530e9360437423225f45f7a041f2b1ef5d1e0a3481946538e',
  'extension/manifest.json': '60becf5fbd4895ec05ab3aa705ce30dcd19948b7e0f5e038154706c66cadfd12',
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
  if (manifest.registryId !== 'O05' || manifest.project !== 'kokey' || manifest.release !== 'v0.1.1') {
    fail('O05 manifest must identify kokey and oss-brand v0.1.1');
  }
  if (manifest.source !== release || manifest.guide !== guide) fail('O05 manifest source or guide is incorrect');
} catch {
  fail('missing or invalid docs/assets/brand/oss-brand.json');
}

await verifyHashes(assets, 'oss-brand v0.1.1');
await verifyHashes(preserved, 'preserved surface');

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
} catch {
  fail('missing site/index.html');
}

if (!process.exitCode) console.log('Brand check passed: kokey O05 surfaces match oss-brand v0.1.1.');
