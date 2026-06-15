/**
 * Tạo cấu trúc STORAGE_DIR chuẩn (uploads + cache).
 *
 * Usage:
 *   pnpm storage:init              # @api (main)
 *   pnpm storage:init:checkin      # @hub-event/api
 *   node script-system/db/init-storage-dirs.cjs store-sync
 *   node script-system/db/init-storage-dirs.cjs --dir D:/HUB/data/custom
 */
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, PRODUCT_LINES } = require("../lib/monorepo-root.cjs");
const {
  STORAGE_UPLOAD_SUBDIRS,
  STORAGE_DIR_BY_LINE,
} = require('../lib/layout/storage-layout.cjs');

const arg = process.argv[2];
const dirFlag = process.argv.indexOf('--dir');
const explicitDir =
  dirFlag >= 0 ? process.argv[dirFlag + 1]?.trim() : null;

/** @param {string} token */
function resolvePackage(token) {
  if (!token || token.startsWith('--')) return PRODUCT_LINES.main?.api?.package;
  if (token.startsWith('@')) return token;
  const line = PRODUCT_LINES[token];
  if (line?.api?.package) return line.api.package;
  console.error(`[storage:init] không tìm thấy API package cho: ${token}`);
  process.exit(1);
}

/** @param {string} pkg */
function resolveApiRoot(pkg) {
  for (const [key, line] of Object.entries(PRODUCT_LINES)) {
    if (line.api?.package === pkg) {
      return { apiRoot: path.join(ROOT, line.api.path), lineKey: key };
    }
  }
  console.error(`[storage:init] không map được thư mục API: ${pkg}`);
  process.exit(1);
}

/** @param {string} apiRoot */
function readStorageDirFromEnv(apiRoot) {
  const envPath = path.join(apiRoot, '.env');
  if (!fs.existsSync(envPath)) return '';
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^STORAGE_DIR\s*=\s*(.+)$/);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return process.env.STORAGE_DIR?.trim() || '';
}

const pkg = resolvePackage(arg);
const { apiRoot, lineKey } = resolveApiRoot(pkg);

let storageDir = explicitDir || readStorageDirFromEnv(apiRoot);
if (!storageDir) {
  storageDir = STORAGE_DIR_BY_LINE[lineKey] || STORAGE_DIR_BY_LINE.main;
  console.warn(
    `[storage:init] chưa có STORAGE_DIR trong ${path.relative(ROOT, apiRoot)}/.env — dùng mặc định ${storageDir}`,
  );
}

const base = path.isAbsolute(storageDir)
  ? storageDir
  : path.resolve(apiRoot, storageDir);

console.log(`[storage:init] ${pkg} → ${base}`);

let created = 0;
for (const rel of STORAGE_UPLOAD_SUBDIRS) {
  const abs = path.join(base, rel);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(abs, { recursive: true });
    created += 1;
    console.log(`  + ${rel}`);
  }
}

console.log(
  `[storage:init] xong — ${STORAGE_UPLOAD_SUBDIRS.length} path chuẩn (${created} mới tạo)`,
);
