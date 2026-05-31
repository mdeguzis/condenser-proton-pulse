#!/usr/bin/env node
/**
 * Standalone production build for a condenser plugin.
 * Produces dist/frontend.js (ESM) and dist/backend.cjs (CJS).
 *
 * condenser:api, react, and react/jsx-runtime are resolved to the shims
 * bundled in this repo so the output is self-contained.
 */
import { build } from 'esbuild';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

mkdirSync(path.join(root, 'dist'), { recursive: true });

const shimAlias = {
  'condenser:api':      path.join(root, 'shims/condenser-api.ts'),
  'react':              path.join(root, 'shims/react.ts'),
  'react/jsx-runtime':  path.join(root, 'shims/react-jsx.ts'),
  'react/jsx-dev-runtime': path.join(root, 'shims/react-jsx.ts'),
};

await build({
  entryPoints: [path.join(root, 'frontend.tsx')],
  bundle: true,
  format: 'esm',
  target: 'esnext',
  outfile: path.join(root, 'dist/frontend.js'),
  alias: shimAlias,
});

await build({
  entryPoints: [path.join(root, 'backend.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: path.join(root, 'dist/backend.cjs'),
});

console.log('Build complete: dist/frontend.js + dist/backend.cjs');
