import { build, context } from 'esbuild';
import { cp } from 'node:fs/promises';

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
  { entryPoints: ['src/annotations.ts'], outfile: 'dist/annotations.js' },
  { entryPoints: ['src/fullpage.ts'], outfile: 'dist/fullpage.js' },
  { entryPoints: ['src/popup.ts'], outfile: 'dist/popup.js' },
];

async function copyAssets() {
  await cp('src/popup.html', 'dist/popup.html');
  console.log('copied popup.html → dist/popup.html');
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
