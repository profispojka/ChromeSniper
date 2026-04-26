import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'icon.svg'));

for (const size of [16, 32, 48, 128]) {
  await sharp(src, { density: size * 4 })
    .resize(size, size)
    .png()
    .toFile(join(here, `icon-${size}.png`));
  console.log(`icon-${size}.png ✓`);
}
