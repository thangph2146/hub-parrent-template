/**
 * Pull/sync check-in từ main → hub-event (API subset + admin pages).
 *
 * Workflow dev: sửa apps/main, push; trên máy deploy hoặc trước release check-in:
 *   pnpm pull:checkin   (alias)
 *   pnpm sync:checkin
 *
 * Không thay git pull — chạy SAU git pull khi cần cập nhật hub-event từ main.
 */
const { execSync } = require("node:child_process");
const path = require("node:path");

const { ROOT } = require("../lib/paths.cjs");
const run = (cmd, label) => {
  console.log(`\n[sync-checkin] ${label}\n`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

console.log("[sync-checkin] main → hub-event (API profile + admin modules)\n");

run("node script-system/sync/sync-api-from-main.cjs hub-event", "1/3 API từ main (api.sync-profile.json)");
run("node script-system/verify/verify-api-profile.mjs hub-event", "2/3 verify API profile");
run(
  "node script-system/sync/copy-checkin-admin-modules.cjs",
  "3/3 admin pages + menu tree + verify (gọi trong script copy)",
);

console.log("\n[sync-checkin] Hoàn tất. Test deploy: pnpm dev:checkin");
