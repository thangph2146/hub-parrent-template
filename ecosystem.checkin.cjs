/**
 * PM2 — stack check-in sự kiện
 * @hub-event-checkin-frontend :3000 | @backend :3001 | @api :3002
 *
 * Cả stack:
 *   pm2 start ecosystem.checkin.cjs
 *
 * Từng app:
 *   pm2 start ecosystem.checkin.cjs --only hub-checkin-api
 *   pm2 start ecosystem.checkin.cjs --only hub-checkin-backend
 *   pm2 start ecosystem.checkin.cjs --only hub-checkin-frontend
 *
 * Lưu ý: không chạy đồng thời với ecosystem.main.cjs (trùng port 3000–3002).
 */
const { createCheckinStack } = require("./ecosystem.shared.cjs")

module.exports = {
  apps: createCheckinStack(),
}
