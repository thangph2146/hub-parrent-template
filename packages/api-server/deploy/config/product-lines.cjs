/**
 * Product line API target paths — dùng bởi render/sync trong @workspace/api-server.
 * Downstream tự sở hữu apps/; template chỉ render vào các target này.
 */
const PRODUCT_LINES = {
  main: {
    api: { path: 'apps/main/api', package: '@api', port: 3002 },
  },
  'hub-parent': {
    api: { path: 'apps/hub-parent/api', package: '@hub-parent/api', port: 3002 },
  },
  'hub-checkin': {
    api: { path: 'apps/hub-checkin/api', package: '@hub-checkin/api', port: 3002 },
  },
  'store-sync': {
    api: { path: 'apps/store-sync/api', package: '@store-sync/api', port: 3002 },
  },
}

const MAIN_API_PATH = PRODUCT_LINES.main.api.path

module.exports = { PRODUCT_LINES, MAIN_API_PATH }
