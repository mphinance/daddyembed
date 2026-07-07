#!/usr/bin/env node
// Build DaddyEmbed's two shippable artifacts:
//   1. dist/daddyembed.js  — the vanilla UMD <script> bundle. Inlines the SDK
//      (so a blogger drops one tag and it just works). Sets window.DaddyEmbed
//      and auto-mounts any <script data-widget> / [data-daddyembed] on the page.
//   2. dist/index.js + .cjs — the ESM/CJS React package (@traderdaddy/embed).
//      react + @traderdaddy/sdk stay external (listed as deps/peers).
//
// Until @traderdaddy/sdk is on npm, both resolve it from the sibling checkout so
// esbuild can bundle its TS source directly. --watch keeps rebuilding.

import { context, build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const WATCH = new Set(process.argv.slice(2)).has('--watch');

// Sibling SDK source — swap the alias for the published package once it's on npm.
const SDK = join(ROOT, '..', 'traderdaddy-sdk', 'src');
const sdkAlias = {
  '@traderdaddy/sdk/mock': join(SDK, 'mock', 'index.ts'),
  '@traderdaddy/sdk': join(SDK, 'index.ts'),
};

const common = {
  bundle: true,
  target: 'es2022',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.css': 'text' },
  logLevel: 'info',
  sourcemap: WATCH ? 'inline' : false,
  minify: !WATCH,
};

// 1) Vanilla UMD bundle — SDK inlined, self-mounting.
const umd = {
  ...common,
  entryPoints: { daddyembed: join(ROOT, 'src/umd.ts') },
  outdir: OUT,
  format: 'iife',
  alias: sdkAlias,
};

// 2) React package — SDK + react external.
const reactEsm = {
  ...common,
  entryPoints: { index: join(ROOT, 'src/index.tsx') },
  outdir: OUT,
  format: 'esm',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@traderdaddy/sdk'],
};
const reactCjs = {
  ...reactEsm,
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
};

async function copyDemo() {
  if (existsSync(join(ROOT, 'demo'))) {
    await cp(join(ROOT, 'demo'), join(OUT, 'demo'), { recursive: true });
  }
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  if (WATCH) {
    for (const opts of [umd, reactEsm, reactCjs]) {
      const ctx = await context(opts);
      await ctx.watch();
    }
    await copyDemo();
    console.log('[build] watching → dist/');
  } else {
    await Promise.all([build(umd), build(reactEsm), build(reactCjs)]);
    await copyDemo();
    console.log('[build] done → dist/ (daddyembed.js + index.js/.cjs)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
