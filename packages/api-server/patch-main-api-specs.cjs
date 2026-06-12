/**
 * Script chuyển đổi string IDs sang number IDs trong apps/main/api spec files.
 *
 * Lý do: apps/main/api concrete services (AcademicYearsService, ...) dùng
 * toEntityId() yêu cầu number, throw BadRequestException với string '1'.
 * Cần dùng 1 (number) thay vì '1' (string).
 */
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', '..', 'apps', 'main', 'api', 'src');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const orig = content;

  // Replace .getById('1') → .getById(1)
  content = content.replace(/\.getById\('1'\)/g, '.getById(1)');
  // Replace .getById('99999') → .getById(99999)
  content = content.replace(/\.getById\('99999'\)/g, '.getById(99999)');
  // Replace .softDelete('1') → .softDelete(1)
  content = content.replace(/\.softDelete\('1'\)/g, '.softDelete(1)');
  content = content.replace(/\.softDelete\('99999'\)/g, '.softDelete(99999)');
  // Replace .restore('1') → .restore(1)
  content = content.replace(/\.restore\('1'\)/g, '.restore(1)');
  content = content.replace(/\.restore\('99999'\)/g, '.restore(99999)');
  // Replace .hardDelete('1') → .hardDelete(1)
  content = content.replace(/\.hardDelete\('1'\)/g, '.hardDelete(1)');
  content = content.replace(/\.hardDelete\('99999'\)/g, '.hardDelete(99999)');
  // Replace .bulk('xxx', ['1']) → .bulk('xxx', [1])
  content = content.replace(/\.bulk\('delete', \['1'\]\)/g, ".bulk('delete', [1])");
  content = content.replace(/\.bulk\('restore', \['1'\]\)/g, ".bulk('restore', [1])");
  content = content.replace(/\.bulk\('hard-delete', \['1'\]\)/g, ".bulk('hard-delete', [1])");
  content = content.replace(/\.bulk\('invalid-action', \['1'\]\)/g, ".bulk('invalid-action', [1])");
  // Replace type signatures: (id: string) → (id: number), ids: string[] → ids: number[]
  content = content.replace(/\(id: string\)/g, '(id: number)');
  content = content.replace(/ids: string\[\]/g, 'ids: number[]');

  if (content !== orig) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let patched = 0;
  for (const f of files) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      patched += walkDir(p);
    } else if (f.endsWith('.spec.ts')) {
      if (patchFile(p)) patched++;
    }
  }
  return patched;
}

const patched = walkDir(BASE);
console.log(`Patched ${patched} files.`);
