/**
 * Bootstrap DB trống cho API deploy line (store-sync, hub-checkin, …).
 *
 * DB mới không có schema legacy → `migration:up` fail ở migration đổi tên bảng cũ.
 * Luồng an toàn: schema:create (entities hiện tại) → seed → đánh dấu migrations đã chạy.
 *
 * Usage:
 *   node script-system/db/bootstrap-fresh-api.cjs @store-sync/api
 *   node script-system/db/bootstrap-fresh-api.cjs store-sync
 *   pnpm db:bootstrap:store
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { ROOT, PRODUCT_LINES } = require("../lib/monorepo-root.cjs");

const arg = process.argv[2];
if (!arg) {
  console.error(
    "[db:bootstrap] thiếu target — ví dụ: @store-sync/api | store-sync",
  );
  process.exit(1);
}

/** @param {string} token */
function resolvePackage(token) {
  if (token.startsWith("@")) return token;
  const line = PRODUCT_LINES[token];
  if (line?.api?.package) return line.api.package;
  console.error(`[db:bootstrap] không tìm thấy API package cho: ${token}`);
  process.exit(1);
}

/** @param {string} pkg */
function resolveApiRoot(pkg) {
  for (const line of Object.values(PRODUCT_LINES)) {
    if (line.api?.package === pkg) {
      return path.join(ROOT, line.api.path);
    }
  }
  if (pkg === PRODUCT_LINES.main?.api?.package) {
    return path.join(ROOT, PRODUCT_LINES.main.api.path);
  }
  console.error(`[db:bootstrap] không map được thư mục API: ${pkg}`);
  process.exit(1);
}

/** @param {string} apiRoot @param {string} scriptBody @param {{ inherit?: boolean }} [opts] */
function runTempScript(apiRoot, scriptBody, opts = {}) {
  const scriptPath = path.join(apiRoot, ".bootstrap-temp.cjs");
  fs.writeFileSync(scriptPath, scriptBody, "utf8");
  try {
    return execSync("node .bootstrap-temp.cjs", {
      cwd: apiRoot,
      encoding: "utf8",
      stdio: opts.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    })?.trim?.() ?? "";
  } finally {
    fs.rmSync(scriptPath, { force: true });
  }
}

const pkg = resolvePackage(arg);
const apiRoot = resolveApiRoot(pkg);

const run = (label, cmd) => {
  console.log(`\n[db:bootstrap] ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

/** @returns {number} */
function countExistingTables() {
  try {
    const out = runTempScript(
      apiRoot,
      `
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('module');
const req = createRequire(path.join(${JSON.stringify(apiRoot)}, 'package.json'));
const { MikroORM, EntityCaseNamingStrategy } = req('@mikro-orm/core');
const { MySqlDriver } = req('@mikro-orm/mysql');
const { PostgreSqlDriver } = req('@mikro-orm/postgresql');
const { SqliteDriver } = req('@mikro-orm/sqlite');

function loadDatabaseUrl() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL || '';
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\\r?\\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^DATABASE_URL\\s*=\\s*(.+)$/);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return process.env.DATABASE_URL || '';
}

function driver(url) {
  if (url.startsWith('postgres')) return PostgreSqlDriver;
  if (url.startsWith('sqlite')) return SqliteDriver;
  return MySqlDriver;
}

