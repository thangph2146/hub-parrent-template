#!/usr/bin/env node
/**
 * Kiểm tra layout scripts/pm2 — product-owned PM2 (hub-checkin).
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")

const PM2_DIR = path.join(ROOT, "scripts", "pm2")
const REQUIRED = ["apps.cjs", "stack.cjs"]

/** @type {string[]} */
const errors = []

function fail(msg) {
  errors.push(msg)
}

for (const file of REQUIRED) {
  if (!fs.existsSync(path.join(PM2_DIR, file))) {
    fail(`Thiếu scripts/pm2/${file}`)
  }
}

if (fs.existsSync(path.join(ROOT, "ecosystem"))) {
  fail("Thư mục ecosystem/ legacy — dùng scripts/pm2/")
}

try {
  const { createStack, PROCESS_NAMES } = require(path.join(PM2_DIR, "apps.cjs"))
  if (createStack().length !== 2) {
    fail("createStack() phải trả 2 app (api + frontend)")
  }
  if (PROCESS_NAMES.length !== 2) {
    fail("PROCESS_NAMES phải có 2 entry")
  }
} catch (error) {
  fail(`Không load scripts/pm2/apps.cjs: ${error.message}`)
}

if (errors.length) {
  console.error(
    `verify:pm2 FAIL — ${errors.length} lỗi:\n` +
      errors.map((e) => `  - ${e}`).join("\n"),
  )
  process.exit(1)
}

console.log("verify:pm2 OK — scripts/pm2/apps.cjs + stack.cjs")
