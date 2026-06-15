/**
 * pull:checkin — packages-first (không copy API legacy từ main).
 *
 * Native API hub-event đã commit → chỉ verify + admin migrate/generate.
 * Regenerate API: pnpm api:regenerate:checkin
 *
 * Usage:
 *   pnpm pull:checkin
 *   node script-system/sync/sync-checkin-packages.cjs
 */
const { ROOT } = require("../lib/monorepo-root.cjs");
const { runStep } = require("../lib/run-step.cjs");

const PREFIX = "pull:checkin";

console.log(`[${PREFIX}] verify + admin (native hub-event/api — không sync-api legacy)\n`);

runStep(
  ROOT,
  "pnpm --filter @workspace/api-server run build",
  "1/7 build @workspace/api-server",
  PREFIX,
);
runStep(
  ROOT,
  "node script-system/verify/verify-api-profile.cjs hub-event",
  "2/7 verify API profile",
  PREFIX,
);
runStep(
  ROOT,
  "node script-system/admin/migrate-admin-modules.cjs",
  "3/7 admin package migrate",
  PREFIX,
);
runStep(ROOT, "pnpm admin:fix-package", "4/7 chuẩn hóa import package", PREFIX);
runStep(
  ROOT,
  "node script-system/admin/fix-package-post-migrate.cjs",
  "5/7 normalize mutation + lib imports",
  PREFIX,
);
runStep(
  ROOT,
  "node script-system/admin/generate-admin-routes.cjs apps/hub-event/hub-event-checkin-frontend --prune",
  "6/7 generate route + menu check-in",
  PREFIX,
);
runStep(
  ROOT,
  "node script-system/verify/verify-checkin-admin-sync.cjs",
  "7/7 verify admin check-in",
  PREFIX,
);
runStep(
  ROOT,
  "pnpm --filter @workspace/api-server run verify:checkin-api",
  "verify API template (checkin)",
  PREFIX,
);

console.log(`\n[${PREFIX}] xong — test: pnpm dev:checkin · regenerate API: pnpm api:regenerate:checkin`);
