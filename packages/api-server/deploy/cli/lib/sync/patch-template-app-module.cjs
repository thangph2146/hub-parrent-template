/**
 * Sau copy main → nest: PermissionsGuard template cần AuthService (pkg dùng token DI).
 * main/api inject AuthService trực tiếp — patch app.module cho deploy line.
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')

function patchTemplateAppModule(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const filePath = path.join(destRoot, 'src/app.module.ts')
  if (!fs.existsSync(filePath)) return false

  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
  if (/useFactory:\s*\(reflector:\s*Reflector,\s*authService:\s*AuthService\)/.test(content)) {
    return false
  }

  if (!content.includes("PermissionsGuard")) {
    log.warn('sync:app-module', 'skip — không tìm thấy PermissionsGuard import')
    return false
  }

  if (!content.includes("from '@nestjs/core'")) {
    content = content.replace(
      "import { Module } from '@nestjs/common';",
      "import { Module } from '@nestjs/common';\nimport { Reflector } from '@nestjs/core';",
    )
  } else if (!content.includes('Reflector')) {
    content = content.replace(
      "import { APP_GUARD } from '@nestjs/core';",
      "import { APP_GUARD, Reflector } from '@nestjs/core';",
    )
  }

  if (!content.includes("from './auth/auth.service'")) {
    content = content.replace(
      /import \{ PermissionsGuard \} from '\.\/common(?:\/permissions\.guard)?';/,
      "import { PermissionsGuard } from './common';\nimport { AuthService } from './auth/auth.service';",
    )
  }

  const replaced = content.replace(
    /\{\s*provide:\s*APP_GUARD,\s*useClass:\s*PermissionsGuard,\s*\},/,
    `{
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, authService: AuthService) =>
        new PermissionsGuard(reflector, authService),
      inject: [Reflector, AuthService],
    },`,
  )

  if (replaced === content) {
    log.warn('sync:app-module', 'skip — không tìm thấy PermissionsGuard APP_GUARD provider')
    return false
  }

  fs.writeFileSync(filePath, replaced, 'utf8')
  log.step('sync:app-module', 'patched src/app.module.ts — PermissionsGuard + AuthService factory')
  return true
}

module.exports = { patchTemplateAppModule }
