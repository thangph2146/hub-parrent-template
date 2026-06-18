/**
 * @deprecated Dùng verify-render-api.mjs — giữ alias check-in.
 */
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { PACKAGE_ROOT } = require('../lib/monorepo-root.cjs')
const script = path.join(PACKAGE_ROOT, 'deploy/cli/verify/verify-render-api.mjs')
execSync(`node ${script} apps/hub-checkin/api`, { stdio: 'inherit' })
