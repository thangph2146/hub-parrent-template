/**
 * @deprecated Thay bằng `pnpm pull:checkin` (API + migrate + admin:generate:checkin).
 * Giữ file để script/bookmark cũ báo lỗi rõ ràng thay vì copy lại module.
 */
const { ROOT } = require("../../lib/monorepo-root.cjs");

console.error(
  [
    "[copy-checkin-admin] DEPRECATED — không còn copy module từ main/backend.",
    "",
    "Dùng:",
    "  pnpm pull:checkin          # API + migrate package + generate routes",
    "  pnpm admin:generate:checkin",
    "  pnpm verify:checkin-admin",
    "",
    `ROOT: ${ROOT}`,
  ].join("\n"),
);

process.exit(1);
