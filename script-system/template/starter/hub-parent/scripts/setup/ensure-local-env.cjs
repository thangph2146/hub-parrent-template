/**
 * Tạo .env local từ .env.example (clone GitHub — file .env không được commit).
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");

const TARGETS = [
  "apps/hub-parent/api",
  "apps/hub-parent/hub-parent-frontend",
];

function ensureEnv(appRel) {
  const dir = path.join(ROOT, appRel);
  const example = path.join(dir, ".env.example");
  const dest = path.join(dir, ".env");
  if (!fs.existsSync(example)) return;
  if (fs.existsSync(dest)) return;
  fs.copyFileSync(example, dest);
  console.log(`[setup] tạo ${appRel}/.env từ .env.example`);
}

for (const rel of TARGETS) {
  ensureEnv(rel);
}
