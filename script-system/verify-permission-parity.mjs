/**
 * Kiểm tra parity giữa `apps/api/src/config/permissions.ts` (server) và
 * `packages/api-client/src/permissions.ts` (client UI). Mục tiêu: source of
 * truth = server (enforce), client mirror — phát hiện drift sớm.
 *
 * Chạy: pnpm verify:permissions
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const API_PERMS_PATH = join(root, "apps/api/src/config/permissions.ts");
const CLIENT_PERMS_PATH = join(
  root,
  "packages/api-client/src/permissions.ts",
);

if (!existsSync(API_PERMS_PATH)) {
  console.error(`[verify-permission-parity] Missing: ${API_PERMS_PATH}`);
  process.exit(1);
}
if (!existsSync(CLIENT_PERMS_PATH)) {
  console.error(
    `[verify-permission-parity] Missing: ${CLIENT_PERMS_PATH}`,
  );
  process.exit(1);
}

const apiSrc = readFileSync(API_PERMS_PATH, "utf8");
const clientSrc = readFileSync(CLIENT_PERMS_PATH, "utf8");

/**
 * Trích tất cả string permission code xuất hiện trong `apps/api/.../permissions.ts`.
 * Hai dạng:
 *   1. Resource + actions: `\`${RESOURCES.X}:${ACTIONS.Y}\`` hoặc trong
 *      `generateResourcePermissions()` helper (loop qua tất cả actions).
 *   2. Literal: `\`x:y\`` trực tiếp (legacy: import {PERMISSIONS}).
 */
function extractApiCodes(source) {
  const codes = new Set();

  const resourceMap = parseNamedStringObject(source, "RESOURCES");
  const actionMap = parseNamedStringObject(source, "ACTIONS");

  const tplRe = /`([^`]*\$\{(?:RESOURCES|ACTIONS)\.[A-Z][A-Z0-9_]*\}[^`]*)`/g;
  for (const m of source.matchAll(tplRe)) {
    const expanded = m[1].replace(
      /\$\{(RESOURCES|ACTIONS)\.([A-Z][A-Z0-9_]*)\}/g,
      (_, kind, name) =>
        kind === "RESOURCES"
          ? (resourceMap.get(name) ?? `{RES:${name}}`)
          : (actionMap.get(name) ?? `{ACT:${name}}`),
    );
    if (/^[a-z][a-z0-9_]*:[a-z][a-z0-9_-]*$/.test(expanded)) {
      codes.add(expanded);
    }
  }

  const genRe =
    /\.\.\.generateResourcePermissions\(\s*RESOURCES\.([A-Z][A-Z0-9_]*)\s*\)/g;
  const stdActions = ["view", "create", "update", "delete", "manage", "export"];
  for (const m of source.matchAll(genRe)) {
    const resource = resourceMap.get(m[1]);
    if (!resource) continue;
    for (const action of stdActions) {
      codes.add(`${resource}:${action}`);
    }
  }

  const literalRe = /[`'"]([a-z][a-z0-9_]*):([a-z][a-z0-9_-]*)[`'"]/g;
  for (const m of source.matchAll(literalRe)) {
    if (!m[1].startsWith("RESOURCES") && !m[1].startsWith("ACTIONS")) {
      codes.add(`${m[1]}:${m[2]}`);
    }
  }

  return codes;
}

/**
 * Trích `CONST = { A: "x", B: "y" }` → Map<A→x, B→y>.
 * Lấy block object đầu tiên có tên `name` (vd: "RESOURCES", "ACTIONS").
 */
function parseNamedStringObject(source, name) {
  const map = new Map();
  const re = new RegExp(
    `(?:export\\s+)?const\\s+${name}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as\\s+const`,
    "m",
  );
  const m = re.exec(source);
  if (!m) return map;
  const body = m[1];
  const entryRe = /^\s*([A-Z][A-Z0-9_]*)\s*:\s*['"]([^'"]+)['"]/gm;
  for (const e of body.matchAll(entryRe)) {
    map.set(e[1], e[2]);
  }
  return map;
}

/**
 * Trích tất cả string permission code từ `PERMISSION_CODES` object — dạng
 * `KEY: "x:y"` (string literal, có dấu `:` đúng 1 lần).
 */
function extractClientCodes(source) {
  const codes = new Set();
  const re = /^\s*[A-Z][A-Z0-9_]*:\s*[`'"]([a-z][a-z0-9_]*):([a-z][a-z0-9_-]*)[`'"]/gm;
  for (const m of source.matchAll(re)) {
    codes.add(`${m[1]}:${m[2]}`);
  }
  // Legacy dot-notation keys (vd: `users.cart_own`).
  const legacyRe = /^\s*[A-Z][A-Z0-9_]*:\s*[`'"]([a-z][a-z0-9_]*)\.([a-z][a-z0-9_]+)[`'"]/gm;
  for (const m of source.matchAll(legacyRe)) {
    codes.add(`${m[1]}.${m[2]}`);
  }
  return codes;
}

const apiCodes = extractApiCodes(apiSrc);
const clientCodes = extractClientCodes(clientSrc);

const onlyInApi = [...apiCodes].filter((c) => !clientCodes.has(c));
const onlyInClient = [...clientCodes].filter(
  (c) => !apiCodes.has(c) && !c.includes("."),
);

const legacyOnly = [...clientCodes].filter((c) => c.includes("."));

const isClean = onlyInApi.length === 0 && onlyInClient.length === 0;

console.log(
  `[verify-permission-parity] API codes: ${apiCodes.size} · Client codes: ${clientCodes.size} · Legacy dot-notation: ${legacyOnly.length}`,
);

if (onlyInApi.length > 0) {
  console.error(
    `\n[verify-permission-parity] Có ${onlyInApi.length} code có trong API nhưng THIẾU ở client PERMISSION_CODES (sẽ khiến UI không gate được action, hoặc typecheck fail):`,
  );
  for (const c of [...onlyInApi].sort()) {
    console.error(`  - ${c}`);
  }
}

if (onlyInClient.length > 0) {
  console.error(
    `\n[verify-permission-parity] Có ${onlyInClient.length} code có trong client PERMISSION_CODES nhưng KHÔNG tồn tại trong API (typecheck sẽ fail khi dùng làm @Permissions arg):`,
  );
  for (const c of [...onlyInClient].sort()) {
    console.error(`  - ${c}`);
  }
}

if (legacyOnly.length > 0) {
  console.warn(
    `\n[verify-permission-parity] Có ${legacyOnly.length} legacy dot-notation key (không có trong API catalog, chỉ để tương thích DB cũ):`,
  );
  for (const c of legacyOnly) {
    console.warn(`  - ${c}`);
  }
}

if (!isClean) {
  console.error(
    `\n[verify-permission-parity] FAIL — parity check không đạt. Cập nhật cả 2 file cho khớp.`,
  );
  process.exit(1);
}

console.log(
  `[verify-permission-parity] OK — parity giữa API và client PERMISSION_CODES khớp hoàn toàn.`,
);
