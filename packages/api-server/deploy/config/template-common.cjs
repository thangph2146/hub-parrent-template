/**
 * Helper Nest chỉ dùng trên template deploy (import entity/socket/config app).
 * Nguồn vend từ apps/main/api — không đặt trong packages/api-server/src/common.
 */
const path = require('node:path')
const { PACKAGE_ROOT } = require('../cli/lib/monorepo-root.cjs')

const TEMPLATE_COMMON_DIR = path.join(PACKAGE_ROOT, 'deploy', 'template-common')

const TEMPLATE_INFRA_FILES = [
  // Nest infra (middleware, interceptor, filter, realtime)
  'admin-realtime-broadcast.service.ts',
  'admin-realtime.interceptor.ts',
  'admin-realtime.util.ts',
  'api-access.middleware.ts',
  'database-http-exception.filter.ts',
  'logging.interceptor.ts',
  'public.decorator.ts',
  'request-id.middleware.ts',
  // Commerce helpers (products/orders/carts trên check-in API)
  'cart-types.ts',
  'gift-rules.ts',
  'product-types.ts',
  'product-units.ts',
  'promo-checkout.ts',
  'unit-pricing.ts',
]

module.exports = { TEMPLATE_COMMON_DIR, TEMPLATE_INFRA_FILES }
