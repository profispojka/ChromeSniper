import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const proposals = [
  'proposal-A-gunmetal',
  'proposal-B-paper',
  'proposal-C-snipframe',
  'proposal-D-lens',
  'proposal-E-dotsquare',
];

for (const name of proposals) {
  const svg = readFileSync(join(here, `${name}.svg`));
  for (const size of [128, 32]) {
    await sharp(svg, { density: size * 4 })
      .resize(size, size)
      .png()
      .toFile(join(here, `${name}-${size}.png`));
  }
  console.log(`${name} ✓`);
}
