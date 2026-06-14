/**
 * Báo cáo trạng thái binding extends Base* sau api:render.
 * Usage: node deploy/cli/report-module-bindings.cjs [appApiRoot]
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/monorepo-root.cjs')
const { getPackageBaseModules } = require('../../config/package-module-bindings.cjs')
const {
  getPackageModuleTemplates,
  SKIP_THIN_MODULE_IDS,
  listThinMaterializeModuleIds,
} = require('../../config/package-module-templates.cjs')

const appRoot = path.resolve(ROOT, process.argv[2] ?? 'apps/hub-event/api')
const srcRoot = path.join(appRoot, 'src')

function listModuleDirs() {
  if (!fs.existsSync(srcRoot)) return []
  return fs
    .readdirSync(srcRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !['migrations', 'mikro-orm', 'entities', 'common', 'config'].includes(name))
    .sort()
}

function classifyModule(moduleId) {
  const servicePath = path.join(srcRoot, moduleId, `${moduleId}.service.ts`)
  const controllerPath = path.join(srcRoot, moduleId, `${moduleId}.controller.ts`)
  if (!fs.existsSync(servicePath)) return { kind: 'no-service', extendsBase: false }

  const svc = fs.readFileSync(servicePath, 'utf8')
  const pkg = getPackageBaseModules()[moduleId]
  const template = getPackageModuleTemplates().byModuleId[moduleId]
  const extendsMatch = svc.match(/extends\s+(Base\w+)/)
  const extendsBase = Boolean(extendsMatch)
  const baseClass = extendsMatch?.[1] ?? null

  let kind = 'mirror'
  if (SKIP_THIN_MODULE_IDS.has(moduleId)) kind = 'skip-thin'
  else if (template?.materialize === 'thin' && pkg) kind = 'thin'
  else if (svc.includes('extends BaseStandardAdminCrudService')) kind = 'crud-legacy'
  else if (extendsBase) kind = 'extends-other'

  return {
    kind,
    extendsBase,
    baseClass,
    expectedBase: pkg?.baseServiceClass ?? template?.primary?.service?.className ?? null,
    hasController: fs.existsSync(controllerPath),
  }
}

function main() {
  const modules = listModuleDirs()
  const rows = modules.map((id) => ({ moduleId: id, ...classifyModule(id) }))
  const thin = rows.filter((r) => r.kind === 'thin')
  const skip = rows.filter((r) => r.kind === 'skip-thin')
  const mirror = rows.filter((r) => r.kind === 'mirror')
  const legacy = rows.filter((r) => r.kind === 'crud-legacy')
  const mismatch = thin.filter((r) => r.expectedBase && r.baseClass !== r.expectedBase)

  const lines = [
    `# Báo cáo module binding — ${path.relative(ROOT, appRoot)}`,
    '',
    `Thời điểm: ${new Date().toISOString()}`,
    '',
    '## Tổng quan',
    '',
    `| Loại | Số module |`,
    `|------|-----------|`,
    `| **thin** (extends Base* package) | ${thin.length} |`,
    `| **skip-thin** (mirror — multi-service / phức tạp) | ${skip.length} |`,
    `| **mirror** (copy main, chưa thin) | ${mirror.length} |`,
    `| **crud-legacy** (BaseStandardAdminCrudService) | ${legacy.length} |`,
    `| Tổng module app | ${rows.length} |`,
    '',
    `Package template ref: ${Object.keys(getPackageModuleTemplates().byModuleId).length} module`,
    `Active module-bases (thin): ${listThinMaterializeModuleIds().length} module`,
    '',
    '## Module thin (extends Base*)',
    '',
    ...thin.map(
      (r) =>
        `- \`${r.moduleId}\` → \`${r.baseClass}\`${r.baseClass === r.expectedBase ? '' : ` (expected ${r.expectedBase})`}`,
    ),
    '',
    '## Module skip-thin (giữ mirror)',
    '',
    ...skip.map((r) => `- \`${r.moduleId}\``),
    '',
    '## Module mirror khác',
    '',
    ...(mirror.length ? mirror.map((r) => `- \`${r.moduleId}\``) : ['- _(không)_']),
    '',
  ]

  if (mismatch.length) {
    lines.push('## Cảnh báo mismatch', '', ...mismatch.map((r) => `- ${r.moduleId}`), '')
  }

  const report = lines.join('\n')
  console.log(report)

  const outPath = path.join(appRoot, 'MODULE_BINDING_REPORT.md')
  fs.writeFileSync(outPath, `${report}\n`, 'utf8')
  console.log(`\n[report] → ${path.relative(ROOT, outPath)}`)
}

main()
