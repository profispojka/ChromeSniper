import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const big = readFileSync(join(here, 'icon-1-viewfinder.svg'));
const small = readFileSync(join(here, 'icon-1-viewfinder-small.svg'));

const renders = [
  { src: small, size: 16 },
  { src: small, size: 32 },
  { src: big,   size: 48 },
  { src: big,   size: 128 },
];

for (const { src, size } of renders) {
  await sharp(src, { density: size * 4 })
    .resize(size, size)
    .png()
    .toFile(join(here, `icon-${size}.png`));
  console.log(`icon-${size}.png ✓`);
}
