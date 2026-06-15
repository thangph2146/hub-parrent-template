#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const IMPORT =
  "import { toEntityId, toEntityIdList } from '../common/entity-id';\n";
const IMPORT_DEPTH2 =
  "import { toEntityId, toEntityIdList } from '../../common/entity-id';\n";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === 'migrations') continue;
      walk(p, out);
    } else if (p.endsWith('.service.ts') || p.endsWith('.controller.ts')) {
      out.push(p);
    }
  }
  return out;
}

function ensureImport(file, src) {
  if (src.includes('toEntityId')) return src;
  const depth = file.split(path.sep).filter((s) => s === 'src').length;
  const rel = file.includes(`${path.sep}src${path.sep}`)
    ? file.split(`${path.sep}src${path.sep}`)[1]
    : '';
  const levels = rel.split(path.sep).length - 1;
  const imp =
    levels <= 1
      ? "import { toEntityId, toEntityIdList } from '../common/entity-id';\n"
      : `import { toEntityId, toEntityIdList } from '${'../'.repeat(levels)}common/entity-id';\n`;
  const idx = src.indexOf('\n');
  return src.slice(0, idx + 1) + imp + src.slice(idx + 1);
}

function transform(src) {
  let out = src;
  out = out.replace(
    /\.findOne\(([^,()]+),\s*\{\s*id:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\s*\)/g,
    '.findOne($1, toEntityId($2))',
  );
  out = out.replace(
    /\.findOne\(([^,()]+),\s*\{\s*id\s*\}\s*\)/g,
    '.findOne($1, toEntityId(id))',
  );
  out = out.replace(
    /\.getReference\(([^,()]+),\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/g,
    (m, entity, varName) => {
      if (
        [
          'User',
          'Role',
          'Post',
          'Category',
          'Tag',
          'Event',
          'Group',
          'Student',
          'Camera',
          'Session',
          'Notification',
          'ContactRequest',
          'ParentStudent',
          'AdmissionResult',
          'Department',
          'Message',
          'PageContent',
          'SeoMeta',
          'Template',
          'Screen',
          'Comment',
        ].some((e) => entity.includes(e)) ||
        entity.includes('()')
      ) {
        return `.getReference(${entity}, toEntityId(${varName}))`;
      }
      return m;
    },
  );
  out = out.replace(
    /id:\s*\{\s*\$in:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g,
    'id: { $in: toEntityIdList($1) }',
  );
  out = out.replace(
    /\{\s*user:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g,
    (m, v) => {
      if (v === 'user' || v === 'userId') return `{ user: toEntityId(${v}) }`;
      return m;
    },
  );
  return out;
}

let changed = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  const next = transform(src);
  if (next === src) continue;
  src = ensureImport(file, next);
  fs.writeFileSync(file, src);
  changed++;
}
console.log(`Query migration touched ${changed} files`);
