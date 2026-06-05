/**
 * PM2 mặc định — alias của stack site chính.
 *
 * Site chính (@frontend + @backend + @api):
 *   pm2 start ecosystem.config.cjs
 *   pm2 start ecosystem.main.cjs
 *
 * Check-in (@hub-event-checkin-frontend + @backend + @api):
 *   pm2 start ecosystem.checkin.cjs
 *
 * Chạy riêng một app (ví dụ chỉ API):
 *   pm2 start ecosystem.main.cjs --only hub-main-api
 */
module.exports = require("./ecosystem.main.cjs")
