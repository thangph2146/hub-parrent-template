/**
 * PM2 compo 2 — check-in sự kiện
 * apps/hub-event/api (:3002) + apps/hub-event/hub-event-checkin-frontend (:3000)
 *
 * Cả stack:
 *   pnpm pm2:start:checkin
 *   pnpm pm2:reload:checkin
 *   pnpm pm2:restart:checkin
 *   pm2 start ecosystem.checkin.cjs
 *
 * Từng app:
 *   pm2 start ecosystem.checkin.cjs --only hub-checkin-api
 *   pm2 start ecosystem.checkin.cjs --only hub-checkin-frontend
 *
 * Lưu ý: không chạy đồng thời với ecosystem.main.cjs (trùng port 3000–3002).
 */
const { createCheckinStack } = require("./ecosystem.shared.cjs")

module.exports = {
  apps: createCheckinStack(),
}
