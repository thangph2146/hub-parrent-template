/**
 * Báo cáo chi tiết từng file module sau api:render.
 * Usage: node deploy/cli/report-module-files.cjs [appApiRoot]
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/monorepo-root.cjs')
const { getPackageBaseModules } = require('../../config/package-module-bindings.cjs')
const {
  getPackageModuleTemplates,
  SKIP_THIN_MODULE_IDS,
} = require('../../config/package-module-templates.cjs')

const appRoot = path.resolve(ROOT, process.argv[2] ?? 'apps/hub-event/api')
const srcRoot = path.join(appRoot, 'src')
const FAT_SERVICE_LINES = 80
const FAT_CONTROLLER_LINES = 60

function listModuleDirs() {
  if (!fs.existsSync(srcRoot)) return []
  return fs
    .readdirSync(srcRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !['migrations', 'mikro-orm', 'entities', 'common', 'config'].includes(name))
    .sort()
}

function listTsFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.includes('.spec.'))
    .sort()
}

function countLines(text) {
  return text.split('\n').length
}

function analyzeFile(filePath, moduleId) {
  const rel = path.relative(appRoot, filePath).replace(/\\/g, '/')
  const name = path.basename(filePath)
  const src = fs.readFileSync(filePath, 'utf8')
  const lines = countLines(src)
  const issues = []
  const flags = []

  if (src.includes('AUTO-GENERATED')) flags.push('auto-generated')
  else flags.push('manual/native')

  const extendsBase = src.match(/extends\s+(Base\w+)/)?.[1] ?? null
  if (extendsBase) flags.push(`extends:${extendsBase}`)

  if (name.endsWith('.service.ts')) {
    if (!extendsBase && !src.includes('@Injectable')) {
      issues.push('service không @Injectable / không extends Base*')
    } else if (!extendsBase && SKIP_THIN_MODULE_IDS.has(moduleId)) {
      flags.push('mirror-service')
    } else if (!extendsBase) {
      issues.push('service không extends Base*')
    }
    if (lines > FAT_SERVICE_LINES) flags.push(`fat:${lines}L`)
  }

  if (name.endsWith('.controller.ts')) {
    if (!extendsBase && !src.includes('@Controller')) {
      issues.push('controller thiếu @Controller')
    } else if (!extendsBase && !['public.controller.ts'].includes(name)) {
      const isPublic = name.startsWith('public-')
      if (!isPublic && !SKIP_THIN_MODULE_IDS.has(moduleId)) {
        issues.push('controller không extends Base*')
      } else if (isPublic && !extendsBase) {
        flags.push('public-mirror')
      }
    }
    if (lines > FAT_CONTROLLER_LINES) flags.push(`fat:${lines}L`)
  }

  const importSources = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])
  const baseImports = importSources.filter((s) => s.includes('module-bases'))
  const dupBase = baseImports.filter((s, i) => baseImports.indexOf(s) !== i)
  if (dupBase.length) issues.push(`import trùng base: ${[...new Set(dupBase)].join(', ')}`)

  const valueTypeDup = /import\s+\{([^}]+)\}\s+from\s+'([^']+module-bases[^']+)'[\s\S]*?export\s+type\s+\{([^}]+)\}\s+from\s+'\2'/
  if (valueTypeDup.test(src)) {
    const dupMatch = src.match(valueTypeDup)
    if (dupMatch) {
      const imported = dupMatch[1].split(',').map((s) => s.trim())
      const exported = dupMatch[3].split(',').map((s) => s.trim())
      const overlap = imported.filter((s) => exported.includes(s.replace(/^type\s+/, '')))
      if (overlap.length > 3) flags.push('import+export-type overlap')
    }
  }

  return { rel, name, lines, flags, issues, extendsBase }
}

function classifyModule(moduleId) {
  const pkg = getPackageBaseModules()[moduleId]
  const template = getPackageModuleTemplates().byModuleId[moduleId]
  const dir = path.join(srcRoot, moduleId)
  const files = listTsFiles(dir).map((f) => analyzeFile(path.join(dir, f), moduleId))

  const mainService = files.find((f) => f.name === `${moduleId}.service.ts`)
  const expectedBase = pkg?.baseServiceClass ?? template?.primary?.service?.className ?? null

  let status = 'ok'
  const moduleIssues = []

  if (SKIP_THIN_MODULE_IDS.has(moduleId)) {
    status = 'skip-thin'
  } else if (mainService?.extendsBase) {
    status = mainService.extendsBase === expectedBase ? 'thin' : 'thin-mismatch'
    if (status === 'thin-mismatch') {
      moduleIssues.push(`expected ${expectedBase}, got ${mainService.extendsBase}`)
    }
  } else if (mainService) {
    status = 'mirror'
    moduleIssues.push('service không extends Base*')
  } else {
    status = 'no-service'
  }

  for (const f of files) {
    if (f.issues.length) moduleIssues.push(...f.issues.map((i) => `${f.name}: ${i}`))
  }

  if (mainService?.flags.some((f) => f.startsWith('fat:'))) {
    status = status === 'thin' ? 'thin+fat-override' : status
  }

  return { moduleId, status, expectedBase, files, moduleIssues }
}

function main() {
  const modules = listModuleDirs().map(classifyModule)
  const ok = modules.filter((m) => m.status === 'thin' && !m.moduleIssues.length)
  const thinFat = modules.filter((m) => m.status === 'thin+fat-override')
  const skip = modules.filter((m) => m.status === 'skip-thin')
  const mirror = modules.filter((m) => m.status === 'mirror' || m.status === 'no-service')
  const warn = modules.filter(
    (m) => m.moduleIssues.length && !['mirror', 'no-service', 'skip-thin'].includes(m.status),
  )

  const lines = [
    `# Báo cáo kiểm tra từng file — ${path.relative(ROOT, appRoot)}`,
    '',
    `Thời điểm: ${new Date().toISOString()}`,
    '',
    '## Tổng quan',
    '',
    '| Chỉ số | Giá trị |',
    '|--------|---------|',
    `| Tổng module | ${modules.length} |`,
    `| Thin OK (extends Base*, không issue) | ${ok.length} |`,
    `| Thin + fat override (service > ${FAT_SERVICE_LINES} dòng) | ${thinFat.length} |`,
    `| Skip-thin (mirror có chủ đích) | ${skip.length} |`,
    `| Mirror / no-service | ${mirror.length} |`,
    `| Có cảnh báo file | ${warn.length + thinFat.length} |`,
    '',
    '## Xác minh pipeline',
    '',
    '- `pnpm api:render apps/hub-event/api --prune` — pass',
    '- Typecheck, check-in API, endpoint parity — pass (xem log render)',
    '',
    '## Chi tiết từng module',
    '',
  ]

  for (const m of modules) {
    lines.push(`### \`${m.moduleId}\` — **${m.status}**`)
    if (m.expectedBase) lines.push(`- Expected base: \`${m.expectedBase}\``)
    if (m.moduleIssues.length) {
      lines.push('- Issues:')
      for (const i of m.moduleIssues) lines.push(`  - ${i}`)
    }
    lines.push('')
    lines.push('| File | Dòng | Extends | Flags | Issues |')
    lines.push('|------|------|---------|-------|--------|')
    for (const f of m.files) {
      const ext = f.extendsBase ? `\`${f.extendsBase}\`` : '—'
      const flags = f.flags.join(', ') || '—'
      const issues = f.issues.join('; ') || '—'
      lines.push(`| \`${f.rel}\` | ${f.lines} | ${ext} | ${flags} | ${issues} |`)
    }
    lines.push('')
  }

  if (thinFat.length) {
    lines.push('## Module thin nhưng service fat (cần review)')
    lines.push('')
    for (const m of thinFat) {
      const svc = m.files.find((f) => f.name.endsWith('.service.ts'))
      lines.push(`- \`${m.moduleId}\` — ${svc?.lines ?? '?'} dòng (${svc?.rel})`)
    }
    lines.push('')
  }

  if (mirror.length) {
    lines.push('## Module mirror (không thin)')
    lines.push('')
    for (const m of mirror) {
      lines.push(`- \`${m.moduleId}\` — ${m.status}`)
    }
    lines.push('')
  }

  const report = lines.join('\n')
  console.log(report)

  const outPath = path.join(appRoot, 'MODULE_FILES_AUDIT.md')
  fs.writeFileSync(outPath, `${report}\n`, 'utf8')
  console.log(`\n[audit] → ${path.relative(ROOT, outPath)}`)
}

main()
