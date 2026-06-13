/**
 * Gộp *-admin.controller/service → {folder}.controller/service (mẫu posts).
 * Usage: node script-system/api/merge-unified-admin-modules.cjs [moduleId...]
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')
const { REGISTRY } = require('./api-module-registry.cjs')

/** notifications trước sessions (cross-import). */
const DEFAULT_UNIFY = [
  'notifications',
  'events',
  'comments',
  'accounts',
  'page-contents',
  'event-checkins',
  'event-speakers',
  'event-registrations',
  'sessions',
]

function pascalFromFolder(folder) {
  return folder
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function unifyContent(src, pascal, folder) {
  let out = src
  const pairs = [
    [`Base${pascal}AdminController`, `Base${pascal}Controller`],
    [`Base${pascal}AdminService`, `Base${pascal}Service`],
    [`I${pascal}AdminControllerService`, `I${pascal}ControllerService`],
    ['ISessionsAdminSocketGateway', 'ISessionsSocketGateway'],
    [`./${folder}-admin.service`, `./${folder}.service`],
    [`./${folder}-admin.controller`, `./${folder}.controller`],
    [
      "from '../notifications/notifications-admin.service'",
      "from '../notifications/notifications.service'",
    ],
    [
      './event-registrations-admin.service',
      './event-registrations.service',
    ],
  ]
  for (const [from, to] of pairs) {
    out = out.split(from).join(to)
  }
  out = out.replace(
    `Base${pascal}AdminController —`,
    `Base${pascal}Controller —`,
  )
  return out
}

function appendControllerDeprecatedAliases(content, pascal) {
  if (content.includes(`I${pascal}AdminControllerService = I${pascal}ControllerService`)) {
    return content
  }
  const aliasBlock = [
    '',
    `/** @deprecated Dùng \`I${pascal}ControllerService\`. */`,
    `export type I${pascal}AdminControllerService = I${pascal}ControllerService;`,
  ]
  if (pascal === 'Sessions') {
    aliasBlock.push(
      `/** @deprecated Dùng \`ISessionsSocketGateway\`. */`,
      `export type ISessionsAdminSocketGateway = ISessionsSocketGateway;`,
    )
  }
  const match = content.match(/export type I\w+ControllerService = Pick<[\s\S]*?>;/)
  if (match) {
    const idx = content.indexOf(match[0]) + match[0].length
    return content.slice(0, idx) + aliasBlock.join('\n') + content.slice(idx)
  }
  return `${content.trimEnd()}\n${aliasBlock.join('\n')}\n`
}

function renderUnifiedModule(def, pascal) {
  const ctrlStem = def.controllerFile.replace(/\.ts$/, '')
  const svcStem = def.serviceFile.replace(/\.ts$/, '')
  const typeLines = (def.reExportTypes ?? [])
    .map((t) => `  type ${t},`)
    .join('\n')
  const serviceExport = typeLines
    ? `export {\n  Base${pascal}Service,\n${typeLines}\n} from './${svcStem}';`
    : `export {\n  Base${pascal}Service,\n} from './${svcStem}';`

  return `/**
 * ${pascal} Module — NestJS wiring cho admin ${def.folder}.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { Base${pascal}Controller } from './${ctrlStem}';

@Module({})
export class Base${pascal}Module {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), Base${pascal}Controller],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { Base${pascal}Controller } from './${ctrlStem}';
${serviceExport}
`
}

function collectScaffoldStems(dir, def) {
  const stems = new Set()
  for (const entry of fs.readdirSync(dir)) {
    if (entry.includes('-admin.')) continue
    if (entry === def.controllerFile || entry === def.serviceFile) continue
    if (entry === `${def.folder}.module.ts` || entry === 'index.ts') continue
    if (entry.startsWith('event-registration-attendance')) continue

    if (
      entry.endsWith('.controller.ts') ||
      entry.endsWith('.service.ts') ||
      entry.endsWith('.module.ts')
    ) {
      stems.add(entry.replace(/\.(controller|service|module)\.ts$/, ''))
    }
    if (
      entry.endsWith('.controller.spec.ts') ||
      entry.endsWith('.service.spec.ts') ||
      entry.endsWith('.service.integration.spec.ts') ||
      entry.endsWith('.module-meta.spec.ts')
    ) {
      stems.add(
        entry
          .replace(/\.(controller|service)\.spec\.ts$/, '')
          .replace(/\.service\.integration\.spec\.ts$/, '')
          .replace(/\.module-meta\.spec\.ts$/, ''),
      )
    }
  }
  return stems
}

function deleteScaffoldArtifacts(dir, stems, def) {
  const keep = new Set([
    def.controllerFile,
    def.serviceFile,
    `${def.folder}.module.ts`,
    'index.ts',
    'index.barrel.spec.ts',
    `${def.folder}.module-meta.spec.ts`,
    'event-registration-attendance.service.ts',
    'event-registration-attendance.types.ts',
    'event-registration-attendance.deps.ts',
  ])

  for (const stem of stems) {
    for (const suffix of [
      '.controller.ts',
      '.service.ts',
      '.module.ts',
      '.controller.spec.ts',
      '.service.spec.ts',
      '.service.integration.spec.ts',
      '.module-meta.spec.ts',
    ]) {
      const file = `${stem}${suffix}`
      if (keep.has(file)) continue
      const full = path.join(dir, file)
      if (fs.existsSync(full)) {
        fs.unlinkSync(full)
        console.log(`[merge] deleted ${path.relative(ROOT, full)}`)
      }
    }
  }

  for (const entry of fs.readdirSync(dir)) {
    if (!entry.includes('-admin.') || !entry.endsWith('.ts')) continue
    fs.unlinkSync(path.join(dir, entry))
    console.log(`[merge] deleted admin ${def.folder}/${entry}`)
  }
}

function mergeModule(moduleId) {
  const def = REGISTRY[moduleId]
  if (!def) throw new Error(`Unknown module: ${moduleId}`)
  const folder = def.folder
  const pascal = pascalFromFolder(folder)
  const dir = path.join(ROOT, 'packages/api-server/src/modules', folder)

  const adminCtrl = path.join(dir, `${folder}-admin.controller.ts`)
  const adminSvc = path.join(dir, `${folder}-admin.service.ts`)
  if (!fs.existsSync(adminCtrl) || !fs.existsSync(adminSvc)) {
    console.warn(`[merge] skip ${moduleId}: missing admin files`)
    return false
  }

  let ctrl = unifyContent(fs.readFileSync(adminCtrl, 'utf8'), pascal, folder)
  ctrl = appendControllerDeprecatedAliases(ctrl, pascal)

  const svc = unifyContent(fs.readFileSync(adminSvc, 'utf8'), pascal, folder)

  fs.writeFileSync(path.join(dir, def.controllerFile), ctrl, 'utf8')
  fs.writeFileSync(path.join(dir, def.serviceFile), svc, 'utf8')
  console.log(`[merge] wrote ${folder}/${def.controllerFile}, ${def.serviceFile}`)

  fs.writeFileSync(
    path.join(dir, `${folder}.module.ts`),
    renderUnifiedModule(def, pascal),
    'utf8',
  )

  const stems = collectScaffoldStems(dir, def)
  deleteScaffoldArtifacts(dir, stems, def)
  return true
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_UNIFY
for (const id of ids) mergeModule(id)

console.log('[merge] done — chạy render-module-barrel.cjs + api:generate:checkin')
