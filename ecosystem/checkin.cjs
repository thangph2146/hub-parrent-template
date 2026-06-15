/**
 * PM2 compo 2 — check-in sự kiện
 * hub-event API (:3002) + check-in frontend (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start:checkin
 *   pm2 start ecosystem/checkin.cjs
 *
 * Lưu ý: không chạy đồng thời với ecosystem/main (trùng port 3000–3002).
 */
const { createCheckinStack } = require("./shared.cjs");

module.exports = {
  apps: createCheckinStack(),
};
