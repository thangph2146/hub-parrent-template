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

run("node script-system/sync/sync-api-from-main.cjs hub-event", "1/7 API từ main (api.sync-profile.json)");
run("node script-system/verify/verify-api-profile.mjs hub-event", "2/7 verify API profile");
run(
  "node script-system/admin/migrate-admin-modules.cjs",
  "3/7 admin package (rewrite import, không ghi đè module generated)",
);
run("pnpm admin:fix-package", "4/7 chuẩn hóa import package");
run(
  "node script-system/admin/fix-package-post-migrate.cjs",
  "5/7 normalize mutation + lib imports",
);
run(
  "node script-system/admin/generate-admin-routes.cjs apps/hub-event/hub-event-checkin-frontend --prune",
  "6/7 generate route + menu check-in",
);
run(
  "node script-system/verify/verify-checkin-admin-sync.mjs",
  "7/7 verify admin check-in",
);

console.log("\n[sync-checkin] Hoàn tất. Test deploy: pnpm dev:checkin");
