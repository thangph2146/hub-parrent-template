/**
 * Sinh index.ts module — admin layer trước, scaffold CRUD sau (hub-event chỉ dùng admin).
 * Usage: node script-system/api/render-module-barrel.cjs
 */
const fs = require('node:fs')
const path = require('path')
const { ROOT } = require('../lib/paths.cjs')
const { REGISTRY } = require('./api-module-registry.cjs')

/** Module gộp 1 controller + 1 service (không còn *-admin.*) */
const UNIFIED_MODULES = [
  'posts',
  'events',
  'comments',
  'accounts',
  'page-contents',
  'notifications',
  'sessions',
  'event-checkins',
  'event-registrations',
  'event-speakers',
  'uploads',
  'system',
  'auth',
]

function pascalFromFolder(folder) {
  return folder
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function scaffoldModuleFile(def) {
  if (fs.existsSync(path.join(ROOT, 'packages/api-server/src/modules', def.folder, `${def.folder}.module.ts`))) {
    return `${def.folder}.module.ts`
  }
  const singular = def.folder.replace(/s$/, '')
  if (fs.existsSync(path.join(ROOT, 'packages/api-server/src/modules', def.folder, `${singular}.module.ts`))) {
    return `${singular}.module.ts`
  }
  return `${def.folder}.module.ts`
}

function scaffoldServiceStem(def) {
  const folder = def.folder
  const dir = path.join(ROOT, 'packages/api-server/src/modules', folder)
  if (def.serviceFile) {
    const stem = def.serviceFile.replace(/\.ts$/, '')
    if (fs.existsSync(path.join(dir, def.serviceFile))) return stem
  }
  const singular = folder.replace(/s$/, '')
  if (fs.existsSync(path.join(dir, `${singular}.service.ts`))) return singular
  if (fs.existsSync(path.join(dir, `${folder}.service.ts`))) return folder
  return singular
}

function scaffoldControllerStem(def, serviceStem) {
  const folder = def.folder
  const dir = path.join(ROOT, 'packages/api-server/src/modules', folder)
  if (def.controllerFile) {
    const stem = def.controllerFile.replace(/\.ts$/, '')
    if (fs.existsSync(path.join(dir, def.controllerFile))) return stem
  }
  if (fs.existsSync(path.join(dir, `${serviceStem}.controller.ts`))) return serviceStem
  if (fs.existsSync(path.join(dir, `${folder}.controller.ts`))) return folder
  return serviceStem
}

function readScaffoldDtoExports(servicePath) {
  if (!fs.existsSync(servicePath)) return null
  const src = fs.readFileSync(servicePath, 'utf8')
  const row = src.match(/export interface (\w+RowDto)/)?.[1]
  const create = src.match(/export interface (\w+CreateData)/)?.[1]
  const update = src.match(/export interface (\w+UpdateData)/)?.[1]
  if (!row || !create || !update) return null
  return { row, create, update }
}

function renderAdminBarrel(moduleId) {
  const def = REGISTRY[moduleId]
  if (!def) return null

  const folder = def.folder
  const pascal = pascalFromFolder(folder)
  const modFile = scaffoldModuleFile(def)
  const serviceStem = scaffoldServiceStem(def)

  const adminControllerStem =
    moduleId === 'auth' ? 'auth-admin.controller' : `${folder}-admin.controller`

  const adminServiceClass =
    moduleId === 'auth' ? null : `Base${pascal}AdminService`
  const adminControllerClass =
    moduleId === 'auth' ? 'BaseAuthAdminController' : `Base${pascal}AdminController`
  const adminInterface =
    moduleId === 'auth'
      ? 'IAuthAdminControllerService'
      : `I${pascal}AdminControllerService`

  const lines = [
    `/**`,
    ` * ${pascal} module.`,
    ` *`,
    ` * **hub-event check-in:** extend \`*-admin.service\` + \`*-admin.controller\` (binding entity).`,
    ` * **Scaffold CRUD** (\`${serviceStem}.service.ts\`) — main/generic; hub-event không dùng HTTP scaffold.`,
    ` */`,
    ``,
    `// ── Admin layer (hub-event binding) ───────────────────────────────────────`,
  ]

  if (moduleId === 'auth') {
    lines.push(
      `export { BaseAuthAdminController } from './auth-admin.controller';`,
      `export type { IAuthAdminControllerService } from './auth-admin.controller';`,
      `export { BaseAuthService } from './auth.service';`,
    )
  } else {
    lines.push(
      `export { ${adminServiceClass} } from './${folder}-admin.service';`,
      `export { ${adminControllerClass} } from './${adminControllerStem}';`,
      `export type { ${adminInterface} } from './${adminControllerStem}';`,
    )
    if (def.reExportTypes?.length) {
      const types =
        moduleId === 'comments'
          ? def.reExportTypes.filter((t) => t !== 'CommentRowDto')
          : moduleId === 'posts'
            ? def.reExportTypes.filter((t) => !['PostRowDto', 'PostDetailDto'].includes(t))
            : def.reExportTypes
      if (types.length) {
        lines.push(
          `export type { ${types.join(', ')} } from './${folder}-admin.service';`,
        )
      }
    }
  }

  if (moduleId === 'sessions') {
    lines.push(
      `export type { ISessionsAdminSocketGateway } from './sessions-admin.controller';`,
    )
  }

  if (moduleId === 'comments' && def.reExportTypes?.includes('CommentRowDto')) {
    lines.push(
      `export type { CommentRowDto, CommentRowDto as AdminCommentRowDto } from './comments-admin.service';`,
    )
  }

  if (moduleId === 'event-registrations') {
    lines.push(
      `export { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';`,
      `export type { AttendanceSource, ManualAttendanceAction, ApplyAttendanceResult } from './event-registration-attendance.types';`,
    )
  }

  if (moduleId === 'auth') {
    lines.push(
      ``,
      `// ── Public auth + module wiring (main / generic) ───────────────────────────`,
      `export {`,
      `  BaseAuthModule,`,
      `  BasePublicAuthController,`,
      `} from './auth.module';`,
      `export type { IPublicAuthControllerService } from './public-auth.controller';`,
      `export type {`,
      `  AuthRolePayload,`,
      `  AuthLoginPayload,`,
      `  GoogleProfileDto,`,
      `  DevLoginOptionDto,`,
      `} from './auth.service';`,
    )
    return `${lines.join('\n')}\n`
  }

  lines.push(
    ``,
    `// ── Scaffold CRUD (main / generic — không hub-event HTTP) ─────────────────`,
    `export {`,
    `  Base${pascal}Service,`,
    `  Base${pascal}Controller,`,
    `  Base${pascal}Module,`,
    `} from './${modFile.replace(/\.ts$/, '')}';`,
  )

  const controllerStem = scaffoldControllerStem(def, serviceStem)
  const servicePath = path.join(
    ROOT,
    'packages/api-server/src/modules',
    folder,
    `${serviceStem}.service.ts`,
  )
  const dtoTypes = readScaffoldDtoExports(servicePath)
  const adminRowTypes = new Set(
    (def.reExportTypes ?? []).filter((t) => t.endsWith('RowDto')),
  )

  if (fs.existsSync(
    path.join(ROOT, 'packages/api-server/src/modules', folder, `${controllerStem}.controller.ts`),
  )) {
    const controllerInterfaceMatch = fs
      .readFileSync(
        path.join(ROOT, 'packages/api-server/src/modules', folder, `${controllerStem}.controller.ts`),
        'utf8',
      )
      .match(/export interface (I\w+ControllerService)/)
    if (controllerInterfaceMatch) {
      lines.push(
        `export type { ${controllerInterfaceMatch[1]} } from './${controllerStem}.controller';`,
      )
    }
  }

  if (dtoTypes && !adminRowTypes.has(dtoTypes.row)) {
    lines.push(
      `export type {`,
      `  ${dtoTypes.row},`,
      `  ${dtoTypes.create},`,
      `  ${dtoTypes.update},`,
      `} from './${serviceStem}.service';`,
    )
  }

  return `${lines.join('\n')}\n`
}

function unifiedServiceConstExports(moduleId, folder) {
  if (moduleId === 'posts') {
    return `export { POSTS_FILTER_CATEGORIES_NONE } from './${folder}.service';\n`
  }
  if (moduleId === 'uploads') {
    return `export { UPLOADS_BULK_DELETE_MAX_PATHS } from './${folder}.service';\n`
  }
  return ''
}

function unifiedHelperExports(moduleId) {
  if (moduleId === 'system') {
    return `export {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  pivotFk,
  sanitizePivotRowsInExportJson,
  stripHeroSlidesPermissions,
  stripLegacyHeroSlideFromBundle,
} from './import-helpers';
export type { ImportRow } from './import-helpers';
export {
  normalizeLegacyImportRow,
  resolveLegacyTableModelName,
} from './export-schema';
export {
  exportLegacyKey,
  IMPORT_ID_MAP_GROUP,
  LegacyImportIdMap,
} from './legacy-import-id-map';
export {
  buildImportVerification,
  getImportReferenceFilePath,
  loadImportReferenceManifest,
} from './import-reference';
export type { ImportVerificationResult } from './import-reference';
export type { ExportDataResult, ImportDataResult } from './system.service';
`
  }
  return ''
}

function unifiedTypeExports(moduleId, def, folder) {
  const lines = []
  if (moduleId === 'comments') {
    const filtered = (def.reExportTypes ?? []).filter((t) => t !== 'CommentRowDto')
    if (filtered.length) {
      lines.push(
        `export type {\n  ${filtered.join(',\n  ')},\n} from './${folder}.service';`,
      )
    }
    lines.push(
      `export type { CommentRowDto, CommentRowDto as AdminCommentRowDto } from './${folder}.service';`,
    )
  } else if (moduleId === 'uploads') {
    lines.push(
      `export type {
  CreateStorageFolderResult,
  UploadFileInput,
  StorageMediaKind,
  StorageRealm,
  StorageTabDto,
} from './${folder}.service';`,
    )
  } else if (def.reExportTypes?.length) {
    lines.push(
      `export type {\n  ${def.reExportTypes.join(',\n  ')},\n} from './${folder}.service';`,
    )
  }
  if (moduleId === 'event-registrations') {
    lines.push(
      `export { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';`,
      `export type { AttendanceSource, ManualAttendanceAction, ApplyAttendanceResult } from './event-registration-attendance.types';`,
    )
  }
  if (moduleId === 'sessions') {
    lines.push(
      `export type { ISessionsSocketGateway, ISessionsSocketGateway as ISessionsAdminSocketGateway } from './${folder}.controller';`,
    )
  }
  return lines.length ? `${lines.join('\n')}\n` : ''
}

function renderUnifiedBarrel(moduleId) {
  if (!UNIFIED_MODULES.includes(moduleId)) return null
  const def = REGISTRY[moduleId]
  if (!def) return null
  const pascal = pascalFromFolder(def.folder)
  const folder = def.folder

  if (moduleId === 'auth') {
    return `/**
 * ${pascal} module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  Base${pascal}Service,
  Base${pascal}Service as Base${pascal}AdminService,
} from './${folder}.service';
export {
  Base${pascal}Controller,
  Base${pascal}Controller as Base${pascal}AdminController,
} from './${folder}.controller';
export type { I${pascal}ControllerService } from './${folder}.controller';
/** @deprecated Dùng \`I${pascal}ControllerService\`. */
export type { I${pascal}ControllerService as I${pascal}AdminControllerService } from './${folder}.controller';
export type {
  AuthRolePayload,
  AuthLoginPayload,
  GoogleProfileDto,
  DevLoginOptionDto,
} from './${folder}.service';
export {
  Base${pascal}Module,
  BasePublicAuthController,
} from './${folder}.module';
export type { IPublicAuthControllerService } from './public-auth.controller';
`
  }

  return `/**
 * ${pascal} module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  Base${pascal}Service,
  Base${pascal}Service as Base${pascal}AdminService,
} from './${folder}.service';
export {
  Base${pascal}Controller,
  Base${pascal}Controller as Base${pascal}AdminController,
} from './${folder}.controller';
export type { I${pascal}ControllerService } from './${folder}.controller';
/** @deprecated Dùng \`I${pascal}ControllerService\`. */
export type { I${pascal}ControllerService as I${pascal}AdminControllerService } from './${folder}.controller';
${unifiedTypeExports(moduleId, def, folder)}${unifiedServiceConstExports(moduleId, folder)}${unifiedHelperExports(moduleId)}export { Base${pascal}Module } from './${folder}.module';
`
}

function tagScaffoldFiles(moduleId) {
  const def = REGISTRY[moduleId]
  const dir = path.join(ROOT, 'packages/api-server/src/modules', def.folder)
  const banner =
    '/** @scaffold-only — Generic CRUD; hub-event dùng *-admin.* thay cho HTTP layer này. */\n'
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.ts')) continue
    if (entry.includes('-admin.')) continue
    if (entry === 'public-auth.controller.ts') continue
    if (!entry.endsWith('.service.ts') && !entry.endsWith('.controller.ts') && !entry.endsWith('.module.ts')) {
      continue
    }
    const full = path.join(dir, entry)
    let src = fs.readFileSync(full, 'utf8')
    if (src.includes('@scaffold-only')) continue
    if (!src.startsWith('/**')) {
      fs.writeFileSync(full, banner + src, 'utf8')
      console.log(`[barrel] tagged scaffold ${def.folder}/${entry}`)
    }
  }
}

for (const moduleId of UNIFIED_MODULES) {
  const content = renderUnifiedBarrel(moduleId)
  if (!content) continue
  const out = path.join(
    ROOT,
    'packages/api-server/src/modules',
    REGISTRY[moduleId].folder,
    'index.ts',
  )
  fs.writeFileSync(out, content, 'utf8')
  console.log(`[barrel] unified ${moduleId} → index.ts`)
}

console.log('[barrel] done')
