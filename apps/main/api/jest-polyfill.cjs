/**
 * Polyfill script: Thêm method `clearMocksOnScope` vào Jest ModuleMocker.
 *
 * Vấn đề:
 *   - `apps/main/api` dùng `jest@^30.0.0` + `ts-jest@^29.2.5`
 *   - `jest-runtime@30.4.2` ở dòng 3784 gọi: `this._moduleMocker.clearMocksOnScope()`
 *   - Method này CHỈ có ở `jest-mock@30.5.0+`, không có ở `jest-mock@29.x` mà ts-jest@29 sử dụng
 *   - Lỗi: `TypeError: this._moduleMocker.clearMocksOnScope is not a function`
 *
 * Cách fix tạm:
 *   1. Patch prototype của ModuleMocker để có method này (no-op)
 *   2. Đăng ký qua `globalSetup` của jest
 *
 * Fix chính thức cần:
 *   - Upgrade `ts-jest` lên `^30.0.0` (đang chờ release)
 *   - HOẶC downgrade `jest` xuống `^29.7.0`
 */
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const candidates = [
    'node_modules/jest-mock',
    '../node_modules/jest-mock',
    '../../node_modules/jest-mock',
    '../../../node_modules/jest-mock',
  ];

  let mockPath = null;
  for (const c of candidates) {
    const p = path.resolve(c);
    if (fs.existsSync(p)) {
      mockPath = p;
      break;
    }
  }

  if (!mockPath) {
    // Tìm trong pnpm
    const pnpm = path.resolve('../../node_modules/.pnpm');
    if (fs.existsSync(pnpm)) {
      const dirs = fs.readdirSync(pnpm).filter((d) => d.startsWith('jest-mock@'));
      for (const d of dirs) {
        const m = path.join(pnpm, d, 'node_modules', 'jest-mock');
        if (fs.existsSync(m)) {
          mockPath = m;
          break;
        }
      }
    }
  }

  if (mockPath) {
    try {
      const mod = require(mockPath);
      if (mod.ModuleMocker && !mod.ModuleMocker.prototype.clearMocksOnScope) {
        mod.ModuleMocker.prototype.clearMocksOnScope = function () {
          // no-op polyfill
        };
        console.log(`[polyfill] Patched clearMocksOnScope on ${mockPath}`);
      } else if (mod.default && !mod.default.prototype.clearMocksOnScope) {
        mod.default.prototype.clearMocksOnScope = function () {};
        console.log(`[polyfill] Patched clearMocksOnScope (default export) on ${mockPath}`);
      } else {
        console.log(`[polyfill] clearMocksOnScope already exists on ${mockPath}`);
      }
    } catch (e) {
      console.error(`[polyfill] Failed to patch: ${e.message}`);
    }
  } else {
    console.warn('[polyfill] jest-mock not found, skipping patch');
  }
};
