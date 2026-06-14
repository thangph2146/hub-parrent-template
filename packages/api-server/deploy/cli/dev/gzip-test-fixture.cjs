#!/usr/bin/env node
/**
 * Nén export JSON → src/data-test/fixtures/*.json.gz (dev only, không CI).
 *
 *   node deploy/cli/dev/gzip-test-fixture.cjs path/to/hub-system-export-2026-06-11.json
 */
const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const { PACKAGE_ROOT } = require('../lib/monorepo-root.cjs')

const inputArg = process.argv[2]
const defaultInput = path.join(
  PACKAGE_ROOT,
  'src/data-test/fixtures/hub-system-export-2026-06-11.json',
)
const input = path.resolve(inputArg ?? defaultInput)

if (!fs.existsSync(input)) {
  console.error(`[gzip-test-fixture] Không tìm thấy: ${input}`)
  console.error('  Export từ main API rồi truyền đường dẫn .json làm argv[2].')
  process.exit(1)
}

const base = path.basename(input).replace(/\.json$/i, '')
const out = path.join(PACKAGE_ROOT, 'src/data-test/fixtures', `${base}.json.gz`)

const raw = fs.readFileSync(input)
const gz = zlib.gzipSync(raw, { level: 9 })
fs.writeFileSync(out, gz)

console.log(
  `[gzip-test-fixture] ${(raw.length / 1024 / 1024).toFixed(2)}MB → ${(gz.length / 1024 / 1024).toFixed(2)}MB`,
)
console.log(`[gzip-test-fixture] ${out}`)
