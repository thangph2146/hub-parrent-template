/**
 * PM2 compo 3 — store sync
 * store-sync API (:3002) + storefront (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start:store
 *   pm2 start ecosystem/store.cjs
 *
 * Lưu ý: không chạy đồng thời với ecosystem/main hoặc ecosystem/checkin (trùng port).
 */
const { createStoreStack } = require("./shared.cjs");

module.exports = {
  apps: createStoreStack(),
};
