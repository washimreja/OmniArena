// build.mjs — esbuild bundler for OmniArena Extension
// Each content script and the background worker must be separate bundles.
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const entryPoints = [
  { in: 'src/background.ts',                    out: 'background' },
  { in: 'src/bridge-content.ts',                out: 'bridge-content' },
  { in: 'src/platforms/chatgpt/content.ts',     out: 'content-chatgpt' },
  { in: 'src/platforms/gemini/content.ts',      out: 'content-gemini' },
  { in: 'src/platforms/claude/content.ts',      out: 'content-claude' },
  { in: 'src/platforms/grok/content.ts',        out: 'content-grok' },
  { in: 'src/platforms/deepseek/content.ts',    out: 'content-deepseek' },
];

const buildOptions = {
  entryPoints,
  bundle: true,
  outdir: 'dist',
  format: /** @type {const} */ ('iife'),
  platform: /** @type {const} */ ('browser'),
  target: 'chrome120',
  sourcemap: isWatch,
  logLevel: /** @type {const} */ ('info'),
};

// Copy static files to dist
function copyStatics() {
  if (!existsSync('dist')) mkdirSync('dist');
  if (!existsSync('dist/icons')) mkdirSync('dist/icons');
  copyFileSync('manifest.json', 'dist/manifest.json');
  if (existsSync('popup.html')) copyFileSync('popup.html', 'dist/popup.html');
  // Icons (placeholder — copy if they exist)
  for (const size of [16, 48, 128]) {
    const src = `icons/icon${size}.png`;
    if (existsSync(src)) copyFileSync(src, `dist/icons/icon${size}.png`);
  }
}

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  copyStatics();
  console.log('👀 Watching for changes… (dist/ is updated on save)');
} else {
  await esbuild.build(buildOptions);
  copyStatics();
  console.log('✅ OmniArena Extension built → dist/');
  console.log('   Load in Chrome: chrome://extensions → Load unpacked → select dist/');
}
