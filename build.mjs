import { build, context } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  platform: 'browser',
  sourcemap: 'linked',
  logLevel: 'info',
};

const entries = [
  { entryPoints: ['src/content.ts'], outfile: 'dist/content.js' },
  { entryPoints: ['src/background.ts'], outfile: 'dist/background.js' },
];

async function copyAssets() {
  const dest = 'dist/lib/tesseract';
  if (existsSync(dest)) await rm(dest, { recursive: true });
  await mkdir(dest, { recursive: true });
  await cp('node_modules/tesseract.js/dist/worker.min.js', `${dest}/worker.min.js`);
  await mkdir(`${dest}/core`, { recursive: true });
  for (const file of [
    'tesseract-core.wasm',
    'tesseract-core.wasm.js',
    'tesseract-core-simd.wasm',
    'tesseract-core-simd.wasm.js',
    'tesseract-core-simd-lstm.wasm',
    'tesseract-core-simd-lstm.wasm.js',
    'tesseract-core-lstm.wasm',
    'tesseract-core-lstm.wasm.js',
  ]) {
    await cp(`node_modules/tesseract.js-core/${file}`, `${dest}/core/${file}`);
  }
  console.log(`copied tesseract assets → ${dest}`);
}

await copyAssets();

if (watch) {
  for (const e of entries) {
    const ctx = await context({ ...common, ...e });
    await ctx.watch();
  }
  console.log('watching...');
} else {
  await Promise.all(entries.map((e) => build({ ...common, ...e })));
}
