#!/usr/bin/env node
/**
 * Chuẩn hóa apps/main/api/src/common:
 *   pkg/      — (removed) dùng trực tiếp @workspace/api-server/common
 *   admin/    — filter-configs, realtime/
 *   commerce/ — orders/products helpers
 *   infra/    — middleware, interceptor, filter
 *   app/      — dev-login, parse-setting, legacy audit
 *
 * Xóa 17 file shim phẳng; cập nhật import toàn src.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')

const MAIN_COMMON = path.join(ROOT, 'apps/main/api/src/common')
const MAIN_SRC = path.join(ROOT, 'apps/main/api/src')

const PKG_SHIMS = [
  'api-response.ts',
  'entity-id.ts',
  'pagination.ts',
  'date-utils.ts',
  'bulk-actions.ts',
  'apply-column-filters.ts',
  'parse-list-query.ts',
  'parse-column-filters.ts',
  'permissions.decorator.ts',
  'permissions.guard.ts',
  'get-options.ts',
  'resolve-relation-filters.ts',
  'image-processor.ts',
  'fs-unlink-retry.ts',
  'poster-normalize.ts',
  'event-time-status.ts',
  'public.decorator.ts',
]

/** @type {Array<[from: string, to: string]>} */
const MOVES = [
  ['admin-filter-configs.ts', 'admin/filter-configs.ts'],
  ['admin-realtime-broadcast.service.ts', 'admin/realtime/broadcast.service.ts'],
  ['admin-realtime.interceptor.ts', 'admin/realtime/interceptor.ts'],
  ['admin-realtime.util.ts', 'admin/realtime/util.ts'],
  ['cart-types.ts', 'commerce/cart-types.ts'],
  ['gift-rules.ts', 'commerce/gift-rules.ts'],
  ['gift-rules.spec.ts', 'commerce/gift-rules.spec.ts'],
  ['product-types.ts', 'commerce/product-types.ts'],
  ['product-units.ts', 'commerce/product-units.ts'],
  ['product-units.spec.ts', 'commerce/product-units.spec.ts'],
  ['promo-checkout.ts', 'commerce/promo-checkout.ts'],
  ['promo-checkout.spec.ts', 'commerce/promo-checkout.spec.ts'],
  ['unit-pricing.ts', 'commerce/unit-pricing.ts'],
  ['unit-pricing.spec.ts', 'commerce/unit-pricing.spec.ts'],
  ['api-access.middleware.ts', 'infra/api-access.middleware.ts'],
  ['database-http-exception.filter.ts', 'infra/database-http-exception.filter.ts'],
  ['logging.interceptor.ts', 'infra/logging.interceptor.ts'],
  ['request-id.middleware.ts', 'infra/request-id.middleware.ts'],
  ['dev-login-options.ts', 'app/dev-login-options.ts'],
  ['legacy-audit-timestamps.ts', 'app/legacy-audit-timestamps.ts'],
  ['parse-setting-value.ts', 'app/parse-setting-value.ts'],
]