(async () => {
  const url = loadDatabaseUrl();
  const schema = url.startsWith('mysql') || url.startsWith('postgres')
    ? decodeURIComponent(new URL(url).pathname.replace(/^\\//, ''))
    : 'main';
  const orm = await MikroORM.init({
    driver: driver(url),
    clientUrl: url,
    entities: [],
    discovery: { disableDynamicFileAccess: true, warnWhenNoEntities: false },
    namingStrategy: EntityCaseNamingStrategy,
  });
  try {
    const conn = orm.em.getConnection();
    const rows = await conn.execute(
      "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'",
      [schema],
    );
    const count = Number(rows?.[0]?.c ?? 0);
    process.stdout.write('TABLE_COUNT:' + (Number.isFinite(count) ? count : 0));
  } finally {
    await orm.close(true);
  }
})().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
`,
    );
    const match = out.match(/TABLE_COUNT:(\d+)/);
    const count = match ? Number.parseInt(match[1], 10) : 0;
    return Number.isFinite(count) ? count : 0;
  } catch (err) {
    console.error("[db:bootstrap] không đọc được schema:", err?.message || err);
    process.exit(1);
  }
}

const tableCount = countExistingTables();
if (tableCount > 0) {
  console.log(
    `[db:bootstrap] schema đã có (${tableCount} bảng) — bỏ qua schema:create`,
  );
} else {
  run(`schema:create — ${pkg}`, `pnpm --filter ${pkg} run db:create`);
}

run(`seed — ${pkg}`, `pnpm --filter ${pkg} run db:seed`);

const migrationsDir = path.join(apiRoot, "src", "migrations");
if (!fs.existsSync(migrationsDir)) {
  console.log("[db:bootstrap] không có src/migrations — bỏ qua stamp");
  process.exit(0);
}

const names = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => path.basename(f, ".ts"))
  .sort();

if (!names.length) {
  console.log("[db:bootstrap] không có migration — xong");
  process.exit(0);
}

console.log("\n[db:bootstrap] stamp migrations");
runTempScript(
  apiRoot,
  `
const { config } = require('dotenv');
const { MikroORM, EntityCaseNamingStrategy } = require('@mikro-orm/core');
const { MySqlDriver } = require('@mikro-orm/mysql');
const { PostgreSqlDriver } = require('@mikro-orm/postgresql');
const { SqliteDriver } = require('@mikro-orm/sqlite');

config({ path: '.env' });

const names = ${JSON.stringify(names)};

function driver() {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('postgres')) return PostgreSqlDriver;
  if (url.startsWith('sqlite')) return SqliteDriver;
  return MySqlDriver;
}

(async () => {
  const orm = await MikroORM.init({
    driver: driver(),
    clientUrl: process.env.DATABASE_URL,
    entities: [],
    discovery: { disableDynamicFileAccess: true, warnWhenNoEntities: false },
    namingStrategy: EntityCaseNamingStrategy,
    migrations: { tableName: 'mikro_orm_migrations' },
  });
  try {
    const conn = orm.em.getConnection();
    let stamped = 0;
    let skipped = 0;
    for (const name of names) {
      const rows = await conn.execute(
        'select 1 from mikro_orm_migrations where name = ? limit 1',
        [name],
      );
      if (rows?.length) {
        skipped += 1;
        continue;
      }
      await conn.execute(
        'insert into mikro_orm_migrations (name, executed_at) values (?, ?)',
        [name, new Date()],
      );
      stamped += 1;
      console.log('[db:bootstrap] stamped', name);
    }
    if (skipped && !stamped) {
      console.log('[db:bootstrap] migrations đã stamp trước đó (' + skipped + ')');
    }
  } finally {
    await orm.close(true);
  }
})().catch((err) => {
  console.error('[db:bootstrap] stamp failed:', err?.message || err);
  process.exit(1);
});
`,
  { inherit: true },
);

const devHint =
  arg === "store-sync" || pkg === "@store-sync/api"
    ? "pnpm dev:store"
    : arg === "hub-checkin" || pkg === "@hub-checkin/api"
      ? "pnpm dev:checkin"
      : arg === "hub-parent" || pkg === "@hub-parent/api"
        ? "pnpm dev:main"
        : `pnpm --filter ${pkg} run dev`;

console.log(`\n[db:bootstrap] xong — có thể chạy ${devHint}`);
console.log(
  '[db:bootstrap] gợi ý: pnpm storage:init (STORAGE_DIR) · db:demo cần data/seed/full-export-*.json',
);
