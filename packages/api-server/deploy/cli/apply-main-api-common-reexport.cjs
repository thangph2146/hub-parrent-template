#!/usr/bin/env node
/**
 * Thay file common trùng packages/api-server bằng re-export mỏng (layout phẳng).
 * Sau khi chạy `pnpm main-api:common:structure`, script này không còn cần — pkg import trực tiếp.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')

const MAIN_COMMON = path.join(ROOT, 'apps/main/api/src/common')

/** File re-export toàn bộ barrel package common. */
const REEXPORT_ALL = [
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
]

const REEXPORT_PUBLIC = `/** @see packages/api-server/src/common/permissions.guard */
export { IS_PUBLIC_KEY, Public } from '@workspace/api-server/common';
`

const REEXPORT_TEMPLATE = (file) => `/** @see packages/api-server/src/common/${file.replace(/\\.ts$/, '')} */
export * from '@workspace/api-server/common';
`

function main() {
  const dryRun = process.argv.includes('--dry-run')
  let updated = 0

  for (const file of REEXPORT_ALL) {
    const abs = path.join(MAIN_COMMON, file)
    if (!fs.existsSync(abs)) {
      console.warn(`[skip] missing ${file}`)
      continue
    }
    const next = REEXPORT_TEMPLATE(file)
    const prev = fs.readFileSync(abs, 'utf8')
    if (prev === next) continue
    if (dryRun) {
      console.log(`[dry-run] ${file}`)
    } else {
      fs.writeFileSync(abs, next)
      console.log(`[write] ${file}`)
    }
    updated++
  }

  const publicPath = path.join(MAIN_COMMON, 'public.decorator.ts')
  if (fs.existsSync(publicPath)) {
    const prev = fs.readFileSync(publicPath, 'utf8')
    if (prev !== REEXPORT_PUBLIC) {
      if (dryRun) console.log('[dry-run] public.decorator.ts')
      else {
        fs.writeFileSync(publicPath, REEXPORT_PUBLIC)
        console.log('[write] public.decorator.ts')
      }
      updated++
    }
  }

  console.log(`Done — ${updated} file(s)${dryRun ? ' (dry-run)' : ''}.`)
}

main()
