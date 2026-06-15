#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === 'migrations') continue;
      walk(p, out);
    } else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

function relImport(file) {
  const rel = path.relative(path.dirname(file), path.join(srcRoot, 'common', 'entity-id.ts'));
  return rel.replace(/\\/g, '/').replace(/\.ts$/, '');
}

let fixed = 0;
for (const file of walk(srcRoot)) {
  if (file.endsWith('entity-id.ts')) continue;
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('toEntityId') && !src.includes('toEntityIdList')) continue;
  if (src.includes('common/entity-id')) continue;
  const imp = `import { toEntityId, toEntityIdList } from '${relImport(file)}';\n`;
  const m = src.match(/^import .+;\n/m);
  if (m) {
    src = src.replace(m[0], m[0] + imp);
  } else {
    src = imp + src;
  }
  fs.writeFileSync(file, src);
  fixed++;
}
console.log(`Added imports to ${fixed} files`);
