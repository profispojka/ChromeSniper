import { build, context } from 'esbuild';
import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const prod = process.argv.includes('--prod');
const pkg = process.argv.includes('--package');

const common = {
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  platform: 'browser',
  sourcemap: prod ? false : 'linked',
  minify: prod,
  drop: prod ? ['console', 'debugger'] : [],
  legalComments: 'none',
  logLevel: 'info',
};

const entries = [
  { entryPoints: ['src/content.ts'], outfile: 'dist/content.js' },
  { entryPoints: ['src/background.ts'], outfile: 'dist/background.js' },
  { entryPoints: ['src/annotations.ts'], outfile: 'dist/annotations.js' },
  { entryPoints: ['src/fullpage.ts'], outfile: 'dist/fullpage.js' },
  { entryPoints: ['src/historyModal.ts'], outfile: 'dist/historyModal.js' },
  { entryPoints: ['src/popup.ts'], outfile: 'dist/popup.js' },
];

async function copyAssets() {
  await cp('src/popup.html', 'dist/popup.html');
  console.log('copied popup.html → dist/popup.html');
}

async function cleanDist() {
  if (existsSync('dist')) await rm('dist', { recursive: true });
  await mkdir('dist', { recursive: true });
}

async function packageZip() {
  const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
  const version = manifest.version;
  const outDir = 'release';
  const stageDir = join(outDir, 'snipper');
  const zipName = `snipper-${version}.zip`;
  const zipPath = join(outDir, zipName);

  if (existsSync(outDir)) await rm(outDir, { recursive: true });
  await mkdir(stageDir, { recursive: true });

  await cp('manifest.json', join(stageDir, 'manifest.json'));
  await cp('lib', join(stageDir, 'lib'), { recursive: true });

  await mkdir(join(stageDir, 'dist'), { recursive: true });
  for (const file of await readdir('dist')) {
    if (file.endsWith('.map')) continue;
    await cp(join('dist', file), join(stageDir, 'dist', file));
  }

  await mkdir(join(stageDir, 'icons'), { recursive: true });
  for (const size of [16, 32, 48, 128]) {
    await cp(`icons/icon-${size}.png`, join(stageDir, 'icons', `icon-${size}.png`));
  }

  execFileSync('zip', ['-r', '-q', zipName, 'snipper'], { cwd: resolve(outDir) });
  await rm(stageDir, { recursive: true });

  console.log(`packaged → ${zipPath}`);
}

if (watch) {
  await copyAssets();
  for (const e of entries) {
    const ctx = await context({ ...common, ...e });
    await ctx.watch();
  }
  console.log('watching...');
} else {
  if (prod) await cleanDist();
  await copyAssets();
  await Promise.all(entries.map((e) => build({ ...common, ...e })));
  if (pkg) await packageZip();
}
