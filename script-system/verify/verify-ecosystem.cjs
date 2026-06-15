#!/usr/bin/env node
/**
 * Kiểm tra layout ecosystem/ — không còn file PM2 rải ở repo root.
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../lib/monorepo-root.cjs");

const ECOSYSTEM_DIR = path.join(ROOT, "ecosystem");

const REQUIRED = [
  "shared.cjs",
  "main.cjs",
  "checkin.cjs",
  "store.cjs",
  "config.cjs",
  "pm2-stack.cjs",
  "README.md",
];

/** @type {string[]} */
const errors = [];

function fail(msg) {
  errors.push(msg);
}

for (const file of REQUIRED) {
  if (!fs.existsSync(path.join(ECOSYSTEM_DIR, file))) {
    fail(`Thiếu ecosystem/${file}`);
  }
}

for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (entry.name.startsWith("ecosystem.") && entry.name.endsWith(".cjs")) {
    fail(
      `File PM2 rải ở root: ${entry.name} — chỉ dùng ecosystem/*.cjs (xóa shim root)`,
    );
  }
}

try {
  const { createParentStack, createCheckinStack, createStoreStack } = require(
    path.join(ECOSYSTEM_DIR, "shared.cjs"),
  );
  if (createParentStack().length !== 3) {
    fail("createParentStack() phải trả 3 app");
  }
  if (createCheckinStack().length !== 2) {
    fail("createCheckinStack() phải trả 2 app");
  }
  if (createStoreStack().length !== 2) {
    fail("createStoreStack() phải trả 2 app");
  }
} catch (error) {
  fail(`Không load ecosystem/shared.cjs: ${error.message}`);
}

if (errors.length) {
  console.error(
    `verify:ecosystem FAIL — ${errors.length} lỗi:\n` +
      errors.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  "verify:ecosystem OK — mọi file PM2 trong ecosystem/; root không còn ecosystem.*.cjs",
);
