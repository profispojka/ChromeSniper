import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const variants = [
  'icon-8-outline-snip',
  'icon-9-outline-snip-shadow',
];

for (const v of variants) {
  const src = readFileSync(join(here, `${v}.svg`));
  for (const size of [16, 32, 48, 128]) {
    await sharp(src, { density: size * 4 })
      .resize(size, size)
      .png()
      .toFile(join(here, `${v}-${size}.png`));
  }
  console.log(`${v} ✓`);
}
