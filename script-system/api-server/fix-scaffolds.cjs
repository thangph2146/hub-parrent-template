/**
 * Script: fix file names + content cho tất cả module scaffolds.
 *
 * Vấn đề: rename-files.cjs đã tạo file names sai (mất dấu gạch ngang).
 * Fix: rename files + cập nhật content với PascalCase class names đúng.
 *
 * Cú pháp: `node script-system/api-server/fix-scaffolds.cjs`
 */
const fs = require('node:fs');
const path = require('node:path');

const MODULES_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'packages',
  'api-server',
  'src',
  'modules',
);

const SKIP_FOLDERS = new Set(['users', 'posts', 'categories', 'comments']);

// Folder name (kebab-case) -> singular PascalCase
function singularPascal(folderName) {
  // 'academic-years' -> 'AcademicYear'
  // 'event-checkins' -> 'EventCheckin'
  // 'accounts' -> 'Account'
  // 'categories' -> 'Category'
  const singular = folderName.replace(/s$/, '').replace(/ie$/, 'y');
  // Ngoại lệ: categories -> Category, companies -> Company
  return singular
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function pluralPascal(singular) {
  if (singular.endsWith('y') && !/[aeiou]y$/.test(singular)) {
    return singular.slice(0, -1) + 'ies';
  }
  return singular + 's';
}

function singularKebab(pluralKebab) {
  return pluralKebab.replace(/s$/, '').replace(/ie$/, 'y');
}

function step1_renameFiles() {
  console.log('=== Step 1: Rename files to proper kebab-case ===');
  const folders = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const folder of folders) {
    if (SKIP_FOLDERS.has(folder)) continue;
    const dir = path.join(MODULES_DIR, folder);
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const m = file.match(/^([a-z]+(?:[a-z]+)*)\.(service|controller|module|types|spec)\.ts$/);
      if (!m) continue;
      const badName = m[1];
      const role = m[2];
      const expected = `${singularKebab(folder)}.${role}.ts`;
      if (file === expected) continue;
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, expected);
      if (fs.existsSync(newPath)) {
        console.log(`[!] Target ${expected} exists in ${folder}, skip`);
        continue;
      }
      fs.renameSync(oldPath, newPath);
      console.log(`[F] ${folder}/${file} -> ${expected}`);
    }
  }
}

function step2_updateContent() {
  console.log('\n=== Step 2: Update file content (class names) ===');
  const folders = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const folder of folders) {
    if (SKIP_FOLDERS.has(folder)) continue;
    const dir = path.join(MODULES_DIR, folder);
    const singular = singularPascal(folder);
    const plural = pluralPascal(singular);
    // singular: 'Account', plural: 'Accounts'
    // singular: 'Category', plural: 'Categories'
    // singular: 'AcademicYear', plural: 'AcademicYears'

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      // Pattern thay thế: <Singular>RowDto, <Singular>CreateData, ...
      // Dùng word boundary để chỉ thay exact match
      const re = new RegExp(`\\b${singular}\\b`, 'g');
      content = content.replace(re, plural);

      // @ApiTags('Accountses') -> @ApiTags('Accounts') (fix double-s)
      content = content.replace(new RegExp(`'${plural}'s'`, 'g'), `'${plural}'`);

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[U] ${folder}/${file}`);
      }
    }
  }
}

function main() {
  step1_renameFiles();
  step2_updateContent();
  console.log('\nDone.');
}

main();