const IMPORT_REPLACEMENTS = [
  // pkg → workspace package
  [/from '\.\.\/common\/api-response'/g, "from '@workspace/api-server/common'"],
  [/from '\.\/common\/api-response'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/entity-id'/g, "from '@workspace/api-server/common'"],
  [/from '\.\/common\/entity-id'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/pagination'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/date-utils'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/bulk-actions'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/apply-column-filters'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/parse-list-query'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/parse-column-filters'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/permissions\.decorator'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/permissions\.guard'/g, "from '@workspace/api-server/common'"],
  [/from '\.\/common\/permissions\.guard'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/get-options'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/resolve-relation-filters'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/image-processor'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/fs-unlink-retry'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/poster-normalize'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/event-time-status'/g, "from '@workspace/api-server/common'"],
  [/from '\.\.\/common\/public\.decorator'/g, "from '@workspace/api-server/common'"],
  // admin
  [/from '\.\.\/common\/admin-filter-configs'/g, "from '../common/admin/filter-configs'"],
  [
    /from '\.\.\/common\/admin-realtime-broadcast\.service'/g,
    "from '../common/admin/realtime/broadcast.service'",
  ],
  [
    /from '\.\.\/common\/admin-realtime\.interceptor'/g,
    "from '../common/admin/realtime/interceptor'",
  ],
  // commerce
  [/from '\.\.\/common\/cart-types'/g, "from '../common/commerce/cart-types'"],
  [/from '\.\.\/common\/gift-rules'/g, "from '../common/commerce/gift-rules'"],
  [/from '\.\.\/common\/product-types'/g, "from '../common/commerce/product-types'"],
  [/from '\.\.\/common\/product-units'/g, "from '../common/commerce/product-units'"],
  [/from '\.\.\/common\/promo-checkout'/g, "from '../common/commerce/promo-checkout'"],
  [/from '\.\.\/common\/unit-pricing'/g, "from '../common/commerce/unit-pricing'"],
  // infra
  [/from '\.\/common\/logging\.interceptor'/g, "from './common/infra/logging.interceptor'"],
  [
    /from '\.\/common\/database-http-exception\.filter'/g,
    "from './common/infra/database-http-exception.filter'",
  ],
  [/from '\.\/common\/request-id\.middleware'/g, "from './common/infra/request-id.middleware'"],
  [/from '\.\/common\/api-access\.middleware'/g, "from './common/infra/api-access.middleware'"],
  // app
  [/from '\.\.\/common\/dev-login-options'/g, "from '../common/app/dev-login-options'"],
  [/from '\.\.\/common\/parse-setting-value'/g, "from '../common/app/parse-setting-value'"],
  [/from '\.\.\/common\/legacy-audit-timestamps'/g, "from '../common/app/legacy-audit-timestamps'"],
]

const DEPTH_FIXES = [
  {
    file: 'admin/realtime/broadcast.service.ts',
    replacements: [
      ["from '../socket/socket.types'", "from '../../../socket/socket.types'"],
      ["from '../../../socket/socket.gateway'", "from '../../../socket/socket.gateway'"],
    ],
  },
  {
    file: 'admin/realtime/interceptor.ts',
    replacements: [
      ["from '../socket/socket.gateway'", "from '../../../socket/socket.gateway'"],
      ["from './admin-realtime.util'", "from './util'"],
    ],
  },
  {
    file: 'admin/filter-configs.ts',
    replacements: [
      [
        "import type { AdminColumnFiltersConfig } from './apply-column-filters';",
        "import type { AdminColumnFiltersConfig } from '@workspace/api-server/common';",
      ],
    ],
  },
  {
    file: 'infra/database-http-exception.filter.ts',
    replacements: [
      ["from './api-response'", "from '@workspace/api-server/common'"],
    ],
  },
  {
    file: 'infra/api-access.middleware.ts',
    replacements: [["from '../config/", "from '../../config/"]],
  },
  {
    file: 'infra/logging.interceptor.ts',
    replacements: [["from '../config/", "from '../../config/"]],
  },
  {
    file: 'app/dev-login-options.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/gift-rules.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/gift-rules.spec.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/product-units.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/product-units.spec.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/promo-checkout.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
  {
    file: 'commerce/promo-checkout.spec.ts',
    replacements: [["from '../entities/", "from '../../entities/"]],
  },
]

const INTERNAL_FIXES = DEPTH_FIXES

const BARRELS = {
  'index.ts': `/** Main API common — pkg utilities + app-specific modules. */
export * from '@workspace/api-server/common';
export * from './admin';
export * from './commerce';
export * from './infra';
export * from './app';
`,
  'admin/index.ts': `export * from './filter-configs';
export * from './realtime';
`,
  'admin/realtime/index.ts': `export * from './broadcast.service';
export * from './interceptor';
export * from './util';
`,
  'commerce/index.ts': `export * from './cart-types';
export * from './gift-rules';
export * from './product-types';
export * from './product-units';
export * from './promo-checkout';
export * from './unit-pricing';
`,
  'infra/index.ts': `export * from './api-access.middleware';
export * from './database-http-exception.filter';
export * from './logging.interceptor';
export * from './request-id.middleware';
`,
  'app/index.ts': `export * from './dev-login-options';
export * from './legacy-audit-timestamps';
export * from './parse-setting-value';
`,
}

function walkTs(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name)
    const st = fs.statSync(abs)
    if (st.isDirectory()) {
      if (name === 'node_modules') continue
      walkTs(abs, out)
    } else if (name.endsWith('.ts')) {
      out.push(abs)
    }
  }
  return out
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function main() {
  const dryRun = process.argv.includes('--dry-run')

  for (const dir of ['admin/realtime', 'admin', 'commerce', 'infra', 'app']) {
    const abs = path.join(MAIN_COMMON, dir)
    if (!dryRun) fs.mkdirSync(abs, { recursive: true })
  }

  for (const [from, to] of MOVES) {
    const src = path.join(MAIN_COMMON, from)
    const dest = path.join(MAIN_COMMON, to)
    if (!fs.existsSync(src)) {
      console.warn(`[skip move] missing ${from}`)
      continue
    }
    if (dryRun) {
      console.log(`[dry-run move] ${from} → ${to}`)
    } else {
      ensureDirFor(dest)
      fs.renameSync(src, dest)
      console.log(`[move] ${from} → ${to}`)
    }
  }

  for (const shim of PKG_SHIMS) {
    const abs = path.join(MAIN_COMMON, shim)
    if (!fs.existsSync(abs)) continue
    if (dryRun) console.log(`[dry-run delete] ${shim}`)
    else {
      fs.unlinkSync(abs)
      console.log(`[delete] ${shim}`)
    }
  }

  for (const [rel, content] of Object.entries(BARRELS)) {
    const abs = path.join(MAIN_COMMON, rel)
    if (dryRun) console.log(`[dry-run write] ${rel}`)
    else {
      ensureDirFor(abs)
      fs.writeFileSync(abs, content)
      console.log(`[write] ${rel}`)
    }
  }

  for (const { file, replacements } of INTERNAL_FIXES) {
    const abs = path.join(MAIN_COMMON, file)
    if (!fs.existsSync(abs)) continue
    let text = fs.readFileSync(abs, 'utf8')
    for (const [from, to] of replacements) {
      text = text.replace(from, to)
    }
    if (!dryRun) fs.writeFileSync(abs, text)
    console.log(`[fix] ${file}`)
  }

  const files = walkTs(MAIN_SRC)
  let updated = 0
  for (const abs of files) {
    if (abs.startsWith(MAIN_COMMON)) continue
    let text = fs.readFileSync(abs, 'utf8')
    const before = text
    for (const [pattern, replacement] of IMPORT_REPLACEMENTS) {
      text = text.replace(pattern, replacement)
    }
    if (text !== before) {
      if (!dryRun) fs.writeFileSync(abs, text)
      updated++
      console.log(`[import] ${path.relative(MAIN_SRC, abs)}`)
    }
  }

  console.log(`Done — ${updated} importer file(s)${dryRun ? ' (dry-run)' : ''}.`)
}

main()
