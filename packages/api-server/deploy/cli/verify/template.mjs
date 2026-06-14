/**
 * Verify deploy/nest template — NestJS OOP.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { PACKAGE_ROOT } = require('../lib/monorepo-root.cjs')
const { listTemplateModuleIds, resolveTemplateRoot } = require('../../config/template.config.cjs')

const templateRoot = resolveTemplateRoot()
const errors = []
const warnings = []

const fail = (msg) => errors.push(msg)
const warn = (msg) => warnings.push(msg)

if (!fs.existsSync(path.join(templateRoot, 'src', 'main.ts'))) {
  fail('Thiếu deploy/nest/src/main.ts — chạy pnpm api:sync-template')
}

for (const rel of ['nest-cli.json', 'mikro-orm.config.ts', 'package.json', 'TEMPLATE.meta.json']) {
  if (!fs.existsSync(path.join(templateRoot, rel))) fail(`Thiếu deploy/nest/${rel}`)
}

if (fs.existsSync(path.join(templateRoot, '.graphify'))) {
  fail('deploy/nest/.graphify không được commit')
}

const pkg = JSON.parse(fs.readFileSync(path.join(templateRoot, 'package.json'), 'utf8'))
if (pkg.name !== '@workspace/api-server/template') {
  warn(`template package name="${pkg.name}" — expected @workspace/api-server/template`)
}

for (const dir of ['common', 'common/crud', 'common/module-bases', 'common/module-types', 'config', 'entities', 'mikro-orm']) {
  if (!fs.existsSync(path.join(templateRoot, 'src', dir))) fail(`Thiếu deploy/nest/src/${dir}/`)
}

const moduleIds = listTemplateModuleIds(templateRoot)
const OPTIONAL_NO_CONTROLLER = new Set(['public', 'socket'])
const OPTIONAL_NO_SERVICE = new Set(['proxy-image', 'socket', 'messages'])

let modulesChecked = 0
for (const moduleId of moduleIds) {
  modulesChecked++
  const moduleDir = path.join(templateRoot, 'src', moduleId)
  const files = fs.readdirSync(moduleDir)
  if (!files.some((f) => f.endsWith('.module.ts'))) fail(`src/${moduleId}/ thiếu *.module.ts`)
  if (!files.some((f) => f.endsWith('.service.ts')) && !OPTIONAL_NO_SERVICE.has(moduleId)) {
    warn(`src/${moduleId}/ không có *.service.ts`)
  }
  if (!files.some((f) => f.endsWith('.controller.ts')) && !OPTIONAL_NO_CONTROLLER.has(moduleId)) {
    warn(`src/${moduleId}/ không có *.controller.ts`)
  }
}

for (const rel of ['auth/auth.service.ts', 'system/system.service.ts', 'seed-full-export.ts']) {
  const abs = path.join(templateRoot, 'src', rel)
  if (fs.existsSync(abs) && fs.readFileSync(abs, 'utf8').includes('@workspace/api-server/modules/')) {
    warn(`${rel} còn binding legacy @workspace/api-server/modules/*`)
  }
}

const { CONTRACT_SPECS } = require('../lib/sync/sync-contract-specs.cjs')
for (const entry of CONTRACT_SPECS) {
  const abs = path.join(templateRoot, 'src', entry.to)
  if (!fs.existsSync(abs)) {
    fail(`Thiếu contract spec src/${entry.to} — chạy pnpm api:sync-template`)
  }
}
const fixtureGz = path.join(templateRoot, 'src/data-test/fixtures')
if (!fs.existsSync(fixtureGz) || !fs.readdirSync(fixtureGz).some((f) => /\.json\.gz$/i.test(f))) {
  fail('Thiếu src/data-test/fixtures/*.json.gz — chạy pnpm api:sync-template')
}

let moduleSpecCount = 0
for (const moduleId of moduleIds) {
  if (['common', 'config', 'data-test', 'entities', 'migrations', 'seeds', 'seeders', 'mikro-orm', 'scripts'].includes(moduleId)) {
    continue
  }
  const dir = path.join(templateRoot, 'src', moduleId)
  moduleSpecCount += fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.service.spec.ts')).length
}
if (moduleSpecCount < 40) {
  fail(`Thiếu module service spec (có ${moduleSpecCount}, cần ≥40) — chạy pnpm api:sync-template`)
}

if (warnings.length) {
  console.warn('[verify:template] WARN:\n' + warnings.map((w) => `  - ${w}`).join('\n'))
}
if (errors.length) {
  console.error('[verify:template] FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

console.log(`[verify:template] OK — ${modulesChecked} module NestJS OOP (@ ${PACKAGE_ROOT})`)
