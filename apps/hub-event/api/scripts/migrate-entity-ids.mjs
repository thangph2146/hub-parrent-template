#!/usr/node
/**
 * One-off codemod: DTO id fields string → number trong apps/api/src.
 * Chạy: node apps/api/scripts/migrate-entity-ids.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const GLOBS = ['.ts'];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'migrations' || name === 'dist') continue;
      walk(p, out);
    } else if (GLOBS.some((g) => p.endsWith(g.replace('*', '')))) {
      out.push(p);
    }
  }
  return out;
}

const replacements = [
  [/(\bid:\s*)string(\s*;)/g, '$1number$2'],
  [/(\buserId:\s*)string(\s*;)/g, '$1number$2'],
  [/(\broleId:\s*)string(\s*;)/g, '$1number$2'],
  [/(\bparentId:\s*)string(\s*;)/g, '$1number$2'],
  [/(\bauthorId:\s*)string(\s*;)/g, '$1number$2'],
  [/(\bcustomerId:\s*)string(\s*;)/g, '$1number$2'],
  [/(\blinkedEventId:\s*)string(\s*\|\s*null)/g, '$1number$2'],
  [/(\bcheckinCameraId:\s*)string(\s*\|\s*null)/g, '$1number$2'],
  [/(\bcheckoutCameraId:\s*)string(\s*\|\s*null)/g, '$1number$2'],
  [/Array<\{\s*id:\s*string/g, 'Array<{ id: number'],
  [/Promise<\{\s*id:\s*string/g, 'Promise<{ id: number'],
  [/(\|\s*null\s*\}\s*\|\s*null)/g, '$1'], // noop guard
];

let changed = 0;
for (const file of walk(root)) {
  if (file.includes('entity-id.ts')) continue;
  let src = fs.readFileSync(file, 'utf8');
  const orig = src;
  for (const [re, rep] of replacements) {
    src = src.replace(re, rep);
  }
  if (src !== orig) {
    fs.writeFileSync(file, src);
    changed++;
  }
}

console.log(`Updated ${changed} files under ${root}`);
