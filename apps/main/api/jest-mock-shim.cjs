/**
 * Shim for jest-mock - thêm method `clearMocksOnScope` (no-op).
 *
 * jest-runtime@30.4.2 ở dòng 3784 gọi: `this._moduleMocker.clearMocksOnScope()`
 * Method này chỉ có ở jest-mock@30.5+, không có ở jest-mock@29 (mà ts-jest@29 dùng).
 *
 * File này patch prototype bằng cách tìm ModuleMocker class và thêm method.
 */
let mod;
try {
  mod = require('jest-mock');
} catch (e) {
  // Try resolving from pnpm structure
  const path = require('path');
  const fs = require('fs');
  const pnpmDirs = fs.readdirSync(path.resolve(__dirname, '../../node_modules/.pnpm'))
    .filter((d) => d.startsWith('jest-mock@') && d.includes('29'));
  for (const d of pnpmDirs) {
    const p = path.resolve(__dirname, '../../node_modules/.pnpm', d, 'node_modules', 'jest-mock');
    if (fs.existsSync(p)) {
      mod = require(p);
      break;
    }
  }
}

if (mod && mod.ModuleMocker && !mod.ModuleMocker.prototype.clearMocksOnScope) {
  mod.ModuleMocker.prototype.clearMocksOnScope = function () {
    // no-op polyfill
  };
}

module.exports = mod;
