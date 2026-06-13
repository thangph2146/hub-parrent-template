/**
 * Sync check-in packages-first — không copy API từ apps/main.
 *
 * Workflow:
 *   pnpm pull:checkin          (alias packages-first)
 *   pnpm pull:checkin:legacy   (copy main → hub-event, deprecated)
 *
 * Dev logic: sửa packages/api-server + packages/admin-app, generate vào apps/hub-event.
 * Downstream hub-event-monorepo: dùng pnpm pull:template thay vì script này.
 */
const { execSync } = require("node:child_process");

const { ROOT } = require("../lib/paths.cjs");

const run = (cmd, label) => {
  console.log(`\n[sync-checkin-packages] ${label}\n`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

console.log(
  "[sync-checkin-packages] hub-event từ @workspace/api-server + @workspace/admin-app (không sync main)\n",
);

run("pnpm --filter @workspace/api-server run build", "1/7 build @workspace/api-server");
run(
  "node script-system/api/generate-api-modules.cjs apps/hub-event/api --prune",
  "2/7 generate API scaffold (@workspace/api-server)",
);
run(
  "node script-system/verify/verify-checkin-api-modules.mjs",
  "3/7 verify API scaffold",
);
run(
  "node script-system/admin/migrate-admin-modules.cjs",
  "4/7 admin package (rewrite import, không ghi đè module generated)",
);
run("pnpm admin:fix-package", "5/7 chuẩn hóa import package");
run(
  "node script-system/admin/fix-package-post-migrate.cjs",
  "6/7 normalize mutation + lib imports",
);
run(
  "node script-system/admin/generate-admin-routes.cjs apps/hub-event/hub-event-checkin-frontend --prune",
  "7/7 generate route + menu check-in",
);
run(
  "node script-system/verify/verify-checkin-admin-sync.mjs",
  "verify admin check-in",
);

console.log("\n[sync-checkin-packages] Hoàn tất. Test: pnpm dev:checkin");
