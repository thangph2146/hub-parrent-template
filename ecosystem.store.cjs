/**
 * PM2 compo 3 — store sync
 * apps/api (:3002) + apps/backend (:3001) + apps/store-sync-frontend (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start:store
 *   pnpm pm2:reload:store
 *   pnpm pm2:restart:store
 *   pm2 start ecosystem.store.cjs
 *
 * Từng app:
 *   pm2 start ecosystem.store.cjs --only hub-store-api
 *   pm2 start ecosystem.store.cjs --only hub-store-backend
 *   pm2 start ecosystem.store.cjs --only hub-store-frontend
 *
 * Lưu ý: không chạy đồng thời với ecosystem.main.cjs / ecosystem.checkin.cjs (trùng port 3000–3002).
 */
const { createStoreStack } = require("./ecosystem.shared.cjs")

module.exports = {
  apps: createStoreStack(),
}
