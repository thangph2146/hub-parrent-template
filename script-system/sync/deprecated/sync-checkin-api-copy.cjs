/**
 * @deprecated Legacy — copy API từ apps/main → hub-event.
 * Dùng `pnpm pull:checkin` (packages-first) hoặc downstream `pnpm pull:template`.
 *
 *   pnpm pull:checkin:legacy
 */
const { execSync } = require("node:child_process");

const { ROOT } = require("../../lib/monorepo-root.cjs");

const run = (cmd, label) => {
  console.log(`\n[sync-checkin] ${label}\n`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

console.log("[sync-checkin] main → hub-event (API profile + admin modules)\n");

run(
  "pnpm --filter @workspace/api-server run build",
  "0/8 build @workspace/api-server (trước generate)",
);
run(
  "node script-system/sync/sync-api-from-main.cjs hub-event",
  "1/8 API từ main (api.sync-profile.json) — LEGACY",
);
run(
  "node script-system/verify/verify-api-profile.cjs hub-event",
  "2/7 verify API profile",
);
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
  "node script-system/verify/verify-checkin-admin-sync.cjs",
  "7/8 verify admin check-in",
);
run(
  "pnpm --filter @workspace/api-server run verify:checkin-api",
  "8/8 verify API template",
);

console.log("\n[sync-checkin] Hoàn tất. Test deploy: pnpm dev:checkin");
